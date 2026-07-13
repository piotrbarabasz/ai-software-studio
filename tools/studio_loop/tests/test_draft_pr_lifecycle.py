from __future__ import annotations

import json
import shutil
import subprocess
from dataclasses import dataclass, replace
from pathlib import Path
from typing import Any

import pytest

from studio_loop.adapters.gh_cli import Check, PullRequest
from studio_loop.controller import ControllerCrash
from studio_loop.lifecycle import DraftPrPolicy, LifecycleController
from studio_loop.validation_runner import TaskValidationReport, ValidationReport


def git(repository: Path, *arguments: str) -> str:
    return subprocess.run(
        ["git", *arguments],
        cwd=repository,
        text=True,
        capture_output=True,
        check=True,
    ).stdout.strip()


@pytest.fixture
def published_repository(tmp_path: Path) -> tuple[Path, Path, dict[str, Any]]:
    repository = tmp_path / "feature repository"
    remote = tmp_path / "remote.git"
    repository.mkdir()
    git(repository, "init", "-b", "main")
    git(repository, "config", "user.name", "Lifecycle Test")
    git(repository, "config", "user.email", "lifecycle@example.invalid")
    (repository / ".gitignore").write_text(".automation/state/\n", encoding="utf-8")
    source_config = Path(__file__).parents[3] / ".studio-loop"
    shutil.copytree(source_config, repository / ".studio-loop")
    (repository / "README.md").write_text("base\n", encoding="utf-8")
    git(repository, "add", ".gitignore", ".studio-loop", "README.md")
    git(repository, "commit", "-m", "base")
    base_sha = git(repository, "rev-parse", "HEAD")
    git(tmp_path, "init", "--bare", str(remote))
    git(repository, "remote", "add", "origin", str(remote))
    git(repository, "switch", "-c", "007-autonomous-loop")
    metadata = {
        "feature_id": "007-autonomous-loop",
        "number": 7,
        "slug": "autonomous-loop",
        "branch": "007-autonomous-loop",
        "directory": "specs/007-autonomous-loop",
        "base_branch": "main",
        "base_sha": base_sha,
        "request_sha256": "a" * 64,
    }
    return repository, remote, metadata


@dataclass
class RoleResult:
    output: dict[str, Any]
    succeeded: bool = True
    attempts: int = 1


class LifecycleRoles:
    def __init__(self, repository: Path) -> None:
        self.repository = repository
        self.calls: list[str] = []

    def run(self, role: str, path: Path, *, invocation_id: str) -> RoleResult:
        del invocation_id
        package = json.loads(path.read_text(encoding="utf-8"))
        self.calls.append(role)
        if role == "planner":
            return RoleResult(
                {
                    "schema_version": "1.1.0",
                    "status": "ready",
                    "spec_markdown": "# Feature specification\n",
                    "plan_markdown": "# Feature plan\n",
                    "tasks": {
                        "schema_version": "1.1.0",
                        "feature_id": "007-autonomous-loop",
                        "requirements": ["FR-001"],
                        "tasks": [
                            {
                                "id": "T100",
                                "phase": "P01-core",
                                "title": "First task",
                                "description": "Write the first controlled file.",
                                "dependencies": [],
                                "requirement_ids": ["FR-001"],
                                "allowed_read_paths": ["README.md"],
                                "allowed_write_paths": ["first.txt"],
                                "writes": True,
                                "validation_profiles": ["tests"],
                                "completion_criteria": ["first file exists"],
                                "tests": ["tests profile"],
                                "status": "pending",
                            },
                            {
                                "id": "T101",
                                "phase": "P01-core",
                                "title": "Second task",
                                "description": "Write the dependent controlled file.",
                                "dependencies": ["T100"],
                                "requirement_ids": ["FR-001"],
                                "allowed_read_paths": ["first.txt"],
                                "allowed_write_paths": ["second.txt"],
                                "writes": True,
                                "validation_profiles": ["tests"],
                                "completion_criteria": ["second file exists"],
                                "tests": ["tests profile"],
                                "status": "pending",
                            },
                        ],
                    },
                    "ambiguities": [],
                    "blocking_issues": [],
                }
            )
        task_id = str(package["task_id"])
        if role == "implementer":
            changed = str(package["allowed_write_paths"][0])
            (self.repository / changed).write_text(f"{task_id}\n", encoding="utf-8")
            return RoleResult(
                {
                    "status": "implemented",
                    "task_id": task_id,
                    "summary": "implemented",
                    "claimed_changed_files": [changed],
                    "commands_requested": [],
                    "blocking_issues": [],
                }
            )
        if role == "reviewer":
            return RoleResult(
                {
                    "verdict": "PASS",
                    "task_id": task_id,
                    "blocking_findings": [],
                    "non_blocking_findings": [],
                    "covered_requirements": ["FR-001"],
                    "recommended_action": "commit",
                }
            )
        changed = str(package["allowed_write_paths"][0])
        (self.repository / changed).write_text(f"{task_id} repaired\n", encoding="utf-8")
        return RoleResult(
            {
                "status": "repaired",
                "task_id": task_id,
                "addressed_failures": ["CI failure"],
                "remaining_failures": [],
                "claimed_changed_files": [changed],
            }
        )


class PassingValidations:
    def __init__(self, *, fail_task_id: str | None = None) -> None:
        self.calls: list[tuple[str, tuple[str, ...]]] = []
        self.fail_task_id = fail_task_id

    def ensure_known(self, names: tuple[str, ...]) -> None:
        assert set(names) <= {"tests", "feature-tests"}

    def run_many(self, task_id: str, profiles: tuple[str, ...]) -> TaskValidationReport:
        self.ensure_known(profiles)
        self.calls.append((task_id, profiles))
        passed = task_id != self.fail_task_id
        results = tuple(
            ValidationReport(
                profile=profile,
                argv=("python", "-c", "pass"),
                working_directory=".",
                started_at="2026-07-13T10:00:00+00:00",
                ended_at="2026-07-13T10:00:01+00:00",
                exit_code=0 if passed else 1,
                stdout="PASS" if passed else "",
                stderr="" if passed else "controlled failure",
                truncated=False,
                truncation_marker=None,
                status="PASS" if passed else "FAIL",
            )
            for profile in profiles
        )
        return TaskValidationReport(task_id, profiles, results, passed)


class FakeGithub:
    def __init__(self, remote: Path, checks: list[tuple[Check, ...]]) -> None:
        self.remote = remote
        self.check_queue = checks
        self.pull_request: PullRequest | None = None
        self.create_count = 0
        self.body = "Operator note that must survive.\n"

    def _head(self) -> str:
        return git(
            self.remote.parent,
            "--git-dir",
            str(self.remote),
            "rev-parse",
            "refs/heads/007-autonomous-loop",
        )

    def find_pull_requests(self, **_: Any) -> tuple[PullRequest, ...]:
        if self.pull_request is None:
            return ()
        self.pull_request = replace(self.pull_request, head_sha=self._head(), body=self.body)
        return (self.pull_request,)

    def create_draft_pull_request(self, **kwargs: Any) -> PullRequest:
        self.create_count += 1
        self.body = Path(kwargs["body_file"]).read_text(encoding="utf-8") + self.body
        self.pull_request = PullRequest(
            42,
            "https://example.invalid/42",
            "OPEN",
            True,
            kwargs["base"],
            kwargs["head"],
            self._head(),
            self.body,
        )
        return self.pull_request

    def update_pull_request_body(self, **kwargs: Any) -> None:
        assert kwargs["number"] == 42
        self.body = Path(kwargs["body_file"]).read_text(encoding="utf-8")

    def checks(self, **_: Any) -> tuple[Check, ...]:
        if len(self.check_queue) > 1:
            return self.check_queue.pop(0)
        return self.check_queue[0]


def policy() -> DraftPrPolicy:
    return DraftPrPolicy(
        remote="origin",
        required_checks=("tests",),
        check_interval_seconds=0.001,
        check_timeout_seconds=1,
        check_max_attempts=3,
        missing_checks="block",
        feature_validation_profiles=("feature-tests",),
        ci_repair_attempts=1,
    )


def test_full_draft_pr_lifecycle_uses_bare_remote_and_fake_github(
    published_repository: tuple[Path, Path, dict[str, Any]],
) -> None:
    repository, remote, metadata = published_repository
    roles = LifecycleRoles(repository)
    validations = PassingValidations()
    github = FakeGithub(
        remote,
        [
            (Check("tests", "SUCCESS"),),
            (Check("tests", "SUCCESS"),),
            (Check("tests", "SUCCESS"),),
        ],
    )

    result = LifecycleController(
        repository,
        role_runner=roles,
        validation_runner=validations,
        github=github,
        draft_pr_policy=policy(),
    ).run(
        metadata=metadata,
        request="Implement two dependent tasks.",
        mode="draft-pr",
        owner="owner",
        repository="repo",
        run_id="run-draft-pr-e2e",
    )

    assert result.status == "READY_FOR_REVIEW"
    assert result.local_sha == result.remote_sha
    assert result.pull_request == 42
    assert result.ci_status == "passed"
    assert result.human_gate is False
    assert github.create_count == 1
    assert github.pull_request is not None and github.pull_request.is_draft
    assert "Operator note that must survive." in github.body
    assert "READY_FOR_REVIEW" in github.body
    assert "- [x] T100" in github.body and "- [x] T101" in github.body
    assert roles.calls == [
        "planner",
        "implementer",
        "reviewer",
        "implementer",
        "reviewer",
    ]
    assert ("FEATURE", ("feature-tests",)) in validations.calls
    assert git(repository, "status", "--short") == ""
    assert git(repository, "rev-list", "--count", "HEAD") == "4"
    assert (
        git(
            remote.parent,
            "--git-dir",
            str(remote),
            "rev-parse",
            "refs/heads/007-autonomous-loop",
        )
        == result.local_sha
    )

    run_cache = repository / ".automation" / "state" / "runs" / "run-draft-pr-e2e"
    (run_cache / "snapshot.json").unlink()
    (run_cache / "events.jsonl").unlink()
    shutil.rmtree(repository / ".automation" / "state" / "controller" / "run-draft-pr-e2e")
    recovered = LifecycleController(
        repository,
        role_runner=roles,
        validation_runner=validations,
        github=github,
        draft_pr_policy=policy(),
    ).run(
        metadata=metadata,
        request="Rebuild disposable lifecycle state.",
        mode="draft-pr",
        owner="owner",
        repository="repo",
        run_id="run-draft-pr-e2e",
    )
    assert recovered.status == "READY_FOR_REVIEW"
    assert github.create_count == 1
    assert roles.calls.count("implementer") == 2


def test_failed_ci_is_mapped_to_task_repaired_and_republished(
    published_repository: tuple[Path, Path, dict[str, Any]],
) -> None:
    repository, remote, metadata = published_repository
    roles = LifecycleRoles(repository)
    github = FakeGithub(
        remote,
        [
            (Check("tests", "FAILURE"),),
            (Check("tests", "SUCCESS"),),
            (Check("tests", "SUCCESS"),),
            (Check("tests", "SUCCESS"),),
        ],
    )

    result = LifecycleController(
        repository,
        role_runner=roles,
        validation_runner=PassingValidations(),
        github=github,
        draft_pr_policy=policy(),
    ).run(
        metadata=metadata,
        request="Implement and repair CI if required.",
        mode="draft-pr",
        owner="owner",
        repository="repo",
        run_id="run-ci-repair-e2e",
    )

    assert result.status == "READY_FOR_REVIEW"
    assert roles.calls.count("debugger") == 1
    assert git(repository, "rev-list", "--count", "HEAD") == "5"
    assert "CI repair" in github.body
    assert github.create_count == 1


class CrashSchedule:
    def __init__(self, checkpoints: list[tuple[str, int]]) -> None:
        self.pending = checkpoints
        self.seen: dict[str, int] = {}

    def __call__(self, checkpoint: str) -> None:
        self.seen[checkpoint] = self.seen.get(checkpoint, 0) + 1
        if self.pending and (checkpoint, self.seen[checkpoint]) == self.pending[0]:
            self.pending.pop(0)
            raise ControllerCrash(f"controlled crash at {checkpoint}")


def test_resume_reconciles_lost_push_pr_ci_and_final_state_updates(
    published_repository: tuple[Path, Path, dict[str, Any]],
) -> None:
    repository, remote, metadata = published_repository
    roles = LifecycleRoles(repository)
    github = FakeGithub(remote, [(Check("tests", "SUCCESS"),)])
    checkpoints = CrashSchedule(
        [
            ("after_push_before_remote_state", 1),
            ("after_pr_create_before_state", 1),
            ("after_commit_before_state", 1),
            ("after_push_before_remote_state", 4),
            ("during_ci_polling", 1),
            ("after_ci_success_before_transition", 1),
            ("after_final_check_before_ready", 1),
        ]
    )

    while checkpoints.pending:
        with pytest.raises(ControllerCrash):
            LifecycleController(
                repository,
                role_runner=roles,
                validation_runner=PassingValidations(),
                github=github,
                draft_pr_policy=policy(),
                checkpoint=checkpoints,
            ).run(
                metadata=metadata,
                request="Recover every durable publication boundary.",
                mode="draft-pr",
                owner="owner",
                repository="repo",
                run_id="run-publication-recovery",
            )

    result = LifecycleController(
        repository,
        role_runner=roles,
        validation_runner=PassingValidations(),
        github=github,
        draft_pr_policy=policy(),
    ).run(
        metadata=metadata,
        request="Recover every durable publication boundary.",
        mode="draft-pr",
        owner="owner",
        repository="repo",
        run_id="run-publication-recovery",
    )

    assert result.status == "READY_FOR_REVIEW"
    assert github.create_count == 1
    assert roles.calls.count("planner") == 1
    assert roles.calls.count("implementer") == 2
    assert result.local_sha == result.remote_sha
    assert git(repository, "status", "--short") == ""


def test_resume_after_debugger_uses_dirty_repair_without_reinvoking_role(
    published_repository: tuple[Path, Path, dict[str, Any]],
) -> None:
    repository, remote, metadata = published_repository
    roles = LifecycleRoles(repository)
    github = FakeGithub(
        remote,
        [
            (Check("tests", "FAILURE"),),
            (Check("tests", "SUCCESS"),),
            (Check("tests", "SUCCESS"),),
            (Check("tests", "SUCCESS"),),
        ],
    )
    checkpoints = CrashSchedule([("after_debugger", 1)])
    with pytest.raises(ControllerCrash):
        LifecycleController(
            repository,
            role_runner=roles,
            validation_runner=PassingValidations(),
            github=github,
            draft_pr_policy=policy(),
            checkpoint=checkpoints,
        ).run(
            metadata=metadata,
            request="Resume a CI repair after Debugger output.",
            mode="draft-pr",
            owner="owner",
            repository="repo",
            run_id="run-debugger-recovery",
        )

    assert git(repository, "status", "--short") == "M first.txt"
    result = LifecycleController(
        repository,
        role_runner=roles,
        validation_runner=PassingValidations(),
        github=github,
        draft_pr_policy=policy(),
    ).run(
        metadata=metadata,
        request="Resume a CI repair after Debugger output.",
        mode="draft-pr",
        owner="owner",
        repository="repo",
        run_id="run-debugger-recovery",
    )

    assert result.status == "READY_FOR_REVIEW"
    assert roles.calls.count("debugger") == 1
    assert result.local_sha == result.remote_sha


def test_unmapped_ci_failure_leaves_pr_draft(
    published_repository: tuple[Path, Path, dict[str, Any]],
) -> None:
    repository, remote, metadata = published_repository
    github = FakeGithub(remote, [(Check("unmapped", "FAILURE"),)])
    result = LifecycleController(
        repository,
        role_runner=LifecycleRoles(repository),
        validation_runner=PassingValidations(),
        github=github,
        draft_pr_policy=replace(policy(), required_checks=("unmapped",)),
    ).run(
        metadata=metadata,
        request="Block an unmapped CI failure.",
        mode="draft-pr",
        owner="owner",
        repository="repo",
        run_id="run-unmapped-ci",
    )

    assert result.status == "BLOCKED" and result.human_gate
    assert github.pull_request is not None and github.pull_request.is_draft
    assert "cannot be mapped" in " ".join(result.blocking_issues)
    assert "cannot be mapped" in github.body


def test_feature_validation_failure_leaves_existing_pr_draft(
    published_repository: tuple[Path, Path, dict[str, Any]],
) -> None:
    repository, remote, metadata = published_repository
    github = FakeGithub(
        remote,
        [
            (Check("tests", "SUCCESS"),),
            (Check("tests", "SUCCESS"),),
        ],
    )
    result = LifecycleController(
        repository,
        role_runner=LifecycleRoles(repository),
        validation_runner=PassingValidations(fail_task_id="FEATURE"),
        github=github,
        draft_pr_policy=policy(),
    ).run(
        metadata=metadata,
        request="Block a failed feature-level validation.",
        mode="draft-pr",
        owner="owner",
        repository="repo",
        run_id="run-feature-validation-failure",
    )

    assert result.status == "BLOCKED" and result.human_gate
    assert github.pull_request is not None and github.pull_request.is_draft
    assert "feature validation" in " ".join(result.blocking_issues)
    assert "feature validation" in github.body
