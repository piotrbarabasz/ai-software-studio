from __future__ import annotations

import subprocess
from pathlib import Path

import pytest

from studio_loop.errors import CommandError
from studio_loop.lifecycle import LifecycleController
from studio_loop.locking import RepositoryLock


def git(repository: Path, *arguments: str) -> str:
    return subprocess.run(
        ["git", *arguments],
        cwd=repository,
        text=True,
        capture_output=True,
        check=True,
    ).stdout.strip()


def test_repository_lock_is_exclusive_and_shared_by_linked_worktrees(tmp_path: Path) -> None:
    repository = tmp_path / "repository"
    worktree = tmp_path / "linked worktree"
    repository.mkdir()
    git(repository, "init", "-b", "main")
    git(repository, "config", "user.name", "Lock Test")
    git(repository, "config", "user.email", "lock@example.invalid")
    (repository / "README.md").write_text("base\n", encoding="utf-8")
    git(repository, "add", "README.md")
    git(repository, "commit", "-m", "base")
    git(repository, "branch", "001-lock-test")
    git(repository, "worktree", "add", "--lock", str(worktree), "001-lock-test")

    first = RepositoryLock.for_repository(repository)
    second = RepositoryLock.for_repository(worktree)
    assert first.path == second.path
    first.acquire()
    try:
        with pytest.raises(CommandError) as raised:
            second.acquire()
        assert raised.value.code == "LOCK_UNAVAILABLE"
    finally:
        first.release()

    with second:
        assert second.path.exists()


def test_lifecycle_refuses_a_second_active_writer(tmp_path: Path) -> None:
    repository = tmp_path / "repository"
    repository.mkdir()
    git(repository, "init", "-b", "007-autonomous-loop")
    git(repository, "config", "user.name", "Lock Test")
    git(repository, "config", "user.email", "lock@example.invalid")
    (repository / "README.md").write_text("base\n", encoding="utf-8")
    git(repository, "add", "README.md")
    git(repository, "commit", "-m", "base")

    class Roles:
        def run(self, *_args: object, **_kwargs: object) -> object:
            raise AssertionError("a role must not run without the writer lock")

    with RepositoryLock.for_repository(repository):
        with pytest.raises(CommandError) as raised:
            LifecycleController(repository, role_runner=Roles()).run(  # type: ignore[arg-type]
                metadata={"feature_id": "007-autonomous-loop", "branch": "007-autonomous-loop"},
                request="request",
                mode="local",
            )
    assert raised.value.code == "LOCK_UNAVAILABLE"
