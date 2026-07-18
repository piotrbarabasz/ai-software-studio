#!/usr/bin/env python3
"""Read-only verification that routine deploys will preserve public Cloud Run access."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", required=True)
    parser.add_argument("--region", required=True)
    parser.add_argument("--service", action="append", required=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    gcloud = shutil.which("gcloud")
    if not gcloud:
        print("IAM audit failed: gcloud is not installed or not on PATH.", file=sys.stderr)
        return 2

    failures: list[str] = []
    for service in args.service:
        result = subprocess.run(
            [
                gcloud,
                "run",
                "services",
                "get-iam-policy",
                service,
                f"--project={args.project}",
                f"--region={args.region}",
                "--format=json",
            ],
            text=True,
            capture_output=True,
            check=False,
        )
        if result.returncode != 0:
            failures.append(
                f"{service}: cannot read the service IAM policy; verify that the service exists "
                "and the Cloud Build identity has read access"
            )
            continue
        try:
            policy = json.loads(result.stdout)
            is_public = any(
                binding.get("role") == "roles/run.invoker"
                and "allUsers" in binding.get("members", [])
                and not binding.get("condition")
                for binding in policy.get("bindings", [])
            )
        except (json.JSONDecodeError, AttributeError, TypeError):
            failures.append(f"{service}: gcloud returned an unreadable IAM policy")
            continue
        if not is_public:
            failures.append(f"{service}: missing roles/run.invoker for allUsers")

    if failures:
        print(
            "Cloud Run IAM predeploy audit failed; routine deployment will not mutate IAM:",
            file=sys.stderr,
        )
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        print(
            "Bootstrap each existing service explicitly, then rerun the audit:\n"
            "  gcloud run services add-iam-policy-binding SERVICE "
            f"--project={args.project} --region={args.region} "
            "--member=allUsers --role=roles/run.invoker",
            file=sys.stderr,
        )
        return 1

    print("Cloud Run IAM audit passed: every service grants roles/run.invoker to allUsers.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
