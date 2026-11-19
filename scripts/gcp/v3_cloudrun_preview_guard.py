#!/usr/bin/env python3
"""Fail-closed Cloud Run v3 preview guard: existing production service, 0% preview traffic."""
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

PROJECT = "ai-software-studio-501918"
REGION = "europe-central2"
SERVICE = "aisoftware-studio-web"
TAG = "v3-review"
SNAPSHOT = Path("/workspace/.protolume-v3-live-traffic.json")


def active_traffic(service: dict) -> list[tuple[str, int]]:
    """Ignore 0% tagged revisions; compare only revisions serving default traffic."""
    values = []
    for entry in service.get("status", {}).get("traffic", []):
        percent = int(entry.get("percent", 0))
        if percent:
            values.append((str(entry.get("revisionName", "")), percent))
    return sorted(values)


def check_before(service: dict) -> list[tuple[str, int]]:
    live = active_traffic(service)
    if not live or sum(percent for _, percent in live) != 100:
        raise ValueError("Existing Cloud Run service must have 100% real production traffic.")
    if any(not revision for revision, _ in live):
        raise ValueError("Cannot establish the existing production revision baseline.")
    for entry in service.get("status", {}).get("traffic", []):
        if entry.get("tag") == TAG and int(entry.get("percent", 0)) != 0:
            raise ValueError("Preview tag is already serving production traffic.")
    return live


def check_after(service: dict, baseline: list[tuple[str, int]]) -> str:
    current = active_traffic(service)
    if current != baseline:
        raise ValueError("Production traffic changed during preview deployment; investigate immediately.")
    tagged = [
        entry for entry in service.get("status", {}).get("traffic", [])
        if entry.get("tag") == TAG
    ]
    if len(tagged) != 1:
        observed = [
            {"tag": entry.get("tag"), "revisionName": entry.get("revisionName"),
             "percent": entry.get("percent", 0)}
            for entry in service.get("status", {}).get("traffic", [])
        ]
        raise ValueError(
            f"Preview revision must have exactly one tag with zero traffic; "
            f"found {len(tagged)} matching entries. Traffic status: {observed}"
        )
    # Cloud Run's API defaults the percent of a tagged revision to zero.
    # In JSON responses the field can therefore be omitted entirely.
    if int(tagged[0].get("percent", 0)) != 0:
        raise ValueError("Preview tag is unexpectedly receiving production traffic.")
    revision = str(tagged[0].get("revisionName", ""))
    if not revision:
        raise ValueError("Preview revision is missing its identifier.")
    latest = str(service.get("status", {}).get("latestCreatedRevisionName", ""))
    if latest and revision != latest:
        raise ValueError("Preview tag does not point to the newly created revision.")
    return str(tagged[0].get("url", ""))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("before", "after"))
    parser.add_argument("--project", required=True)
    parser.add_argument("--region", required=True)
    parser.add_argument("--service", required=True)
    parser.add_argument("--tag", required=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    expected = (PROJECT, REGION, SERVICE, TAG)
    received = (args.project, args.region, args.service, args.tag)
    if received != expected:
        raise SystemExit("BLOCKED: Cloud Run preview target does not match approved production service.")

    result = subprocess.run(
        [
            "gcloud", "run", "services", "describe", SERVICE,
            f"--project={PROJECT}", f"--region={REGION}",
            "--format=json",
        ],
        capture_output=True, text=True, check=False,
    )
    if result.returncode:
        raise SystemExit(
            "BLOCKED: existing Cloud Run service could not be verified. "
            "Check project, IAM and service existence.\n" + result.stderr[-1500:]
        )
    service = json.loads(result.stdout)
    actual_name = service.get("metadata", {}).get("name")
    if actual_name and actual_name != SERVICE:
        raise SystemExit("BLOCKED: service identity mismatch.")

    if args.mode == "before":
        baseline = check_before(service)
        SNAPSHOT.write_text(json.dumps(baseline), encoding="utf-8")
        print("Existing production traffic captured. Preview deploy may use --no-traffic only.")
        return 0

    if not SNAPSHOT.exists():
        raise SystemExit("BLOCKED: missing baseline snapshot.")
    baseline = [(str(revision), int(percent)) for revision, percent in json.loads(SNAPSHOT.read_text(encoding="utf-8"))]
    url = check_after(service, baseline)
    print("PASS: production traffic unchanged; preview tag has 0% traffic.")
    if url:
        print("PREVIEW URL:", url)
    else:
        print("Preview URL not reported: inspect the tagged revision in Cloud Run console.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
