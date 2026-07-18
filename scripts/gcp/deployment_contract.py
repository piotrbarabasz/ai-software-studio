#!/usr/bin/env python3
"""Validate resolved, non-secret production deployment inputs."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlsplit

REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CONTRACT_PATH = REPOSITORY_ROOT / "infra" / "gcp" / "production-contract.json"
PLACEHOLDER_PATTERN = re.compile(
    r"<[^>]*>|__[^\s]*REQUIRED[^\s]*__|\$(?:\{[^}]+\}|[A-Z_][A-Z0-9_]*)",
    re.IGNORECASE,
)
PROJECT_ID_PATTERN = re.compile(r"^[a-z][a-z0-9-]{4,28}[a-z0-9]$")
RESOURCE_NAME_PATTERN = re.compile(r"^[a-z][a-z0-9-]{0,62}$")
SECRET_NAME_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,255}$")
IMAGE_TAG_PATTERN = re.compile(r"^[0-9a-f]{7,64}$")
HOSTNAME_PATTERN = re.compile(
    r"^(?=.{1,253}$)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+"
    r"[A-Za-z]{2,63}$"
)
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
SECRET_REFERENCE_FIELDS = {"PUBLIC_LEGAL_CONFIG_SECRET", "SMTP_PASSWORD_SECRET"}


@dataclass(frozen=True)
class Contract:
    schema_version: int
    invariants: dict[str, str]
    secret_reference_fields: frozenset[str]
    scopes: dict[str, tuple[str, ...]]


def load_contract(path: Path = DEFAULT_CONTRACT_PATH) -> Contract:
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
        schema_version = raw["schema_version"]
        invariants = raw["invariants"]
        scopes = raw["scopes"]
        secret_fields = raw["secret_reference_fields"]
    except (OSError, json.JSONDecodeError, KeyError, TypeError) as exc:
        raise ValueError(f"cannot load deployment contract from {path}: {exc}") from exc

    if schema_version != 1:
        raise ValueError(f"unsupported deployment contract schema_version: {schema_version!r}")
    if not isinstance(invariants, dict) or not all(
        isinstance(key, str) and isinstance(value, str) for key, value in invariants.items()
    ):
        raise ValueError("deployment contract invariants must be a string-to-string object")
    if not isinstance(scopes, dict) or not all(
        isinstance(name, str)
        and isinstance(fields, list)
        and all(isinstance(field, str) for field in fields)
        for name, fields in scopes.items()
    ):
        raise ValueError("deployment contract scopes must contain field-name arrays")
    if not isinstance(secret_fields, list) or not all(
        isinstance(field, str) for field in secret_fields
    ):
        raise ValueError("deployment contract secret_reference_fields must be an array")
    if invariants.get("CORS_ALLOWED_ORIGINS") != invariants.get("PUBLIC_SITE_URL"):
        raise ValueError("deployment contract CORS_ALLOWED_ORIGINS must equal PUBLIC_SITE_URL")

    return Contract(
        schema_version=schema_version,
        invariants=dict(invariants),
        secret_reference_fields=frozenset(secret_fields),
        scopes={name: tuple(fields) for name, fields in scopes.items()},
    )


def _unsafe_text(value: str) -> bool:
    lowered = value.lower()
    return bool(
        PLACEHOLDER_PATTERN.search(value)
        or "localhost" in lowered
        or "127.0.0.1" in lowered
        or "::1" in lowered
        or "example.com" in lowered
        or lowered.endswith(".example")
        or ".example." in lowered
    )


def _valid_https_url(value: str, *, origin_only: bool = False) -> bool:
    try:
        parsed = urlsplit(value)
        port = parsed.port
    except ValueError:
        return False
    if (
        parsed.scheme != "https"
        or not parsed.hostname
        or parsed.username is not None
        or parsed.password is not None
        or _unsafe_text(value)
    ):
        return False
    if port is not None and not 1 <= port <= 65535:
        return False
    return not (origin_only and (parsed.path not in {"", "/"} or parsed.query or parsed.fragment))


def _integer_in_range(value: str, minimum: int, maximum: int) -> bool:
    try:
        parsed = int(value, 10)
    except ValueError:
        return False
    return str(parsed) == value and minimum <= parsed <= maximum


def _append(errors: list[str], field: str, expectation: str) -> None:
    errors.append(f"{field}: {expectation}")


def validate_values(
    values: dict[str, str],
    contract: Contract,
    scope: str,
) -> list[str]:
    if scope not in contract.scopes:
        return [f"scope: must be one of {', '.join(sorted(contract.scopes))}"]

    errors: list[str] = []
    fields = contract.scopes[scope]
    for field in fields:
        value = values.get(field, "")
        if not value.strip():
            expectation = (
                "required Secret Manager reference name"
                if field in contract.secret_reference_fields
                else "required non-empty value"
            )
            _append(errors, field, expectation)
            continue
        if _unsafe_text(value):
            _append(
                errors,
                field,
                "must not contain placeholders, localhost, or example.com",
            )

    for field, expected in contract.invariants.items():
        if field in fields and values.get(field) != expected:
            if field in contract.secret_reference_fields:
                _append(
                    errors,
                    field,
                    "must be the Secret Manager reference name declared by contract v1; "
                    "actual value omitted",
                )
            else:
                _append(errors, field, f"must equal contract v1 value {expected!r}")

    project_id = values.get("PROJECT_ID", "")
    if "PROJECT_ID" in fields and project_id and not PROJECT_ID_PATTERN.fullmatch(project_id):
        _append(errors, "PROJECT_ID", "must be a valid lowercase GCP project ID")

    for field in {
        "REGION",
        "ARTIFACT_REPO",
        "BACKEND_SERVICE",
        "FRONTEND_SERVICE",
        "BACKEND_IMAGE_NAME",
        "FRONTEND_IMAGE_NAME",
    } & set(fields):
        value = values.get(field, "")
        if value and not RESOURCE_NAME_PATTERN.fullmatch(value):
            _append(errors, field, "must use lowercase GCP resource-name syntax")

    for field in contract.secret_reference_fields & set(fields):
        value = values.get(field, "")
        if value and not SECRET_NAME_PATTERN.fullmatch(value):
            _append(
                errors,
                field,
                "must be a valid Secret Manager secret name; actual value omitted",
            )

    if (
        "PUBLIC_SITE_URL" in fields
        and values.get("PUBLIC_SITE_URL")
        and not _valid_https_url(values["PUBLIC_SITE_URL"], origin_only=True)
    ):
        _append(
            errors,
            "PUBLIC_SITE_URL",
            "must be a valid HTTPS origin without credentials, query, or fragment",
        )
    has_cors = "CORS_ALLOWED_ORIGINS" in fields and values.get("CORS_ALLOWED_ORIGINS")
    if has_cors and not _valid_https_url(values["CORS_ALLOWED_ORIGINS"], origin_only=True):
        _append(errors, "CORS_ALLOWED_ORIGINS", "must be one valid HTTPS origin")
    if (
        "BACKEND_URL" in fields
        and values.get("BACKEND_URL")
        and not _valid_https_url(values["BACKEND_URL"], origin_only=False)
    ):
        _append(errors, "BACKEND_URL", "must be a valid non-local HTTPS URL")

    for field in {"PUBLIC_SITE_INDEXING", "SMTP_USE_TLS"} & set(fields):
        value = values.get(field, "")
        if value and value not in {"true", "false"}:
            _append(errors, field, "must be exactly 'true' or 'false'")

    if (
        "SMTP_PORT" in fields
        and values.get("SMTP_PORT")
        and not _integer_in_range(values["SMTP_PORT"], 1, 65535)
    ):
        _append(errors, "SMTP_PORT", "must be a base-10 integer from 1 through 65535")
    if (
        "CONTACT_RATE_LIMIT_PER_MINUTE" in fields
        and values.get("CONTACT_RATE_LIMIT_PER_MINUTE")
        and not _integer_in_range(values["CONTACT_RATE_LIMIT_PER_MINUTE"], 1, 120)
    ):
        _append(
            errors,
            "CONTACT_RATE_LIMIT_PER_MINUTE",
            "must be an integer from 1 through 120",
        )
    if (
        "MIN_INSTANCES" in fields
        and values.get("MIN_INSTANCES")
        and not _integer_in_range(values["MIN_INSTANCES"], 0, 1000)
    ):
        _append(errors, "MIN_INSTANCES", "must be an integer from 0 through 1000")

    for field in {"CONTACT_RECIPIENT_EMAIL", "CONTACT_FROM_EMAIL"} & set(fields):
        value = values.get(field, "")
        if value and not EMAIL_PATTERN.fullmatch(value):
            _append(errors, field, "must be a syntactically valid non-example email address")

    if "SMTP_HOST" in fields:
        value = values.get("SMTP_HOST", "")
        if value and not HOSTNAME_PATTERN.fullmatch(value):
            _append(errors, "SMTP_HOST", "must be a valid non-local DNS hostname")

    if "IMAGE_TAG" in fields:
        value = values.get("IMAGE_TAG", "")
        if value and not IMAGE_TAG_PATTERN.fullmatch(value):
            _append(
                errors,
                "IMAGE_TAG",
                "must be a 7-64 character lowercase hexadecimal commit ID; "
                "manual-local is forbidden",
            )

    return list(dict.fromkeys(errors))


def values_from_environment(fields: tuple[str, ...], prefix: str) -> dict[str, str]:
    return {field: os.environ.get(f"{prefix}{field}", "") for field in fields}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--contract", type=Path, default=DEFAULT_CONTRACT_PATH)
    parser.add_argument(
        "--scope", choices=("production", "backend", "frontend"), default="production"
    )
    parser.add_argument("--env-prefix", default="DEPLOY_")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        contract = load_contract(args.contract)
    except ValueError as exc:
        print(f"Deployment contract error: {exc}", file=sys.stderr)
        return 2

    values = values_from_environment(contract.scopes[args.scope], args.env_prefix)
    errors = validate_values(values, contract, args.scope)
    if errors:
        print(
            f"Deployment contract v{contract.schema_version} validation failed:",
            file=sys.stderr,
        )
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(
        f"Deployment contract v{contract.schema_version} validated "
        f"{len(contract.scopes[args.scope])} resolved fields for scope {args.scope}."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
