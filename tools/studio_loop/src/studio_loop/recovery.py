"""Conservative reconstruction from artifacts and observed Git/GitHub facts."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Protocol

from pydantic import ValidationError

from .errors import CommandError, ExitCategory
from .models import FEATURE_ID, TaskCollection


@dataclass(frozen=True)
class RecoveryResult:
    state: str
    local_sha: str | None
    remote_sha: str | None
    pull_request_number: int | None
    reason: str | None = None


class _GitAdapter(Protocol):
    def is_clean(self) -> bool: ...
    def remote_sha(self, remote: str, branch: str) -> str | None: ...
    def remotes(self) -> tuple[str, ...]: ...
    def commits_with_trailer(self, name: str, value: str) -> tuple[str, ...]: ...
    def is_ancestor(self, ancestor: str, descendant: str) -> bool: ...


class _GitService(Protocol):
    @property
    def git(self) -> _GitAdapter: ...
    def current_branch(self) -> str: ...
    def head_sha(self) -> str: ...


class _GitHubTransport(Protocol):
    def find_pull_requests(
        self, *, owner: str, repository: str, head: str, base: str
    ) -> tuple[Any, ...]: ...


class RecoveryService:
    """Derive only facts that agree; all ambiguity is an explicit BLOCKED result."""

    def __init__(self, git: _GitService, github: _GitHubTransport | None = None) -> None:
        self.git, self.github = git, github

    def rebuild(
        self,
        *,
        feature_metadata: Path,
        tasks_path: Path,
        runtime_state: Path | None,
        owner: str | None = None,
        repository: str | None = None,
    ) -> RecoveryResult:
        metadata = self._load(feature_metadata, "feature metadata")
        state = self._load(runtime_state, "runtime state", optional=True) if runtime_state else None
        branch = metadata.get("branch")
        base = metadata.get("base_branch")
        feature_id = metadata.get("feature_id")
        base_sha = metadata.get("base_sha")
        if (
            not isinstance(branch, str)
            or not FEATURE_ID.fullmatch(branch)
            or feature_id != branch
            or not isinstance(base, str)
            or not base
            or branch in {base, "main", "master"}
            or not isinstance(base_sha, str)
            or re.fullmatch(r"[0-9a-f]{40,64}", base_sha) is None
        ):
            return self._blocked("feature branch metadata is unsafe")
        if self.git.current_branch() != branch:
            return self._blocked("current branch differs from feature metadata")
        local_sha = self.git.head_sha()
        if not self.git.git.is_clean():
            return self._blocked("worktree has uncommitted changes")
        saved_local = state.get("local_sha") if isinstance(state, dict) else None
        if saved_local and saved_local != local_sha:
            if not isinstance(saved_local, str) or not self.git.git.is_ancestor(
                saved_local, local_sha
            ):
                return self._blocked("runtime state points to a divergent local SHA")
        if not tasks_path.exists():
            if saved_local and saved_local != local_sha:
                return self._blocked(
                    "local HEAD advanced before canonical planner artifacts were recorded"
                )
            return RecoveryResult("PLANNING", local_sha, None, None)
        tasks = self._load(tasks_path, "tasks")
        try:
            collection = TaskCollection.model_validate(tasks)
        except ValidationError as error:
            raise CommandError(
                "RECOVERY_TASKS_INVALID",
                "canonical tasks are invalid; recovery will not infer missing work",
                ExitCategory.RECONCILIATION,
            ) from error
        if collection.feature_id != feature_id:
            return self._blocked("task feature identity differs from feature metadata")
        task_records = [task.model_dump(mode="json") for task in collection.tasks]
        completed = [task for task in task_records if task.get("status") == "completed"]
        inferred_completed: set[str] = set()
        evidence = self._task_commit_evidence(feature_id, base_sha, task_records)
        if evidence is None:
            return self._blocked(
                "task commit trailers are ambiguous or outside the feature history"
            )
        inferred_completed = evidence
        for task in completed:
            task_id = task.get("id")
            if isinstance(task_id, str) and task_id not in inferred_completed:
                return self._blocked("completed task lacks commit evidence")
        unfinished = {
            task.get("id")
            for task in task_records
            if isinstance(task.get("id"), str)
            and task.get("status") != "completed"
            and task.get("id") not in inferred_completed
        }
        if unfinished:
            return RecoveryResult("READY", local_sha, None, None)
        remote_sha = (
            self.git.git.remote_sha("origin", branch)
            if "origin" in self.git.git.remotes()
            else None
        )
        saved_remote = state.get("remote_sha") if isinstance(state, dict) else None
        if saved_remote and remote_sha != saved_remote:
            if (
                remote_sha is None
                or not isinstance(saved_remote, str)
                or not self.git.git.is_ancestor(saved_remote, remote_sha)
                or not self.git.git.is_ancestor(remote_sha, local_sha)
            ):
                return self._blocked("runtime state points to a divergent remote SHA")
        if remote_sha is None:
            return RecoveryResult("LOCALLY_COMPLETE", local_sha, None, None)
        if remote_sha != local_sha:
            return self._blocked("remote SHA differs from local SHA")
        if self.github is None or not owner or not repository:
            return RecoveryResult("PUBLISHED", local_sha, remote_sha, None)
        prs = self.github.find_pull_requests(
            owner=owner, repository=repository, head=branch, base=base
        )
        if len(prs) > 1:
            return self._blocked("multiple PRs match feature branch")
        if not prs:
            return RecoveryResult("PUBLISHED", local_sha, remote_sha, None)
        pr = prs[0]
        if not pr.is_draft or pr.head_sha != remote_sha:
            return self._blocked("PR is non-draft or points to stale SHA")
        recorded_number = (
            state.get("pull_request_number", state.get("pull_request"))
            if isinstance(state, dict)
            else None
        )
        if recorded_number is not None and recorded_number != pr.number:
            return self._blocked("runtime state records a different PR")
        return RecoveryResult("CI_PENDING", local_sha, remote_sha, pr.number)

    @staticmethod
    def _load(path: Path | None, label: str, *, optional: bool = False) -> dict[str, Any]:
        if path is None or not path.exists():
            if optional:
                return {}
            raise CommandError(
                "RECOVERY_ARTIFACT_MISSING", f"{label} is missing", ExitCategory.RECONCILIATION
            )
        try:
            value = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise CommandError(
                "RECOVERY_STATE_CORRUPT", f"{label} is unreadable", ExitCategory.RECONCILIATION
            ) from error
        if not isinstance(value, dict):
            raise CommandError(
                "RECOVERY_STATE_CORRUPT", f"{label} must be an object", ExitCategory.RECONCILIATION
            )
        return value

    @staticmethod
    def _blocked(reason: str) -> RecoveryResult:
        return RecoveryResult("BLOCKED", None, None, None, reason)

    def _task_commit_evidence(
        self, feature_id: str, base_sha: str, tasks: list[dict[str, Any]]
    ) -> set[str] | None:
        """Recover only exact, unique task trailers; no guessed task completion."""
        adapter = getattr(self.git, "git", None)
        finder = getattr(adapter, "commits_with_trailer", None)
        if not callable(finder):
            return set()
        feature_commits = set(finder("Studio-Feature", feature_id))
        ancestry = getattr(adapter, "is_ancestor", None)
        if not callable(ancestry):
            return None
        matched: set[str] = set()
        matched_commits: set[str] = set()
        for task in tasks:
            task_id = task.get("id")
            if not isinstance(task_id, str):
                return None
            task_commits = set(finder("Studio-Task", task_id))
            matches = feature_commits.intersection(task_commits)
            if matches:
                latest = tuple(
                    candidate
                    for candidate in matches
                    if all(other == candidate or ancestry(other, candidate) for other in matches)
                )
                if len(latest) != 1:
                    return None
                commit = latest[0]
                if (
                    commit == base_sha
                    or not ancestry(base_sha, commit)
                    or commit in matched_commits
                ):
                    return None
                matched_commits.add(commit)
                matched.add(task_id)
        return matched
