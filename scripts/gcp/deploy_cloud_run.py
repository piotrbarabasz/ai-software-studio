#!/usr/bin/env python3
"""Run gcloud deploy and retain its status while collecting failure diagnostics."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from typing import Any


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", required=True)
    parser.add_argument("--region", required=True)
    parser.add_argument("--service", required=True)
    parser.add_argument("gcloud_args", nargs=argparse.REMAINDER)
    args = parser.parse_args()
    if args.gcloud_args[:1] == ["--"]:
        args.gcloud_args = args.gcloud_args[1:]
    if not args.gcloud_args:
        parser.error("pass gcloud run deploy flags after --")
    return args


def _ready_condition(revision: dict[str, Any]) -> dict[str, Any] | None:
    conditions = revision.get("status", {}).get("conditions", [])
    return next(
        (condition for condition in conditions if condition.get("type") == "Ready"),
        None,
    )


def _newest_failed_revision(
    gcloud: str, project: str, region: str, service: str
) -> tuple[str, str]:
    result = subprocess.run(
        [
            gcloud,
            "run",
            "revisions",
            "list",
            f"--project={project}",
            f"--region={region}",
            f"--service={service}",
            "--sort-by=~metadata.creationTimestamp",
            "--limit=10",
            "--format=json",
        ],
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        return "", "revision lookup failed (missing permission or unavailable API)"
    try:
        revisions = json.loads(result.stdout)
    except json.JSONDecodeError:
        return "", "revision lookup returned invalid JSON"
    for revision in revisions:
        condition = _ready_condition(revision)
        if condition and str(condition.get("status", "")).lower() == "false":
            return str(revision.get("metadata", {}).get("name", "")), str(
                condition.get("message", "Ready=False")
            )
    return "", "no Ready=False revision was visible"


def _show_logs(gcloud: str, project: str, service: str, revision: str) -> None:
    log_filter = (
        'resource.type="cloud_run_revision" '
        f'AND resource.labels.service_name="{service}" '
        f'AND resource.labels.revision_name="{revision}"'
    )
    result = subprocess.run(
        [
            gcloud,
            "logging",
            "read",
            log_filter,
            f"--project={project}",
            "--limit=100",
            "--order=asc",
            "--format=value(timestamp,severity,textPayload,jsonPayload.message)",
        ],
        check=False,
    )
    if result.returncode != 0:
        print(
            "Additional diagnostic: Cloud Run application logs could not be read; "
            "the original deploy failure remains authoritative.",
            file=sys.stderr,
        )


def main() -> int:
    args = parse_args()
    gcloud = shutil.which("gcloud")
    if not gcloud:
        print("gcloud is not installed or not on PATH.", file=sys.stderr)
        return 127

    deploy = subprocess.run(
        [gcloud, "run", "deploy", args.service, *args.gcloud_args],
        check=False,
    )
    deploy_status = deploy.returncode
    if deploy_status == 0:
        return 0

    print(
        f"gcloud run deploy failed with exit code {deploy_status}; "
        "collecting best-effort diagnostics.",
        file=sys.stderr,
    )
    revision, detail = _newest_failed_revision(gcloud, args.project, args.region, args.service)
    if not revision:
        print(f"Additional diagnostic: {detail}.", file=sys.stderr)
        return deploy_status

    print(
        f"Newest failed revision: {revision}. Ready condition: {detail}",
        file=sys.stderr,
    )
    _show_logs(gcloud, args.project, args.service, revision)
    return deploy_status


if __name__ == "__main__":
    raise SystemExit(main())
