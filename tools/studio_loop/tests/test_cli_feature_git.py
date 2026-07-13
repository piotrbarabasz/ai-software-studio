from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest

from studio_loop.adapters.git_cli import GitCli
from studio_loop.cli import main
from studio_loop.errors import EXIT_CODES, CommandError, ExitCategory
from studio_loop.feature_numbering import FeatureService, normalize_slug
from studio_loop.git_service import GitService, commit_message
from studio_loop.worktrees import WorktreeService


def git(path: Path, *args: str) -> str:
    completed = subprocess.run(["git", *args], cwd=path, text=True, capture_output=True, check=True)
    return completed.stdout.strip()


@pytest.fixture
def repository(tmp_path: Path) -> Path:
    root = tmp_path / "repo with spaces"
    root.mkdir()
    git(root, "init", "-b", "main")
    git(root, "config", "user.email", "test@example.invalid")
    git(root, "config", "user.name", "Studio Loop test")
    policy = root / ".studio-loop" / "validation-profiles.json"
    policy.parent.mkdir()
    policy.write_text(
        json.dumps(
            {
                "schema_version": "1.0.0",
                "profiles": {
                    "studio-loop-tests": {
                        "argv": [sys.executable, "-c", "raise SystemExit(0)"],
                        "working_directory": ".",
                    }
                },
            }
        ),
        encoding="utf-8",
    )
    (root / ".gitignore").write_text(".automation/state/\n", encoding="utf-8")
    (root / "README.md").write_text("base\n", encoding="utf-8")
    git(root, "add", "--", ".gitignore", ".studio-loop/validation-profiles.json", "README.md")
    git(root, "commit", "-m", "base")
    return root


def json_stdout(capsys: pytest.CaptureFixture[str]) -> dict[str, object]:
    return json.loads(capsys.readouterr().out)


def test_start_dry_run_is_json_only_and_does_not_mutate(
    repository: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    (repository / "specs" / "001-existing").mkdir(parents=True)
    request = repository / "request file.txt"
    request.write_text("Change something safely", encoding="utf-8")
    before = git(repository, "status", "--porcelain")

    assert (
        main(
            [
                "start",
                "--request-file",
                str(request),
                "--mode",
                "dry-run",
                "--repo",
                str(repository),
                "--json",
            ]
        )
        == 0
    )

    payload = json_stdout(capsys)
    assert payload["ok"] is True
    assert payload["feature_id"] == "002-request-file"
    assert payload["effects_performed"] == []
    assert git(repository, "status", "--porcelain") == before
    assert not (repository / ".automation").exists()
    assert not (repository.parent / "repo with spaces-worktrees" / "002-request-file").exists()


def test_numbering_slug_and_branch_collisions_use_all_evidence(repository: Path) -> None:
    (repository / "specs" / "003-from-specs").mkdir(parents=True)
    git(repository, "branch", "005-from-local")
    service = FeatureService(repository)
    assert normalize_slug("  Żółć & API / Version 2! ") == "zoc-api-version-2"
    proposal = service.propose("A feature")
    assert proposal.number == 1
    assert proposal.feature_id == "001-a-feature"
    git(repository, "branch", proposal.branch)
    with pytest.raises(CommandError, match="already in use"):
        service.ensure_available(proposal)


def test_remote_branch_numbers_are_observed_when_a_remote_exists(
    repository: Path, tmp_path: Path
) -> None:
    remote = tmp_path / "remote.git"
    git(tmp_path, "init", "--bare", str(remote))
    git(repository, "remote", "add", "origin", str(remote))
    git(repository, "branch", "004-remote-only")
    git(repository, "push", "origin", "004-remote-only")
    git(repository, "branch", "-D", "004-remote-only")
    assert 4 in FeatureService(repository).used_numbers()


def test_worktree_is_idempotent_but_refuses_branch_owned_elsewhere(
    repository: Path, tmp_path: Path
) -> None:
    adapter = GitCli.discover(repository)
    adapter.create_branch("001-space-path", adapter.head_sha())
    service = WorktreeService(repository, adapter)
    base = tmp_path / "work trees"
    created = service.ensure("001-space-path", base_directory=base)
    assert created.created is True
    resumed = service.ensure("001-space-path", base_directory=base)
    assert resumed.created is False
    with pytest.raises(CommandError) as raised:
        service.ensure("001-space-path", base_directory=tmp_path / "other")
    assert raised.value.code == "BRANCH_IN_USE"
    assert created.path.exists()


def test_worktree_refuses_dirty_and_detached_source(repository: Path, tmp_path: Path) -> None:
    adapter = GitCli.discover(repository)
    adapter.create_branch("001-dirty", adapter.head_sha())
    worktree = WorktreeService(repository, adapter).ensure(
        "001-dirty", base_directory=tmp_path / "worktrees"
    )
    (worktree.path / "dirty.txt").write_text("x", encoding="utf-8")
    with pytest.raises(CommandError) as raised:
        WorktreeService(repository, adapter).ensure(
            "001-dirty", base_directory=tmp_path / "worktrees"
        )
    assert raised.value.code == "WORKTREE_DIRTY"
    git(repository, "checkout", "--detach")
    with pytest.raises(CommandError) as detached:
        adapter.current_branch()
    assert detached.value.code == "DETACHED_HEAD"


def test_worktree_resume_requires_lock_and_expected_head(repository: Path, tmp_path: Path) -> None:
    adapter = GitCli.discover(repository)
    expected = adapter.head_sha()
    adapter.create_branch("001-owned", expected)
    service = WorktreeService(repository, adapter)
    worktree = service.ensure(
        "001-owned", base_directory=tmp_path / "worktrees", expected_head_sha=expected
    )
    git(repository, "worktree", "unlock", str(worktree.path))
    with pytest.raises(CommandError) as unlocked:
        service.ensure(
            "001-owned", base_directory=tmp_path / "worktrees", expected_head_sha=expected
        )
    assert unlocked.value.code == "WORKTREE_UNSAFE"

    git(repository, "worktree", "lock", str(worktree.path))
    (worktree.path / "advanced.txt").write_text("advanced\n", encoding="utf-8")
    git(worktree.path, "add", "advanced.txt")
    git(worktree.path, "commit", "-m", "advance")
    with pytest.raises(CommandError) as moved:
        service.ensure(
            "001-owned", base_directory=tmp_path / "worktrees", expected_head_sha=expected
        )
    assert moved.value.code == "WORKTREE_HEAD_MISMATCH"


def test_safe_commit_contract_and_prohibited_stage_or_push(repository: Path) -> None:
    service = GitService(repository)
    (repository / "only.txt").write_text("controlled\n", encoding="utf-8")
    sha = service.commit_files(
        files=["only.txt"],
        feature_id="001-safe",
        task_id="T001",
        run_id="run-001",
        subject="controlled change",
    )
    assert sha == git(repository, "rev-parse", "HEAD")
    message = git(repository, "log", "-1", "--format=%B")
    assert "Studio-Feature: 001-safe" in message
    assert "Studio-Task: T001" in message
    assert "Studio-Run: run-001" in message
    with pytest.raises(CommandError):
        service.add_files(["."])
    with pytest.raises(CommandError) as push:
        service.push_feature(remote="origin", branch="main", base_branch="main")
    assert push.value.code == "PUSH_PROTECTED_BRANCH"
    assert not hasattr(service, "merge")
    assert not hasattr(service, "rebase")
    assert not hasattr(service, "reset")
    assert not hasattr(service, "clean")
    assert not hasattr(service, "delete_branch")


def test_cli_local_lifecycle_and_draft_pr_controlled_stop(
    repository: Path, capsys: pytest.CaptureFixture[str], tmp_path: Path
) -> None:
    request = tmp_path / "request.txt"
    request.write_text("a local feature", encoding="utf-8")
    root = tmp_path / "isolated worktrees"
    assert (
        main(
            [
                "start",
                "--request-file",
                str(request),
                "--slug",
                "Local Feature",
                "--mode",
                "local",
                "--worktree-root",
                str(root),
                "--repo",
                str(repository),
                "--json",
            ]
        )
        == 0
    )
    started = json_stdout(capsys)
    feature = str(started["feature_id"])
    assert git(repository, "branch", "--show-current") == "main"
    assert main(["status", "--feature", feature, "--repo", str(repository), "--json"]) == 0
    assert json_stdout(capsys)["feature_state"] == "initialized"
    worktree = root / feature
    tasks = {
        "schema_version": "1.0.0",
        "feature_id": feature,
        "requirements": ["FR-001"],
        "tasks": [
            {
                "id": "T001",
                "phase": "setup",
                "title": "Test renderer",
                "description": "Render canonical tasks.",
                "dependencies": [],
                "requirement_ids": ["FR-001"],
                "allowed_read_paths": ["specs"],
                "allowed_write_paths": [],
                "writes": False,
                "validation_profile": "studio-loop-tests",
                "completion_criteria": ["rendered"],
                "tests": ["pytest"],
                "status": "pending",
            }
        ],
    }
    (worktree / "specs" / feature / "tasks.json").write_text(json.dumps(tasks), encoding="utf-8")
    assert main(["validate", "--feature", feature, "--repo", str(repository), "--json"]) == 0
    assert json_stdout(capsys)["feature_state"] == "validated"
    assert main(["render-tasks", "--feature", feature, "--repo", str(repository), "--json"]) == 0
    assert json_stdout(capsys)["effects_performed"] == ["tasks_rendered"]
    assert (
        main(["render-tasks", "--feature", feature, "--check", "--repo", str(repository), "--json"])
        == 0
    )
    assert json_stdout(capsys)["effects_performed"] == []
    assert (
        main(
            [
                "resume",
                "--feature",
                feature,
                "--mode",
                "draft-pr",
                "--allow-mode-upgrade",
                "--repo",
                str(repository),
                "--json",
            ]
        )
        == EXIT_CODES[ExitCategory.PREFLIGHT]
    )
    assert json_stdout(capsys)["diagnostics"][0]["code"] == "REMOTE_ORIGIN_MISSING"
    assert (
        main(
            [
                "abort",
                "--feature",
                feature,
                "--reason",
                "operator test",
                "--repo",
                str(repository),
                "--json",
            ]
        )
        == 0
    )
    assert json_stdout(capsys)["feature_state"] == "aborted"


def test_commit_message_is_deterministic() -> None:
    assert commit_message(
        feature_id="001-safe", task_id="T001", run_id="run-1", subject="  change\n now "
    ) == (
        "feat(001-safe): change now\n\nStudio-Feature: 001-safe\nStudio-Task: T001\nStudio-Run: run-1"
    )


def test_invalid_cli_option_uses_stable_json_usage_exit(capsys: pytest.CaptureFixture[str]) -> None:
    assert main(["start", "--mode", "unsafe", "--json"]) == EXIT_CODES[ExitCategory.USAGE]
    payload = json_stdout(capsys)
    assert payload["exit_category"] == "usage_error"
    assert payload["diagnostics"][0]["code"] == "INVALID_ARGUMENTS"
