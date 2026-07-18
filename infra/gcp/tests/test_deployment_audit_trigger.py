from __future__ import annotations

import argparse
import contextlib
import io
import json
import subprocess
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
SCRIPT_ROOT = REPOSITORY_ROOT / "scripts" / "gcp"
sys.path.insert(0, str(SCRIPT_ROOT))

import audit_trigger  # noqa: E402
from deployment_contract import load_contract  # noqa: E402


def trigger_payload(substitutions: dict[str, str] | None = None) -> dict[str, object]:
    return {
        "id": "901333cb-1c13-4929-90e5-6df070eb647e",
        "name": "deploy-prod",
        "filename": "infra/gcp/cloudbuild.deploy.yaml",
        "github": {"push": {"branch": "^master$"}},
        "substitutions": substitutions
        or {
            "_CONTACT_RECIPIENT_EMAIL": "recipient@test.invalid",
            "_CONTACT_FROM_EMAIL": "sender@test.invalid",
            "_SMTP_HOST": "smtp.test.invalid",
            "_SMTP_PORT": "587",
            "_SMTP_USERNAME": "smtp-user",
            "_SMTP_USE_TLS": "true",
        },
    }


def arguments(**overrides: object) -> argparse.Namespace:
    values: dict[str, object] = {
        "project": "ai-software-studio-501918",
        "trigger_kind": "production",
        "trigger_location": "global",
        "trigger_id": None,
        "trigger_name": "deploy-prod",
        "contract": audit_trigger.DEFAULT_CONTRACT_PATH,
    }
    values.update(overrides)
    return argparse.Namespace(**values)


class TriggerAuditTest(unittest.TestCase):
    def test_global_trigger_can_be_selected_by_exact_name(self) -> None:
        result = subprocess.CompletedProcess(
            [], 0, stdout=json.dumps([trigger_payload()]), stderr=""
        )

        with (
            patch.object(audit_trigger, "parse_args", return_value=arguments()),
            patch.object(audit_trigger.shutil, "which", return_value="gcloud"),
            patch.object(audit_trigger.subprocess, "run", return_value=result) as run,
        ):
            status = audit_trigger.main()

        self.assertEqual(status, 0)
        command = run.call_args.args[0]
        self.assertIn("--region=global", command)
        self.assertIn("--filter=name=deploy-prod", command)
        self.assertNotIn("europe-central2", command)

    def test_pull_request_trigger_has_exact_event_name_config_and_no_overrides(
        self,
    ) -> None:
        payload = {
            "id": "pull-request-trigger-id",
            "name": "pr-checks",
            "filename": "infra/gcp/cloudbuild.pr-checks.yaml",
            "github": {"pullRequest": {"branch": "^master$"}},
            "substitutions": {},
        }
        args = arguments(
            trigger_kind="pull-request",
            trigger_name="pr-checks",
        )
        result = subprocess.CompletedProcess(
            [], 0, stdout=json.dumps([payload]), stderr=""
        )

        with (
            patch.object(audit_trigger, "parse_args", return_value=args),
            patch.object(audit_trigger.shutil, "which", return_value="gcloud"),
            patch.object(audit_trigger.subprocess, "run", return_value=result),
        ):
            status = audit_trigger.main()

        self.assertEqual(status, 0)

    def test_pull_request_trigger_rejects_push_event_and_substitution_override(
        self,
    ) -> None:
        payload = {
            "id": "pull-request-trigger-id",
            "name": "pr-checks",
            "filename": "infra/gcp/cloudbuild.pr-checks.yaml",
            "github": {"push": {"branch": "^master$"}},
            "substitutions": {"_PUBLIC_SITE_INDEXING": "true"},
        }
        args = arguments(
            trigger_kind="pull-request",
            trigger_name="pr-checks",
        )
        result = subprocess.CompletedProcess(
            [], 0, stdout=json.dumps([payload]), stderr=""
        )

        with (
            patch.object(audit_trigger, "parse_args", return_value=args),
            patch.object(audit_trigger.shutil, "which", return_value="gcloud"),
            patch.object(audit_trigger.subprocess, "run", return_value=result),
            contextlib.redirect_stderr(io.StringIO()) as stderr,
        ):
            status = audit_trigger.main()

        self.assertEqual(status, 1)
        self.assertIn("event: expected 'pull-request'", stderr.getvalue())
        self.assertIn("must not override", stderr.getvalue())

    def test_regional_trigger_can_be_selected_by_explicit_id(self) -> None:
        result = subprocess.CompletedProcess(
            [], 0, stdout=json.dumps(trigger_payload()), stderr=""
        )
        args = arguments(
            trigger_location="europe-west1",
            trigger_id="trigger-id",
            trigger_name=None,
        )

        with (
            patch.object(audit_trigger, "parse_args", return_value=args),
            patch.object(audit_trigger.shutil, "which", return_value="gcloud"),
            patch.object(audit_trigger.subprocess, "run", return_value=result) as run,
        ):
            status = audit_trigger.main()

        self.assertEqual(status, 0)
        self.assertEqual(run.call_args.args[0][1:4], ["builds", "triggers", "describe"])
        self.assertIn("trigger-id", run.call_args.args[0])
        self.assertIn("--region=europe-west1", run.call_args.args[0])

    def test_name_lookup_reports_zero_and_multiple_exact_matches(self) -> None:
        for payload, expected in (
            ([], "zero exact matches"),
            ([trigger_payload()] * 2, "more than one"),
        ):
            with self.subTest(expected=expected):
                result = subprocess.CompletedProcess(
                    [], 0, stdout=json.dumps(payload), stderr=""
                )
                with (
                    patch.object(audit_trigger.subprocess, "run", return_value=result),
                    contextlib.redirect_stderr(io.StringIO()) as stderr,
                ):
                    trigger, status = audit_trigger._load_trigger("gcloud", arguments())

                self.assertIsNone(trigger)
                self.assertEqual(status, 1)
                self.assertIn(expected, stderr.getvalue())

    def test_gcloud_failures_are_classified_without_dumping_diagnostics(self) -> None:
        cases = {
            "NOT_FOUND: missing": "trigger not found",
            "PERMISSION_DENIED: denied": "permission denied",
            "UNAUTHENTICATED: login required": "authentication failed",
        }
        for diagnostic, expected in cases.items():
            with self.subTest(expected=expected):
                result = subprocess.CompletedProcess(
                    [], 1, stdout="", stderr=diagnostic
                )
                with (
                    patch.object(audit_trigger.subprocess, "run", return_value=result),
                    contextlib.redirect_stderr(io.StringIO()) as stderr,
                ):
                    trigger, status = audit_trigger._load_trigger(
                        "gcloud", arguments(trigger_id="trigger-id", trigger_name=None)
                    )

                self.assertIsNone(trigger)
                self.assertEqual(status, 1)
                self.assertIn(expected, stderr.getvalue())
                self.assertNotIn(diagnostic, stderr.getvalue())

    def test_active_legacy_drift_is_reported_without_secret_reference_value(
        self,
    ) -> None:
        substitutions = {
            "_PROJECT_ID": "ai-software-studio-501918",
            "_REGION": "europe-central2",
            "_PUBLIC_SITE_URL": "https://old-service.run.app/",
            "_SMTP_PASSWORD_SECRET": "do-not-print-this-reference",
            "_FRONTEND_URL": "https://old-service.run.app",
            "_IMAGE_TAG": "$SHORT_SHA",
        }

        errors = audit_trigger._audit_substitutions(substitutions, load_contract())
        output = "\n".join(errors)

        for expected in (
            "_PUBLIC_SITE_URL",
            "trailing slash",
            "_PUBLIC_LEGAL_CONFIG_SECRET",
            "_APP_ENV",
            "_CONTACT_DELIVERY_MODE",
            "_MIN_INSTANCES",
            "_CONTACT_RECIPIENT_EMAIL",
            "_CONTACT_FROM_EMAIL",
            "_SMTP_HOST",
            "_SMTP_PORT",
            "_SMTP_USERNAME",
            "_SMTP_USE_TLS",
            "_FRONTEND_URL",
            "_IMAGE_TAG",
        ):
            self.assertIn(expected, output)
        self.assertNotIn("do-not-print-this-reference", output)


if __name__ == "__main__":
    unittest.main()
