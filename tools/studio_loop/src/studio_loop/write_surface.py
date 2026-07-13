"""Pre-execution validation for task-declared workspace write surfaces."""

from __future__ import annotations

import os
import re
import stat
from dataclasses import dataclass
from pathlib import Path, PurePosixPath


@dataclass(frozen=True)
class WriteSurfaceAssessment:
    passed: bool
    normalized_paths: tuple[str, ...]
    violations: tuple[str, ...]


class WriteSurfaceGuard:
    """Fail closed when a declared write path can resolve outside the worktree.

    This check intentionally runs immediately before a workspace-write role. It
    narrows the race window but cannot make a pathname check and a later tool
    write atomic; the sandbox, PreToolUse hook, and post-execution DiffGuard are
    still required as independent layers.
    """

    def __init__(self, worktree: Path) -> None:
        self.worktree = worktree.resolve(strict=True)

    @staticmethod
    def _normalize(path: str) -> str:
        candidate = path.strip().replace("\\", "/")
        if (
            not candidate
            or candidate.startswith("/")
            or candidate.startswith("//")
            or re.match(r"^[A-Za-z]:", candidate)
        ):
            raise ValueError("path must be repository-relative")
        parts = candidate.split("/")
        if any(part in {"", ".", ".."} for part in parts):
            raise ValueError("path traversal is forbidden")
        if any(any(ord(character) < 32 for character in part) for part in parts):
            raise ValueError("path contains control characters")
        if any(any(token in part for token in "*?[") for part in parts):
            raise ValueError("write-surface paths must be concrete, not glob patterns")
        return PurePosixPath(*parts).as_posix()

    @staticmethod
    def _is_reparse_point(path: Path, details: os.stat_result) -> bool:
        if os.name != "nt":
            return False
        attributes = getattr(details, "st_file_attributes", 0)
        reparse_flag = getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0x400)
        return bool(attributes & reparse_flag)

    def _is_contained(self, path: Path) -> bool:
        try:
            path.relative_to(self.worktree)
        except ValueError:
            return False
        return True

    def _inspect(self, normalized: str) -> list[str]:
        violations: list[str] = []
        current = self.worktree
        parts = PurePosixPath(normalized).parts
        for index, part in enumerate(parts):
            current = current / part
            try:
                details = os.lstat(current)
            except FileNotFoundError:
                break
            except OSError as error:
                violations.append(f"{normalized}: cannot inspect existing path element ({error})")
                return violations

            is_link = stat.S_ISLNK(details.st_mode)
            is_reparse = self._is_reparse_point(current, details)
            try:
                resolved = current.resolve(strict=True)
            except (OSError, RuntimeError):
                violations.append(
                    f"{normalized}: existing symlink or reparse point cannot be resolved safely"
                )
                return violations
            if not self._is_contained(resolved):
                kind = "symlink or reparse point" if is_link or is_reparse else "path element"
                violations.append(
                    f"{normalized}: existing {kind} resolves outside the active worktree"
                )
                return violations
            if index < len(parts) - 1 and not resolved.is_dir():
                violations.append(f"{normalized}: existing parent path element is not a directory")
                return violations

        candidate = self.worktree.joinpath(*parts)
        try:
            resolved_candidate = candidate.resolve(strict=False)
        except (OSError, RuntimeError):
            violations.append(f"{normalized}: path cannot be resolved safely")
            return violations
        if not self._is_contained(resolved_candidate):
            violations.append(f"{normalized}: resolved path escapes the active worktree")
        return violations

    def assess(self, allowed_paths: tuple[str, ...]) -> WriteSurfaceAssessment:
        normalized_paths: list[str] = []
        violations: list[str] = []
        for raw_path in allowed_paths:
            try:
                normalized = self._normalize(raw_path)
            except ValueError as error:
                violations.append(f"{raw_path!r}: {error}")
                continue
            normalized_paths.append(normalized)

        for normalized in normalized_paths:
            violations.extend(self._inspect(normalized))

        return WriteSurfaceAssessment(
            passed=not violations,
            normalized_paths=tuple(normalized_paths),
            violations=tuple(dict.fromkeys(violations)),
        )
