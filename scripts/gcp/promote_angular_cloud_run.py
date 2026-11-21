#!/usr/bin/env python3
"""Promote only the new Angular revision; keep V3 preview tagged at 0% traffic."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from typing import Any

PROJECT = "ai-software-studio-501918"
REGION = "europe-central2"
SERVICE = "aisoftware-studio-web"
PREVIEW_TAG = "v3-review"
REVISION_PATTERN = re.compile(r"^aisoftware-studio-web-[a-z0-9-]{4,50}$")


class TrafficError(Exception):
    """Unsafe or unverified Cloud Run traffic configuration."""


def _traffic(service: dict[str, Any]) -> list[dict[str, Any]]:
    traffic = service.get("status", {}).get("traffic")
    if not isinstance(traffic, list):
        raise TrafficError("Cloud Run status.traffic was not returned.")
    return traffic


def _percentage(entry: dict[str, Any]) -> int:
    return int(entry.get("percent", 0))


def deployment_target(service: dict[str, Any]) -> tuple[str, str | None]:
    """Validate the target and snapshot an existing 0% V3 preview revision."""
    status = service.get("status", {})
    latest = str(status.get("latestReadyRevisionName") or "")
    created = str(status.get("latestCreatedRevisionName") or "")
    if not latest or latest != created or not REVISION_PATTERN.fullmatch(latest):
        raise TrafficError("Latest created/ready Angular revision is not verifiable.")

    tags = [entry for entry in _traffic(service) if entry.get("tag") == PREVIEW_TAG]
    if len(tags) > 1:
        raise TrafficError("More than one V3 preview tag was found.")
    preview = None
    if tags:
        tag = tags[0]
        preview = str(tag.get("revisionName") or "")
        if not preview or preview == latest or _percentage(tag) != 0:
            raise TrafficError("V3 preview tag is not a separate 0% revision.")

    live = [entry for entry in _traffic(service) if _percentage(entry) > 0]
    if sum(_percentage(entry) for entry in live) != 100:
        raise TrafficError("Production traffic does not total 100%.")
    # Traffic may be pinned to a specific older Angular revision.
    return latest, preview


def verify_promoted(service: dict[str, Any], latest: str, preview: str | None) -> None:
    if str(service.get("status", {}).get("latestReadyRevisionName") or "") != latest:
        raise TrafficError("Another deployment changed the latest ready revision.")
    active = [
        (str(entry.get("revisionName") or ""), _percentage(entry))
        for entry in _traffic(service)
        if _percentage(entry) > 0
    ]
    if active != [(latest, 100)]:
        raise TrafficError(
            "The latest Angular revision is not serving 100% of traffic."
        )

    tagged = [entry for entry in _traffic(service) if entry.get("tag") == PREVIEW_TAG]
    if preview:
        if (
            len(tagged) != 1
            or str(tagged[0].get("revisionName") or "") != preview
            or _percentage(tagged[0]) != 0
        ):
            raise TrafficError("V3 preview tag or its 0% allocation was changed.")
    elif tagged:
        raise TrafficError("An unexpected V3 preview tag was created.")


def _describe(project: str, region: str, service: str) -> dict[str, Any]:
    result = subprocess.run(
        [
            "gcloud",
            "run",
            "services",
            "describe",
            service,
            f"--project={project}",
            f"--region={region}",
            "--format=json",
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode:
        raise TrafficError(
            "Cannot inspect Cloud Run service traffic (IAM/API failure)."
        )
    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise TrafficError("Cloud Run service returned invalid JSON.") from exc
    if not isinstance(data, dict) or data.get("metadata", {}).get("name") != service:
        raise TrafficError("Cloud Run service identity mismatch.")
    return data


def promote(project: str, region: str, service: str) -> None:
    if (project, region, service) != (PROJECT, REGION, SERVICE):
        raise TrafficError(
            "Refusing to change traffic outside approved Protolume frontend."
        )
    latest, preview = deployment_target(_describe(project, region, service))
    command = [
        "gcloud",
        "run",
        "services",
        "update-traffic",
        service,
        f"--project={project}",
        f"--region={region}",
        f"--to-revisions={latest}=100",
    ]
    if preview:
        command.append(f"--update-tags={PREVIEW_TAG}={preview}")
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    if result.returncode:
        raise TrafficError(
            "Failed to promote the Angular revision (Cloud Run update-traffic)."
        )
    verify_promoted(_describe(project, region, service), latest, preview)
    print(
        f"PASS: production frontend revision {latest} serves 100% traffic; "
        "V3 preview tag remains at 0%."
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", required=True)
    parser.add_argument("--region", required=True)
    parser.add_argument("--service", required=True)
    args = parser.parse_args()
    try:
        promote(args.project, args.region, args.service)
    except (TrafficError, ValueError, TypeError) as exc:
        print(f"BLOCKED: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
