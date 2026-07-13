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
    plan_path: str | None = None
    remaining_tasks: tuple[str, ...] = ()
    current_state: str = ""
    validation_summary: str = ""
    local_sha: str | None = None
    remote_sha: str | None = None
    ci_history: tuple[str, ...] = ()
    recorded_number: int | None = None


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
    completed = "\n".join(f"- [x] {task}" for task in request.completed_tasks) or "- none"
    remaining = "\n".join(f"- [ ] {task}" for task in request.remaining_tasks) or "- none"
    blockers = "\n".join(f"- {redact(blocker)[:1000]}" for blocker in request.blockers) or "- none"
    ci_history = "\n".join(f"- {redact(item)[:1000]}" for item in request.ci_history) or "- none"
    local_sha = request.local_sha or request.head_sha
    remote_sha = request.remote_sha or request.head_sha
    managed = "\n".join(
        (
            AUTO_START,
            f"Feature: `{request.feature_id}`",
            f"Base: `{request.base_branch}`",
            f"State: `{request.current_state or 'unknown'}`",
            "",
            "## Completed tasks",
            completed,
            "",
            "## Remaining tasks",
            remaining,
            "",
            "## Last validations",
            redact(request.validation_summary or request.test_summary)[:2000],
            "",
            "## Revisions",
            f"- Local SHA: `{local_sha}`",
            f"- Remote SHA: `{remote_sha}`",
            "",
            "## Blockers",
            blockers,
            "",
            "## CI history",
            ci_history,
            "",
            f"Specification: `{request.spec_path}`",
            f"Plan: `{request.plan_path or request.spec_path.replace('spec.md', 'plan.md')}`",
            AUTO_END,
        )
    )
    if AUTO_START in prior_body and AUTO_END in prior_body:
        start = prior_body.index(AUTO_START)
        end = prior_body.index(AUTO_END, start) + len(AUTO_END)
        return prior_body[:start] + managed + prior_body[end:]
    if prior_body:
        return managed + "\n\n" + prior_body
    manual = f"{MANUAL_START}\n<!-- Human-maintained notes. -->\n{MANUAL_END}"
    return managed + "\n\n" + manual + "\n"


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
            if request.recorded_number is not None and existing.number != request.recorded_number:
                raise CommandError(
                    "PR_NUMBER_MISMATCH",
                    "runtime state points to a different pull request",
                    ExitCategory.RECONCILIATION,
                )
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
