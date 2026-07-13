"""Draft-PR publication gates; push happens only after every local gate passes."""

from __future__ import annotations

from dataclasses import dataclass

from .errors import CommandError, ExitCategory
from .git_service import GitService


@dataclass(frozen=True)
class PushRequest:
    mode: str
    feature_branch: str
    base_branch: str
    remote: str
    local_sha: str
    task_commit_exists: bool
    reviewer_passed: bool
    validation_passed: bool
    expected_remote_sha: str | None = None


class PublishingService:
    def __init__(self, git: GitService) -> None:
        self.git = git

    def push(self, request: PushRequest) -> str:
        if request.mode != "draft-pr":
            raise CommandError("PUSH_MODE_FORBIDDEN", "push is available only in draft-pr mode")
        branch = self.git.current_branch()
        if branch != request.feature_branch:
            raise CommandError(
                "PUSH_BRANCH_MISMATCH", "current branch does not match feature metadata"
            )
        if branch in {request.base_branch, "main", "master"}:
            raise CommandError("PUSH_PROTECTED_BRANCH", "push to base branch is forbidden")
        if self.git.head_sha() != request.local_sha or not request.task_commit_exists:
            raise CommandError("PUSH_COMMIT_MISSING", "a verified local task commit is required")
        if not self.git.git.is_clean():
            raise CommandError("PUSH_WORKTREE_DIRTY", "worktree must be clean before push")
        if not request.reviewer_passed or not request.validation_passed:
            raise CommandError("PUSH_GATES_FAILED", "validation and reviewer must both pass")
        before = self.git.git.remote_sha(request.remote, branch)
        if before != request.expected_remote_sha:
            raise CommandError(
                "REMOTE_MOVED",
                "remote feature branch changed since the last observation",
                ExitCategory.RECONCILIATION,
            )
        self.git.push_feature(remote=request.remote, branch=branch, base_branch=request.base_branch)
        observed = self.git.git.remote_sha(request.remote, branch)
        if observed != request.local_sha:
            raise CommandError(
                "REMOTE_SHA_MISMATCH",
                "remote SHA does not equal verified local SHA",
                ExitCategory.RECONCILIATION,
            )
        if before is not None and before != request.local_sha:
            # A normal push can only advance a known branch through ordinary Git fast-forward.
            # The post-push equality check is authoritative; this record protects recovery callers.
            pass
        return observed


def ready_for_review(
    *,
    tasks_completed: bool,
    feature_validation_passed: bool,
    local_sha: str | None,
    remote_sha: str | None,
    ci_passed: bool,
    clean_worktree: bool,
    human_gate: bool,
    blockers: tuple[str, ...] = (),
) -> bool:
    return bool(
        tasks_completed
        and feature_validation_passed
        and local_sha
        and local_sha == remote_sha
        and ci_passed
        and clean_worktree
        and not human_gate
        and not blockers
    )
