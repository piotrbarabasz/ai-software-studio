"""CLI-facing composition of the planner and single-task execution controller.

This module deliberately contains no agent policy: agents provide structured
data, while this controller validates it, writes artifacts and advances state.
"""

from __future__ import annotations

import json
import os
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any, Protocol

from jsonschema import Draft202012Validator  # type: ignore[import-untyped]

from .controller import AutonomousLoopController, ControllerResult
from .diff_guard import DiffGuard
from .errors import CommandError, ExitCategory
from .git_service import GitService
from .locking import RepositoryLock
from .models import RunEvent, RunState, TaskCollection, utc_now
from .roles import RoleName
from .state_machine import LoopState, transition
from .state_store import StateStore
from .task_graph import TaskGraph
from .task_renderer import render_tasks
from .validation_runner import ValidationPolicyError, ValidationRunner


class RoleRunner(Protocol):
    def run(self, role: RoleName, task_package_path: Path, *, invocation_id: str) -> Any: ...


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

    def __init__(self, worktree: Path, *, role_runner: RoleRunner) -> None:
        self.worktree = worktree.resolve()
        self.role_runner = role_runner
        self.git = GitService(self.worktree)

    def run(
        self,
        *,
        metadata: dict[str, Any],
        request: str,
        mode: str,
        run_id: str | None = None,
    ) -> LifecycleResult:
        with RepositoryLock.for_repository(self.worktree):
            return self._run_locked(
                metadata=metadata,
                request=request,
                mode=mode,
                run_id=run_id,
            )

    def _run_locked(
        self,
        *,
        metadata: dict[str, Any],
        request: str,
        mode: str,
        run_id: str | None = None,
    ) -> LifecycleResult:
        if mode not in {"local", "draft-pr"}:
            raise CommandError("MODE_INVALID", "lifecycle requires local or draft-pr mode")
        feature_id = str(metadata["feature_id"])
        branch = str(metadata["branch"])
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
            )
            state = store.write_state(state)
        else:
            state = loaded_state

        def advance(target: LoopState, *, task_id: str | None = None) -> None:
            nonlocal state
            current = state.state
            if current != target:
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
            )
            store.append_event(event)
            state = store.write_state(
                state.model_copy(update={"state": target, "active_task_id": task_id}),
                expected_revision=state.revision,
            )

        try:
            if state.state is LoopState.CREATED:
                advance(LoopState.PREFLIGHT)
                advance(LoopState.WORKTREE_CREATED)
            artifacts = self.worktree / "specs" / feature_id
            tasks_path = artifacts / "tasks.json"
            if not tasks_path.exists():
                advance(LoopState.SPECIFICATION)
                advance(LoopState.PLANNING)
                output = self._planner_output(metadata, request, run_id)
                if output.get("status") != "ready":
                    issues = tuple(str(item) for item in output.get("blocking_issues", ()))
                    return self._blocked(
                        store, state, branch, run_id, issues or ("planner did not reach ready",)
                    )
                advance(LoopState.TASK_GENERATION)
                collection = self._write_planner_artifacts(artifacts, feature_id, output)
                ValidationRunner(self.worktree).ensure_known(
                    tuple(task.validation_profile for task in collection.tasks)
                )
                TaskGraph(collection)
                self._commit_planning_artifacts(feature_id, run_id)
                advance(LoopState.SPEC_VALIDATION)
            else:
                collection = TaskCollection.model_validate_json(
                    tasks_path.read_text(encoding="utf-8")
                )
                TaskGraph(collection)
                ValidationRunner(self.worktree).ensure_known(
                    tuple(task.validation_profile for task in collection.tasks)
                )
                if state.state is not LoopState.SPEC_VALIDATION:
                    # A pre-existing artifact can only be resumed from a durable,
                    # verified planning boundary.
                    return self._blocked(
                        store, state, branch, run_id, ("runtime planning state is ambiguous",)
                    )

            advance(LoopState.TASK_SELECTED)
            result: ControllerResult = AutonomousLoopController(
                self.worktree,
                role_runner=self.role_runner,  # type: ignore[arg-type]
                runtime_directory=self.worktree / ".automation" / "state" / "controller",
            ).run(collection, run_id=run_id, mode="local", writer_lock_held=True)
            if result.state != "ALL_COMPLETED":
                return self._blocked(
                    store,
                    state,
                    branch,
                    run_id,
                    (result.blocker or "task execution stopped",),
                    result,
                )
            advance(LoopState.IMPLEMENTING)
            advance(LoopState.VALIDATING)
            advance(LoopState.REVIEWING)
            advance(LoopState.COMMITTING)
            advance(LoopState.FEATURE_VALIDATION)
            if mode == "draft-pr":
                return self._blocked(
                    store,
                    state,
                    branch,
                    run_id,
                    ("draft-pr publication and CI reconciliation are not implemented",),
                )
            return LifecycleResult(
                "LOCALLY_COMPLETE",
                run_id,
                feature_id,
                branch,
                str(self.worktree),
                "FEATURE_VALIDATION",
                None,
                self.git.head_sha(),
                next_action="human review or resume --mode draft-pr",
            )
        except (CommandError, ValidationPolicyError, ValueError) as error:
            return self._blocked(store, state, branch, run_id, (str(error),))

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
        if state.state is not LoopState.BLOCKED:
            try:
                event = RunEvent(
                    event_id=f"{run_id}-blocked-{state.revision + 1}",
                    sequence=len(store.read_events()) + 1,
                    occurred_at=datetime.now(UTC),
                    feature_id=state.feature_id,
                    run_id=run_id,
                    event_type="blocked",
                    from_state=state.state.value,
                    to_state=LoopState.BLOCKED.value,
                )
                store.append_event(event)
                store.write_state(
                    state.model_copy(update={"state": LoopState.BLOCKED}),
                    expected_revision=state.revision,
                )
            except Exception as error:
                raise CommandError(
                    "BLOCK_STATE_PERSIST_FAILED",
                    "failed to persist the blocked lifecycle state",
                    ExitCategory.RECONCILIATION,
                ) from error
        return LifecycleResult(
            "BLOCKED",
            run_id,
            state.feature_id,
            branch,
            str(self.worktree),
            "BLOCKED",
            task_result.planned_task_id if task_result else state.active_task_id,
            self.git.head_sha(),
            next_action="resolve blocker and resume",
            human_gate=True,
            blocking_issues=issues,
        )
