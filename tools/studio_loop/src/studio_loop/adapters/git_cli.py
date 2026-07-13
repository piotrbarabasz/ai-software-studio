"""Small, argv-only Git adapter.

This module intentionally exposes only observations and narrowly scoped operations.
It never uses a shell, force options, history rewrites, cleanup, or branch deletion.
"""

from __future__ import annotations

import os
import re
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

from ..errors import CommandError, ExitCategory, GitError


@dataclass(frozen=True)
class WorktreeRecord:
    path: Path
    head: str | None
    branch: str | None
    locked: bool
    prunable: bool


class GitCli:
    _EXECUTABLE_LOCAL_CONFIG = (
        r"^(alias\..*|filter\..*|core\.(hookspath|fsmonitor|sshcommand)|"
        r"diff\.external|diff\..*\.(command|textconv)|merge\..*\.driver)$"
    )

    def __init__(self, repository: Path) -> None:
        self.repository = repository.resolve()

    @staticmethod
    def _environment() -> dict[str, str]:
        allowed = {
            "APPDATA",
            "COMSPEC",
            "HOME",
            "HOMEDRIVE",
            "HOMEPATH",
            "LANG",
            "LC_ALL",
            "LOCALAPPDATA",
            "PATH",
            "PATHEXT",
            "SSH_AUTH_SOCK",
            "SYSTEMDRIVE",
            "SYSTEMROOT",
            "TEMP",
            "TMP",
            "USERPROFILE",
            "WINDIR",
        }
        environment = {key: value for key, value in os.environ.items() if key.upper() in allowed}
        environment.update(
            {
                "GCM_INTERACTIVE": "Never",
                "GIT_CONFIG_NOSYSTEM": "0",
                "GIT_TERMINAL_PROMPT": "0",
                "LC_ALL": "C",
            }
        )
        return environment

    def _run_raw(
        self, arguments: list[str], *, check: bool = True
    ) -> subprocess.CompletedProcess[str]:
        completed = subprocess.run(
            ["git", *arguments],
            cwd=self.repository,
            env=self._environment(),
            text=True,
            encoding="utf-8",
            errors="replace",
            capture_output=True,
            shell=False,
            check=False,
        )
        if check and completed.returncode:
            detail = completed.stderr.strip() or completed.stdout.strip() or "Git command failed"
            raise GitError(detail)
        return completed

    def ensure_safe_configuration(self) -> None:
        """Reject repository-owned Git configuration that can execute a process."""

        configured = self._run_raw(
            [
                "config",
                "--local",
                "--includes",
                "--name-only",
                "--get-regexp",
                self._EXECUTABLE_LOCAL_CONFIG,
            ],
            check=False,
        )
        if configured.returncode not in {0, 1}:
            raise GitError(configured.stderr.strip() or "could not inspect local Git configuration")
        keys = tuple(line for line in configured.stdout.splitlines() if line)
        if keys:
            raise CommandError(
                "GIT_EXECUTABLE_CONFIG_FORBIDDEN",
                "repository-local Git configuration can execute a process and is forbidden",
                ExitCategory.POLICY,
            )

    def _run(self, arguments: list[str], *, check: bool = True) -> subprocess.CompletedProcess[str]:
        self.ensure_safe_configuration()
        return self._run_raw(arguments, check=check)

    def _run_mutation(
        self, arguments: list[str], *, check: bool = True
    ) -> subprocess.CompletedProcess[str]:
        """Run a controller mutation with every repository hook disabled."""

        with tempfile.TemporaryDirectory(prefix="studio-loop-empty-hooks-") as hooks:
            return self._run(["-c", f"core.hooksPath={hooks}", *arguments], check=check)

    @classmethod
    def discover(cls, path: Path) -> GitCli:
        completed = subprocess.run(
            ["git", "-C", str(path), "rev-parse", "--show-toplevel"],
            text=True,
            encoding="utf-8",
            errors="replace",
            capture_output=True,
            shell=False,
            check=False,
        )
        if completed.returncode:
            raise CommandError(
                "NOT_A_REPOSITORY", "repository root could not be detected", ExitCategory.PREFLIGHT
            )
        return cls(Path(completed.stdout.strip()))

    def repository_root(self) -> Path:
        return self.repository

    def current_branch(self) -> str:
        value = self._run(["symbolic-ref", "--quiet", "--short", "HEAD"], check=False)
        if value.returncode:
            raise CommandError(
                "DETACHED_HEAD", "repository is in detached HEAD state", ExitCategory.PREFLIGHT
            )
        return value.stdout.strip()

    def head_sha(self) -> str:
        return self._run(["rev-parse", "HEAD"]).stdout.strip()

    def resolve_commit(self, reference: str) -> str:
        if not reference or reference.startswith("-"):
            raise CommandError("INVALID_BASE_BRANCH", "base branch is not a valid Git reference")
        result = self._run(["rev-parse", "--verify", f"{reference}^{{commit}}"], check=False)
        if result.returncode:
            raise CommandError(
                "BASE_BRANCH_NOT_FOUND",
                f"base branch was not found: {reference}",
                ExitCategory.PREFLIGHT,
            )
        return result.stdout.strip()

    def is_clean(self) -> bool:
        return not bool(self._run(["status", "--porcelain=v1", "-z"]).stdout)

    def has_submodules(self) -> bool:
        output = self._run(["ls-files", "--stage", "-z"]).stdout
        return any(record.startswith("160000 ") for record in output.split("\0") if record)

    def changed_files(self, *, cached: bool = False) -> tuple[str, ...]:
        args = ["diff", "--name-only", "-z"]
        if cached:
            args.append("--cached")
        return tuple(item for item in self._run(args).stdout.split("\0") if item)

    def diff(self, *, cached: bool = False) -> str:
        args = ["diff", "--no-ext-diff"]
        if cached:
            args.append("--cached")
        return self._run(args).stdout

    def commit_message_at(self, reference: str = "HEAD") -> str:
        return self._run(["show", "-s", "--format=%B", reference]).stdout.rstrip()

    def commits_with_trailer(self, name: str, value: str) -> tuple[str, ...]:
        """Return reachable commits matching one exact trailer without parsing locale output."""
        if not name or not value or "\n" in name or "\n" in value:
            raise CommandError("INVALID_TRAILER", "commit trailer query is invalid")
        pattern = f"^{re.escape(name)}: {re.escape(value)}$"
        output = self._run(["log", "--format=%H", f"--grep={pattern}"]).stdout
        return tuple(line for line in output.splitlines() if line)

    def first_parent(self, reference: str = "HEAD") -> str | None:
        parents = self.parents(reference)
        return parents[0] if parents else None

    def parents(self, reference: str = "HEAD") -> tuple[str, ...]:
        return tuple(self._run(["show", "-s", "--format=%P", reference]).stdout.split())

    def operation_in_progress(self) -> bool:
        for name in (
            "MERGE_HEAD",
            "CHERRY_PICK_HEAD",
            "REVERT_HEAD",
            "rebase-merge",
            "rebase-apply",
        ):
            raw = self._run(["rev-parse", "--git-path", name]).stdout.strip()
            path = Path(raw)
            if not path.is_absolute():
                path = self.repository / path
            if path.exists():
                return True
        return False

    def is_ancestor(self, ancestor: str, descendant: str) -> bool:
        if not ancestor or not descendant or ancestor.startswith("-") or descendant.startswith("-"):
            raise CommandError("INVALID_COMMIT", "commit ancestry query is invalid")
        result = self._run(["merge-base", "--is-ancestor", ancestor, descendant], check=False)
        if result.returncode not in {0, 1}:
            raise GitError(result.stderr.strip() or "could not verify commit ancestry")
        return result.returncode == 0

    def local_branches(self) -> tuple[str, ...]:
        output = self._run(["for-each-ref", "--format=%(refname:short)", "refs/heads"]).stdout
        return tuple(line for line in output.splitlines() if line)

    def local_branch_exists(self, branch: str) -> bool:
        return (
            self._run(
                ["show-ref", "--verify", "--quiet", f"refs/heads/{branch}"], check=False
            ).returncode
            == 0
        )

    def remotes(self) -> tuple[str, ...]:
        return tuple(line for line in self._run(["remote"]).stdout.splitlines() if line)

    def remote_url(self, remote: str = "origin") -> str:
        self._validate_remote(remote)
        if remote not in self.remotes():
            raise CommandError(
                "REMOTE_ORIGIN_MISSING",
                "remote origin is required for draft-pr",
                ExitCategory.PREFLIGHT,
            )
        result = self._run(["remote", "get-url", remote], check=False)
        if result.returncode or not result.stdout.strip():
            raise CommandError(
                "REMOTE_ORIGIN_MISSING",
                "remote origin is required for draft-pr",
                ExitCategory.PREFLIGHT,
            )
        return result.stdout.strip()

    def remote_branches(self) -> tuple[str, ...]:
        branches: set[str] = set()
        for remote in self.remotes():
            result = self._run(["ls-remote", "--heads", remote], check=False)
            if result.returncode:
                continue
            for line in result.stdout.splitlines():
                fields = line.split("\t", 1)
                if len(fields) == 2 and fields[1].startswith("refs/heads/"):
                    branches.add(fields[1][11:])
        return tuple(sorted(branches))

    def remote_branch_exists(self, branch: str) -> bool:
        return branch in self.remote_branches()

    def fetch(self, remote: str) -> None:
        self._validate_remote(remote)
        self._run_mutation(["fetch", "--no-tags", remote])

    def worktrees(self) -> tuple[WorktreeRecord, ...]:
        # Git for Windows 2.35 supports porcelain but not its later ``-z`` option.
        # Porcelain keys make the line format unambiguous even when paths contain spaces.
        raw = self._run(["worktree", "list", "--porcelain"]).stdout
        records: list[WorktreeRecord] = []
        for block in (part for part in raw.split("\n\n") if part):
            path: Path | None = None
            head: str | None = None
            branch: str | None = None
            locked = False
            prunable = False
            for entry in block.splitlines():
                if entry.startswith("worktree "):
                    path = Path(entry[9:]).resolve()
                elif entry.startswith("HEAD "):
                    head = entry[5:]
                elif entry.startswith("branch refs/heads/"):
                    branch = entry[18:]
                elif entry.startswith("locked"):
                    locked = True
                elif entry.startswith("prunable"):
                    prunable = True
            if path is not None:
                records.append(WorktreeRecord(path, head, branch, locked, prunable))
        return tuple(records)

    def create_branch(self, branch: str, expected_base_sha: str) -> None:
        self._validate_feature_branch(branch)
        if self.local_branch_exists(branch):
            raise CommandError("BRANCH_COLLISION", f"local branch already exists: {branch}")
        if self.resolve_commit(expected_base_sha) != expected_base_sha:
            raise CommandError(
                "BASE_MOVED",
                "base revision changed before branch creation",
                ExitCategory.RECONCILIATION,
            )
        self._run_mutation(["branch", branch, expected_base_sha])

    def create_worktree(self, path: Path, branch: str) -> None:
        self._validate_feature_branch(branch)
        self._run_mutation(["worktree", "add", "--lock", str(path), branch])

    def stage_files(self, files: tuple[str, ...]) -> None:
        self._validate_file_list(files)
        self._run_mutation(["add", "--", *files])

    def commit(self, message: str) -> str:
        # Repository-local Git hooks are executable code and are not part of the
        # controller's trusted validation allowlist. Use an empty, ephemeral hook
        # directory so a commit cannot trigger push, deployment or secret access.
        self._run_mutation(["commit", "--no-gpg-sign", "-m", message])
        return self.head_sha()

    def remote_sha(self, remote: str, branch: str) -> str | None:
        self._validate_remote(remote)
        self._validate_feature_branch(branch)
        if remote not in self.remotes():
            raise CommandError("REMOTE_NOT_FOUND", f"configured remote was not found: {remote}")
        result = self._run(["ls-remote", "--heads", remote, f"refs/heads/{branch}"], check=False)
        if result.returncode:
            raise GitError(result.stderr.strip() or f"could not query remote {remote}")
        return result.stdout.split()[0] if result.stdout.strip() else None

    def push_feature_branch(self, remote: str, branch: str, *, base_branch: str) -> None:
        if branch in {"main", "master", base_branch}:
            raise CommandError(
                "PUSH_PROTECTED_BRANCH", "push to protected base branch is forbidden"
            )
        self._validate_remote(remote)
        if remote not in self.remotes():
            raise CommandError("REMOTE_NOT_FOUND", f"configured remote was not found: {remote}")
        self._validate_feature_branch(branch)
        self._run_mutation(["push", "--", remote, f"refs/heads/{branch}:refs/heads/{branch}"])

    @staticmethod
    def _validate_feature_branch(branch: str) -> None:
        if re.fullmatch(r"[0-9]{3}-[a-z0-9]+(?:-[a-z0-9]+)*", branch) is None:
            raise CommandError("INVALID_BRANCH", "branch name is not an allowed feature branch")

    def _validate_remote(self, remote: str) -> None:
        if re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,63}", remote) is None:
            raise CommandError("INVALID_REMOTE", "remote name is not allowed")

    @staticmethod
    def _validate_file_list(files: tuple[str, ...]) -> None:
        if not files:
            raise CommandError("EMPTY_FILE_LIST", "an explicit non-empty file list is required")
        for file_name in files:
            path = Path(file_name)
            if file_name in {".", "*"} or path.is_absolute() or ".." in path.parts:
                raise CommandError(
                    "UNSAFE_PATH", "only repository-relative explicit files may be staged"
                )
