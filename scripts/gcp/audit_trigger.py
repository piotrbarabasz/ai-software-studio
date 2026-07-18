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
EXPECTED_TRIGGER_NAME = "deploy-prod"
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
}
REQUIRED_TRIGGER_FIELDS = (
    "CONTACT_RECIPIENT_EMAIL",
    "CONTACT_FROM_EMAIL",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USERNAME",
    "SMTP_USE_TLS",
)
MIGRATION_OVERRIDE_FIELDS = (
    "PUBLIC_SITE_URL",
    "PUBLIC_SITE_INDEXING",
    "PUBLIC_LEGAL_CONFIG_SECRET",
    "CONTACT_DELIVERY_MODE",
    "APP_ENV",
    "MIN_INSTANCES",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", required=True)
    parser.add_argument(
        "--trigger-location",
        default="global",
        help="Cloud Build trigger location, independent of the Cloud Run deployment region",
    )
    selector = parser.add_mutually_exclusive_group()
    selector.add_argument("--trigger-id")
    selector.add_argument("--trigger-name")
    parser.add_argument("--contract", type=Path, default=DEFAULT_CONTRACT_PATH)
    args = parser.parse_args()
    if not args.trigger_id and not args.trigger_name:
        args.trigger_name = "deploy-prod"
    return args


def _trigger_branch(trigger: dict[str, Any]) -> str:
    return str(
        trigger.get("github", {}).get("push", {}).get("branch")
        or trigger.get("repositoryEventConfig", {}).get("push", {}).get("branch")
        or ""
    )


def _failure_category(result: subprocess.CompletedProcess[str]) -> str:
    diagnostic = f"{result.stderr}\n{result.stdout}".upper()
    if "PERMISSION_DENIED" in diagnostic or "PERMISSION DENIED" in diagnostic:
        return "permission denied"
    if any(
        marker in diagnostic
        for marker in (
            "UNAUTHENTICATED",
            "NOT LOGGED IN",
            "LOGIN REQUIRED",
            "REAUTHENTICATION",
            "NO ACTIVE ACCOUNT",
        )
    ):
        return "authentication failed"
    if "NOT_FOUND" in diagnostic or "NOT FOUND" in diagnostic:
        return "trigger not found"
    return f"gcloud failed with exit code {result.returncode or 1}"


def _run_json(command: list[str], description: str) -> tuple[Any | None, int]:
    result = subprocess.run(command, text=True, capture_output=True, check=False)
    if result.returncode != 0:
        print(
            f"Trigger audit failed: {description}: {_failure_category(result)}.",
            file=sys.stderr,
        )
        return None, result.returncode or 1
    try:
        return json.loads(result.stdout), 0
    except json.JSONDecodeError:
        print(
            f"Trigger audit failed: {description}: gcloud returned invalid JSON.",
            file=sys.stderr,
        )
        return None, 2


def _load_trigger(
    gcloud: str, args: argparse.Namespace
) -> tuple[dict[str, Any] | None, int]:
    common = [
        f"--project={args.project}",
        f"--region={args.trigger_location}",
        "--format=json",
    ]
    if args.trigger_id:
        payload, status = _run_json(
            [gcloud, "builds", "triggers", "describe", args.trigger_id, *common],
            f"cannot describe trigger ID {args.trigger_id!r} in location "
            f"{args.trigger_location!r}",
        )
        if status:
            return None, status
        if not isinstance(payload, dict):
            print(
                "Trigger audit failed: describe did not return one trigger.",
                file=sys.stderr,
            )
            return None, 2
        return payload, 0

    payload, status = _run_json(
        [
            gcloud,
            "builds",
            "triggers",
            "list",
            *common,
            f"--filter=name={args.trigger_name}",
        ],
        f"cannot list trigger name {args.trigger_name!r} in location "
        f"{args.trigger_location!r}",
    )
    if status:
        return None, status
    if not isinstance(payload, list):
        print(
            "Trigger audit failed: trigger list did not return a JSON array.",
            file=sys.stderr,
        )
        return None, 2
    matches = [
        trigger for trigger in payload if trigger.get("name") == args.trigger_name
    ]
    if not matches:
        print(
            f"Trigger audit failed: zero exact matches for name {args.trigger_name!r} "
            f"in {args.project}/{args.trigger_location}.",
            file=sys.stderr,
        )
        return None, 1
    if len(matches) > 1:
        print(
            f"Trigger audit failed: more than one exact match for name {args.trigger_name!r} "
            f"in {args.project}/{args.trigger_location}; use --trigger-id.",
            file=sys.stderr,
        )
        return None, 1
    return matches[0], 0


def _difference(field: str, expected: str, actual: str, secret_fields: set[str]) -> str:
    substitution = FIELD_TO_SUBSTITUTION[field]
    if field in secret_fields:
        return f"{substitution}: does not match the contract secret reference name; value omitted"
    return f"{substitution}: expected {expected!r}, found {actual!r}"


def _audit_substitutions(substitutions: dict[str, Any], contract: Any) -> list[str]:
    errors: list[str] = []
    normalized = {key: str(value) for key, value in substitutions.items()}
    invariant_keys = {
        FIELD_TO_SUBSTITUTION[field]
        for field in contract.invariants
        if field != "CORS_ALLOWED_ORIGINS"
    }
    required_keys = {FIELD_TO_SUBSTITUTION[field] for field in REQUIRED_TRIGGER_FIELDS}
    allowed_keys = invariant_keys | required_keys

    for field, expected in contract.invariants.items():
        if field == "CORS_ALLOWED_ORIGINS":
            continue
        substitution = FIELD_TO_SUBSTITUTION[field]
        if substitution in normalized and normalized[substitution] != expected:
            errors.append(
                _difference(
                    field,
                    expected,
                    normalized[substitution],
                    set(contract.secret_reference_fields),
                )
            )

    public_site_override = normalized.get("_PUBLIC_SITE_URL", "")
    if public_site_override.endswith("/"):
        errors.append("_PUBLIC_SITE_URL: origin must not have a trailing slash")

    missing_keys = sorted(required_keys - set(normalized))
    errors.extend(
        f"{key}: required environment substitution is missing" for key in missing_keys
    )

    # A trigger with repository-owned overrides is in the explicit migration phase. Report
    # incomplete migration keys, while allowing the eventual minimal trigger to omit all of them.
    if invariant_keys & set(normalized):
        for field in MIGRATION_OVERRIDE_FIELDS:
            key = FIELD_TO_SUBSTITUTION[field]
            if key not in normalized:
                errors.append(f"{key}: migration override is missing")

    if "_IMAGE_TAG" in normalized:
        errors.append(
            "_IMAGE_TAG: historical custom tag substitution must be removed; "
            "cloudbuild.deploy.yaml uses built-in $SHORT_SHA"
        )
    if "_FRONTEND_URL" in normalized:
        errors.append("_FRONTEND_URL: unexpected obsolete production substitution")
    unexpected_keys = sorted(
        set(normalized) - allowed_keys - {"_IMAGE_TAG", "_FRONTEND_URL"}
    )
    errors.extend(
        f"{key}: unexpected production substitution" for key in unexpected_keys
    )

    values = dict(contract.invariants)
    for field in contract.scopes["production"]:
        substitution = FIELD_TO_SUBSTITUTION.get(field)
        if substitution and substitution in normalized:
            values[field] = normalized[substitution]
    values["CORS_ALLOWED_ORIGINS"] = values["PUBLIC_SITE_URL"]
    values["IMAGE_TAG"] = "deadbee"
    errors.extend(validate_values(values, contract, "production"))
    return list(dict.fromkeys(errors))


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

    trigger, status = _load_trigger(gcloud, args)
    if status or trigger is None:
        return status or 1

    errors: list[str] = []
    if args.project != contract.invariants["PROJECT_ID"]:
        errors.append(
            f"project: expected contract value {contract.invariants['PROJECT_ID']!r}, "
            f"found {args.project!r}"
        )
    if trigger.get("disabled") is True:
        errors.append("trigger: expected enabled, found disabled")
    trigger_name = str(trigger.get("name", ""))
    if trigger_name != EXPECTED_TRIGGER_NAME:
        errors.append(
            f"name: expected {EXPECTED_TRIGGER_NAME!r}, found {trigger_name!r}"
        )
    branch = _trigger_branch(trigger)
    if branch != EXPECTED_BRANCH:
        errors.append(f"branch: expected {EXPECTED_BRANCH!r}, found {branch!r}")
    filename = str(trigger.get("filename", ""))
    if filename != EXPECTED_CONFIG:
        errors.append(f"config: expected {EXPECTED_CONFIG!r}, found {filename!r}")
    if not isinstance(trigger.get("substitutions", {}), dict):
        errors.append("substitutions: expected a mapping")
    else:
        errors.extend(_audit_substitutions(trigger.get("substitutions", {}), contract))

    if errors:
        print(
            "Production trigger drift detected (read-only audit; no GCP changes made):",
            file=sys.stderr,
        )
        for error in dict.fromkeys(errors):
            print(f"- {error}", file=sys.stderr)
        return 1

    identity = trigger.get("id") or trigger.get("name") or "unknown"
    print(
        f"Trigger {identity!r} in location {args.trigger_location!r} matches deployment "
        f"contract v{contract.schema_version}, branch {EXPECTED_BRANCH}, and {EXPECTED_CONFIG}."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
