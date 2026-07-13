"""Non-interactive, bounded GitHub CLI adapter.

The adapter deliberately has no method for merge, approval, closing a PR, changing
its base, or converting Draft to ready.  It accepts JSON only and never preserves
the inherited environment or raw command output as evidence.
"""

from __future__ import annotations

import json
import os
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ..errors import CommandError, ExitCategory
from ..redaction import redact


@dataclass(frozen=True)
class GitHubCapability:
    available: bool
    authenticated: bool
    owner: str | None = None
    repository: str | None = None
    detail: str | None = None


@dataclass(frozen=True)
class PullRequest:
    number: int
    url: str
    state: str
    is_draft: bool
    base_ref: str
    head_ref: str
    head_sha: str
    body: str = ""


@dataclass(frozen=True)
class Check:
    name: str
    state: str
    link: str | None = None
    workflow: str | None = None
    description: str | None = None


class GhCli:
    """Literal-argv `gh` transport suitable for fake executable tests."""

    def __init__(
        self, repository: Path, *, executable: str = "gh", max_output_bytes: int = 65_536
    ) -> None:
        self.repository = repository.resolve()
        self.executable = executable
        self.max_output_bytes = max_output_bytes

    def _run(
        self, arguments: list[str], *, allowed_codes: tuple[int, ...] = (0,)
    ) -> subprocess.CompletedProcess[str]:
        try:
            completed = subprocess.run(
                [self.executable, *arguments],
                cwd=self.repository,
                text=True,
                encoding="utf-8",
                errors="replace",
                input="",
                capture_output=True,
                shell=False,
                env={
                    key: os.environ[key]
                    for key in (
                        "PATH",
                        "HOME",
                        "USERPROFILE",
                        "APPDATA",
                        "LOCALAPPDATA",
                        "SYSTEMROOT",
                        "WINDIR",
                        "ComSpec",
                    )
                    if key in os.environ
                }
                | {"GH_PROMPT_DISABLED": "1", "NO_COLOR": "1"},
                check=False,
            )
        except FileNotFoundError as error:
            raise CommandError(
                "GH_NOT_FOUND", "GitHub CLI gh is not available", ExitCategory.PREFLIGHT
            ) from error
        completed.stdout = redact(completed.stdout[: self.max_output_bytes])
        completed.stderr = redact(completed.stderr[: self.max_output_bytes])
        if completed.returncode not in allowed_codes:
            raise CommandError("GH_FAILED", "GitHub CLI command failed", ExitCategory.EXTERNAL)
        return completed

    @staticmethod
    def _json(value: str) -> Any:
        try:
            return json.loads(value)
        except json.JSONDecodeError as error:
            raise CommandError(
                "GH_INVALID_JSON", "GitHub CLI returned invalid JSON", ExitCategory.EXTERNAL
            ) from error

    def capability(self, *, owner: str, repository: str) -> GitHubCapability:
        try:
            version = self._run(["--version"], allowed_codes=(0,))
        except CommandError as error:
            if error.code == "GH_NOT_FOUND":
                return GitHubCapability(False, False, detail="GitHub CLI gh is not available")
            raise
        if not version.stdout.strip():
            return GitHubCapability(False, False, detail="GitHub CLI version output is unavailable")
        auth = self._run(["auth", "status", "--hostname", "github.com"], allowed_codes=(0, 1))
        if auth.returncode:
            return GitHubCapability(True, False, detail="GitHub CLI is not authenticated")
        repo = self._run(
            ["repo", "view", f"{owner}/{repository}", "--json", "nameWithOwner,viewerPermission"],
            allowed_codes=(0, 1),
        )
        if repo.returncode:
            return GitHubCapability(True, True, detail="repository is not accessible through gh")
        payload = self._json(repo.stdout)
        if payload.get("nameWithOwner") != f"{owner}/{repository}":
            return GitHubCapability(
                True, True, detail="GitHub repository identity differs from policy"
            )
        if str(payload.get("viewerPermission", "")).upper() not in {"ADMIN", "MAINTAIN", "WRITE"}:
            return GitHubCapability(
                True, True, detail="GitHub permission cannot create a branch and Draft PR"
            )
        return GitHubCapability(True, True, owner, repository)

    @staticmethod
    def _pull_request(item: dict[str, Any]) -> PullRequest:
        head = item.get("headRefName", "")
        base = item.get("baseRefName", "")
        commit = item.get("headRefOid", "")
        if not isinstance(item.get("number"), int) or not all(
            isinstance(value, str) for value in (head, base, commit)
        ):
            raise CommandError(
                "GH_INVALID_PR",
                "GitHub CLI returned an invalid pull request",
                ExitCategory.EXTERNAL,
            )
        return PullRequest(
            item["number"],
            str(item.get("url", "")),
            str(item.get("state", "")),
            bool(item.get("isDraft")),
            base,
            head,
            commit,
            str(item.get("body", "")),
        )

    def find_pull_requests(
        self, *, owner: str, repository: str, head: str, base: str
    ) -> tuple[PullRequest, ...]:
        payload = self._json(
            self._run(
                [
                    "pr",
                    "list",
                    "--repo",
                    f"{owner}/{repository}",
                    "--state",
                    "open",
                    "--head",
                    head,
                    "--base",
                    base,
                    "--json",
                    "number,url,state,isDraft,baseRefName,headRefName,headRefOid,body",
                    "--limit",
                    "10",
                ]
            ).stdout
        )
        if not isinstance(payload, list):
            raise CommandError(
                "GH_INVALID_PR", "GitHub CLI PR list is not an array", ExitCategory.EXTERNAL
            )
        return tuple(self._pull_request(item) for item in payload if isinstance(item, dict))

    def create_draft_pull_request(
        self, *, owner: str, repository: str, base: str, head: str, title: str, body_file: str
    ) -> PullRequest:
        output = self._run(
            [
                "pr",
                "create",
                "--repo",
                f"{owner}/{repository}",
                "--base",
                base,
                "--head",
                head,
                "--title",
                title,
                "--body-file",
                body_file,
                "--draft",
                "--json",
                "number,url,state,isDraft,baseRefName,headRefName,headRefOid,body",
            ]
        ).stdout
        payload = self._json(output)
        if not isinstance(payload, dict):
            raise CommandError(
                "GH_INVALID_PR", "GitHub CLI created an invalid pull request", ExitCategory.EXTERNAL
            )
        return self._pull_request(payload)

    def update_pull_request_body(
        self, *, owner: str, repository: str, number: int, body_file: str
    ) -> None:
        self._run(
            ["pr", "edit", str(number), "--repo", f"{owner}/{repository}", "--body-file", body_file]
        )

    def checks(self, *, owner: str, repository: str, number: int) -> tuple[Check, ...]:
        result = self._run(
            [
                "pr",
                "checks",
                str(number),
                "--repo",
                f"{owner}/{repository}",
                "--required",
                "--json",
                "name,state,link,workflow,description",
            ],
            allowed_codes=(0, 1, 8),
        )
        payload = self._json(result.stdout or "[]")
        if not isinstance(payload, list):
            raise CommandError(
                "GH_INVALID_CHECKS", "GitHub CLI checks are not an array", ExitCategory.EXTERNAL
            )
        checks: list[Check] = []
        for item in payload:
            if (
                not isinstance(item, dict)
                or not isinstance(item.get("name"), str)
                or not isinstance(item.get("state"), str)
            ):
                raise CommandError(
                    "GH_INVALID_CHECKS",
                    "GitHub CLI returned an invalid check",
                    ExitCategory.EXTERNAL,
                )
            checks.append(
                Check(
                    item["name"],
                    item["state"],
                    item.get("link"),
                    item.get("workflow"),
                    item.get("description"),
                )
            )
        return tuple(checks)
