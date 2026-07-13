"""Git-observed diff and repository-boundary enforcement."""

from __future__ import annotations

import fnmatch
import hashlib
import os
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path, PurePosixPath

_SECRET_PATH = re.compile(
    r"(?:^|/)(?:\.env(?:\.(?!example$|sample$)[^/]*)?|secrets?(?:/|\.|$)|credentials?(?:/|\.|$))"
    r"|\.(?:pem|p12|pfx|key)$",
    re.IGNORECASE,
)
_SECRET_CONTENT = re.compile(
    rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|"
    rb"(?:gh[pousr]_|sk-)[A-Za-z0-9_-]{16,}|"
    rb"(?i:(?:api[_-]?key|password|secret|token)\s*[:=]\s*['\"]?[A-Za-z0-9_+./=-]{16,})"
)


class DiffGuardError(RuntimeError):
    pass


@dataclass(frozen=True)
class RepositorySnapshot:
    branch: str
    head_sha: str
    status: tuple[tuple[str, str], ...]
    git_control_digest: str = ""

    @property
    def changed_paths(self) -> tuple[str, ...]:
        return tuple(path for _, path in self.status)


@dataclass(frozen=True)
class DiffAssessment:
    passed: bool
    changed_paths: tuple[str, ...]
    diff: str
    violations: tuple[str, ...]


class DiffGuard:
    """Treat Git and filesystem facts as authoritative for one task attempt."""

    def __init__(
        self,
        repository: Path,
        *,
        forbidden_paths: tuple[str, ...] = (
            ".git",
            ".automation/state",
            ".studio-loop",
            ".codex",
        ),
    ) -> None:
        self.repository = repository.resolve()
        self.forbidden_paths = tuple(self._normalise(item) for item in forbidden_paths)
        self.ignore_case = self._repository_ignores_case()

    def _git(self, *arguments: str, check: bool = True) -> bytes:
        result = subprocess.run(
            ["git", *arguments],
            cwd=self.repository,
            stdin=subprocess.DEVNULL,
            capture_output=True,
            shell=False,
            check=False,
        )
        if check and result.returncode:
            detail = result.stderr.decode("utf-8", errors="replace").strip()
            raise DiffGuardError(detail or "Git observation failed")
        return result.stdout

    def _repository_ignores_case(self) -> bool:
        result = subprocess.run(
            ["git", "config", "--bool", "core.ignorecase"],
            cwd=self.repository,
            text=True,
            capture_output=True,
            shell=False,
            check=False,
        )
        if result.returncode == 0:
            return result.stdout.strip().lower() == "true"
        return os.name == "nt"

    @staticmethod
    def _normalise(path: str) -> str:
        raw = path.replace("\\", "/")
        if not raw or raw.startswith("/") or re.match(r"^[A-Za-z]:", raw):
            raise DiffGuardError(f"unsafe repository path: {path!r}")
        parts = PurePosixPath(raw).parts
        if any(part in {"", ".", ".."} for part in parts):
            raise DiffGuardError(f"unsafe repository path: {path!r}")
        if any(any(ord(character) < 32 for character in part) for part in parts):
            raise DiffGuardError("repository path contains control characters")
        return "/".join(parts)

    def _key(self, path: str) -> str:
        return path.casefold() if self.ignore_case else path

    def _contained_path(self, path: str) -> tuple[str, str | None]:
        normal = self._normalise(path)
        candidate = self.repository.joinpath(*PurePosixPath(normal).parts)
        try:
            resolved = candidate.resolve(strict=False)
            resolved.relative_to(self.repository)
        except (OSError, ValueError):
            return normal, "path escapes the repository through a symlink or reparse point"
        return normal, None

    def _matches(self, path: str, pattern: str) -> bool:
        candidate = self._key(path)
        expected = self._key(pattern)
        if any(character in expected for character in "*?["):
            return fnmatch.fnmatchcase(candidate, expected)
        return candidate == expected or candidate.startswith(expected.rstrip("/") + "/")

    def snapshot(self) -> RepositorySnapshot:
        branch = (
            self._git("symbolic-ref", "--quiet", "--short", "HEAD", check=False)
            .decode("utf-8", errors="replace")
            .strip()
        )
        if not branch:
            branch = "<detached>"
        head = self._git("rev-parse", "HEAD").decode("ascii", errors="replace").strip()
        raw = self._git("status", "--porcelain=v1", "-z", "--untracked-files=all")
        entries = raw.split(b"\0")
        status: list[tuple[str, str]] = []
        index = 0
        while index < len(entries):
            record = entries[index]
            index += 1
            if not record:
                continue
            text = record.decode("utf-8", errors="surrogateescape")
            code, path = text[:2], text[3:]
            normal = path.replace("\\", "/")
            status.append((code, normal))
            if "R" in code or "C" in code:
                if index < len(entries) and entries[index]:
                    source = entries[index].decode("utf-8", errors="surrogateescape")
                    status.append((code, source.replace("\\", "/")))
                    index += 1
        return RepositorySnapshot(
            branch, head, tuple(sorted(set(status))), self._git_control_digest()
        )

    def _git_control_digest(self) -> str:
        directories: list[Path] = []
        for argument in ("--git-dir", "--git-common-dir"):
            raw_directory = (
                self._git("rev-parse", "--path-format=absolute", argument)
                .decode("utf-8", errors="replace")
                .strip()
            )
            git_directory = Path(raw_directory).resolve()
            if git_directory not in directories:
                directories.append(git_directory)
        digest = hashlib.sha256()
        # Objects and reflogs can be large and are not authority by themselves. Every
        # mutable control surface (HEAD, index, refs, config, packed-refs and linked
        # worktree metadata) is included so an agent cannot hide a Git write behind
        # an unchanged worktree diff.
        for git_directory in directories:
            digest.update(str(git_directory).encode("utf-8", errors="surrogateescape"))
            for path in sorted(git_directory.rglob("*"), key=lambda item: item.as_posix()):
                if not path.is_file():
                    continue
                relative = path.relative_to(git_directory)
                if relative.parts[0] in {"objects", "logs"}:
                    continue
                digest.update(relative.as_posix().encode("utf-8", errors="surrogateescape"))
                try:
                    digest.update(path.read_bytes())
                except OSError:
                    digest.update(b"<unreadable>")
        return digest.hexdigest()

    def _real_diff(self, paths: tuple[str, ...]) -> str:
        tracked = self._git("diff", "--no-ext-diff", "--binary", "HEAD", "--").decode(
            "utf-8", errors="replace"
        )
        fragments = [tracked]
        for path in paths:
            absolute = self.repository.joinpath(*PurePosixPath(path).parts)
            if not absolute.is_file() or absolute.is_symlink():
                continue
            check = self._git("ls-files", "--error-unmatch", "--", path, check=False)
            if check:
                continue
            try:
                data = absolute.read_bytes()
            except OSError:
                continue
            digest = hashlib.sha256(data).hexdigest()
            preview = data[:8192].decode("utf-8", errors="replace")
            fragments.append(
                f"diff --git a/{path} b/{path}\nnew file (untracked) sha256 {digest}\n{preview}"
            )
        return "\n".join(part for part in fragments if part)

    def assess(
        self,
        baseline: RepositorySnapshot,
        *,
        allowed_paths: tuple[str, ...],
        task_status_paths: tuple[str, ...] = (),
    ) -> DiffAssessment:
        violations: list[str] = []
        if baseline.status:
            violations.append("repository contained pre-existing changes before the task")
        current = self.snapshot()
        if current.branch != baseline.branch:
            violations.append("agent changed the current branch")
        if current.head_sha != baseline.head_sha:
            violations.append("agent created a commit or moved HEAD")
        if current.git_control_digest != baseline.git_control_digest:
            violations.append("agent changed protected .git control files")

        try:
            allowed = tuple(self._normalise(item) for item in allowed_paths)
            protected_status = tuple(self._normalise(item) for item in task_status_paths)
        except DiffGuardError as error:
            violations.append(str(error))
            allowed = ()
            protected_status = ()

        changed: list[str] = []
        for raw_path in current.changed_paths:
            try:
                path, escape = self._contained_path(raw_path)
            except DiffGuardError as error:
                violations.append(str(error))
                continue
            changed.append(path)
            if escape:
                violations.append(f"{path}: {escape}")
            if self._matches(path, ".git"):
                violations.append(f"{path}: .git changes are forbidden")
            if any(self._matches(path, pattern) for pattern in self.forbidden_paths):
                violations.append(f"{path}: forbidden path")
            if any(self._matches(path, pattern) for pattern in protected_status):
                violations.append(f"{path}: agent changed task status/control artifact")
            if not any(self._matches(path, pattern) for pattern in allowed):
                violations.append(f"{path}: path is outside allowed_paths")
            if _SECRET_PATH.search(path):
                violations.append(f"{path}: secret-bearing path is forbidden")
            absolute = self.repository.joinpath(*PurePosixPath(path).parts)
            if absolute.is_file() and not absolute.is_symlink():
                try:
                    content = absolute.read_bytes()[:2_000_000]
                except OSError:
                    content = b""
                if _SECRET_CONTENT.search(content):
                    violations.append(f"{path}: likely secret-bearing change")

        unique_changed = tuple(sorted(set(changed), key=self._key))
        if not allowed and unique_changed:
            violations.append("read-only task produced repository changes")
        return DiffAssessment(
            passed=not violations,
            changed_paths=unique_changed,
            diff=self._real_diff(unique_changed),
            violations=tuple(dict.fromkeys(violations)),
        )
