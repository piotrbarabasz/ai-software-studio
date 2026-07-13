"""CLI-facing composition of the planner and single-task execution controller.

This module deliberately contains no agent policy: agents provide structured
data, while this controller validates it, writes artifacts and advances state.
"""

from __future__ import annotations

import json
import os
import uuid
from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any, Literal, Protocol, cast

from jsonschema import Draft202012Validator  # type: ignore[import-untyped]

from .adapters.gh_cli import Check, PullRequest
from .checks import CheckObservation, CheckState, CiObserver
from .ci_repair import CiRepairService, map_failure_to_task
from .controller import AutonomousLoopController, ControllerResult, TaskCompletionEvidence
from .diff_guard import DiffGuard
from .errors import CommandError, ExitCategory
from .git_service import GitService
from .locking import RepositoryLock
from .models import RunEvent, RunState, TaskCollection, utc_now
from .publishing import PublishingService, PushRequest, ready_for_review
from .pull_requests import PullRequestRequest, PullRequestService
from .retry_policy import RetryBudget, RetryPolicy
from .roles import RoleName
from .state_machine import LoopState, transition
from .state_store import StateStore
from .task_graph import TaskGraph
from .task_renderer import render_tasks
from .validation_runner import ValidationPolicyError, ValidationRunner


class RoleRunner(Protocol):
    def run(self, role: RoleName, task_package_path: Path, *, invocation_id: str) -> Any: ...


class ValidationRunnerPort(Protocol):
    def ensure_known(self, names: tuple[str, ...]) -> None: ...

    def run_many(self, task_id: str, profile_names: tuple[str, ...]) -> Any: ...


class GithubTransport(Protocol):
    def find_pull_requests(
        self, *, owner: str, repository: str, head: str, base: str
    ) -> tuple[PullRequest, ...]: ...

    def create_draft_pull_request(
        self,
        *,
        owner: str,
        repository: str,
        base: str,
        head: str,
        title: str,
        body_file: str,
    ) -> PullRequest: ...

    def update_pull_request_body(
        self, *, owner: str, repository: str, number: int, body_file: str
    ) -> None: ...

    def checks(self, *, owner: str, repository: str, number: int) -> tuple[Check, ...]: ...


@dataclass(frozen=True)
class DraftPrPolicy:
    remote: str = "origin"
    required_checks: tuple[str, ...] = ("studio-loop-ci",)
    check_interval_seconds: float = 10.0
    check_timeout_seconds: float = 900.0
    check_max_attempts: int = 90
    missing_checks: str = "block"
    feature_validation_profiles: tuple[str, ...] = ("studio-loop-tests",)
    ci_repair_attempts: int = 2
    check_task_map: dict[str, str] | None = None

    def __post_init__(self) -> None:
        if self.check_interval_seconds <= 0 or self.check_timeout_seconds <= 0:
            raise ValueError("check interval and timeout must be positive")
        if self.check_max_attempts < 1:
            raise ValueError("check_max_attempts must be positive")
        if self.missing_checks not in {"block", "pending"}:
            raise ValueError("missing_checks must be block or pending")
        if self.ci_repair_attempts < 0:
            raise ValueError("ci_repair_attempts cannot be negative")


@dataclass(frozen=True)
class LifecycleResult:
    status: str
    run_id: str
    feature_id: str
    branch: str
    worktree: str
    phase: str
    current_task: str | None
    local_sha: str | None
    remote_sha: str | None = None
    pull_request: int | None = None
    ci_status: str | None = None
    next_action: str | None = None
    human_gate: bool = False
    blocking_issues: tuple[str, ...] = ()

    def data(self) -> dict[str, Any]:
        return {
            "status": self.status,
            "run_id": self.run_id,
            "feature_id": self.feature_id,
            "branch": self.branch,
            "worktree": self.worktree,
            "phase": self.phase,
            "current_task": self.current_task,
            "local_sha": self.local_sha,
            "remote_sha": self.remote_sha,
            "pull_request": self.pull_request,
            "ci_status": self.ci_status,
            "next_action": self.next_action,
            "human_gate": self.human_gate,
            "blocking_issues": list(self.blocking_issues),
        }


def _atomic_text(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as output:
        output.write(value)
        output.flush()
        os.fsync(output.fileno())
        temporary = Path(output.name)
    os.replace(temporary, path)


class LifecycleController:
    """Own the durable boundaries around planner and existing task execution."""

    def __init__(
        self,
        worktree: Path,
        *,
        role_runner: RoleRunner,
        validation_runner: ValidationRunnerPort | None = None,
        github: GithubTransport | None = None,
        draft_pr_policy: DraftPrPolicy | None = None,
        checkpoint: Callable[[str], None] | None = None,
    ) -> None:
        self.worktree = worktree.resolve()
        self.role_runner = role_runner
        self.git = GitService(self.worktree)
        self.validation_runner = validation_runner
        self.github = github
        self.draft_pr_policy = draft_pr_policy or DraftPrPolicy()
        self.checkpoint = checkpoint or (lambda _name: None)
        self._pull_request_context: tuple[str, str, str] | None = None

    @property
    def validations(self) -> ValidationRunnerPort:
        if self.validation_runner is None:
            raise RuntimeError("validation runner has not been initialized")
        return self.validation_runner

    def run(
        self,
        *,
        metadata: dict[str, Any],
        request: str,
        mode: str,
        run_id: str | None = None,
        owner: str | None = None,
        repository: str | None = None,
    ) -> LifecycleResult:
        with RepositoryLock.for_repository(self.worktree):
            if self.validation_runner is None:
                self.validation_runner = ValidationRunner(self.worktree)
            return self._run_locked(
                metadata=metadata,
                request=request,
                mode=cast(Literal["local", "draft-pr"], mode),
                run_id=run_id,
                owner=owner,
                repository=repository,
            )

    def _run_locked(
        self,
        *,
        metadata: dict[str, Any],
        request: str,
        mode: str,
        run_id: str | None = None,
        owner: str | None = None,
        repository: str | None = None,
    ) -> LifecycleResult:
        if mode not in {"local", "draft-pr"}:
            raise CommandError("MODE_INVALID", "lifecycle requires local or draft-pr mode")
        if mode == "draft-pr" and (self.github is None or not owner or not repository):
            raise CommandError(
                "DRAFT_PR_TRANSPORT_MISSING",
                "draft-pr mode requires an authenticated GitHub transport and repository identity",
                ExitCategory.PREFLIGHT,
            )
        feature_id = str(metadata["feature_id"])
        branch = str(metadata["branch"])
        base_branch = str(metadata["base_branch"])
        self._pull_request_context = (
            (owner, repository, base_branch)
            if mode == "draft-pr" and owner is not None and repository is not None
            else None
        )
        run_id = run_id or f"run-{uuid.uuid4()}"
        store = StateStore(self.worktree / ".automation" / "state" / "runs" / run_id)
        loaded_state = store.read_state()
        if loaded_state is None:
            state = RunState(
                feature_id=feature_id,
                run_id=run_id,
                state=LoopState.CREATED,
                revision=0,
                updated_at=utc_now(),
                mode=cast(Literal["local", "draft-pr"], mode),
                branch=branch,
                worktree=str(self.worktree),
                local_sha=self.git.head_sha(),
            )
            state = store.write_state(state)
        else:
            state = loaded_state

        if state.branch not in {None, branch} or state.worktree not in {None, str(self.worktree)}:
            return self._blocked(
                store,
                state,
                branch,
                run_id,
                ("runtime state identity differs from feature metadata",),
            )
        if state.mode != mode:
            if (
                state.mode == "local"
                and mode == "draft-pr"
                and state.state is LoopState.FEATURE_VALIDATION
            ):
                state = self._record(
                    store,
                    state,
                    "mode_upgraded",
                    evidence=("local->draft-pr",),
                    mode="draft-pr",
                )
            else:
                return self._blocked(
                    store,
                    state,
                    branch,
                    run_id,
                    ("run mode cannot be broadened from the current lifecycle boundary",),
                )

        def advance(
            target: LoopState,
            *,
            task_id: str | None = None,
            evidence: tuple[str, ...] = (),
        ) -> RunState:
            nonlocal state
            persisted = store.read_state()
            if persisted is not None and persisted.revision > state.revision:
                state = persisted
            current = state.state
            if current == target:
                return state
            transition(current, target)
            event = RunEvent(
                event_id=f"{run_id}-{state.revision + 1}",
                sequence=len(store.read_events()) + 1,
                occurred_at=datetime.now(UTC),
                feature_id=feature_id,
                run_id=run_id,
                event_type="state_transition",
                from_state=current.value,
                to_state=target.value,
                task_id=task_id,
                evidence=evidence,
            )
            store.append_event(event)
            state = store.write_state(
                state.model_copy(
                    update={
                        "state": target,
                        "active_task_id": task_id,
                        "local_sha": self.git.head_sha(),
                    }
                ),
                expected_revision=state.revision,
            )
            return state

        try:
            artifacts = self.worktree / "specs" / feature_id
            tasks_path = artifacts / "tasks.json"
            if state.state is LoopState.BLOCKED:
                controller_statuses = self._controller_task_statuses(run_id)
                active_status = (
                    controller_statuses.get(state.active_task_id)
                    if controller_statuses is not None and state.active_task_id is not None
                    else None
                )
                state = self._record(
                    store,
                    state,
                    "resume_requested",
                    evidence=("re-enter from durable BLOCKED state",),
                    human_gate=False,
                    blocking_issues=(),
                )
                if not tasks_path.exists():
                    advance(LoopState.PREFLIGHT)
                elif state.active_task_id is not None and active_status == "completed":
                    target = (
                        LoopState.CI_PENDING
                        if state.remote_sha == self.git.head_sha()
                        and state.pull_request is not None
                        else LoopState.PUSHING
                    )
                    advance(target, task_id=state.active_task_id)
                elif state.active_task_id is not None and active_status == "in_progress":
                    advance(LoopState.TASK_SELECTED, task_id=state.active_task_id)
                elif controller_statuses and all(
                    status == "completed" for status in controller_statuses.values()
                ):
                    advance(LoopState.FEATURE_VALIDATION)
                else:
                    advance(LoopState.SPEC_VALIDATION)
            if state.state is LoopState.CREATED:
                advance(LoopState.PREFLIGHT)
            if state.state is LoopState.PREFLIGHT:
                advance(LoopState.WORKTREE_CREATED)
            if not tasks_path.exists():
                if state.state is LoopState.WORKTREE_CREATED:
                    advance(LoopState.SPECIFICATION)
                if state.state is LoopState.SPECIFICATION:
                    advance(LoopState.PLANNING)
                if state.state is not LoopState.PLANNING:
                    return self._blocked(
                        store,
                        state,
                        branch,
                        run_id,
                        ("planner artifacts are missing outside a recoverable planning state",),
                    )
                output = self._planner_output(metadata, request, run_id)
                if output.get("status") != "ready":
                    issues = tuple(str(item) for item in output.get("blocking_issues", ()))
                    return self._blocked(
                        store, state, branch, run_id, issues or ("planner did not reach ready",)
                    )
                collection = self._write_planner_artifacts(artifacts, feature_id, output)
                advance(
                    LoopState.TASK_GENERATION,
                    evidence=("validated planner output written",),
                )
                self.validations.ensure_known(
                    tuple(
                        profile for task in collection.tasks for profile in task.validation_profiles
                    )
                )
                TaskGraph(collection)
                self._commit_planning_artifacts(feature_id, run_id)
                advance(
                    LoopState.SPEC_VALIDATION,
                    evidence=(f"planning_commit={self.git.head_sha()}",),
                )
            else:
                collection = TaskCollection.model_validate_json(
                    tasks_path.read_text(encoding="utf-8")
                )
                TaskGraph(collection)
                self.validations.ensure_known(
                    tuple(
                        profile for task in collection.tasks for profile in task.validation_profiles
                    )
                )
                if state.state is LoopState.WORKTREE_CREATED:
                    advance(LoopState.SPECIFICATION, evidence=("planner artifacts observed",))
                if state.state is LoopState.SPECIFICATION:
                    advance(LoopState.PLANNING, evidence=("planner artifacts observed",))
                if state.state is LoopState.PLANNING:
                    advance(LoopState.TASK_GENERATION, evidence=("planner artifacts observed",))
                if state.state is LoopState.TASK_GENERATION:
                    if not self._planning_commit_exists(feature_id, run_id):
                        self._commit_planning_artifacts(feature_id, run_id)
                    advance(
                        LoopState.SPEC_VALIDATION,
                        evidence=(f"planning_commit={self.git.head_sha()}",),
                    )
                if state.state in {
                    LoopState.CREATED,
                    LoopState.PREFLIGHT,
                    LoopState.WORKTREE_CREATED,
                    LoopState.SPECIFICATION,
                    LoopState.PLANNING,
                    LoopState.TASK_GENERATION,
                }:
                    return self._blocked(
                        store, state, branch, run_id, ("runtime planning state is ambiguous",)
                    )

            if state.state is LoopState.READY_FOR_REVIEW:
                return self._result_from_state(state, status="READY_FOR_REVIEW")

            assert collection is not None
            executor: AutonomousLoopController | None = None

            def phase_observer(phase: str, task_id: str) -> None:
                targets = {
                    "task_selected": LoopState.TASK_SELECTED,
                    "implementing": LoopState.IMPLEMENTING,
                    "validating": LoopState.VALIDATING,
                    "reviewing": LoopState.REVIEWING,
                    "committing": LoopState.COMMITTING,
                }
                target = targets[phase]
                if state.state is not target:
                    advance(target, task_id=task_id, evidence=(f"controller_phase={phase}",))

            def completed(evidence: TaskCompletionEvidence) -> None:
                nonlocal state
                if mode == "local":
                    completed_tasks = tuple(
                        dict.fromkeys((*state.completed_tasks, evidence.task_id))
                    )
                    state = self._record(
                        store,
                        state,
                        "task_locally_completed",
                        task_id=evidence.task_id,
                        evidence=(f"commit={evidence.commit_sha}",),
                        completed_tasks=completed_tasks,
                        validation_summary=evidence.validation_summary,
                    )
                    return
                assert executor is not None and owner is not None and repository is not None
                state = self._publish_completed_task(
                    store=store,
                    state=state,
                    advance=advance,
                    collection=collection,
                    executor=executor,
                    evidence=evidence,
                    owner=owner,
                    repository=repository,
                    branch=branch,
                    base_branch=base_branch,
                    run_id=run_id,
                )

            executor = AutonomousLoopController(
                self.worktree,
                role_runner=self.role_runner,  # type: ignore[arg-type]
                validation_runner=self.validations,
                retry_policy=RetryPolicy(ci_repair=self.draft_pr_policy.ci_repair_attempts),
                runtime_directory=self.worktree / ".automation" / "state" / "controller",
                phase_observer=phase_observer,
                on_task_completed=completed,
                checkpoint=self.checkpoint,
            )

            if mode == "draft-pr" and (
                state.state is LoopState.SPEC_VALIDATION
                or (state.state is LoopState.PUSHING and state.active_task_id is None)
            ):
                assert owner is not None and repository is not None
                state = self._publish_planning_revision(
                    store=store,
                    state=state,
                    advance=advance,
                    collection=collection,
                    owner=owner,
                    repository=repository,
                    branch=branch,
                    base_branch=base_branch,
                    run_id=run_id,
                )

            if (
                mode == "draft-pr"
                and state.active_task_id is not None
                and state.active_task_id not in state.completed_tasks
                and (self._controller_task_statuses(run_id) or {}).get(state.active_task_id)
                == "completed"
                and state.state
                in {
                    LoopState.COMMITTING,
                    LoopState.PUSHING,
                    LoopState.CI_PENDING,
                    LoopState.REPAIRING,
                }
            ):
                assert owner is not None and repository is not None
                task_id = state.active_task_id
                if state.state is LoopState.REPAIRING:
                    repair = executor.repair_ci(
                        collection,
                        run_id=run_id,
                        task_id=task_id,
                        failure_summary=self._latest_ci_failure(state),
                        writer_lock_held=True,
                    )
                    if repair.state == "BLOCKED":
                        return self._blocked(
                            store,
                            state,
                            branch,
                            run_id,
                            (repair.blocker or "interrupted CI repair could not resume",),
                            repair,
                        )
                recovered_evidence = self._controller_completion_evidence(
                    collection=collection,
                    run_id=run_id,
                    task_id=task_id,
                )
                state = self._publish_completed_task(
                    store=store,
                    state=state,
                    advance=advance,
                    collection=collection,
                    executor=executor,
                    evidence=recovered_evidence,
                    owner=owner,
                    repository=repository,
                    branch=branch,
                    base_branch=base_branch,
                    run_id=run_id,
                )

            result: ControllerResult = executor.run(
                collection, run_id=run_id, mode="local", writer_lock_held=True
            )
            if result.state != "ALL_COMPLETED":
                return self._blocked(
                    store,
                    state,
                    branch,
                    run_id,
                    (result.blocker or "task execution stopped",),
                    result,
                )

            observed_completed = tuple(
                task.id
                for task in collection.tasks
                if result.task_statuses.get(task.id) == "completed"
            )
            if observed_completed != state.completed_tasks:
                state = self._record(
                    store,
                    state,
                    "task_completion_reconciled",
                    evidence=tuple(f"completed={task_id}" for task_id in observed_completed),
                    completed_tasks=observed_completed,
                )

            if state.state is not LoopState.FEATURE_VALIDATION:
                advance(
                    LoopState.FEATURE_VALIDATION,
                    evidence=("all canonical tasks completed",),
                )
            feature_validation = self.validations.run_many(
                "FEATURE", self.draft_pr_policy.feature_validation_profiles
            )
            feature_summary = ", ".join(
                f"{item.profile}: {item.status}" for item in feature_validation.results
            )
            state = self._record(
                store,
                state,
                "feature_validation_finished",
                evidence=(feature_summary,),
                feature_validation_passed=bool(feature_validation.passed),
                validation_summary=feature_summary,
                local_sha=self.git.head_sha(),
            )
            if not feature_validation.passed:
                return self._blocked(
                    store,
                    state,
                    branch,
                    run_id,
                    ("feature validation did not PASS",),
                    result,
                )
            if mode == "local":
                return self._result_from_state(state, status="LOCALLY_COMPLETE")

            assert owner is not None and repository is not None
            pull_request = self._reconcile_pull_request(
                state=state,
                collection=collection,
                owner=owner,
                repository=repository,
                branch=branch,
                base_branch=base_branch,
            )
            if state.pull_request != pull_request.number:
                state = self._record(
                    store,
                    state,
                    "pull_request_reconciled",
                    evidence=(f"pull_request={pull_request.number}",),
                    pull_request=pull_request.number,
                )
            advance(
                LoopState.CI_PENDING,
                evidence=(f"final_checks_sha={state.remote_sha}",),
            )
            final_observation = self._observe_ci(
                pull_request=pull_request,
                owner=owner,
                repository=repository,
                expected_sha=state.remote_sha or self.git.head_sha(),
            )
            state = self._record_ci(store, state, final_observation, "final")
            if final_observation.state is not CheckState.PASSED:
                return self._blocked(
                    store,
                    state,
                    branch,
                    run_id,
                    (f"final CI checks ended as {final_observation.state.value}",),
                    result,
                )
            if not ready_for_review(
                tasks_completed=len(state.completed_tasks) == len(collection.tasks),
                feature_validation_passed=state.feature_validation_passed,
                local_sha=self.git.head_sha(),
                remote_sha=state.remote_sha,
                draft_pr_open=pull_request.is_draft and pull_request.state.casefold() == "open",
                pull_request_head_sha=pull_request.head_sha,
                ci_passed=state.ci_status == CheckState.PASSED.value,
                clean_worktree=self.git.git.is_clean(),
                human_gate=False,
                blockers=state.blocking_issues,
            ):
                return self._blocked(
                    store,
                    state,
                    branch,
                    run_id,
                    ("final ready-for-review predicate did not pass",),
                    result,
                )
            self.checkpoint("after_final_check_before_ready")
            advance(
                LoopState.READY_FOR_REVIEW,
                evidence=(f"pull_request={pull_request.number}",),
            )
            final_pull_request = self._reconcile_pull_request(
                state=state,
                collection=collection,
                owner=owner,
                repository=repository,
                branch=branch,
                base_branch=base_branch,
            )
            state = self._record(
                store,
                state,
                "pull_request_ready_summary_updated",
                evidence=(
                    f"pull_request={final_pull_request.number}",
                    f"ci_status={state.ci_status}",
                ),
            )
            return self._result_from_state(state, status="READY_FOR_REVIEW")
        except (CommandError, ValidationPolicyError, ValueError) as error:
            return self._blocked(store, state, branch, run_id, (str(error),))

    def _record(
        self,
        store: StateStore,
        state: RunState,
        event_type: str,
        *,
        task_id: str | None = None,
        evidence: tuple[str, ...] = (),
        **updates: Any,
    ) -> RunState:
        event = RunEvent(
            event_id=f"{state.run_id}-{state.revision + 1}",
            sequence=len(store.read_events()) + 1,
            occurred_at=datetime.now(UTC),
            feature_id=state.feature_id,
            run_id=state.run_id,
            event_type=event_type,
            from_state=state.state.value,
            to_state=state.state.value,
            task_id=task_id,
            evidence=evidence,
        )
        store.append_event(event)
        return store.write_state(state.model_copy(update=updates), expected_revision=state.revision)

    def _result_from_state(self, state: RunState, *, status: str) -> LifecycleResult:
        next_action = (
            "human review"
            if status == "READY_FOR_REVIEW"
            else "human review or resume --mode draft-pr"
        )
        return LifecycleResult(
            status=status,
            run_id=state.run_id,
            feature_id=state.feature_id,
            branch=state.branch or self.git.current_branch(),
            worktree=state.worktree or str(self.worktree),
            phase=state.state.value,
            current_task=state.active_task_id,
            local_sha=state.local_sha or self.git.head_sha(),
            remote_sha=state.remote_sha,
            pull_request=state.pull_request,
            ci_status=state.ci_status,
            next_action=next_action,
            human_gate=False,
            blocking_issues=state.blocking_issues,
        )

    def _planning_commit_exists(self, feature_id: str, run_id: str) -> bool:
        if not self.git.git.is_clean():
            return False
        matches = set(self.git.git.commits_with_trailer("Studio-Feature", feature_id))
        matches.intersection_update(self.git.git.commits_with_trailer("Studio-Task", "PLAN"))
        matches.intersection_update(self.git.git.commits_with_trailer("Studio-Run", run_id))
        if len(matches) != 1:
            return False
        return self.git.git.is_ancestor(next(iter(matches)), self.git.head_sha())

    def _publish_planning_revision(
        self,
        *,
        store: StateStore,
        state: RunState,
        advance: Callable[..., RunState],
        collection: TaskCollection,
        owner: str,
        repository: str,
        branch: str,
        base_branch: str,
        run_id: str,
    ) -> RunState:
        state, pull_request = self._push_and_reconcile_pr(
            store=store,
            state=state,
            advance=advance,
            collection=collection,
            owner=owner,
            repository=repository,
            branch=branch,
            base_branch=base_branch,
            run_id=run_id,
            task_id=None,
            commit_exists=self._planning_commit_exists(state.feature_id, run_id),
            validation_passed=True,
            reviewer_passed=True,
            completed_tasks=state.completed_tasks,
        )
        return advance(
            LoopState.DRAFT_PR_CREATED,
            evidence=(f"pull_request={pull_request.number}",),
        )

    @staticmethod
    def _latest_ci_failure(state: RunState) -> str:
        for item in reversed(state.ci_history):
            if "failure" in item.casefold() or "failed" in item.casefold():
                return item
        return "resume interrupted CI repair from durable controller evidence"

    def _controller_completion_evidence(
        self,
        *,
        collection: TaskCollection,
        run_id: str,
        task_id: str,
    ) -> TaskCompletionEvidence:
        path = (
            self.worktree
            / ".automation"
            / "state"
            / "controller"
            / run_id
            / "controller-state.json"
        )
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise CommandError(
                "TASK_COMPLETION_EVIDENCE_MISSING",
                "interrupted publication lacks readable controller evidence",
                ExitCategory.RECONCILIATION,
            ) from error
        task = next((item for item in collection.tasks if item.id == task_id), None)
        statuses = payload.get("task_statuses")
        commits = payload.get("commits")
        reports = payload.get("validation_reports")
        validation = payload.get("validation_summary")
        reviewer = payload.get("reviewer_output")
        if (
            task is None
            or not isinstance(statuses, dict)
            or statuses.get(task_id) != "completed"
            or not isinstance(commits, dict)
            or not isinstance(reports, list)
            or not isinstance(validation, dict)
            or validation.get("passed") is not True
            or not isinstance(reviewer, dict)
            or reviewer.get("task_id") != task_id
            or reviewer.get("verdict") != "PASS"
            or any(
                not isinstance(report, dict) or report.get("status") != "PASS" for report in reports
            )
        ):
            raise CommandError(
                "TASK_COMPLETION_EVIDENCE_INVALID",
                "interrupted publication lacks completed validation and Reviewer PASS evidence",
                ExitCategory.RECONCILIATION,
            )
        commit_sha = commits.get(task_id)
        if task.writes:
            matching = set(self.git.git.commits_with_trailer("Studio-Task", task_id))
            if (
                not isinstance(commit_sha, str)
                or commit_sha not in matching
                or not self.git.git.is_ancestor(commit_sha, self.git.head_sha())
            ):
                raise CommandError(
                    "TASK_COMMIT_EVIDENCE_INVALID",
                    "interrupted publication lacks a unique reachable task commit",
                    ExitCategory.RECONCILIATION,
                )
        elif commit_sha is not None:
            raise CommandError(
                "READ_ONLY_TASK_COMMIT_INVALID",
                "read-only task unexpectedly records a commit",
                ExitCategory.RECONCILIATION,
            )
        completed_count = sum(value == "completed" for value in statuses.values())
        summary = ", ".join(
            f"{report.get('profile')}: {report.get('status')}" for report in reports
        )
        return TaskCompletionEvidence(
            task_id=task_id,
            commit_sha=cast(str | None, commit_sha),
            validation_passed=True,
            reviewer_passed=True,
            validation_summary=summary,
            all_tasks_completed=completed_count == len(collection.tasks),
        )

    def _controller_task_statuses(self, run_id: str) -> dict[str, str] | None:
        path = (
            self.worktree
            / ".automation"
            / "state"
            / "controller"
            / run_id
            / "controller-state.json"
        )
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return None
        raw = payload.get("task_statuses")
        if not isinstance(raw, dict) or not all(
            isinstance(key, str) and isinstance(value, str) for key, value in raw.items()
        ):
            return None
        return cast(dict[str, str], raw)

    def _publish_completed_task(
        self,
        *,
        store: StateStore,
        state: RunState,
        advance: Callable[..., RunState],
        collection: TaskCollection,
        executor: AutonomousLoopController,
        evidence: TaskCompletionEvidence,
        owner: str,
        repository: str,
        branch: str,
        base_branch: str,
        run_id: str,
    ) -> RunState:
        state = self._record(
            store,
            state,
            "task_commit_accepted",
            task_id=evidence.task_id,
            evidence=(f"commit={evidence.commit_sha}",),
            validation_summary=evidence.validation_summary,
            local_sha=self.git.head_sha(),
        )
        completed_for_body = tuple(dict.fromkeys((*state.completed_tasks, evidence.task_id)))
        while True:
            local_sha = self.git.head_sha()
            if state.state is not LoopState.CI_PENDING or state.remote_sha != local_sha:
                state, pull_request = self._push_and_reconcile_pr(
                    store=store,
                    state=state,
                    advance=advance,
                    collection=collection,
                    owner=owner,
                    repository=repository,
                    branch=branch,
                    base_branch=base_branch,
                    run_id=run_id,
                    task_id=evidence.task_id,
                    commit_exists=True,
                    validation_passed=evidence.validation_passed,
                    reviewer_passed=evidence.reviewer_passed,
                    completed_tasks=completed_for_body,
                )
                state = advance(
                    LoopState.CI_PENDING,
                    task_id=evidence.task_id,
                    evidence=(f"checks_sha={state.remote_sha}",),
                )
            else:
                pull_request = self._reconcile_pull_request(
                    state=state,
                    collection=collection,
                    owner=owner,
                    repository=repository,
                    branch=branch,
                    base_branch=base_branch,
                    completed_tasks=completed_for_body,
                )
            observation = self._observe_ci(
                pull_request=pull_request,
                owner=owner,
                repository=repository,
                expected_sha=state.remote_sha or local_sha,
            )
            state = self._record_ci(store, state, observation, evidence.task_id)
            if observation.state is CheckState.PASSED:
                self.checkpoint("after_ci_success_before_transition")
                return self._record(
                    store,
                    state,
                    "task_published",
                    task_id=evidence.task_id,
                    evidence=(f"remote_sha={state.remote_sha}",),
                    completed_tasks=completed_for_body,
                    human_gate=False,
                    blocking_issues=(),
                )
            if observation.state is not CheckState.FAILED:
                raise CommandError(
                    "CI_NOT_PASSED",
                    f"required CI checks ended as {observation.state.value}",
                    ExitCategory.EXTERNAL,
                )
            mapped = map_failure_to_task(
                observation,
                collection,
                check_task_map=self.draft_pr_policy.check_task_map,
                current_task_id=evidence.task_id,
            )
            used = sum(
                1
                for item in state.ci_history
                if item.startswith(f"{evidence.task_id}: CI repair attempt")
            )
            budget = RetryBudget(
                RetryPolicy(ci_repair=self.draft_pr_policy.ci_repair_attempts),
                {"ci_repair": used},
            )
            decision = CiRepairService().schedule(
                feature_id=state.feature_id,
                task_id=mapped,
                observation=observation,
                budget=budget,
            )
            if decision.state != "DEBUGGER" or mapped is None or decision.attempt is None:
                raise CommandError(
                    "CI_REPAIR_BLOCKED",
                    decision.failure.summary,
                    ExitCategory.TASK,
                )
            state = advance(
                LoopState.REPAIRING,
                task_id=mapped,
                evidence=(decision.failure.summary,),
            )
            repaired = executor.repair_ci(
                collection,
                run_id=run_id,
                task_id=mapped,
                failure_summary=decision.failure.summary,
                writer_lock_held=True,
            )
            refreshed = store.read_state()
            if refreshed is not None:
                state = refreshed
            if repaired.state == "BLOCKED":
                raise CommandError(
                    "CI_REPAIR_FAILED",
                    repaired.blocker or "CI repair failed normal local gates",
                    ExitCategory.TASK,
                )
            history = (
                *state.ci_history,
                f"{mapped}: CI repair attempt {decision.attempt} committed",
            )
            state = self._record(
                store,
                state,
                "ci_repair_committed",
                task_id=mapped,
                evidence=(f"commit={self.git.head_sha()}",),
                ci_history=history,
                local_sha=self.git.head_sha(),
            )

    def _push_and_reconcile_pr(
        self,
        *,
        store: StateStore,
        state: RunState,
        advance: Callable[..., RunState],
        collection: TaskCollection,
        owner: str,
        repository: str,
        branch: str,
        base_branch: str,
        run_id: str,
        task_id: str | None,
        commit_exists: bool,
        validation_passed: bool,
        reviewer_passed: bool,
        completed_tasks: tuple[str, ...],
    ) -> tuple[RunState, Any]:
        if state.state is not LoopState.PUSHING:
            state = advance(
                LoopState.PUSHING,
                task_id=task_id,
                evidence=(f"local_sha={self.git.head_sha()}",),
            )
        local_sha = self.git.head_sha()
        remote_sha = PublishingService(self.git).push(
            PushRequest(
                mode="draft-pr",
                feature_branch=branch,
                base_branch=base_branch,
                remote=self.draft_pr_policy.remote,
                local_sha=local_sha,
                task_commit_exists=commit_exists,
                reviewer_passed=reviewer_passed,
                validation_passed=validation_passed,
                expected_remote_sha=state.remote_sha,
            )
        )
        self.checkpoint("after_push_before_remote_state")
        state = self._record(
            store,
            state,
            "push_succeeded",
            task_id=task_id,
            evidence=(f"remote_sha={remote_sha}",),
            local_sha=local_sha,
            remote_sha=remote_sha,
        )
        pull_request = self._reconcile_pull_request(
            state=state,
            collection=collection,
            owner=owner,
            repository=repository,
            branch=branch,
            base_branch=base_branch,
            completed_tasks=completed_tasks,
        )
        self.checkpoint("after_pr_create_before_state")
        state = self._record(
            store,
            state,
            "pull_request_reconciled",
            task_id=task_id,
            evidence=(f"pull_request={pull_request.number}",),
            pull_request=pull_request.number,
        )
        return state, pull_request

    def _reconcile_pull_request(
        self,
        *,
        state: RunState,
        collection: TaskCollection,
        owner: str,
        repository: str,
        branch: str,
        base_branch: str,
        completed_tasks: tuple[str, ...] | None = None,
    ) -> Any:
        assert self.github is not None
        completed = completed_tasks if completed_tasks is not None else state.completed_tasks
        remaining = tuple(task.id for task in collection.tasks if task.id not in completed)
        return PullRequestService(self.github, workspace=self.worktree).reconcile(
            PullRequestRequest(
                owner=owner,
                repository=repository,
                feature_id=state.feature_id,
                base_branch=base_branch,
                head_branch=branch,
                head_sha=state.remote_sha or self.git.head_sha(),
                title=f"{state.feature_id}: automated feature",
                spec_path=f"specs/{state.feature_id}/spec.md",
                plan_path=f"specs/{state.feature_id}/plan.md",
                completed_tasks=completed,
                remaining_tasks=remaining,
                current_state=state.state.value,
                test_summary=state.validation_summary or "No task validation recorded yet.",
                validation_summary=state.validation_summary,
                local_sha=self.git.head_sha(),
                remote_sha=state.remote_sha,
                blockers=state.blocking_issues,
                ci_history=state.ci_history,
                recorded_number=state.pull_request,
            )
        )

    def _observe_ci(
        self,
        *,
        pull_request: Any,
        owner: str,
        repository: str,
        expected_sha: str,
    ) -> CheckObservation:
        assert self.github is not None
        self.checkpoint("during_ci_polling")
        return CiObserver(self.github).poll(
            owner=owner,
            repository=repository,
            pull_request=pull_request,
            expected_head_sha=expected_sha,
            required=self.draft_pr_policy.required_checks,
            interval_seconds=self.draft_pr_policy.check_interval_seconds,
            timeout_seconds=self.draft_pr_policy.check_timeout_seconds,
            max_attempts=self.draft_pr_policy.check_max_attempts,
            missing_checks=self.draft_pr_policy.missing_checks,
        )

    def _record_ci(
        self,
        store: StateStore,
        state: RunState,
        observation: CheckObservation,
        scope: str,
    ) -> RunState:
        details = (
            ", ".join(f"{check.name}: {check.state}" for check in observation.checks)
            or ", ".join(observation.diagnostics)
            or observation.state.value
        )
        history = (*state.ci_history, f"{scope}: {details}"[:2000])
        return self._record(
            store,
            state,
            "ci_observed",
            evidence=(f"sha={observation.head_sha}", f"state={observation.state.value}"),
            ci_status=observation.state.value,
            ci_history=history,
        )

    def _planner_output(
        self, metadata: dict[str, Any], request: str, run_id: str
    ) -> dict[str, Any]:
        package = (
            self.worktree / ".automation" / "state" / "planner" / run_id / "planner-input.json"
        )
        _atomic_text(
            package,
            json.dumps(
                {
                    "schema_version": "1.1.0",
                    "package_type": "planner",
                    "feature_id": metadata["feature_id"],
                    "branch": metadata["branch"],
                    "title": metadata.get("title", ""),
                    "request": request[:16_000],
                    "allowed_write_paths": [],
                },
                ensure_ascii=False,
                sort_keys=True,
            )
            + "\n",
        )
        result = self.role_runner.run("planner", package, invocation_id=f"{run_id}-planner-1")
        output = getattr(result, "output", None)
        if not getattr(result, "succeeded", False) or not isinstance(output, dict):
            raise CommandError(
                "PLANNER_FAILED", "planner invocation failed or lacked structured output"
            )
        schema_path = self.worktree / ".studio-loop" / "schemas" / "planner-output.schema.json"
        schema = json.loads(schema_path.read_text(encoding="utf-8"))
        errors = sorted(
            Draft202012Validator(schema).iter_errors(output), key=lambda error: list(error.path)
        )
        if errors:
            raise CommandError(
                "PLANNER_OUTPUT_INVALID",
                f"planner output violates schema at {list(errors[0].path)}",
            )
        return output

    def _write_planner_artifacts(
        self, directory: Path, feature_id: str, output: dict[str, Any]
    ) -> TaskCollection:
        raw_tasks = output["tasks"]
        if not isinstance(raw_tasks, dict):
            raise CommandError("PLANNER_OUTPUT_INVALID", "planner tasks must be an object")
        collection = TaskCollection.model_validate(raw_tasks)
        if collection.feature_id != feature_id:
            raise CommandError(
                "PLANNER_FEATURE_MISMATCH", "planner tasks feature_id differs from feature"
            )
        TaskGraph(collection)
        _atomic_text(directory / "spec.md", str(output["spec_markdown"]).rstrip() + "\n")
        _atomic_text(directory / "plan.md", str(output["plan_markdown"]).rstrip() + "\n")
        _atomic_text(directory / "tasks.json", collection.canonical_json() + "\n")
        _atomic_text(directory / "tasks.md", render_tasks(collection))
        return collection

    def _commit_planning_artifacts(self, feature_id: str, run_id: str) -> None:
        changed = DiffGuard(self.worktree).snapshot().changed_paths
        paths = tuple(path for path in changed if path.startswith(f"specs/{feature_id}/"))
        if not paths or len(paths) != len(changed):
            raise CommandError(
                "PLANNER_WRITE_SCOPE", "planner artifact write set is incomplete or unsafe"
            )
        self.git.commit_files(
            files=paths,
            feature_id=feature_id,
            task_id="PLAN",
            run_id=run_id,
            subject="record validated planning artifacts",
            expected_branch=feature_id,
        )

    def _blocked(
        self,
        store: StateStore,
        state: RunState,
        branch: str,
        run_id: str,
        issues: tuple[str, ...],
        task_result: ControllerResult | None = None,
    ) -> LifecycleResult:
        persisted = store.read_state()
        if persisted is not None and persisted.revision > state.revision:
            state = persisted
        blocked_state = state
        if state.state is not LoopState.BLOCKED:
            try:
                transition(state.state, LoopState.BLOCKED)
                event = RunEvent(
                    event_id=f"{run_id}-blocked-{state.revision + 1}",
                    sequence=len(store.read_events()) + 1,
                    occurred_at=datetime.now(UTC),
                    feature_id=state.feature_id,
                    run_id=run_id,
                    event_type="blocked",
                    from_state=state.state.value,
                    to_state=LoopState.BLOCKED.value,
                    task_id=state.active_task_id,
                    evidence=issues,
                )
                store.append_event(event)
                blocked_state = store.write_state(
                    state.model_copy(
                        update={
                            "state": LoopState.BLOCKED,
                            "human_gate": True,
                            "blocking_issues": issues,
                            "local_sha": self.git.head_sha(),
                        }
                    ),
                    expected_revision=state.revision,
                )
            except Exception as error:
                raise CommandError(
                    "BLOCK_STATE_PERSIST_FAILED",
                    "failed to persist the blocked lifecycle state",
                    ExitCategory.RECONCILIATION,
                ) from error
        context = self._pull_request_context
        if context is not None and blocked_state.pull_request is not None:
            owner, repository, base_branch = context
            tasks_path = self.worktree / "specs" / blocked_state.feature_id / "tasks.json"
            try:
                collection = TaskCollection.model_validate_json(
                    tasks_path.read_text(encoding="utf-8")
                )
                pull_request = self._reconcile_pull_request(
                    state=blocked_state,
                    collection=collection,
                    owner=owner,
                    repository=repository,
                    branch=branch,
                    base_branch=base_branch,
                )
                blocked_state = self._record(
                    store,
                    blocked_state,
                    "blocked_pull_request_summary_updated",
                    evidence=(f"pull_request={pull_request.number}",),
                )
            except (OSError, ValueError, CommandError):
                # The original blocker remains authoritative; a secondary PR-body
                # update failure must not erase or broaden it.
                pass
        return LifecycleResult(
            status="BLOCKED",
            run_id=run_id,
            feature_id=state.feature_id,
            branch=branch,
            worktree=str(self.worktree),
            phase="BLOCKED",
            current_task=task_result.planned_task_id
            if task_result
            else blocked_state.active_task_id,
            local_sha=self.git.head_sha(),
            remote_sha=blocked_state.remote_sha,
            pull_request=blocked_state.pull_request,
            ci_status=blocked_state.ci_status,
            next_action="resolve blocker and resume",
            human_gate=True,
            blocking_issues=issues,
        )
