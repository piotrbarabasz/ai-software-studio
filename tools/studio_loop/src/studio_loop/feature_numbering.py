"""Deterministic feature identity allocation from every durable Git evidence source."""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path

from .adapters.git_cli import GitCli
from .errors import CommandError

_FEATURE = re.compile(r"^(?P<number>[0-9]{3})-(?P<slug>[a-z0-9][a-z0-9-]{0,62})$")
_NUMBER = re.compile(r"^(?P<number>[0-9]{3})(?:-|$)")
_METADATA_TITLE = re.compile(r"^\s*(?:title|tytul)\s*:\s*(?P<value>.+?)\s*$", re.IGNORECASE)


def normalize_slug(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-")
    slug = re.sub(r"-{2,}", "-", slug)[:63].rstrip("-")
    if not slug or not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,62}", slug):
        raise CommandError("INVALID_SLUG", "slug must contain at least one ASCII letter or digit")
    return slug


def request_slug(
    request: str,
    *,
    explicit_slug: str | None = None,
    metadata_title: str | None = None,
) -> str:
    """Derive a feature slug only from request content, never its file name.

    The precedence is deliberately small and deterministic so that a temporary
    request path (particularly a Windows path) cannot become feature identity.
    """
    if explicit_slug is not None and re.match(r"^(?:[A-Za-z]:[\\/]|[\\/])", explicit_slug.strip()):
        raise CommandError("INVALID_SLUG", "explicit slug must not be a filesystem path")
    candidates = (explicit_slug, metadata_title, _title_from_request(request))
    for candidate in candidates:
        if candidate is not None and candidate.strip():
            return normalize_slug(candidate)
    raise CommandError(
        "REQUEST_TITLE_MISSING",
        "request needs --slug, metadata title, or a non-empty heading",
    )


def _title_from_request(request: str) -> str | None:
    for raw_line in request.splitlines():
        line = raw_line.strip().lstrip("\ufeff")
        if not line:
            continue
        metadata = _METADATA_TITLE.match(line)
        if metadata:
            return metadata["value"].strip()
        heading = re.sub(r"^#{1,6}\s+", "", line).strip()
        return heading or None
    return None


@dataclass(frozen=True)
class FeatureProposal:
    number: int
    slug: str
    feature_id: str
    branch: str
    directory: str
    evidence_numbers: tuple[int, ...]


class FeatureService:
    def __init__(self, repository: Path, git: GitCli | None = None) -> None:
        self.repository = repository.resolve()
        self.git = git or GitCli.discover(repository)

    def used_numbers(self) -> tuple[int, ...]:
        values: set[int] = set()
        specs = self.repository / "specs"
        if specs.exists():
            for child in specs.iterdir():
                match = _NUMBER.match(child.name)
                if child.is_dir() and match:
                    values.add(int(match["number"]))
        for branch in (*self.git.local_branches(), *self.git.remote_branches()):
            match = _NUMBER.match(branch.removeprefix("refs/heads/"))
            if match:
                values.add(int(match["number"]))
        return tuple(sorted(values))

    def propose(self, raw_slug: str) -> FeatureProposal:
        slug = normalize_slug(raw_slug)
        used = self.used_numbers()
        number = next(candidate for candidate in range(1, 1000) if candidate not in used)
        feature_id = f"{number:03d}-{slug}"
        return FeatureProposal(number, slug, feature_id, feature_id, f"specs/{feature_id}", used)

    def ensure_available(self, proposal: FeatureProposal) -> None:
        if proposal.number in self.used_numbers():
            raise CommandError(
                "NUMBER_COLLISION", f"feature number {proposal.number:03d} is already in use"
            )
        if self.git.local_branch_exists(proposal.branch) or self.git.remote_branch_exists(
            proposal.branch
        ):
            raise CommandError(
                "BRANCH_COLLISION", f"feature branch already exists: {proposal.branch}"
            )
        if not _FEATURE.fullmatch(proposal.feature_id):
            raise CommandError("FEATURE_ID_INVALID", "feature identity is internally inconsistent")
