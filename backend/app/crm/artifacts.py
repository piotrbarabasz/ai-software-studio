"""Offline completeness/integrity gate, not proof of a CRM write or publication rights."""

import hashlib
from datetime import date
from pathlib import Path, PurePosixPath
from typing import Annotated, Literal

from pydantic import Field, StringConstraints

from app.crm.models import FrozenModel, Identifier


class ArtifactFile(FrozenModel):
    kind: Literal["trace", "screenshot", "recording"]
    path: Annotated[str, StringConstraints(min_length=1, max_length=200)]
    sha256: Annotated[str, StringConstraints(pattern=r"^[a-f0-9]{64}$")]


class CrmArtifact(FrozenModel):
    schema_version: Literal[1]
    origin: Literal["fixture", "sandbox-run"]
    channel: Literal["email", "whatsapp"]
    data_origin: Literal["synthetic", "customer"]
    executed_on: date
    target_reference: Identifier
    event_reference: Identifier
    record_reference: Identifier
    scope: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=1000)]
    limitations: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=1500)
    ]
    review_reference: Identifier | None = None
    approval_verified: bool = False
    duplicate_verified: bool = False
    missing_field_verified: bool = False
    fields_match_verified: bool = False
    privacy_and_rights_reviewed: bool = False
    official_channel_verified: bool = False
    files: Annotated[tuple[ArtifactFile, ...], Field(min_length=1, max_length=4)]


def publication_issues(artifact: CrmArtifact, root: Path) -> tuple[str, ...]:
    """Operator-reviewed package only. Never called by the public application."""
    issues = []
    if artifact.origin != "sandbox-run":
        issues.append("test_fixture_is_not_execution_evidence")
    if artifact.data_origin != "synthetic":
        issues.append("public_sandbox_example_requires_synthetic_data")
    if artifact.executed_on > date.today():
        issues.append("execution_date_is_in_the_future")
    if not artifact.review_reference:
        issues.append("review_reference_missing")
    for check in (
        "approval_verified",
        "duplicate_verified",
        "missing_field_verified",
        "fields_match_verified",
        "privacy_and_rights_reviewed",
    ):
        if not getattr(artifact, check):
            issues.append(check + "_missing")
    if artifact.channel == "whatsapp" and not artifact.official_channel_verified:
        issues.append("official_channel_verification_missing")
    kinds = {file.kind for file in artifact.files}
    if "trace" not in kinds or not kinds.intersection({"screenshot", "recording"}):
        issues.append("trace_and_visual_artifact_required")
    root = root.resolve()
    seen = set()
    for file in artifact.files:
        relative = PurePosixPath(file.path)
        if (
            relative.is_absolute()
            or ".." in relative.parts
            or ":" in file.path
            or "\\" in file.path
            or relative.suffix not in {".json", ".png", ".webm", ".mp4"}
        ):
            issues.append("invalid_artifact_path")
            continue
        target = (root / file.path).resolve()
        if not target.is_relative_to(root) or target in seen:
            issues.append("outside_or_duplicate_artifact_path")
            continue
        seen.add(target)
        try:
            with target.open("rb") as source:
                data = source.read(20 * 1024 * 1024 + 1)
            if len(data) > 20 * 1024 * 1024:
                issues.append("artifact_exceeds_20_mib")
            elif not data or hashlib.sha256(data).hexdigest() != file.sha256:
                issues.append("artifact_empty_or_hash_mismatch")
        except OSError:
            issues.append("artifact_file_unavailable")
    return tuple(issues)
