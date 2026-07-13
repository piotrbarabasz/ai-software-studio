"""Idempotent Draft PR reconciliation with controller-owned body markers."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Protocol

from .adapters.gh_cli import PullRequest
from .errors import CommandError, ExitCategory
from .redaction import redact

AUTO_START = "<!-- studio-loop:auto:start -->"
AUTO_END = "<!-- studio-loop:auto:end -->"
MANUAL_START = "<!-- studio-loop:manual:start -->"
MANUAL_END = "<!-- studio-loop:manual:end -->"


@dataclass(frozen=True)
class PullRequestRequest:
    owner: str
    repository: str
    feature_id: str
    base_branch: str
    head_branch: str
    head_sha: str
    title: str
    spec_path: str
    completed_tasks: tuple[str, ...]
    test_summary: str
    blockers: tuple[str, ...]


class _PullRequestTransport(Protocol):
    def find_pull_requests(
        self, *, owner: str, repository: str, head: str, base: str
    ) -> tuple[PullRequest, ...]: ...
    def create_draft_pull_request(
        self, *, owner: str, repository: str, base: str, head: str, title: str, body_file: str
    ) -> PullRequest: ...
    def update_pull_request_body(
        self, *, owner: str, repository: str, number: int, body_file: str
    ) -> None: ...


def render_body(request: PullRequestRequest, prior_body: str = "") -> str:
    manual = ""
    if MANUAL_START in prior_body and MANUAL_END in prior_body:
        start, end = prior_body.index(MANUAL_START), prior_body.index(MANUAL_END) + len(MANUAL_END)
        manual = prior_body[start:end]
    if not manual:
        manual = f"{MANUAL_START}\n<!-- Human-maintained notes. -->\n{MANUAL_END}"
    tasks = "\n".join(f"- [x] {task}" for task in request.completed_tasks) or "- none"
    blockers = "\n".join(f"- {redact(blocker)[:1000]}" for blocker in request.blockers) or "- none"
    return "\n".join(
        (
            AUTO_START,
            f"Feature: `{request.feature_id}`",
            f"Base: `{request.base_branch}`",
            f"Head SHA: `{request.head_sha}`",
            "",
            "## Completed tasks",
            tasks,
            "",
            "## Tests",
            redact(request.test_summary)[:2000],
            "",
            "## Blockers",
            blockers,
            "",
            f"Specification: `{request.spec_path}`",
            AUTO_END,
            "",
            manual,
            "",
        )
    )


class PullRequestService:
    def __init__(self, github: _PullRequestTransport, *, workspace: Path) -> None:
        self.github = github
        self.workspace = workspace

    def reconcile(self, request: PullRequestRequest) -> PullRequest:
        items = self.github.find_pull_requests(
            owner=request.owner,
            repository=request.repository,
            head=request.head_branch,
            base=request.base_branch,
        )
        if len(items) > 1:
            raise CommandError(
                "PR_AMBIGUOUS",
                "more than one open PR matches the feature branch",
                ExitCategory.RECONCILIATION,
            )
        existing = items[0] if items else None
        if existing is not None:
            if (
                not existing.is_draft
                or existing.state.lower() != "open"
                or existing.base_ref != request.base_branch
                or existing.head_ref != request.head_branch
            ):
                raise CommandError(
                    "PR_IDENTITY_MISMATCH",
                    "existing PR is not the matching open Draft PR",
                    ExitCategory.RECONCILIATION,
                )
            if existing.head_sha != request.head_sha:
                raise CommandError(
                    "PR_HEAD_MISMATCH",
                    "existing PR head does not match remote feature SHA",
                    ExitCategory.RECONCILIATION,
                )
        body = render_body(request, existing.body if existing else "")
        with NamedTemporaryFile(
            "w", encoding="utf-8", dir=self.workspace, suffix=".md", delete=False
        ) as file:
            file.write(body)
            body_file = file.name
        try:
            if existing is None:
                created = self.github.create_draft_pull_request(
                    owner=request.owner,
                    repository=request.repository,
                    base=request.base_branch,
                    head=request.head_branch,
                    title=request.title,
                    body_file=body_file,
                )
                if not created.is_draft or created.head_sha != request.head_sha:
                    raise CommandError(
                        "PR_CREATE_MISMATCH",
                        "created PR does not match the published feature SHA",
                        ExitCategory.RECONCILIATION,
                    )
                return created
            self.github.update_pull_request_body(
                owner=request.owner,
                repository=request.repository,
                number=existing.number,
                body_file=body_file,
            )
            return existing
        finally:
            Path(body_file).unlink(missing_ok=True)
