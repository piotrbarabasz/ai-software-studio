#!/usr/bin/env python3
"""Audit a production Cloud Build trigger without modifying GCP resources."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

from deployment_contract import DEFAULT_CONTRACT_PATH, load_contract, validate_values

EXPECTED_BRANCH = "^master$"
EXPECTED_CONFIG = "infra/gcp/cloudbuild.deploy.yaml"
FIELD_TO_SUBSTITUTION = {
    "PROJECT_ID": "_PROJECT_ID",
    "REGION": "_REGION",
    "ARTIFACT_REPO": "_ARTIFACT_REPO",
    "BACKEND_SERVICE": "_BACKEND_SERVICE",
    "FRONTEND_SERVICE": "_FRONTEND_SERVICE",
    "BACKEND_IMAGE_NAME": "_BACKEND_IMAGE_NAME",
    "FRONTEND_IMAGE_NAME": "_FRONTEND_IMAGE_NAME",
    "BACKEND_URL": "_BACKEND_URL",
    "PUBLIC_SITE_URL": "_PUBLIC_SITE_URL",
    "PUBLIC_SITE_INDEXING": "_PUBLIC_SITE_INDEXING",
    "PUBLIC_LEGAL_CONFIG_SECRET": "_PUBLIC_LEGAL_CONFIG_SECRET",
    "SMTP_PASSWORD_SECRET": "_SMTP_PASSWORD_SECRET",
    "CONTACT_RATE_LIMIT_PER_MINUTE": "_CONTACT_RATE_LIMIT_PER_MINUTE",
    "CONTACT_RECIPIENT_EMAIL": "_CONTACT_RECIPIENT_EMAIL",
    "CONTACT_FROM_EMAIL": "_CONTACT_FROM_EMAIL",
    "SMTP_HOST": "_SMTP_HOST",
    "SMTP_PORT": "_SMTP_PORT",
    "SMTP_USERNAME": "_SMTP_USERNAME",
    "SMTP_USE_TLS": "_SMTP_USE_TLS",
    "CONTACT_DELIVERY_MODE": "_CONTACT_DELIVERY_MODE",
    "APP_ENV": "_APP_ENV",
    "MIN_INSTANCES": "_MIN_INSTANCES",
    "IMAGE_TAG": "_IMAGE_TAG",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", required=True)
    parser.add_argument("--region", default="europe-central2")
    parser.add_argument("--trigger", default="deploy-prod")
    parser.add_argument("--contract", type=Path, default=DEFAULT_CONTRACT_PATH)
    return parser.parse_args()


def _trigger_branch(trigger: dict[str, Any]) -> str:
    return str(
        trigger.get("github", {}).get("push", {}).get("branch")
        or trigger.get("repositoryEventConfig", {}).get("push", {}).get("branch")
        or ""
    )


def _difference(field: str, expected: str, actual: str, secret_fields: set[str]) -> str:
    if field in secret_fields:
        substitution = FIELD_TO_SUBSTITUTION[field]
        return f"{substitution}: expected contract v1 secret reference; actual omitted"
    return f"{FIELD_TO_SUBSTITUTION[field]}: expected {expected!r}, found {actual!r}"


def main() -> int:
    args = parse_args()
    gcloud = shutil.which("gcloud")
    if not gcloud:
        print(
            "Trigger audit failed: gcloud is not installed or not on PATH.",
            file=sys.stderr,
        )
        return 2
    try:
        contract = load_contract(args.contract)
    except ValueError as exc:
        print(f"Trigger audit failed: {exc}", file=sys.stderr)
        return 2

    described = subprocess.run(
        [
            gcloud,
            "builds",
            "triggers",
            "describe",
            args.trigger,
            f"--project={args.project}",
            f"--region={args.region}",
            "--format=json",
        ],
        text=True,
        capture_output=True,
        check=False,
    )
    if described.returncode != 0:
        print(
            "Trigger audit failed: cannot describe "
            f"{args.trigger!r} in {args.project}/{args.region}.",
            file=sys.stderr,
        )
        return described.returncode or 1
    try:
        trigger = json.loads(described.stdout)
    except json.JSONDecodeError:
        print("Trigger audit failed: gcloud returned invalid JSON.", file=sys.stderr)
        return 2

    substitutions = trigger.get("substitutions", {})
    errors: list[str] = []
    if trigger.get("disabled") is True:
        errors.append("trigger: expected enabled, found disabled")
    branch = _trigger_branch(trigger)
    if branch != EXPECTED_BRANCH:
        errors.append(f"branch: expected {EXPECTED_BRANCH!r}, found {branch!r}")
    filename = str(trigger.get("filename", ""))
    if filename != EXPECTED_CONFIG:
        errors.append(f"config: expected {EXPECTED_CONFIG!r}, found {filename!r}")

    for field, expected in contract.invariants.items():
        if field == "CORS_ALLOWED_ORIGINS":
            continue
        substitution = FIELD_TO_SUBSTITUTION[field]
        actual = str(substitutions.get(substitution, ""))
        if actual != expected:
            errors.append(
                _difference(field, expected, actual, set(contract.secret_reference_fields))
            )
    if substitutions.get("_IMAGE_TAG") != "$SHORT_SHA":
        errors.append(
            "_IMAGE_TAG: expected literal '$SHORT_SHA' so Cloud Build resolves the commit tag"
        )

    expected_keys = {
        FIELD_TO_SUBSTITUTION[field]
        for field in contract.scopes["production"]
        if field != "CORS_ALLOWED_ORIGINS"
    }
    missing_keys = sorted(expected_keys - set(substitutions))
    errors.extend(f"{key}: required substitution is missing" for key in missing_keys)
    unexpected_keys = sorted(set(substitutions) - expected_keys)
    errors.extend(f"{key}: unexpected production substitution" for key in unexpected_keys)

    values = {
        field: str(substitutions.get(substitution, ""))
        for field, substitution in FIELD_TO_SUBSTITUTION.items()
    }
    values["CORS_ALLOWED_ORIGINS"] = values["PUBLIC_SITE_URL"]
    values["IMAGE_TAG"] = "deadbee"
    errors.extend(validate_values(values, contract, "production"))

    if errors:
        print(
            "Production trigger drift detected (read-only audit; no GCP changes made):",
            file=sys.stderr,
        )
        for error in dict.fromkeys(errors):
            print(f"- {error}", file=sys.stderr)
        return 1

    print(
        f"Trigger {args.trigger!r} matches deployment contract v{contract.schema_version}, "
        f"branch {EXPECTED_BRANCH}, and {EXPECTED_CONFIG}."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
