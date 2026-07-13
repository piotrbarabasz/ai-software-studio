"""Conservative linked-worktree ownership and creation service."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .adapters.git_cli import GitCli
from .errors import CommandError, ExitCategory


@dataclass(frozen=True)
class WorktreeResult:
    path: Path
    branch: str
    created: bool


class WorktreeService:
    def __init__(self, repository: Path, git: GitCli) -> None:
        self.repository = repository.resolve()
        self.git = git

    def default_base_directory(self) -> Path:
        return self.repository.parent / f"{self.repository.name}-worktrees"

    def ensure(
        self,
        branch: str,
        *,
        base_directory: Path | None = None,
        expected_head_sha: str | None = None,
    ) -> WorktreeResult:
        self.git._validate_feature_branch(branch)
        configured_base = base_directory or self.default_base_directory()
        if configured_base.is_symlink():
            raise CommandError("UNSAFE_WORKTREE_ROOT", "worktree base must not be a symlink")
        base = configured_base.resolve()
        if base == self.repository or self.repository in base.parents:
            raise CommandError(
                "UNSAFE_WORKTREE_ROOT", "worktree base must be outside the repository"
            )
        target = (base / branch).resolve()
        try:
            target.relative_to(base)
        except ValueError as error:
            raise CommandError(
                "UNSAFE_WORKTREE_TARGET", "worktree target escapes the configured base"
            ) from error
        records = self.git.worktrees()
        owners = [record for record in records if record.branch == branch]
        if owners:
            if len(owners) != 1:
                raise CommandError(
                    "WORKTREE_AMBIGUOUS",
                    "more than one worktree claims the feature branch",
                    ExitCategory.RECONCILIATION,
                )
            owner = owners[0]
            if owner.path != target:
                raise CommandError(
                    "BRANCH_IN_USE",
                    f"branch is already checked out at {owner.path}",
                    ExitCategory.LOCK,
                )
            if (
                owner.prunable
                or not owner.locked
                or not owner.path.exists()
                or owner.path.is_symlink()
            ):
                raise CommandError(
                    "WORKTREE_UNSAFE",
                    "existing worktree cannot be safely resumed",
                    ExitCategory.RECONCILIATION,
                )
            feature_git = self.git_for(owner.path)
            if expected_head_sha is not None and feature_git.head_sha() != expected_head_sha:
                raise CommandError(
                    "WORKTREE_HEAD_MISMATCH",
                    "existing feature worktree HEAD differs from the expected revision",
                    ExitCategory.RECONCILIATION,
                )
            if feature_git.has_submodules():
                raise CommandError(
                    "WORKTREE_SUBMODULES_UNSUPPORTED",
                    "submodules are unsupported by Studio Loop V1",
                    ExitCategory.POLICY,
                )
            if not feature_git.is_clean():
                raise CommandError(
                    "WORKTREE_DIRTY", "existing feature worktree is dirty", ExitCategory.POLICY
                )
            return WorktreeResult(owner.path, branch, False)
        if target.exists() or target.is_symlink():
            raise CommandError(
                "WORKTREE_TARGET_EXISTS", f"worktree target already exists: {target}"
            )
        base.mkdir(parents=True, exist_ok=True)
        self.git.create_worktree(target, branch)
        feature_git = self.git_for(target)
        if (
            feature_git.current_branch() != branch
            or (expected_head_sha is not None and feature_git.head_sha() != expected_head_sha)
            or feature_git.has_submodules()
            or not feature_git.is_clean()
        ):
            raise CommandError(
                "WORKTREE_VERIFY_FAILED",
                "new worktree failed ownership verification",
                ExitCategory.RECONCILIATION,
            )
        return WorktreeResult(target, branch, True)

    @staticmethod
    def git_for(path: Path) -> GitCli:
        return GitCli.discover(path)
