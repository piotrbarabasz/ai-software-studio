"""Cross-platform, process-scoped locks for controller-owned mutations."""

from __future__ import annotations

import os
import socket
import subprocess
from pathlib import Path
from types import TracebackType
from typing import BinaryIO

from .errors import CommandError, ExitCategory


def _shared_repository_root(repository: Path) -> Path:
    """Return the primary checkout root shared by all linked worktrees."""

    resolved = repository.resolve()
    result = subprocess.run(
        ["git", "rev-parse", "--path-format=absolute", "--git-common-dir"],
        cwd=resolved,
        text=True,
        encoding="utf-8",
        errors="replace",
        capture_output=True,
        shell=False,
        check=False,
    )
    if result.returncode:
        raise CommandError(
            "NOT_A_REPOSITORY",
            "repository lock root could not be determined",
            ExitCategory.PREFLIGHT,
        )
    common = Path(result.stdout.strip()).resolve()
    if common.name != ".git" or not common.is_dir():
        raise CommandError(
            "UNSAFE_GIT_COMMON_DIR",
            "repository lock requires a non-bare checkout with a canonical .git directory",
            ExitCategory.PREFLIGHT,
        )
    return common.parent


class RepositoryLock:
    """An exclusive non-blocking lock shared by every worktree of a repository."""

    def __init__(self, path: Path) -> None:
        self.path = path.resolve()
        self._stream: BinaryIO | None = None

    @classmethod
    def for_repository(cls, repository: Path, *, name: str = "writer") -> RepositoryLock:
        if not name or any(
            character not in "abcdefghijklmnopqrstuvwxyz0123456789-" for character in name
        ):
            raise ValueError("lock name must be a lowercase safe identifier")
        root = _shared_repository_root(repository)
        return cls(root / ".automation" / "state" / "locks" / f"{name}.lock")

    def acquire(self) -> None:
        if self._stream is not None:
            raise RuntimeError("repository lock is already held by this instance")
        self.path.parent.mkdir(parents=True, exist_ok=True)
        stream = self.path.open("a+b")
        try:
            stream.seek(0, os.SEEK_END)
            if stream.tell() == 0:
                stream.write(b"\0")
                stream.flush()
                os.fsync(stream.fileno())
            stream.seek(0)
            if os.name == "nt":
                import msvcrt

                msvcrt.locking(stream.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl

                fcntl.flock(  # type: ignore[attr-defined]
                    stream.fileno(),
                    fcntl.LOCK_EX | fcntl.LOCK_NB,  # type: ignore[attr-defined]
                )
        except (OSError, BlockingIOError) as error:
            stream.close()
            raise CommandError(
                "LOCK_UNAVAILABLE",
                "another Studio Loop writer owns the repository lock",
                ExitCategory.LOCK,
            ) from error
        stream.seek(0)
        owner = f"pid={os.getpid()} host={socket.gethostname()}\n".encode("utf-8", errors="replace")
        stream.write(owner[:255])
        stream.truncate()
        stream.flush()
        os.fsync(stream.fileno())
        stream.seek(0)
        self._stream = stream

    def release(self) -> None:
        stream = self._stream
        if stream is None:
            return
        try:
            stream.seek(0)
            if os.name == "nt":
                import msvcrt

                msvcrt.locking(stream.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                import fcntl

                fcntl.flock(stream.fileno(), fcntl.LOCK_UN)  # type: ignore[attr-defined]
        finally:
            stream.close()
            self._stream = None

    def __enter__(self) -> RepositoryLock:
        self.acquire()
        return self

    def __exit__(
        self,
        _exception_type: type[BaseException] | None,
        _exception: BaseException | None,
        _traceback: TracebackType | None,
    ) -> None:
        self.release()
