from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any

import pytest

from studio_loop.adapters.gh_cli import Check, GhCli, PullRequest
from studio_loop.checks import CheckState, CiObserver
from studio_loop.ci_repair import CiRepairService
from studio_loop.errors import CommandError
from studio_loop.git_service import GitService
from studio_loop.publishing import PublishingService, PushRequest, ready_for_review
from studio_loop.pull_requests import PullRequestRequest, PullRequestService
from studio_loop.recovery import RecoveryService
from studio_loop.retry_policy import RetryBudget, RetryPolicy


class FakeGitCli:
    def __init__(self, *, clean: bool = True, remote: str | None = None) -> None:
        self.clean, self.remote = clean, remote
        self.pushed = False
        self.trailers: dict[tuple[str, str], tuple[str, ...]] = {}

    def is_clean(self) -> bool:
        return self.clean

    def remote_sha(self, _remote: str, _branch: str) -> str | None:
        return self.remote

    def remotes(self) -> tuple[str, ...]:
        return ("origin",)

    def commits_with_trailer(self, name: str, value: str) -> tuple[str, ...]:
        return self.trailers.get((name, value), ())

    def is_ancestor(self, ancestor: str, descendant: str) -> bool:
        return ancestor == "b" * 40 and descendant == "a" * 40


class FakeGit:
    def __init__(
        self,
        *,
        branch: str = "007-autonomous-loop",
        sha: str = "a" * 40,
        clean: bool = True,
        remote: str | None = None,
    ) -> None:
        self.branch, self.sha, self.git = branch, sha, FakeGitCli(clean=clean, remote=remote)

    def current_branch(self) -> str:
        return self.branch

    def head_sha(self) -> str:
        return self.sha

    def push_feature(self, *, remote: str, branch: str, base_branch: str) -> None:
        assert remote == "origin" and branch == self.branch and base_branch == "main"
        self.git.pushed = True
        self.git.remote = self.sha


class FakeGithub:
    def __init__(
        self, prs: list[PullRequest] | None = None, checks: list[tuple[Check, ...]] | None = None
    ) -> None:
        self.prs = prs or []
        self.check_queue = checks or [()]
        self.body = ""
        self.created = False
        self.updated = False

    def find_pull_requests(self, **_: Any) -> tuple[PullRequest, ...]:
        return tuple(self.prs)

    def create_draft_pull_request(self, **kwargs: Any) -> PullRequest:
        self.created = True
        self.body = Path(kwargs["body_file"]).read_text(encoding="utf-8")
        pr = PullRequest(
            42,
            "https://example.invalid/42",
            "OPEN",
            True,
            kwargs["base"],
            kwargs["head"],
            "a" * 40,
            self.body,
        )
        self.prs = [pr]
        return pr

    def update_pull_request_body(self, **kwargs: Any) -> None:
        self.updated = True
        self.body = Path(kwargs["body_file"]).read_text(encoding="utf-8")

    def checks(self, **_: Any) -> tuple[Check, ...]:
        if len(self.check_queue) > 1:
            return self.check_queue.pop(0)
        return self.check_queue[0]


def request() -> PullRequestRequest:
    return PullRequestRequest(
        "owner",
        "repo",
        "007-autonomous-loop",
        "main",
        "007-autonomous-loop",
        "a" * 40,
        "Draft",
        "specs/007-autonomous-loop/spec.md",
        ("T050", "T051"),
        "pytest PASS",
        (),
    )


def recovery_metadata() -> dict[str, Any]:
    return {
        "feature_id": "007-autonomous-loop",
        "branch": "007-autonomous-loop",
        "base_branch": "main",
        "base_sha": "b" * 40,
    }


def recovery_tasks(*, status: str = "completed") -> dict[str, Any]:
    return {
        "schema_version": "1.0.0",
        "feature_id": "007-autonomous-loop",
        "requirements": ["FR-001"],
        "tasks": [
            {
                "id": "T050",
                "phase": "P01-test",
                "title": "Recovered task",
                "description": "Recover one controller-owned writing task.",
                "dependencies": [],
                "requirement_ids": ["FR-001"],
                "allowed_read_paths": ["README.md"],
                "allowed_write_paths": ["work.txt"],
                "writes": True,
                "validation_profile": "trusted",
                "completion_criteria": ["commit exists"],
                "tests": ["trusted validation"],
                "status": status,
            }
        ],
    }


def test_push_requires_every_gate_and_observes_remote_sha() -> None:
    git = FakeGit()
    service = PublishingService(git)  # type: ignore[arg-type]
    with pytest.raises(CommandError, match="draft-pr"):
        service.push(PushRequest("local", git.branch, "main", "origin", git.sha, True, True, True))
    remote = service.push(
        PushRequest("draft-pr", git.branch, "main", "origin", git.sha, True, True, True)
    )
    assert remote == git.sha and git.git.pushed


def test_push_stops_if_remote_moved() -> None:
    git = FakeGit(remote="b" * 40)
    with pytest.raises(CommandError) as error:
        PublishingService(git).push(
            PushRequest("draft-pr", git.branch, "main", "origin", git.sha, True, True, True, None)
        )  # type: ignore[arg-type]
    assert error.value.code == "REMOTE_MOVED"


def test_push_rejects_base_branch() -> None:
    git = FakeGit(branch="main")
    with pytest.raises(CommandError) as error:
        PublishingService(git).push(
            PushRequest("draft-pr", "main", "main", "origin", git.sha, True, True, True)
        )  # type: ignore[arg-type]
    assert error.value.code == "PUSH_PROTECTED_BRANCH"


def _git(repository: Path, *arguments: str) -> str:
    return subprocess.run(
        ["git", *arguments],
        cwd=repository,
        text=True,
        capture_output=True,
        check=True,
    ).stdout.strip()


def test_real_push_uses_bare_remote_and_disables_repository_hooks(tmp_path: Path) -> None:
    repository = tmp_path / "repository"
    remote = tmp_path / "remote.git"
    repository.mkdir()
    _git(repository, "init", "-b", "main")
    _git(repository, "config", "user.name", "Release Test")
    _git(repository, "config", "user.email", "release@example.invalid")
    (repository / "README.md").write_text("base\n", encoding="utf-8")
    _git(repository, "add", "README.md")
    _git(repository, "commit", "-m", "base")
    _git(tmp_path, "init", "--bare", str(remote))
    _git(repository, "remote", "add", "origin", str(remote))
    _git(repository, "switch", "-c", "007-autonomous-loop")
    service = GitService(repository)
    (repository / "controlled.txt").write_text("controlled\n", encoding="utf-8")
    local_sha = service.commit_files(
        files=("controlled.txt",),
        feature_id="007-autonomous-loop",
        task_id="T050",
        run_id="run-real-push",
        subject="controlled push fixture",
        expected_branch="007-autonomous-loop",
    )
    marker = tmp_path / "pre-push-hook-ran"
    hook = repository / ".git" / "hooks" / "pre-push"
    hook.write_text(f"#!/bin/sh\nprintf bad > '{marker.as_posix()}'\nexit 99\n", encoding="utf-8")
    hook.chmod(0o755)

    observed = PublishingService(service).push(
        PushRequest(
            "draft-pr",
            "007-autonomous-loop",
            "main",
            "origin",
            local_sha,
            True,
            True,
            True,
        )
    )

    assert observed == local_sha
    assert (
        _git(tmp_path, "--git-dir", str(remote), "rev-parse", "refs/heads/007-autonomous-loop")
        == local_sha
    )
    assert not marker.exists()


def test_push_rejects_remote_argument_injection_before_git(tmp_path: Path) -> None:
    repository = tmp_path / "repository"
    repository.mkdir()
    _git(repository, "init", "-b", "007-autonomous-loop")
    _git(repository, "config", "user.name", "Release Test")
    _git(repository, "config", "user.email", "release@example.invalid")
    (repository / "README.md").write_text("base\n", encoding="utf-8")
    _git(repository, "add", "README.md")
    _git(repository, "commit", "-m", "base")
    service = GitService(repository)
    with pytest.raises(CommandError) as raised:
        service.push_feature(
            remote="--receive-pack=malicious", branch="007-autonomous-loop", base_branch="main"
        )
    assert raised.value.code == "INVALID_REMOTE"


def test_git_rejects_repository_owned_executable_config_without_external_effect(
    tmp_path: Path,
) -> None:
    repository = tmp_path / "repository"
    repository.mkdir()
    _git(repository, "init", "-b", "007-autonomous-loop")
    _git(repository, "config", "user.name", "Release Test")
    _git(repository, "config", "user.email", "release@example.invalid")
    (repository / "README.md").write_text("base\n", encoding="utf-8")
    _git(repository, "add", "README.md")
    _git(repository, "commit", "-m", "base")
    external = tmp_path / "external.txt"
    external.write_text("unchanged\n", encoding="utf-8")
    _git(
        repository,
        "config",
        "filter.adversarial.clean",
        f"printf changed > '{external.as_posix()}'",
    )
    (repository / ".gitattributes").write_text("*.txt filter=adversarial\n", encoding="utf-8")

    with pytest.raises(CommandError) as raised:
        GitService(repository).git.is_clean()

    assert raised.value.code == "GIT_EXECUTABLE_CONFIG_FORBIDDEN"
    assert external.read_text(encoding="utf-8") == "unchanged\n"


def test_create_and_reuse_draft_pr_preserves_manual_section(tmp_path: Path) -> None:
    github = FakeGithub()
    service = PullRequestService(github, workspace=tmp_path)
    created = service.reconcile(request())
    assert created.is_draft and github.created and "- [x] T050" in github.body
    existing = PullRequest(
        42,
        "url",
        "OPEN",
        True,
        "main",
        "007-autonomous-loop",
        "a" * 40,
        "<!-- studio-loop:manual:start -->\nKeep this\n<!-- studio-loop:manual:end -->",
    )
    github.prs = [existing]
    service.reconcile(request())
    assert github.updated and "Keep this" in github.body


def test_ci_observer_uses_current_head_and_polls_without_busy_loop() -> None:
    pr = PullRequest(42, "url", "OPEN", True, "main", "007-autonomous-loop", "a" * 40)
    github = FakeGithub(
        prs=[pr], checks=[(Check("tests", "PENDING"),), (Check("tests", "SUCCESS"),)]
    )
    clock_values = iter((0.0, 0.0, 0.2, 0.2))
    sleeps: list[float] = []
    observer = CiObserver(github, clock=lambda: next(clock_values), sleep=sleeps.append)
    result = observer.poll(
        owner="owner",
        repository="repo",
        pull_request=pr,
        expected_head_sha="a" * 40,
        required=("tests",),
        interval_seconds=0.1,
        timeout_seconds=1,
    )
    assert result.state is CheckState.PASSED and sleeps == [0.1]
    stale = observer.observe_once(
        owner="owner",
        repository="repo",
        pull_request=pr,
        expected_head_sha="b" * 40,
        required=("tests",),
    )
    assert stale.state is CheckState.MISSING


def test_ci_observer_classifies_failure_timeout_and_skipped() -> None:
    pr = PullRequest(42, "url", "OPEN", True, "main", "007-autonomous-loop", "a" * 40)
    failure = CiObserver(FakeGithub(prs=[pr], checks=[(Check("tests", "FAILURE"),)])).observe_once(
        owner="owner",
        repository="repo",
        pull_request=pr,
        expected_head_sha="a" * 40,
        required=("tests",),
    )
    assert failure.state is CheckState.FAILED
    skipped = CiObserver(FakeGithub(prs=[pr], checks=[(Check("tests", "NEUTRAL"),)])).observe_once(
        owner="owner",
        repository="repo",
        pull_request=pr,
        expected_head_sha="a" * 40,
        required=("tests",),
    )
    assert skipped.state is CheckState.SKIPPED
    ticks = iter((0.0, 2.0))
    timeout = CiObserver(
        FakeGithub(prs=[pr], checks=[(Check("tests", "PENDING"),)]),
        clock=lambda: next(ticks),
        sleep=lambda _: None,
    ).poll(
        owner="owner",
        repository="repo",
        pull_request=pr,
        expected_head_sha="a" * 40,
        required=("tests",),
        interval_seconds=1,
        timeout_seconds=1,
    )
    assert timeout.state is CheckState.TIMEOUT


def test_ci_observer_rejects_head_race_and_nonconclusive_completed_state() -> None:
    expected = PullRequest(42, "url", "OPEN", True, "main", "007-autonomous-loop", "a" * 40)
    moved = PullRequest(42, "url", "OPEN", True, "main", "007-autonomous-loop", "b" * 40)

    class MovingGithub(FakeGithub):
        def find_pull_requests(self, **_: Any) -> tuple[PullRequest, ...]:
            return (expected,) if not getattr(self, "observed", False) else (moved,)

        def checks(self, **kwargs: Any) -> tuple[Check, ...]:
            self.observed = True
            return super().checks(**kwargs)

    raced = CiObserver(
        MovingGithub(prs=[expected], checks=[(Check("tests", "SUCCESS"),)])
    ).observe_once(
        owner="owner",
        repository="repo",
        pull_request=expected,
        expected_head_sha="a" * 40,
        required=("tests",),
    )
    assert raced.state is CheckState.MISSING

    completed = CiObserver(
        FakeGithub(prs=[expected], checks=[(Check("tests", "COMPLETED"),)])
    ).observe_once(
        owner="owner",
        repository="repo",
        pull_request=expected,
        expected_head_sha="a" * 40,
        required=("tests",),
    )
    assert completed.state is CheckState.PENDING


def test_ci_failure_and_exhaustion_create_bounded_repair_decisions() -> None:
    observation = CiObserver(FakeGithub()).observe_once(
        owner="o",
        repository="r",
        pull_request=PullRequest(1, "", "OPEN", True, "main", "branch", "a" * 40),
        expected_head_sha="a" * 40,
        required=(),
    )
    failure = observation.__class__(
        observation.head_sha, CheckState.FAILED, (Check("tests", "FAILURE"),)
    )
    budget = RetryBudget(RetryPolicy(ci_repair=1))
    service = CiRepairService()
    assert (
        service.schedule(
            feature_id="007-autonomous-loop", task_id="T050", observation=failure, budget=budget
        ).state
        == "DEBUGGER"
    )
    assert (
        service.schedule(
            feature_id="007-autonomous-loop", task_id="T050", observation=failure, budget=budget
        ).state
        == "BLOCKED"
    )


def test_recovery_matrix_blocks_ambiguity_and_recovers_remote_without_state(tmp_path: Path) -> None:
    metadata = tmp_path / "feature.json"
    tasks = tmp_path / "tasks.json"
    metadata.write_text(json.dumps(recovery_metadata()), encoding="utf-8")
    tasks.write_text(json.dumps(recovery_tasks()), encoding="utf-8")
    git = FakeGit(remote="a" * 40)
    git.git.trailers[("Studio-Feature", "007-autonomous-loop")] = ("a" * 40,)
    git.git.trailers[("Studio-Task", "T050")] = ("a" * 40,)
    result = RecoveryService(git).rebuild(
        feature_metadata=metadata, tasks_path=tasks, runtime_state=None
    )  # type: ignore[arg-type]
    assert result.state == "PUBLISHED"
    git.git.clean = False
    assert (
        RecoveryService(git)
        .rebuild(feature_metadata=metadata, tasks_path=tasks, runtime_state=None)
        .state
        == "BLOCKED"
    )  # type: ignore[arg-type]


def test_recovery_handles_commit_push_pr_state_and_corruption_cases(tmp_path: Path) -> None:
    metadata, tasks, state = (
        tmp_path / "feature.json",
        tmp_path / "tasks.json",
        tmp_path / "state.json",
    )
    metadata.write_text(
        json.dumps(
            {
                **recovery_metadata(),
            }
        ),
        encoding="utf-8",
    )
    tasks.write_text(json.dumps(recovery_tasks()), encoding="utf-8")
    git = FakeGit(remote=None)
    assert (
        RecoveryService(git)
        .rebuild(feature_metadata=metadata, tasks_path=tasks, runtime_state=None)
        .state
        == "BLOCKED"
    )  # type: ignore[arg-type]
    git.git.trailers[("Studio-Feature", "007-autonomous-loop")] = ("a" * 40,)
    git.git.trailers[("Studio-Task", "T050")] = ("a" * 40,)
    assert (
        RecoveryService(git)
        .rebuild(feature_metadata=metadata, tasks_path=tasks, runtime_state=None)
        .state
        == "LOCALLY_COMPLETE"
    )  # type: ignore[arg-type]
    state.write_text("{broken", encoding="utf-8")
    with pytest.raises(CommandError) as corrupt:
        RecoveryService(git).rebuild(
            feature_metadata=metadata, tasks_path=tasks, runtime_state=state
        )  # type: ignore[arg-type]
    assert corrupt.value.code == "RECOVERY_STATE_CORRUPT"
    state.write_text(json.dumps({"local_sha": "b" * 40}), encoding="utf-8")
    assert (
        RecoveryService(git)
        .rebuild(feature_metadata=metadata, tasks_path=tasks, runtime_state=state)
        .state
        == "BLOCKED"
    )  # type: ignore[arg-type]
    state.write_text("{}", encoding="utf-8")
    git.git.remote = "a" * 40
    pr = PullRequest(42, "url", "OPEN", True, "main", "007-autonomous-loop", "a" * 40)
    assert (
        RecoveryService(git, FakeGithub([pr]))
        .rebuild(
            feature_metadata=metadata,
            tasks_path=tasks,
            runtime_state=state,
            owner="owner",
            repository="repo",
        )
        .state
        == "CI_PENDING"
    )  # type: ignore[arg-type]
    stale = PullRequest(42, "url", "OPEN", True, "main", "007-autonomous-loop", "b" * 40)
    assert (
        RecoveryService(git, FakeGithub([stale]))
        .rebuild(
            feature_metadata=metadata,
            tasks_path=tasks,
            runtime_state=state,
            owner="owner",
            repository="repo",
        )
        .state
        == "BLOCKED"
    )  # type: ignore[arg-type]


def test_recovery_rejects_malformed_canonical_tasks_without_guessing(tmp_path: Path) -> None:
    metadata = tmp_path / "feature.json"
    tasks = tmp_path / "tasks.json"
    metadata.write_text(json.dumps(recovery_metadata()), encoding="utf-8")
    tasks.write_text(json.dumps({"tasks": "not-an-array"}), encoding="utf-8")
    with pytest.raises(CommandError) as raised:
        RecoveryService(FakeGit()).rebuild(
            feature_metadata=metadata, tasks_path=tasks, runtime_state=None
        )  # type: ignore[arg-type]
    assert raised.value.code == "RECOVERY_TASKS_INVALID"


def test_gh_capability_distinguishes_missing_and_unauthenticated() -> None:
    class MissingGh(GhCli):
        def _run(self, *_: Any, **__: Any) -> Any:
            raise CommandError("GH_NOT_FOUND", "missing")

    class UnauthenticatedGh(GhCli):
        def _run(self, arguments: list[str], **_: Any) -> Any:
            if arguments == ["--version"]:
                return type("Result", (), {"stdout": "gh version 2", "returncode": 0})()
            return type("Result", (), {"stdout": "", "returncode": 1})()

    assert MissingGh(Path.cwd()).capability(owner="owner", repository="repo").available is False
    assert (
        UnauthenticatedGh(Path.cwd()).capability(owner="owner", repository="repo").authenticated
        is False
    )


def test_gh_create_uses_exact_noninteractive_draft_argv(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    calls: list[list[str]] = []

    def fake_run(argv: list[str], **_: Any) -> subprocess.CompletedProcess[str]:
        calls.append(argv)
        payload = {
            "number": 42,
            "url": "https://example.invalid/42",
            "state": "OPEN",
            "isDraft": True,
            "baseRefName": "main",
            "headRefName": "007-autonomous-loop",
            "headRefOid": "a" * 40,
            "body": "",
        }
        return subprocess.CompletedProcess(argv, 0, json.dumps(payload), "")

    monkeypatch.setattr("studio_loop.adapters.gh_cli.subprocess.run", fake_run)
    body = tmp_path / "body.md"
    body.write_text("body\n", encoding="utf-8")
    GhCli(tmp_path).create_draft_pull_request(
        owner="owner",
        repository="repo",
        base="main",
        head="007-autonomous-loop",
        title="Controlled draft",
        body_file=str(body),
    )

    assert calls == [
        [
            "gh",
            "pr",
            "create",
            "--repo",
            "owner/repo",
            "--base",
            "main",
            "--head",
            "007-autonomous-loop",
            "--title",
            "Controlled draft",
            "--body-file",
            str(body),
            "--draft",
            "--json",
            "number,url,state,isDraft,baseRefName,headRefName,headRefOid,body",
        ]
    ]
    assert all("merge" not in argument.casefold() for argument in calls[0])


def test_ready_predicate_and_source_contains_no_merge_transport() -> None:
    assert ready_for_review(
        tasks_completed=True,
        feature_validation_passed=True,
        local_sha="a",
        remote_sha="a",
        draft_pr_open=True,
        pull_request_head_sha="a",
        ci_passed=True,
        clean_worktree=True,
        human_gate=False,
    )
    assert not ready_for_review(
        tasks_completed=True,
        feature_validation_passed=True,
        local_sha="a",
        remote_sha="b",
        draft_pr_open=True,
        pull_request_head_sha="b",
        ci_passed=True,
        clean_worktree=True,
        human_gate=False,
    )
    assert not ready_for_review(
        tasks_completed=True,
        feature_validation_passed=True,
        local_sha="a",
        remote_sha="a",
        draft_pr_open=False,
        pull_request_head_sha=None,
        ci_passed=True,
        clean_worktree=True,
        human_gate=False,
    )
    source = Path(__file__).parents[1] / "src" / "studio_loop"
    assert "pr merge" not in "\n".join(
        path.read_text(encoding="utf-8") for path in source.rglob("*.py")
    )


def test_mocked_draft_pr_service_e2e(tmp_path: Path) -> None:
    git = FakeGit(remote=None)
    remote_sha = PublishingService(git).push(  # type: ignore[arg-type]
        PushRequest(
            "draft-pr",
            git.branch,
            "main",
            "origin",
            git.sha,
            True,
            True,
            True,
        )
    )
    github = FakeGithub(checks=[(Check("tests", "SUCCESS"),)])
    pull_request = PullRequestService(github, workspace=tmp_path).reconcile(request())
    observation = CiObserver(github).observe_once(
        owner="owner",
        repository="repo",
        pull_request=pull_request,
        expected_head_sha=remote_sha,
        required=("tests",),
    )
    assert observation.state is CheckState.PASSED
    assert ready_for_review(
        tasks_completed=True,
        feature_validation_passed=True,
        local_sha=git.sha,
        remote_sha=remote_sha,
        draft_pr_open=pull_request.is_draft and pull_request.state == "OPEN",
        pull_request_head_sha=pull_request.head_sha,
        ci_passed=True,
        clean_worktree=True,
        human_gate=False,
    )
    assert pull_request.is_draft and pull_request.state == "OPEN"
    assert not hasattr(github, "merge") and not hasattr(git, "merge")


def test_recovery_uses_real_commit_trailers_without_runtime_cache(tmp_path: Path) -> None:
    repository = tmp_path / "repository"
    repository.mkdir()
    _git(repository, "init", "-b", "main")
    _git(repository, "config", "user.name", "Recovery Test")
    _git(repository, "config", "user.email", "recovery@example.invalid")
    (repository / "README.md").write_text("base\n", encoding="utf-8")
    _git(repository, "add", "README.md")
    _git(repository, "commit", "-m", "base")
    base_sha = _git(repository, "rev-parse", "HEAD")
    _git(repository, "switch", "-c", "007-autonomous-loop")
    service = GitService(repository)
    (repository / "work.txt").write_text("recovered\n", encoding="utf-8")
    task_sha = service.commit_files(
        files=("work.txt",),
        feature_id="007-autonomous-loop",
        task_id="T050",
        run_id="run-recovery",
        subject="recovery evidence",
        expected_parent_sha=base_sha,
        expected_branch="007-autonomous-loop",
    )
    # Recovery inputs are controller artifacts, not uncommitted feature-worktree
    # files. Keeping them outside the repository also verifies that recovery
    # observes a genuinely clean Git worktree.
    metadata = tmp_path / "feature.json"
    tasks = tmp_path / "tasks.json"
    metadata.write_text(json.dumps({**recovery_metadata(), "base_sha": base_sha}), encoding="utf-8")
    tasks.write_text(json.dumps(recovery_tasks(status="pending")), encoding="utf-8")

    result = RecoveryService(service).rebuild(
        feature_metadata=metadata, tasks_path=tasks, runtime_state=None
    )

    assert result.state == "LOCALLY_COMPLETE"
    assert result.local_sha == task_sha
