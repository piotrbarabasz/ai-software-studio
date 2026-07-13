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
from .validation_runner import ValidationPolicyError, ValidationReport, ValidationRunner


class RoleRunner(Protocol):
    def run(self, role: str, task_package_path: Path, *, invocation_id: str) -> Any: ...


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
    commits: dict[str, str] = field(default_factory=dict)
    active_task_id: str | None = None
    base_sha: str | None = None
    branch: str | None = None
    baseline_status: list[list[str]] = field(default_factory=list)
    git_control_digest: str = ""
    package_path: str | None = None
    validation_reports: list[dict[str, Any]] = field(default_factory=list)
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
        validation_runner: ValidationRunner | Any | None = None,
        diff_guard: DiffGuard | None = None,
        git_service: GitService | None = None,
        retry_policy: RetryPolicy | None = None,
        runtime_directory: Path | None = None,
        forbidden_paths: tuple[str, ...] = (
            ".git",
            ".automation/state",
            ".studio-loop",
            ".codex",
        ),
        checkpoint: Callable[[str], None] | None = None,
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
        self.package_service = TaskPackageService(self.runtime_directory)
        self.checkpoint = checkpoint or (lambda _name: None)
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
        self.state = state
        self._save()
        self.effects.append("run_state_created")
        return state

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
            validation_profiles=(task.validation_profile,),
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

    def _validate(self, task: TaskDefinition) -> tuple[list[dict[str, Any]], str | None]:
        report = self.validation_runner.run(task.validation_profile)
        if isinstance(report, ValidationReport):
            payload = report.as_dict()
        elif isinstance(report, dict):
            payload = dict(report)
        else:
            payload = asdict(report)
        reports = [payload]
        self.effects.append(f"validation:{task.validation_profile}")
        status = str(payload.get("status", "ERROR"))
        return (
            reports,
            None if status == "PASS" else f"validation {task.validation_profile} {status}",
        )

    def _review(
        self,
        task: TaskDefinition,
        package: BuiltPackage,
        assessment: DiffAssessment,
        reports: list[dict[str, Any]],
    ) -> tuple[dict[str, Any] | None, str | None]:
        if not reports or any(report.get("status") != "PASS" for report in reports):
            return None, "review cannot run while a required validation is not PASS"
        review_package = self.package_service.review_package(
            package,
            diff=assessment.diff,
            changed_paths=assessment.changed_paths,
            validation_reports=reports,
        )
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
            reports, validation_failure = self._validate(task)
            self.state.validation_reports = reports
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
            summary = validation_failure or review_failure or "controller gate failed"
            try:
                repaired, repair_failure = self._repair(
                    task,
                    package,
                    failure_class=failure_class,
                    summary=summary,
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
        if any(report.get("status") != "PASS" for report in self.state.validation_reports):
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
        self.state.active_task_id = task.id
        self.state.phase = "SELECTED"
        self.state.attempts = {}
        self.state.validation_reports = []
        self.state.reviewer_output = None
        self.state.changed_paths = []
        self._set_task_status(task.id, TaskStatus.IN_PROGRESS)
        self.effects.append("task_in_progress")

        baseline = self.diff_guard.snapshot()
        if baseline.status:
            return self._block("repository contained unrelated changes before task start")
        package = self.package_service.task_package(
            feature_id=self.state.feature_id,
            run_id=self.state.run_id,
            task=task,
            base_sha=baseline.head_sha,
            branch=baseline.branch,
            attempt=1,
            validation_profiles=(task.validation_profile,),
        )
        self.effects.append("task_package_written")
        self.state.base_sha = baseline.head_sha
        self.state.branch = baseline.branch
        self.state.baseline_status = [list(item) for item in baseline.status]
        self.state.git_control_digest = baseline.git_control_digest
        self.state.package_path = str(package.path)
        self.state.phase = "PACKAGED"
        self._save()

        return self._implement_and_gate(task, package)

    def _implement_and_gate(
        self, task: TaskDefinition, package: BuiltPackage
    ) -> ControllerResult | None:
        assert self.state is not None

        while True:
            try:
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
        self, collection: TaskCollection, *, run_id: str, mode: str = "local"
    ) -> ControllerResult:
        if mode == "dry-run":
            return self._run_unlocked(collection, run_id=run_id, mode=mode)
        with RepositoryLock.for_repository(self.repository):
            return self._run_unlocked(collection, run_id=run_id, mode=mode)

    def _run_unlocked(
        self, collection: TaskCollection, *, run_id: str, mode: str = "local"
    ) -> ControllerResult:
        if mode not in {"dry-run", "local"}:
            raise ValueError("execution core supports only dry-run and local modes")
        if mode == "dry-run":
            try:
                self.validation_runner.ensure_known(
                    tuple(task.validation_profile for task in collection.tasks)
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

        self.state = self._load_or_create(collection, run_id, mode)
        self.collection = self._with_statuses(collection, self.state.task_statuses)
        try:
            self.validation_runner.ensure_known(
                tuple(task.validation_profile for task in collection.tasks)
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
            self.state.active_task_id = None
            self.state.phase = "IDLE"
            self.state.base_sha = None
            self.state.branch = None
            self.state.baseline_status = []
            self.state.git_control_digest = ""
            self.state.package_path = None
            self.state.validation_reports = []
            self.state.reviewer_output = None
            self.state.changed_paths = []
            self._save()
