from __future__ import annotations

import json
import os
import subprocess
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import pytest

from studio_loop.controller import AutonomousLoopController, ControllerCrash
from studio_loop.models import TaskCollection
from studio_loop.retry_policy import RetryPolicy
from studio_loop.validation_runner import ValidationPolicyError


def git(repository: Path, *arguments: str) -> str:
    result = subprocess.run(
        ["git", *arguments], cwd=repository, text=True, capture_output=True, check=True
    )
    return result.stdout.strip()


@pytest.fixture
def repository(tmp_path: Path) -> Path:
    root = tmp_path / "controller repo"
    root.mkdir()
    git(root, "init", "-b", "007-autonomous-loop")
    git(root, "config", "user.name", "Controller Test")
    git(root, "config", "user.email", "controller@example.invalid")
    (root / ".gitignore").write_text(".automation/state/\n", encoding="utf-8")
    (root / "README.md").write_text("base\n", encoding="utf-8")
    git(root, "add", ".gitignore", "README.md")
    git(root, "commit", "-m", "base")
    return root


def task_collection(
    *,
    allowed: tuple[str, ...] = ("work.txt",),
    profile: str = "trusted",
    status: str = "pending",
    tasks: list[dict[str, Any]] | None = None,
) -> TaskCollection:
    if tasks is None:
        tasks = [
            {
                "id": "T100",
                "phase": "P01-core",
                "title": "Write controlled file",
                "description": "Write one file through the controlled task flow.",
                "dependencies": [],
                "requirement_ids": ["FR-001"],
                "allowed_read_paths": ["README.md"],
                "allowed_write_paths": list(allowed),
                "writes": bool(allowed),
                "validation_profile": profile,
                "completion_criteria": ["controlled file exists"],
                "tests": ["trusted validation"],
                "status": status,
            }
        ]
    return TaskCollection.model_validate(
        {
            "schema_version": "1.0.0",
            "feature_id": "007-autonomous-loop",
            "requirements": ["FR-001"],
            "tasks": tasks,
        }
    )


@dataclass
class RoleResult:
    output: dict[str, Any] | None
    ok: bool = True
    attempts: int = 1

    @property
    def succeeded(self) -> bool:
        return self.ok


class FakeRoles:
    def __init__(
        self,
        repository: Path,
        *,
        actions: dict[str, list[Callable[[dict[str, Any]], dict[str, Any] | None]]] | None = None,
    ) -> None:
        self.repository = repository
        self.actions = actions or {}
        self.calls: list[tuple[str, str]] = []

    def _default(self, role: str, package: dict[str, Any]) -> dict[str, Any]:
        task_id = str(package["task_id"])
        if role == "implementer":
            path = package["allowed_write_paths"][0]
            (self.repository / path).write_text(f"implemented {task_id}\n", encoding="utf-8")
            return {
                "status": "implemented",
                "task_id": task_id,
                "summary": "implemented",
                "claimed_changed_files": [path],
                "commands_requested": [],
                "blocking_issues": [],
            }
        if role == "reviewer":
            return {
                "verdict": "PASS",
                "task_id": task_id,
                "blocking_findings": [],
                "non_blocking_findings": [],
                "covered_requirements": ["FR-001"],
                "recommended_action": "commit",
            }
        return {
            "status": "repaired",
            "task_id": task_id,
            "addressed_failures": ["failure"],
            "remaining_failures": [],
            "claimed_changed_files": package["allowed_write_paths"],
        }

    def run(self, role: str, task_package_path: Path, *, invocation_id: str) -> RoleResult:
        package = json.loads(task_package_path.read_text(encoding="utf-8"))
        self.calls.append((role, invocation_id))
        queue = self.actions.get(role, [])
        output = queue.pop(0)(package) if queue else self._default(role, package)
        return RoleResult(output=output, ok=output is not None)


class FakeValidations:
    def __init__(
        self,
        repository: Path,
        status: str | Callable[[], str] = "PASS",
        *,
        known: tuple[str, ...] = ("trusted",),
    ) -> None:
        self.repository = repository
        self.status = status
        self.known = set(known)
        self.calls: list[str] = []

    def ensure_known(self, names: tuple[str, ...]) -> None:
        unknown = set(names) - self.known
        if unknown:
            raise ValidationPolicyError("outside allowlist: " + ", ".join(sorted(unknown)))

    def run(self, profile: str) -> dict[str, Any]:
        self.calls.append(profile)
        status = self.status() if callable(self.status) else self.status
        return {
            "profile": profile,
            "argv": ["python", "-m", "pytest"],
            "working_directory": ".",
            "started_at": "2026-07-12T10:00:00+00:00",
            "ended_at": "2026-07-12T10:00:01+00:00",
            "exit_code": 0 if status == "PASS" else 1,
            "stdout": "ok" if status == "PASS" else "failed",
            "stderr": "",
            "truncated": False,
            "truncation_marker": None,
            "status": status,
        }


def controller(
    repository: Path,
    roles: FakeRoles,
    validations: FakeValidations,
    **kwargs: Any,
) -> AutonomousLoopController:
    return AutonomousLoopController(
        repository,
        role_runner=roles,
        validation_runner=validations,
        **kwargs,
    )


def test_full_happy_path_and_local_commit(repository: Path) -> None:
    roles = FakeRoles(repository)
    result = controller(repository, roles, FakeValidations(repository)).run(
        task_collection(), run_id="run-happy"
    )
    assert result.state == "ALL_COMPLETED"
    assert result.task_statuses == {"T100": "completed"}
    assert list(result.commits) == ["T100"]
    assert [name for name, _ in roles.calls] == ["implementer", "reviewer"]
    message = git(repository, "show", "-s", "--format=%B", "HEAD")
    assert "Studio-Feature: 007-autonomous-loop" in message
    assert "Studio-Task: T100" in message
    assert "Studio-Run: run-happy" in message
    assert git(repository, "status", "--short") == ""


@pytest.mark.parametrize(
    ("changed_path", "allowed", "expected"),
    [
        ("other.txt", ("work.txt",), "outside allowed_paths"),
        ("forbidden/data.txt", ("forbidden",), "forbidden path"),
        (".env", (".env",), "secret-bearing path"),
    ],
)
def test_diff_violations_block_without_reverting(
    repository: Path, changed_path: str, allowed: tuple[str, ...], expected: str
) -> None:
    def mutate(package: dict[str, Any]) -> dict[str, Any]:
        path = repository / changed_path
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("unsafe change\n", encoding="utf-8")
        return {
            "status": "implemented",
            "task_id": package["task_id"],
            "summary": "done",
            "claimed_changed_files": [changed_path],
            "commands_requested": [],
            "blocking_issues": [],
        }

    roles = FakeRoles(repository, actions={"implementer": [mutate]})
    loop = controller(repository, roles, FakeValidations(repository))
    if changed_path.startswith("forbidden"):
        loop.diff_guard.forbidden_paths += ("forbidden",)
    result = loop.run(task_collection(allowed=allowed), run_id="run-violation")
    assert result.state == "BLOCKED"
    assert expected in (result.blocker or "")
    assert (repository / changed_path).exists()
    assert git(repository, "rev-list", "--count", "HEAD") == "1"


def test_validation_failure_blocks_without_review_or_commit(repository: Path) -> None:
    def failed_debugger(package: dict[str, Any]) -> dict[str, Any]:
        return {
            "status": "failed",
            "task_id": package["task_id"],
            "addressed_failures": [],
            "remaining_failures": ["still failing"],
            "claimed_changed_files": [],
        }

    roles = FakeRoles(repository, actions={"debugger": [failed_debugger, failed_debugger]})
    result = controller(repository, roles, FakeValidations(repository, "FAIL")).run(
        task_collection(), run_id="run-validation-fail"
    )
    assert result.state == "BLOCKED"
    assert [role for role, _ in roles.calls].count("reviewer") == 0
    assert "T100" not in result.commits


def test_reviewer_failure_blocks_after_debugger_budget(repository: Path) -> None:
    def reviewer_fail(package: dict[str, Any]) -> dict[str, Any]:
        return {
            "verdict": "FAIL",
            "task_id": package["task_id"],
            "blocking_findings": ["not ready"],
            "non_blocking_findings": [],
            "covered_requirements": [],
            "recommended_action": "repair",
        }

    roles = FakeRoles(
        repository, actions={"reviewer": [reviewer_fail, reviewer_fail, reviewer_fail]}
    )
    result = controller(repository, roles, FakeValidations(repository)).run(
        task_collection(), run_id="run-review-fail"
    )
    assert result.state == "BLOCKED"
    assert [role for role, _ in roles.calls].count("debugger") == 2
    assert not result.commits


def test_debugger_repair_success_replays_all_gates(repository: Path) -> None:
    validations = FakeValidations(
        repository,
        lambda: (
            "PASS" if (repository / "work.txt").read_text(encoding="utf-8") == "fixed\n" else "FAIL"
        ),
    )

    def repair(package: dict[str, Any]) -> dict[str, Any]:
        (repository / "work.txt").write_text("fixed\n", encoding="utf-8")
        return FakeRoles(repository)._default("debugger", package)

    roles = FakeRoles(repository, actions={"debugger": [repair]})
    result = controller(repository, roles, validations).run(
        task_collection(), run_id="run-debug-success"
    )
    assert result.state == "ALL_COMPLETED"
    assert validations.calls == ["trusted", "trusted"]
    assert [role for role, _ in roles.calls] == ["implementer", "debugger", "reviewer"]


def test_debugger_repair_failure_exhausts_budget(repository: Path) -> None:
    roles = FakeRoles(repository)
    result = controller(repository, roles, FakeValidations(repository, "FAIL")).run(
        task_collection(), run_id="run-debug-failure"
    )
    assert result.state == "BLOCKED"
    assert [role for role, _ in roles.calls].count("debugger") == 2
    assert result.human_gate is True


def test_implementer_retry_exhausted(repository: Path) -> None:
    roles = FakeRoles(repository, actions={"implementer": [lambda _: None, lambda _: None]})
    result = controller(repository, roles, FakeValidations(repository)).run(
        task_collection(), run_id="run-implementer-exhausted"
    )
    assert result.state == "BLOCKED"
    assert "implementer retry budget exhausted" in (result.blocker or "")
    assert [role for role, _ in roles.calls] == ["implementer", "implementer"]


def test_invalid_reviewer_task_id_blocks(repository: Path) -> None:
    def wrong_task(package: dict[str, Any]) -> dict[str, Any]:
        output = FakeRoles(repository)._default("reviewer", package)
        output["task_id"] = "T999"
        return output

    roles = FakeRoles(repository, actions={"reviewer": [wrong_task]})
    result = controller(
        repository,
        roles,
        FakeValidations(repository),
        retry_policy=RetryPolicy(debugger=0),
    ).run(task_collection(), run_id="run-wrong-review")
    assert result.state == "BLOCKED"
    assert "task_id" in (result.blocker or "") or "debugger" in (result.blocker or "")
    assert not result.commits


def test_reviewer_pass_cannot_override_failed_validation(repository: Path) -> None:
    roles = FakeRoles(repository)
    result = controller(
        repository,
        roles,
        FakeValidations(repository, "FAIL"),
        retry_policy=RetryPolicy(debugger=0),
    ).run(task_collection(), run_id="run-failed-validation-pass-review")
    assert result.state == "BLOCKED"
    assert all(role != "reviewer" for role, _ in roles.calls)
    assert not result.commits


def test_reviewer_pass_requires_complete_requirement_coverage(repository: Path) -> None:
    def incomplete(package: dict[str, Any]) -> dict[str, Any]:
        output = FakeRoles(repository)._default("reviewer", package)
        output["covered_requirements"] = []
        return output

    roles = FakeRoles(repository, actions={"reviewer": [incomplete]})
    result = controller(
        repository,
        roles,
        FakeValidations(repository),
        retry_policy=RetryPolicy(debugger=0),
    ).run(task_collection(), run_id="run-incomplete-review")
    assert result.state == "BLOCKED"
    assert "requirement" in (result.blocker or "") or "debugger" in (result.blocker or "")
    assert not result.commits


def test_agent_branch_change_blocks(repository: Path) -> None:
    def change_branch(package: dict[str, Any]) -> dict[str, Any]:
        git(repository, "switch", "-c", "agent-branch")
        return FakeRoles(repository)._default("implementer", package)

    roles = FakeRoles(repository, actions={"implementer": [change_branch]})
    result = controller(repository, roles, FakeValidations(repository)).run(
        task_collection(), run_id="run-branch-change"
    )
    assert result.state == "BLOCKED"
    assert "changed the current branch" in (result.blocker or "")


def test_agent_cannot_create_hidden_git_ref(repository: Path) -> None:
    def create_ref(package: dict[str, Any]) -> dict[str, Any]:
        git(repository, "branch", "agent-hidden-ref")
        return FakeRoles(repository)._default("implementer", package)

    roles = FakeRoles(repository, actions={"implementer": [create_ref]})
    result = controller(repository, roles, FakeValidations(repository)).run(
        task_collection(), run_id="run-hidden-ref"
    )
    assert result.state == "BLOCKED"
    assert "protected .git control" in (result.blocker or "")


def test_preexisting_foreign_change_blocks_before_agent(repository: Path) -> None:
    (repository / "foreign.txt").write_text("user work\n", encoding="utf-8")
    roles = FakeRoles(repository)
    result = controller(repository, roles, FakeValidations(repository)).run(
        task_collection(), run_id="run-foreign-change"
    )
    assert result.state == "BLOCKED"
    assert roles.calls == []
    assert (repository / "foreign.txt").read_text(encoding="utf-8") == "user work\n"


def test_implementer_cannot_change_runtime_state(repository: Path) -> None:
    def change_runtime(package: dict[str, Any]) -> dict[str, Any]:
        state = (
            repository
            / ".automation"
            / "state"
            / "controller"
            / package["run_id"]
            / "controller-state.json"
        )
        state.write_text("agent-owned runtime\n", encoding="utf-8")
        return FakeRoles(repository)._default("implementer", package)

    roles = FakeRoles(repository, actions={"implementer": [change_runtime]})
    result = controller(repository, roles, FakeValidations(repository)).run(
        task_collection(), run_id="run-runtime-change"
    )
    assert result.state == "BLOCKED"
    assert "runtime state" in (result.blocker or "")


def test_implementer_cannot_change_task_status_artifact(repository: Path) -> None:
    status_path = repository / "specs" / "007-autonomous-loop" / "tasks.md"

    def change_status(package: dict[str, Any]) -> dict[str, Any]:
        status_path.parent.mkdir(parents=True, exist_ok=True)
        status_path.write_text("- [X] T100 agent completion\n", encoding="utf-8")
        return FakeRoles(repository)._default("implementer", package)

    roles = FakeRoles(repository, actions={"implementer": [change_status]})
    result = controller(repository, roles, FakeValidations(repository)).run(
        task_collection(allowed=("work.txt", "specs/007-autonomous-loop")),
        run_id="run-task-status-change",
    )
    assert result.state == "BLOCKED"
    assert "task status" in (result.blocker or "")


def test_symlink_escape_blocks(repository: Path, tmp_path: Path) -> None:
    outside = tmp_path / "outside"
    outside.mkdir()
    outside_file = outside / "work.txt"
    outside_file.write_text("outside\n", encoding="utf-8")
    link = repository / "linked"
    try:
        os.symlink(outside, link, target_is_directory=True)
    except OSError as symlink_error:
        if os.name != "nt":
            pytest.skip(f"directory symlink creation is unavailable: {symlink_error}")
        junction = subprocess.run(
            ["cmd.exe", "/d", "/c", "mklink", "/J", str(link), str(outside)],
            text=True,
            capture_output=True,
            shell=False,
            check=False,
        )
        if junction.returncode != 0:
            pytest.skip(
                "neither directory symlinks nor Windows junctions are available: "
                f"{symlink_error}; {junction.stderr.strip()}"
            )

    try:
        roles = FakeRoles(repository)
        result = controller(repository, roles, FakeValidations(repository)).run(
            task_collection(allowed=("linked/work.txt",)), run_id="run-symlink"
        )
        assert result.state == "BLOCKED"
        assert result.human_gate is True
        assert result.task_statuses["T100"] == "blocked"
        assert roles.calls == []
        assert outside_file.read_text(encoding="utf-8") == "outside\n"
        assert "pre-execution write-surface policy" in (result.blocker or "")
        assert "outside the active worktree" in (result.blocker or "")
        failure_path = (
            repository
            / ".automation"
            / "state"
            / "controller"
            / "run-symlink"
            / "T100"
            / "failure-package.json"
        )
        failure = json.loads(failure_path.read_text(encoding="utf-8"))
        assert failure["failure_package"]["failure_class"] == "policy"
        assert "outside the active worktree" in failure["failure_package"]["summary"]
    finally:
        if link.is_symlink():
            link.unlink()
        elif link.exists():
            os.rmdir(link)


def test_debugger_is_not_invoked_when_write_surface_becomes_unsafe(
    repository: Path, tmp_path: Path
) -> None:
    outside = tmp_path / "debugger-outside"
    outside.mkdir()
    outside_file = outside / "output.txt"
    outside_file.write_text("outside\n", encoding="utf-8")
    link = repository / "work"

    def replace_with_external_link() -> str:
        (link / "output.txt").unlink()
        link.rmdir()
        try:
            os.symlink(outside, link, target_is_directory=True)
        except OSError as symlink_error:
            if os.name != "nt":
                pytest.skip(f"directory symlink creation is unavailable: {symlink_error}")
            junction = subprocess.run(
                ["cmd.exe", "/d", "/c", "mklink", "/J", str(link), str(outside)],
                text=True,
                capture_output=True,
                shell=False,
                check=False,
            )
            if junction.returncode != 0:
                pytest.skip(
                    "neither directory symlinks nor Windows junctions are available: "
                    f"{symlink_error}; {junction.stderr.strip()}"
                )
        return "FAIL"

    def implement(package: dict[str, Any]) -> dict[str, Any]:
        link.mkdir()
        (link / "output.txt").write_text("implemented\n", encoding="utf-8")
        return {
            "status": "implemented",
            "task_id": package["task_id"],
            "summary": "implemented",
            "claimed_changed_files": ["work/output.txt"],
            "commands_requested": [],
            "blocking_issues": [],
        }

    roles = FakeRoles(repository, actions={"implementer": [implement]})
    validations = FakeValidations(repository, replace_with_external_link)
    try:
        result = controller(repository, roles, validations).run(
            task_collection(allowed=("work/output.txt",)), run_id="run-debugger-surface"
        )
        assert result.state == "BLOCKED"
        assert [role for role, _ in roles.calls] == ["implementer"]
        assert "rejected debugger" in (result.blocker or "")
        assert outside_file.read_text(encoding="utf-8") == "outside\n"
    finally:
        if link.is_symlink():
            link.unlink()
        elif link.exists():
            os.rmdir(link)


class CrashAt:
    def __init__(self, boundary: str) -> None:
        self.boundary = boundary
        self.triggered = False

    def __call__(self, boundary: str) -> None:
        if boundary == self.boundary and not self.triggered:
            self.triggered = True
            raise ControllerCrash(boundary)


@pytest.mark.parametrize("boundary", ["before_commit", "after_commit_before_state"])
def test_commit_crash_recovery_creates_exactly_one_commit(repository: Path, boundary: str) -> None:
    roles = FakeRoles(repository)
    with pytest.raises(ControllerCrash, match=boundary):
        controller(
            repository,
            roles,
            FakeValidations(repository),
            checkpoint=CrashAt(boundary),
        ).run(task_collection(), run_id=f"run-crash-{boundary}")
    count_after_crash = int(git(repository, "rev-list", "--count", "HEAD"))
    resumed = controller(repository, roles, FakeValidations(repository)).run(
        task_collection(), run_id=f"run-crash-{boundary}"
    )
    assert resumed.state == "ALL_COMPLETED"
    assert git(repository, "rev-list", "--count", "HEAD") == "2"
    assert count_after_crash == (1 if boundary == "before_commit" else 2)
    assert [role for role, _ in roles.calls] == ["implementer", "reviewer"]


def test_dry_run_has_no_effects(repository: Path) -> None:
    roles = FakeRoles(repository)
    before_status = git(repository, "status", "--porcelain=v1")
    before_head = git(repository, "rev-parse", "HEAD")
    result = controller(repository, roles, FakeValidations(repository)).run(
        task_collection(), run_id="run-dry", mode="dry-run"
    )
    assert result.state == "DRY_RUN"
    assert result.planned_task_id == "T100"
    assert result.effects == ()
    assert roles.calls == []
    assert not (repository / ".automation").exists()
    assert git(repository, "status", "--porcelain=v1") == before_status
    assert git(repository, "rev-parse", "HEAD") == before_head


def test_multiple_tasks_dependencies_and_all_completed(repository: Path) -> None:
    tasks = []
    for number in range(3):
        task_id = f"T{100 + number}"
        tasks.append(
            {
                "id": task_id,
                "phase": "P01-core",
                "title": f"Write {task_id}",
                "description": f"Write the controlled file for {task_id}.",
                "dependencies": [] if number == 0 else [f"T{99 + number}"],
                "requirement_ids": ["FR-001"],
                "allowed_read_paths": ["README.md"],
                "allowed_write_paths": [f"{task_id}.txt"],
                "writes": True,
                "validation_profile": "trusted",
                "completion_criteria": ["file exists"],
                "tests": ["trusted validation"],
                "status": "pending",
            }
        )
    roles = FakeRoles(repository)
    result = controller(repository, roles, FakeValidations(repository)).run(
        task_collection(tasks=tasks), run_id="run-dependencies"
    )
    assert result.state == "ALL_COMPLETED"
    assert list(result.task_statuses.values()) == ["completed", "completed", "completed"]
    assert [role for role, _ in roles.calls if role == "implementer"] == [
        "implementer",
        "implementer",
        "implementer",
    ]
    assert git(repository, "rev-list", "--count", "HEAD") == "4"

    already_done = task_collection(status="completed")
    second_roles = FakeRoles(repository)
    finished = controller(repository, second_roles, FakeValidations(repository)).run(
        already_done, run_id="run-already-complete"
    )
    assert finished.state == "ALL_COMPLETED"
    assert second_roles.calls == []


def test_unknown_validation_profile_requires_human_gate_without_dry_run_mutation(
    repository: Path,
) -> None:
    roles = FakeRoles(repository)
    result = controller(repository, roles, FakeValidations(repository)).run(
        task_collection(profile="arbitrary-shell"), run_id="run-unknown", mode="dry-run"
    )
    assert result.state == "BLOCKED"
    assert result.human_gate is True
    assert result.effects == ()
    assert not (repository / ".automation").exists()
