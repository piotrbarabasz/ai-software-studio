from __future__ import annotations

import subprocess
from pathlib import Path

import pytest

from studio_loop.errors import CommandError
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
