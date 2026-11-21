#!/usr/bin/env python3
"""Promote the verified Angular image revision without promoting the V3 preview."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from collections.abc import Callable
from typing import Any

PROJECT = "ai-software-studio-501918"
REGION = "europe-central2"
SERVICE = "aisoftware-studio-web"
PREVIEW_TAG = "v3-review"
REVISION_PATTERN = re.compile(r"^aisoftware-studio-web-[a-z0-9-]{4,50}$")
IMAGE_PATTERN = re.compile(
    r"^europe-central2-docker\.pkg\.dev/ai-software-studio-501918/"
    r"aisoftware-studio/aisoftware-studio-web:[0-9a-f]{7,40}$"
)


class TrafficError(Exception):
    """Unsafe or unverifiable Cloud Run routing or deployment."""


def _traffic(service: dict[str, Any]) -> list[dict[str, Any]]:
    traffic = service.get("status", {}).get("traffic")
    if not isinstance(traffic, list):
        raise TrafficError("Cloud Run status.traffic was not returned.")
    return traffic


def _percentage(entry: dict[str, Any]) -> int:
    return int(entry.get("percent", 0))


def _validate_traffic(service: dict[str, Any]) -> str | None:
    tags = [entry for entry in _traffic(service) if entry.get("tag") == PREVIEW_TAG]
    if len(tags) > 1:
        raise TrafficError("More than one V3 preview tag was found.")
    preview = None
    if tags:
        preview = str(tags[0].get("revisionName") or "")
        if not REVISION_PATTERN.fullmatch(preview) or _percentage(tags[0]) != 0:
            raise TrafficError(
                "V3 preview tag must target one revision with 0% traffic."
            )

    live = [entry for entry in _traffic(service) if _percentage(entry) > 0]
    if sum(_percentage(entry) for entry in live) != 100:
        raise TrafficError("Production traffic does not total 100%.")
    return preview


def _image_matches(revision: dict[str, Any], expected_image: str) -> bool:
    annotations = revision.get("metadata", {}).get("annotations", {})
    images = {str(annotations.get("client.knative.dev/user-image") or "")}
    for container in revision.get("spec", {}).get("containers", []):
        images.add(str(container.get("image") or ""))
    return expected_image in images


def _is_ready(revision: dict[str, Any]) -> bool:
    conditions = revision.get("status", {}).get("conditions", [])
    return any(
        condition.get("type") == "Ready"
        and str(condition.get("status", "")).lower() == "true"
        for condition in conditions
    )


def deployment_target(
    service: dict[str, Any],
    expected_image: str,
    get_revision: Callable[[str], dict[str, Any]],
    list_revisions: Callable[[], list[dict[str, Any]]],
) -> tuple[str, str | None]:
    """Require a Ready revision whose own image matches this build's image tag."""
    if not IMAGE_PATTERN.fullmatch(expected_image):
        raise TrafficError("Expected Angular image is outside the deployment contract.")
    preview = _validate_traffic(service)
    status = service.get("status", {})
    created = str(status.get("latestCreatedRevisionName") or "")
    if created:
        if not REVISION_PATTERN.fullmatch(created):
            raise TrafficError("Cloud Run latest created revision has an invalid name.")
        candidate = created
    else:
        # A few Cloud Run API response shapes omit latestCreatedRevisionName.
        # Never route to an older tag merely because it happens to be Ready.
        matches = [
            str(revision.get("metadata", {}).get("name") or "")
            for revision in list_revisions()
            if _image_matches(revision, expected_image)
        ]
        matches = [name for name in matches if REVISION_PATTERN.fullmatch(name)]
        if len(matches) != 1:
            raise TrafficError(
                "Cannot uniquely identify a revision for this Angular image; "
                f"matching revision count: {len(matches)}."
            )
        candidate = matches[0]

    if candidate == preview:
        raise TrafficError("The Angular production target points to V3 preview.")
    revision = get_revision(candidate)
    if str(revision.get("metadata", {}).get("name") or "") != candidate:
        raise TrafficError("Cloud Run revision identity mismatch.")
    owner = (
        revision.get("metadata", {})
        .get("labels", {})
        .get("serving.knative.dev/service")
    )
    if owner and owner != SERVICE:
        raise TrafficError("Angular revision belongs to another service.")
    if not _image_matches(revision, expected_image):
        raise TrafficError(
            "Latest created Cloud Run revision does not use this build's Angular image."
        )
    if not _is_ready(revision):
        raise TrafficError(
            "Selected Angular revision is not Ready according to its own status."
        )

    # latestReadyRevisionName is not used: it may lag latestCreated when
    # Cloud Run has a 0%-traffic preview and a pinned production revision.
    return candidate, preview


def verify_promoted(service: dict[str, Any], target: str, preview: str | None) -> None:
    created = str(service.get("status", {}).get("latestCreatedRevisionName") or "")
    if created and created != target:
        raise TrafficError("Another deployment changed the latest created revision.")
    active = [
        (str(entry.get("revisionName") or ""), _percentage(entry))
        for entry in _traffic(service)
        if _percentage(entry) > 0
    ]
    if active != [(target, 100)]:
        raise TrafficError("The verified Angular revision is not serving 100% traffic.")
    if _validate_traffic(service) != preview:
        raise TrafficError("V3 preview revision or its 0% allocation was changed.")


def _json_command(command: list[str]) -> Any:
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    if result.returncode:
        raise TrafficError(
            "Cloud Run read-only API query failed (check permissions and service)."
        )
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise TrafficError("Cloud Run query returned invalid JSON.") from exc


def _base_flags(project: str, region: str) -> list[str]:
    return [f"--project={project}", f"--region={region}", "--format=json"]


def _describe_service(project: str, region: str, service: str) -> dict[str, Any]:
    data = _json_command(
        [
            "gcloud",
            "run",
            "services",
            "describe",
            service,
            *_base_flags(project, region),
        ]
    )
    if not isinstance(data, dict) or data.get("metadata", {}).get("name") != service:
        raise TrafficError("Cloud Run service identity mismatch.")
    return data


def _describe_revision(project: str, region: str, revision: str) -> dict[str, Any]:
    data = _json_command(
        [
            "gcloud",
            "run",
            "revisions",
            "describe",
            revision,
            *_base_flags(project, region),
        ]
    )
    if not isinstance(data, dict):
        raise TrafficError("Cloud Run revision response is not an object.")
    return data


def _list_revisions(project: str, region: str, service: str) -> list[dict[str, Any]]:
    data = _json_command(
        [
            "gcloud",
            "run",
            "revisions",
            "list",
            f"--service={service}",
            "--limit=30",
            *_base_flags(project, region),
        ]
    )
    if not isinstance(data, list):
        raise TrafficError("Cloud Run revisions list response is not an array.")
    return data


def promote(project: str, region: str, service: str, expected_image: str) -> None:
    if (project, region, service) != (PROJECT, REGION, SERVICE):
        raise TrafficError("Refusing to change traffic outside approved Protolume web.")
    before = _describe_service(project, region, service)
    target, preview = deployment_target(
        before,
        expected_image,
        lambda name: _describe_revision(project, region, name),
        lambda: _list_revisions(project, region, service),
    )
    command = [
        "gcloud",
        "run",
        "services",
        "update-traffic",
        service,
        f"--project={project}",
        f"--region={region}",
        f"--to-revisions={target}=100",
    ]
    if preview:
        command.append(f"--update-tags={PREVIEW_TAG}={preview}")
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    if result.returncode:
        raise TrafficError("Cloud Run refused Angular traffic promotion.")
    verify_promoted(_describe_service(project, region, service), target, preview)
    print(
        f"PASS: verified Angular revision {target} at 100% production traffic; "
        "V3 preview remains at 0%."
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", required=True)
    parser.add_argument("--region", required=True)
    parser.add_argument("--service", required=True)
    parser.add_argument("--expected-image", required=True)
    args = parser.parse_args()
    try:
        promote(args.project, args.region, args.service, args.expected_image)
    except (TrafficError, ValueError, TypeError) as exc:
        print(f"BLOCKED: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
