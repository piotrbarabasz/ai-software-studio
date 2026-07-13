"""Policy-enforcing controller-only facade for local Git effects."""

from __future__ import annotations

from pathlib import Path

from .adapters.git_cli import GitCli
from .errors import CommandError


def _has_trailer(message: str, name: str, value: str) -> bool:
    return any(line == f"{name}: {value}" for line in message.splitlines())


def commit_message(*, feature_id: str, task_id: str, run_id: str, subject: str) -> str:
    safe_subject = " ".join(subject.split()).strip()[:72] or task_id
    return (
        f"feat({feature_id}): {safe_subject}\n\n"
        f"Studio-Feature: {feature_id}\n"
        f"Studio-Task: {task_id}\n"
        f"Studio-Run: {run_id}"
    )


class GitService:
    """Only safe operations are public; forbidden Git verbs are not represented."""

    def __init__(self, repository: Path) -> None:
        self.git = GitCli.discover(repository)

    def add_files(self, files: list[str] | tuple[str, ...]) -> None:
        self.git.stage_files(tuple(files))

    def commit_files(
        self,
        *,
        files: list[str] | tuple[str, ...],
        feature_id: str,
        task_id: str,
        run_id: str,
        subject: str,
        expected_parent_sha: str | None = None,
        expected_branch: str | None = None,
    ) -> str:
        explicit = tuple(files)
        if self.git.operation_in_progress():
            raise CommandError(
                "GIT_OPERATION_IN_PROGRESS",
                "commit refused while merge, rebase, cherry-pick or revert state exists",
            )
        if expected_parent_sha is not None and self.git.head_sha() != expected_parent_sha:
            raise CommandError("PARENT_MOVED", "HEAD changed before the controlled commit")
        if expected_branch is not None and self.git.current_branch() != expected_branch:
            raise CommandError("BRANCH_MOVED", "branch changed before the controlled commit")
        if self.git.changed_files(cached=True):
            raise CommandError("INDEX_NOT_EMPTY", "index contains changes not owned by this task")
        self.git.stage_files(explicit)
        staged = set(self.git.changed_files(cached=True))
        if staged != set(explicit):
            raise CommandError(
                "STAGED_FILE_MISMATCH", "index contains files outside the controlled list"
            )
        committed = self.git.commit(
            commit_message(feature_id=feature_id, task_id=task_id, run_id=run_id, subject=subject)
        )
        if len(self.git.parents(committed)) > 1:
            raise CommandError(
                "MERGE_COMMIT_FORBIDDEN", "controller-created commits must not merge"
            )
        if not self.git.is_clean():
            raise CommandError(
                "POST_COMMIT_WORKTREE_DIRTY",
                "repository changed during the controlled commit",
            )
        return committed

    def head_sha(self) -> str:
        return self.git.head_sha()

    def current_branch(self) -> str:
        return self.git.current_branch()

    def observe_task_commit(
        self,
        *,
        feature_id: str,
        task_id: str,
        run_id: str,
        expected_parent_sha: str,
    ) -> str | None:
        """Return HEAD only when Git proves it is this run's expected task commit."""
        head = self.git.head_sha()
        if head == expected_parent_sha:
            return None
        if not self.git.is_clean():
            raise CommandError(
                "COMMIT_RECONCILIATION", "worktree is dirty after the intended task commit"
            )
        message = self.git.commit_message_at(head)
        parents = self.git.parents(head)
        if parents != (expected_parent_sha,):
            raise CommandError(
                "COMMIT_RECONCILIATION", "unexpected or merge commit parent after interruption"
            )
        expected = (
            ("Studio-Feature", feature_id),
            ("Studio-Task", task_id),
            ("Studio-Run", run_id),
        )
        if not all(_has_trailer(message, name, value) for name, value in expected):
            raise CommandError("COMMIT_RECONCILIATION", "HEAD is not the intended task commit")
        return head

    def push_feature(self, *, remote: str, branch: str, base_branch: str) -> None:
        self.git.push_feature_branch(remote, branch, base_branch=base_branch)
