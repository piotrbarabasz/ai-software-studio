"""Deterministic execution core for one-task-at-a-time Autonomous Loop runs."""

from __future__ import annotations

import json
import os
from collections.abc import Callable
from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any, Protocol

from .diff_guard import DiffAssessment, DiffGuard, RepositorySnapshot
from .errors import CommandError
from .git_service import GitService
from .locking import RepositoryLock
from .models import TaskCollection, TaskDefinition, TaskStatus
from .retry_policy import RetryBudget, RetryExhausted, RetryKind, RetryPolicy
from .task_package_service import BuiltPackage, TaskPackageService
from .task_scheduler import ScheduleState, TaskScheduler
from .validation_runner import TaskValidationReport, ValidationPolicyError, ValidationRunner
from .write_surface import WriteSurfaceGuard


class RoleRunner(Protocol):
    def run(self, role: str, task_package_path: Path, *, invocation_id: str) -> Any: ...


class ValidationRunnerPort(Protocol):
    def ensure_known(self, names: tuple[str, ...]) -> None: ...

    def run_many(self, task_id: str, profile_names: tuple[str, ...]) -> TaskValidationReport: ...


class ControllerCrash(RuntimeError):
    """Used by fault-injection tests to model abrupt process interruption."""


@dataclass(frozen=True)
class ControllerResult:
    state: str
    task_statuses: dict[str, str]
    commits: dict[str, str]
    effects: tuple[str, ...]
    human_gate: bool = False
    blocker: str | None = None
    planned_task_id: str | None = None


@dataclass(frozen=True)
class TaskCompletionEvidence:
    task_id: str
    commit_sha: str | None
    validation_passed: bool
    reviewer_passed: bool
    validation_summary: str
    all_tasks_completed: bool


@dataclass
class _State:
    schema_version: str
    feature_id: str
    run_id: str
    mode: str
    state: str
    phase: str
    task_statuses: dict[str, str]
    attempts: dict[str, int] = field(default_factory=dict)
    ci_repair_attempts: dict[str, int] = field(default_factory=dict)
    commits: dict[str, str] = field(default_factory=dict)
    active_task_id: str | None = None
    base_sha: str | None = None
    branch: str | None = None
    baseline_status: list[list[str]] = field(default_factory=list)
    git_control_digest: str = ""
    package_path: str | None = None
    validation_reports: list[dict[str, Any]] = field(default_factory=list)
    validation_summary: dict[str, Any] = field(default_factory=dict)
    reviewer_output: dict[str, Any] | None = None
    changed_paths: list[str] = field(default_factory=list)
    human_gate: bool = False
    blocker: str | None = None
    updated_at: str = ""

    @classmethod
    def from_json(cls, payload: dict[str, Any]) -> _State:
        return cls(**payload)


def _now() -> str:
    return datetime.now(UTC).isoformat()


def _atomic_state(path: Path, state: _State) -> None:
    state.updated_at = _now()
    path.parent.mkdir(parents=True, exist_ok=True)
    with NamedTemporaryFile(
        "w", encoding="utf-8", dir=path.parent, prefix=f".{path.name}.", delete=False
    ) as stream:
        json.dump(asdict(state), stream, indent=2, sort_keys=True)
        stream.write("\n")
        stream.flush()
        os.fsync(stream.fileno())
        temporary = Path(stream.name)
    os.replace(temporary, path)


class AutonomousLoopController:
    """Run controller-observed gates and at most one writing role at a time."""

    def __init__(
        self,
        repository: Path,
        *,
        role_runner: RoleRunner,
        validation_runner: ValidationRunnerPort | None = None,
        diff_guard: DiffGuard | None = None,
        git_service: GitService | None = None,
        retry_policy: RetryPolicy | None = None,
        write_surface_guard: WriteSurfaceGuard | None = None,
        runtime_directory: Path | None = None,
        forbidden_paths: tuple[str, ...] = (
            ".git",
            ".automation/state",
            ".studio-loop",
            ".codex",
        ),
        checkpoint: Callable[[str], None] | None = None,
        phase_observer: Callable[[str, str], None] | None = None,
        on_task_completed: Callable[[TaskCompletionEvidence], None] | None = None,
    ) -> None:
        self.repository = repository.resolve()
        self.runtime_directory = (
            runtime_directory.resolve()
            if runtime_directory is not None
            else self.repository / ".automation" / "state" / "controller"
        )
        self.role_runner = role_runner
        self.validation_runner = validation_runner or ValidationRunner(self.repository)
        self.diff_guard = diff_guard or DiffGuard(self.repository, forbidden_paths=forbidden_paths)
        self.git_service = git_service or GitService(self.repository)
        self.retry_policy = retry_policy or RetryPolicy()
        self.write_surface_guard = write_surface_guard or WriteSurfaceGuard(self.repository)
        self.package_service = TaskPackageService(self.runtime_directory)
        self.checkpoint = checkpoint or (lambda _name: None)
        self.phase_observer = phase_observer or (lambda _phase, _task_id: None)
        self.on_task_completed = on_task_completed or (lambda _evidence: None)
        self.effects: list[str] = []
        self._state_path: Path | None = None
        self.state: _State | None = None
        self.collection: TaskCollection | None = None
        self._last_runtime_violation = False

    def _save(self) -> None:
        if self.state is None or self._state_path is None:
            raise RuntimeError("controller state has not been initialized")
        _atomic_state(self._state_path, self.state)

    def _load_or_create(self, collection: TaskCollection, run_id: str, mode: str) -> _State:
        path = self.runtime_directory / run_id / "controller-state.json"
        self._state_path = path
        if path.exists():
            payload = json.loads(path.read_text(encoding="utf-8"))
            state = _State.from_json(payload)
            if state.feature_id != collection.feature_id or state.run_id != run_id:
                raise RuntimeError("persisted controller identity does not match the requested run")
            if state.mode != mode:
                raise RuntimeError("run mode cannot be broadened during recovery")
            return state
        state = _State(
            schema_version="1.0.0",
            feature_id=collection.feature_id,
            run_id=run_id,
            mode=mode,
            state="RUNNING",
            phase="IDLE",
            task_statuses={task.id: task.status.value for task in collection.tasks},
        )
        self._recover_committed_task_state(state, collection)
        missing_commit = next(
            (
                task.id
                for task in collection.tasks
                if task.writes
                and state.task_statuses.get(task.id) == TaskStatus.COMPLETED.value
                and task.id not in state.commits
            ),
            None,
        )
        if missing_commit is not None:
            raise CommandError(
                "TASK_COMMIT_EVIDENCE_INVALID",
                f"completed writing task lacks commit evidence: {missing_commit}",
            )
        self.state = state
        self._save()
        self.effects.append("run_state_created")
        return state

    def _recover_committed_task_state(self, state: _State, collection: TaskCollection) -> None:
        """Seed disposable controller cache from unique reachable commit trailers."""

        feature_commits = set(
            self.git_service.git.commits_with_trailer("Studio-Feature", collection.feature_id)
        )
        run_commits = set(self.git_service.git.commits_with_trailer("Studio-Run", state.run_id))
        recovered: dict[str, str] = {}
        for task in collection.tasks:
            if not task.writes:
                continue
            task_commits = set(self.git_service.git.commits_with_trailer("Studio-Task", task.id))
            matches = feature_commits.intersection(run_commits, task_commits)
            if matches:
                latest = tuple(
                    candidate
                    for candidate in matches
                    if all(
                        other == candidate or self.git_service.git.is_ancestor(other, candidate)
                        for other in matches
                    )
                )
                if len(latest) != 1:
                    raise RuntimeError(f"controller commits diverge for recovered task {task.id}")
                commit = latest[0]
                if not self.git_service.git.is_ancestor(commit, self.git_service.head_sha()):
                    raise RuntimeError(f"recovered task commit is not reachable: {task.id}")
                recovered[task.id] = commit
        recovered_ids = set(recovered)
        for task in collection.tasks:
            if task.id not in recovered_ids:
                continue
            missing_writing_dependency = next(
                (
                    dependency
                    for dependency in task.dependencies
                    if next(item for item in collection.tasks if item.id == dependency).writes
                    and dependency not in recovered_ids
                ),
                None,
            )
            if missing_writing_dependency is not None:
                raise RuntimeError(
                    f"recovered task {task.id} lacks writing dependency {missing_writing_dependency}"
                )
            state.task_statuses[task.id] = TaskStatus.COMPLETED.value
            state.commits[task.id] = recovered[task.id]

    @staticmethod
    def _with_statuses(collection: TaskCollection, statuses: dict[str, str]) -> TaskCollection:
        tasks = tuple(
            task.model_copy(update={"status": TaskStatus(statuses.get(task.id, task.status.value))})
            for task in collection.tasks
        )
        return collection.model_copy(update={"tasks": tasks})

    def _task(self, task_id: str) -> TaskDefinition:
        assert self.collection is not None
        return next(task for task in self.collection.tasks if task.id == task_id)

    def _baseline(self) -> RepositorySnapshot:
        assert self.state is not None and self.state.base_sha and self.state.branch
        return RepositorySnapshot(
            branch=self.state.branch,
            head_sha=self.state.base_sha,
            status=tuple((item[0], item[1]) for item in self.state.baseline_status),
            git_control_digest=self.state.git_control_digest,
        )

    def _runtime_digest(self) -> str:
        import hashlib

        root = self.repository / ".automation" / "state"
        digest = hashlib.sha256()
        if not root.exists():
            return digest.hexdigest()
        for path in sorted(root.rglob("*"), key=lambda item: item.as_posix()):
            if not path.is_file():
                continue
            relative = path.relative_to(root)
            if relative.parts and relative.parts[0] == "codex":
                continue
            digest.update(relative.as_posix().encode("utf-8", errors="surrogateescape"))
            if path.is_symlink():
                digest.update(os.readlink(path).encode("utf-8", errors="surrogateescape"))
            else:
                try:
                    digest.update(path.read_bytes())
                except OSError:
                    digest.update(b"<unreadable>")
        return digest.hexdigest()

    def _set_task_status(self, task_id: str, status: TaskStatus) -> None:
        assert self.state is not None and self.collection is not None
        self.state.task_statuses[task_id] = status.value
        self.collection = self._with_statuses(self.collection, self.state.task_statuses)
        self._save()

    def _observe_phase(self, phase: str, task_id: str) -> None:
        self.phase_observer(phase, task_id)

    def _block(self, reason: str, *, human_gate: bool = True) -> ControllerResult:
        assert self.state is not None
        self.state.state = "BLOCKED"
        self.state.phase = "BLOCKED"
        self.state.blocker = reason[:4000]
        self.state.human_gate = human_gate
        if self.state.active_task_id is not None:
            self.state.task_statuses[self.state.active_task_id] = TaskStatus.BLOCKED.value
        self._save()
        return self._result()

    def _result(self, *, planned_task_id: str | None = None) -> ControllerResult:
        assert self.state is not None
        return ControllerResult(
            state=self.state.state,
            task_statuses=dict(self.state.task_statuses),
            commits=dict(self.state.commits),
            effects=tuple(self.effects),
            human_gate=self.state.human_gate,
            blocker=self.state.blocker,
            planned_task_id=planned_task_id,
        )

    def _invoke(self, role: str, package: BuiltPackage, kind: RetryKind | None = None) -> Any:
        assert self.state is not None and self.state.active_task_id is not None
        if kind is not None:
            budget = RetryBudget(self.retry_policy, self.state.attempts)
            attempt = budget.consume(kind)
            self.state.attempts = budget.used
            self._save()  # attempts count before invocation and survive interruption
        else:
            attempt = self.state.attempts.get(role, 0) + 1
        invocation_id = f"{self.state.run_id}-{self.state.active_task_id}-{role}-{attempt}"
        runtime_before = self._runtime_digest()
        result = self.role_runner.run(role, package.path, invocation_id=invocation_id)
        self._last_runtime_violation = self._runtime_digest() != runtime_before
        self.effects.append(f"{role}_invoked")
        if getattr(result, "attempts", 1) > self.retry_policy.output_repair + 1:
            raise RuntimeError("agent exceeded the fixed structured-output repair budget")
        return result

    @staticmethod
    def _output(result: Any) -> dict[str, Any] | None:
        output = getattr(result, "output", None)
        return output if isinstance(output, dict) else None

    @staticmethod
    def _succeeded(result: Any) -> bool:
        value = getattr(result, "succeeded", None)
        if isinstance(value, bool):
            return value
        category = getattr(result, "category", None)
        return str(category).lower() in {"success", "codexitcategory.success"}

    def _package(self, task: TaskDefinition) -> BuiltPackage:
        assert self.state is not None and self.state.package_path is not None
        path = Path(self.state.package_path)
        if path.exists():
            return BuiltPackage(path, json.loads(path.read_text(encoding="utf-8")))
        assert self.state.base_sha and self.state.branch
        return self.package_service.task_package(
            feature_id=self.state.feature_id,
            run_id=self.state.run_id,
            task=task,
            base_sha=self.state.base_sha,
            branch=self.state.branch,
            attempt=max(1, self.state.attempts.get(RetryKind.IMPLEMENTER.value, 1)),
            validation_profiles=task.validation_profiles,
        )

    def _assessment(self, task: TaskDefinition) -> DiffAssessment:
        assert self.state is not None
        protected = (
            f"specs/{self.state.feature_id}/tasks.json",
            f"specs/{self.state.feature_id}/tasks.md",
        )
        return self.diff_guard.assess(
            self._baseline(),
            allowed_paths=task.allowed_write_paths,
            task_status_paths=protected,
        )

    def _guard_write_surface(
        self, task: TaskDefinition, package: BuiltPackage, *, role: str
    ) -> ControllerResult | None:
        assert self.state is not None
        assessment = self.write_surface_guard.assess(task.allowed_write_paths)
        if assessment.passed:
            return None
        summary = f"pre-execution write-surface policy rejected {role}: " + "; ".join(
            assessment.violations
        )
        failure = self.package_service.failure_package(
            package,
            failure_class="policy",
            summary=summary,
            diff="",
            validation_reports=[],
            reviewer_output=None,
            remaining_debugger_attempts=RetryBudget(
                self.retry_policy, self.state.attempts
            ).remaining(RetryKind.DEBUGGER),
        )
        self.state.package_path = str(failure.path)
        self.effects.append("failure_package_written")
        self._save()
        return self._block(summary)

    def _validate(
        self, task: TaskDefinition, package: BuiltPackage
    ) -> tuple[list[dict[str, Any]], dict[str, Any], str | None]:
        self._observe_phase("validating", task.id)
        summary = self.validation_runner.run_many(task.id, task.validation_profiles)
        payload = summary.as_dict()
        reports = list(payload["results"])
        self.package_service.validation_report(package, payload)
        self.effects.extend(f"validation:{profile}" for profile in task.validation_profiles)
        expected_profiles = task.validation_profiles
        observed_profiles = tuple(result.profile for result in summary.results)
        all_passed = summary.passed and all(result.status == "PASS" for result in summary.results)
        complete = (
            summary.task_id == task.id
            and summary.required_profiles == expected_profiles
            and observed_profiles == expected_profiles
        )
        failed_profiles = tuple(
            result.profile for result in summary.results if result.status != "PASS"
        )
        failure = None
        if not complete:
            failure = "validation evidence does not match required profiles"
        elif not all_passed:
            failure = "validation " + ", ".join(failed_profiles) + " did not PASS"
        return reports, payload, failure

    def _review(
        self,
        task: TaskDefinition,
        package: BuiltPackage,
        assessment: DiffAssessment,
        reports: list[dict[str, Any]],
    ) -> tuple[dict[str, Any] | None, str | None]:
        assert self.state is not None
        if not reports or any(report.get("status") != "PASS" for report in reports):
            return None, "review cannot run while a required validation is not PASS"
        review_package = self.package_service.review_package(
            package,
            diff=assessment.diff,
            changed_paths=assessment.changed_paths,
            validation_reports=reports,
            validation_summary=self.state.validation_summary,
        )
        self._observe_phase("reviewing", task.id)
        before = self.diff_guard.snapshot()
        result = self._invoke("reviewer", review_package)
        after = self.diff_guard.snapshot()
        if self._last_runtime_violation:
            return None, "reviewer changed protected runtime state"
        if after != before:
            return None, "reviewer mutated repository state"
        output = self._output(result)
        if self._last_runtime_violation:
            return None, "debugger changed protected runtime state"
        if not self._succeeded(result) or output is None:
            return output, "reviewer invocation failed or returned invalid output"
        if output.get("task_id") != task.id:
            return output, "reviewer task_id does not match the active task"
        if output.get("verdict") != "PASS":
            return output, "reviewer requested changes"
        blocking = output.get("blocking_findings")
        if not isinstance(blocking, list) or blocking:
            return output, "Reviewer PASS contains blocking findings"
        covered = output.get("covered_requirements")
        if not isinstance(covered, list) or not set(task.requirement_ids).issubset(set(covered)):
            return output, "Reviewer PASS does not cover every task requirement"
        return output, None

    def _repair(
        self,
        task: TaskDefinition,
        package: BuiltPackage,
        *,
        failure_class: str,
        summary: str,
        assessment: DiffAssessment,
        reports: list[dict[str, Any]],
        reviewer_output: dict[str, Any] | None,
    ) -> tuple[BuiltPackage | None, str | None]:
        assert self.state is not None
        remaining = RetryBudget(self.retry_policy, self.state.attempts).remaining(
            RetryKind.DEBUGGER
        )
        failure = self.package_service.failure_package(
            package,
            failure_class=failure_class,
            summary=summary,
            diff=assessment.diff,
            validation_reports=reports,
            reviewer_output=reviewer_output,
            remaining_debugger_attempts=remaining,
        )
        self.state.phase = "REPAIRING"
        self._save()
        try:
            result = self._invoke("debugger", failure, RetryKind.DEBUGGER)
        except RetryExhausted as error:
            return None, str(error)
        output = self._output(result)
        if not self._succeeded(result) or output is None:
            return None, "debugger invocation failed"
        if output.get("task_id") != task.id:
            return None, "debugger task_id does not match the active task"
        if output.get("status") != "repaired":
            return None, "debugger did not report a completed repair"
        self.checkpoint("after_debugger")
        return package, None

    def _gate_until_pass(
        self, task: TaskDefinition, package: BuiltPackage
    ) -> ControllerResult | None:
        assert self.state is not None
        while True:
            assessment = self._assessment(task)
            self.state.changed_paths = list(assessment.changed_paths)
            if not assessment.passed:
                return self._block("diff guard violation: " + "; ".join(assessment.violations))
            self.state.phase = "VALIDATING"
            self._save()
            reports, validation_summary, validation_failure = self._validate(task, package)
            self.state.validation_reports = reports
            self.state.validation_summary = validation_summary
            self.state.phase = "VALIDATED"
            self._save()
            self.checkpoint("after_validation")
            reviewer_output: dict[str, Any] | None = None
            review_failure: str | None = None
            if validation_failure is None:
                self.state.phase = "REVIEWING"
                self._save()
                reviewer_output, review_failure = self._review(task, package, assessment, reports)
                self.state.reviewer_output = reviewer_output
                if review_failure is None:
                    self.state.phase = "REVIEWED"
                    self._save()
                    self.checkpoint("after_review")
                    return None
            failure_class = "validation" if validation_failure else "review"
            failure_summary = validation_failure or review_failure or "controller gate failed"
            surface_failure = self._guard_write_surface(task, package, role="debugger")
            if surface_failure is not None:
                return surface_failure
            try:
                repaired, repair_failure = self._repair(
                    task,
                    package,
                    failure_class=failure_class,
                    summary=failure_summary,
                    assessment=assessment,
                    reports=reports,
                    reviewer_output=reviewer_output,
                )
            except RetryExhausted as error:
                return self._block(str(error))
            if repaired is None:
                remaining = RetryBudget(self.retry_policy, self.state.attempts).remaining(
                    RetryKind.DEBUGGER
                )
                if remaining == 0:
                    return self._block(repair_failure or "debugger retry budget exhausted")
                continue
            # A repaired diff gets no credit for previous gates: repeat all of them.

    def _recover_or_commit(self, task: TaskDefinition) -> ControllerResult | None:
        assert self.state is not None and self.state.base_sha and self.state.branch
        try:
            observed = self.git_service.observe_task_commit(
                feature_id=self.state.feature_id,
                task_id=task.id,
                run_id=self.state.run_id,
                expected_parent_sha=self.state.base_sha,
            )
        except CommandError as error:
            return self._block(str(error))
        if observed is not None:
            self.state.commits[task.id] = observed
            self.state.phase = "COMMITTED"
            self._save()
            return None
        assessment = self._assessment(task)
        if not assessment.passed:
            return self._block(
                "pre-commit diff guard violation: " + "; ".join(assessment.violations)
            )
        if not self.state.validation_summary.get("passed") or any(
            report.get("status") != "PASS" for report in self.state.validation_reports
        ):
            return self._block("commit refused because validation evidence is not PASS")
        reviewer = self.state.reviewer_output or {}
        if reviewer.get("task_id") != task.id or reviewer.get("verdict") != "PASS":
            return self._block("commit refused because Reviewer PASS evidence is invalid")
        if not task.writes:
            if assessment.changed_paths:
                return self._block("read-only task has unexpected changes")
            return None
        if not assessment.changed_paths:
            return self._block("writing task produced no committable changes")
        self.state.phase = "COMMITTING"
        self._save()
        self._observe_phase("committing", task.id)
        self.checkpoint("before_commit")
        try:
            sha = self.git_service.commit_files(
                files=assessment.changed_paths,
                feature_id=self.state.feature_id,
                task_id=task.id,
                run_id=self.state.run_id,
                subject=task.title,
                expected_parent_sha=self.state.base_sha,
                expected_branch=self.state.branch,
            )
        except CommandError as error:
            return self._block(str(error))
        self.effects.append("local_commit_created")
        self.checkpoint("after_commit_before_state")
        self.state.commits[task.id] = sha
        self.state.phase = "COMMITTED"
        self._save()
        return None

    def _start_task(self, task: TaskDefinition) -> ControllerResult | None:
        assert self.state is not None
        self._observe_phase("task_selected", task.id)
        self.state.active_task_id = task.id
        self.state.phase = "SELECTED"
        self.state.attempts = {}
        self.state.validation_reports = []
        self.state.validation_summary = {}
        self.state.reviewer_output = None
        self.state.changed_paths = []
        self._set_task_status(task.id, TaskStatus.IN_PROGRESS)
        self.effects.append("task_in_progress")

        baseline = self.diff_guard.snapshot()
        package = self.package_service.task_package(
            feature_id=self.state.feature_id,
            run_id=self.state.run_id,
            task=task,
            base_sha=baseline.head_sha,
            branch=baseline.branch,
            attempt=1,
            validation_profiles=task.validation_profiles,
        )
        self.effects.append("task_package_written")
        self.state.base_sha = baseline.head_sha
        self.state.branch = baseline.branch
        self.state.baseline_status = [list(item) for item in baseline.status]
        self.state.git_control_digest = baseline.git_control_digest
        self.state.package_path = str(package.path)
        self.state.phase = "PACKAGED"
        self._save()

        surface_failure = self._guard_write_surface(task, package, role="implementer")
        if surface_failure is not None:
            return surface_failure
        if baseline.status:
            return self._block("repository contained unrelated changes before task start")

        return self._implement_and_gate(task, package)

    def _implement_and_gate(
        self, task: TaskDefinition, package: BuiltPackage
    ) -> ControllerResult | None:
        assert self.state is not None

        while True:
            surface_failure = self._guard_write_surface(task, package, role="implementer")
            if surface_failure is not None:
                return surface_failure
            try:
                self._observe_phase("implementing", task.id)
                result = self._invoke("implementer", package, RetryKind.IMPLEMENTER)
            except RetryExhausted as error:
                return self._block(str(error))
            output = self._output(result)
            if self._last_runtime_violation:
                return self._block("implementer changed protected runtime state")
            if self._succeeded(result) and output is not None:
                if output.get("task_id") != task.id:
                    return self._block("implementer task_id does not match the active task")
                if output.get("status") in {"implemented", "no_change_required"}:
                    break
            remaining = RetryBudget(self.retry_policy, self.state.attempts).remaining(
                RetryKind.IMPLEMENTER
            )
            if remaining == 0:
                return self._block("implementer retry budget exhausted")
        self.state.phase = "IMPLEMENTED"
        self._save()
        self.checkpoint("after_implementation")
        return self._gate_until_pass(task, package)

    def _resume_task(self, task: TaskDefinition) -> ControllerResult | None:
        assert self.state is not None
        package = self._package(task)
        if self.state.phase == "SELECTED":
            return self._start_task(task)
        if self.state.phase == "PACKAGED":
            current = self.diff_guard.snapshot()
            if current != self._baseline():
                return self._block(
                    "interrupted implementer left ambiguous repository changes; "
                    "the counted attempt was not refunded"
                )
            return self._implement_and_gate(task, package)
        if self.state.phase in {"IMPLEMENTED", "VALIDATING", "VALIDATED", "REVIEWING", "REPAIRING"}:
            return self._gate_until_pass(task, package)
        if self.state.phase in {"REVIEWED", "COMMITTING", "COMMITTED"}:
            return self._recover_or_commit(task)
        return self._block(f"cannot reconcile controller phase {self.state.phase}")

    def run(
        self,
        collection: TaskCollection,
        *,
        run_id: str,
        mode: str = "local",
        writer_lock_held: bool = False,
    ) -> ControllerResult:
        if mode == "dry-run":
            return self._run_unlocked(collection, run_id=run_id, mode=mode)
        if writer_lock_held:
            return self._run_unlocked(collection, run_id=run_id, mode=mode)
        with RepositoryLock.for_repository(self.repository):
            return self._run_unlocked(collection, run_id=run_id, mode=mode)

    def repair_ci(
        self,
        collection: TaskCollection,
        *,
        run_id: str,
        task_id: str,
        failure_summary: str,
        writer_lock_held: bool = False,
    ) -> ControllerResult:
        """Run one bounded failure-only CI repair through the normal local gates."""

        if writer_lock_held:
            return self._repair_ci_unlocked(
                collection,
                run_id=run_id,
                task_id=task_id,
                failure_summary=failure_summary,
            )
        with RepositoryLock.for_repository(self.repository):
            return self._repair_ci_unlocked(
                collection,
                run_id=run_id,
                task_id=task_id,
                failure_summary=failure_summary,
            )

    def _repair_ci_unlocked(
        self,
        collection: TaskCollection,
        *,
        run_id: str,
        task_id: str,
        failure_summary: str,
    ) -> ControllerResult:
        try:
            self.state = self._load_or_create(collection, run_id, "local")
        except (CommandError, RuntimeError, json.JSONDecodeError) as error:
            return ControllerResult(
                state="BLOCKED",
                task_statuses={task.id: task.status.value for task in collection.tasks},
                commits={},
                effects=tuple(self.effects),
                human_gate=True,
                blocker=str(error),
            )
        self.collection = self._with_statuses(collection, self.state.task_statuses)
        previous_state = self.state.state
        previous_phase = self.state.phase
        if self.state.task_statuses.get(task_id) != TaskStatus.COMPLETED.value:
            return self._block("CI repair requires a completed mapped task")
        try:
            task = self._task(task_id)
        except StopIteration:
            return self._block("CI failure maps to an unknown task")
        if not task.writes:
            return self._block("CI repair cannot mutate a read-only task")
        interrupted_repair_phases = {
            "CI_REPAIRING",
            "IMPLEMENTED",
            "VALIDATING",
            "VALIDATED",
            "REVIEWING",
            "REVIEWED",
            "REPAIRING",
            "COMMITTING",
            "COMMITTED",
        }
        if (
            self.state.phase in interrupted_repair_phases
            and self.state.ci_repair_attempts.get(task.id, 0) >= 1
        ):
            if (
                self.state.active_task_id != task.id
                or not self.state.base_sha
                or not self.state.branch
                or self.state.ci_repair_attempts.get(task.id, 0) < 1
            ):
                return self._block("persisted CI repair evidence is incomplete or ambiguous")
            package = self.package_service.task_package(
                feature_id=self.state.feature_id,
                run_id=self.state.run_id,
                task=task,
                base_sha=self.state.base_sha,
                branch=self.state.branch,
                attempt=self.state.ci_repair_attempts[task.id],
                validation_profiles=task.validation_profiles,
            )
            self.state.package_path = str(package.path)
            if self.state.phase not in {"REVIEWED", "COMMITTING", "COMMITTED"}:
                self.state.phase = "IMPLEMENTED"
                self._save()
                gated = self._gate_until_pass(task, package)
                if gated is not None:
                    return gated
            if self.state.phase != "COMMITTED":
                committed = self._recover_or_commit(task)
                if committed is not None:
                    return committed
            self._finish_ci_repair(previous_state, "FINALIZING")
            return self._result()
        baseline = self.diff_guard.snapshot()
        if baseline.status:
            return self._block("CI repair requires a clean worktree")
        self.state.active_task_id = task.id
        self.state.base_sha = baseline.head_sha
        self.state.branch = baseline.branch
        self.state.baseline_status = [list(item) for item in baseline.status]
        self.state.git_control_digest = baseline.git_control_digest
        self.state.validation_reports = []
        self.state.validation_summary = {}
        self.state.reviewer_output = None
        self.state.changed_paths = []
        package = self.package_service.task_package(
            feature_id=self.state.feature_id,
            run_id=self.state.run_id,
            task=task,
            base_sha=baseline.head_sha,
            branch=baseline.branch,
            attempt=self.state.ci_repair_attempts.get(task.id, 0) + 1,
            validation_profiles=task.validation_profiles,
        )
        self.state.package_path = str(package.path)
        self.state.phase = "CI_REPAIRING"
        budget = RetryBudget(
            self.retry_policy,
            {RetryKind.CI_REPAIR.value: self.state.ci_repair_attempts.get(task.id, 0)},
        )
        try:
            attempt = budget.consume(RetryKind.CI_REPAIR)
        except RetryExhausted as error:
            return self._block(str(error))
        self.state.ci_repair_attempts[task.id] = attempt
        failure = self.package_service.failure_package(
            package,
            failure_class="validation",
            summary=failure_summary,
            diff="",
            validation_reports=[],
            reviewer_output=None,
            remaining_debugger_attempts=max(0, self.retry_policy.ci_repair - attempt),
        )
        self._save()
        surface_failure = self._guard_write_surface(task, package, role="debugger")
        if surface_failure is not None:
            return surface_failure
        result = self._invoke("debugger", failure)
        output = self._output(result)
        if (
            self._last_runtime_violation
            or not self._succeeded(result)
            or output is None
            or output.get("task_id") != task.id
            or output.get("status") != "repaired"
        ):
            return self._block("CI Debugger failed or returned invalid repair evidence")
        self.checkpoint("after_debugger")
        self.state.phase = "IMPLEMENTED"
        self._save()
        gated = self._gate_until_pass(task, package)
        if gated is not None:
            return gated
        committed = self._recover_or_commit(task)
        if committed is not None:
            return committed
        self._finish_ci_repair(previous_state, previous_phase)
        return self._result()

    def _finish_ci_repair(self, previous_state: str, previous_phase: str) -> None:
        assert self.state is not None
        self.state.state = previous_state
        self.state.phase = previous_phase
        self.state.active_task_id = None
        self.state.base_sha = None
        self.state.branch = None
        self.state.baseline_status = []
        self.state.git_control_digest = ""
        self.state.package_path = None
        self._save()

    def _run_unlocked(
        self, collection: TaskCollection, *, run_id: str, mode: str = "local"
    ) -> ControllerResult:
        if mode not in {"dry-run", "local"}:
            raise ValueError("execution core supports only dry-run and local modes")
        if mode == "dry-run":
            try:
                self.validation_runner.ensure_known(
                    tuple(
                        profile for task in collection.tasks for profile in task.validation_profiles
                    )
                )
            except ValidationPolicyError as error:
                return ControllerResult(
                    state="BLOCKED",
                    task_statuses={task.id: task.status.value for task in collection.tasks},
                    commits={},
                    effects=(),
                    human_gate=True,
                    blocker=str(error),
                )
            decision = TaskScheduler.select(collection)
            planned = decision.task_id if decision.state is ScheduleState.READY else None
            return ControllerResult(
                state="DRY_RUN"
                if decision.state is not ScheduleState.ALL_COMPLETED
                else "ALL_COMPLETED",
                task_statuses={task.id: task.status.value for task in collection.tasks},
                commits={},
                effects=(),
                planned_task_id=planned,
            )

        try:
            self.state = self._load_or_create(collection, run_id, mode)
        except (CommandError, RuntimeError, json.JSONDecodeError) as error:
            return ControllerResult(
                state="BLOCKED",
                task_statuses={task.id: task.status.value for task in collection.tasks},
                commits={},
                effects=tuple(self.effects),
                human_gate=True,
                blocker=str(error),
            )
        self.collection = self._with_statuses(collection, self.state.task_statuses)
        try:
            self.validation_runner.ensure_known(
                tuple(profile for task in collection.tasks for profile in task.validation_profiles)
            )
        except ValidationPolicyError as error:
            return self._block(str(error))
        if self.state.state == "BLOCKED":
            return self._result()

        while True:
            assert self.collection is not None and self.state is not None
            active = self.state.active_task_id
            if active and self.state.task_statuses.get(active) == TaskStatus.IN_PROGRESS.value:
                task = self._task(active)
                result = self._resume_task(task)
            else:
                decision = TaskScheduler.select(self.collection)
                if decision.state is ScheduleState.ALL_COMPLETED:
                    self.state.state = "ALL_COMPLETED"
                    self.state.phase = "IDLE"
                    self.state.active_task_id = None
                    self._save()
                    return self._result()
                if decision.state is not ScheduleState.READY or decision.task_id is None:
                    return self._block(f"scheduler stopped with {decision.state.value}")
                task = self._task(decision.task_id)
                result = self._start_task(task)
            if result is not None:
                return result

            # Commit evidence (or a read-only PASS) exists before completed is recorded.
            self.state.phase = "FINALIZING"
            self._save()
            if task.writes and task.id not in self.state.commits:
                recovery = self._recover_or_commit(task)
                if recovery is not None:
                    return recovery
            self._set_task_status(task.id, TaskStatus.COMPLETED)
            self.effects.append("task_completed")
            all_tasks_completed = all(
                status == TaskStatus.COMPLETED.value for status in self.state.task_statuses.values()
            )
            self.on_task_completed(
                TaskCompletionEvidence(
                    task_id=task.id,
                    commit_sha=self.state.commits.get(task.id),
                    validation_passed=bool(self.state.validation_summary.get("passed")),
                    reviewer_passed=(self.state.reviewer_output or {}).get("verdict") == "PASS",
                    validation_summary=", ".join(
                        f"{item.get('profile')}: {item.get('status')}"
                        for item in self.state.validation_reports
                    ),
                    all_tasks_completed=all_tasks_completed,
                )
            )
            self.state.active_task_id = None
            self.state.phase = "IDLE"
            self.state.base_sha = None
            self.state.branch = None
            self.state.baseline_status = []
            self.state.git_control_digest = ""
            self.state.package_path = None
            self.state.validation_reports = []
            self.state.validation_summary = {}
            self.state.reviewer_output = None
            self.state.changed_paths = []
            self._save()
