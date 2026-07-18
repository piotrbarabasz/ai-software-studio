from __future__ import annotations

import os
import subprocess
import sys
import unittest
from pathlib import Path

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
VALIDATOR = REPOSITORY_ROOT / "scripts" / "gcp" / "deployment_contract.py"


def valid_environment() -> dict[str, str]:
    values = {
        "PROJECT_ID": "ai-software-studio-501918",
        "REGION": "europe-central2",
        "ARTIFACT_REPO": "aisoftware-studio",
        "BACKEND_SERVICE": "aisoftware-studio-api",
        "FRONTEND_SERVICE": "aisoftware-studio-web",
        "BACKEND_IMAGE_NAME": "aisoftware-studio-api",
        "FRONTEND_IMAGE_NAME": "aisoftware-studio-web",
        "BACKEND_URL": "https://aisoftware-studio-api-175725977490.europe-central2.run.app",
        "PUBLIC_SITE_URL": "https://protolume.pl",
        "CORS_ALLOWED_ORIGINS": "https://protolume.pl",
        "PUBLIC_SITE_INDEXING": "false",
        "PUBLIC_LEGAL_CONFIG_SECRET": "aisoftware-studio-public-legal-config",
        "SMTP_PASSWORD_SECRET": "aisoftware-studio-smtp-password",
        "CONTACT_RATE_LIMIT_PER_MINUTE": "30",
        "CONTACT_RECIPIENT_EMAIL": "recipient@configuration.test",
        "CONTACT_FROM_EMAIL": "sender@configuration.test",
        "SMTP_HOST": "smtp.configuration.test",
        "SMTP_PORT": "587",
        "SMTP_USERNAME": "smtp-test-user",
        "SMTP_USE_TLS": "true",
        "CONTACT_DELIVERY_MODE": "email",
        "APP_ENV": "production",
        "MIN_INSTANCES": "0",
        "IMAGE_TAG": "00309330686d4ee83a6522088322e2ed6efcde8e",
    }
    return {f"DEPLOY_{key}": value for key, value in values.items()}


def run_validator(
    overrides: dict[str, str] | None = None,
) -> subprocess.CompletedProcess[str]:
    environment = os.environ.copy()
    environment.update(valid_environment())
    if overrides:
        environment.update({f"DEPLOY_{key}": value for key, value in overrides.items()})
    return subprocess.run(
        [sys.executable, str(VALIDATOR), "--scope", "production"],
        cwd=REPOSITORY_ROOT,
        env=environment,
        text=True,
        capture_output=True,
        check=False,
    )


class DeploymentContractCliTest(unittest.TestCase):
    def test_valid_resolved_contract_exits_zero(self) -> None:
        result = run_validator()

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("validated", result.stdout)

    def test_old_run_app_origin_is_rejected_with_both_field_names(self) -> None:
        old_origin = "https://aisoftware-studio-web-old.europe-central2.run.app"
        result = run_validator(
            {"PUBLIC_SITE_URL": old_origin, "CORS_ALLOWED_ORIGINS": old_origin}
        )

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("PUBLIC_SITE_URL", result.stderr)
        self.assertIn("CORS_ALLOWED_ORIGINS", result.stderr)

    def test_manual_local_tag_is_rejected(self) -> None:
        result = run_validator({"IMAGE_TAG": "manual-local"})

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("IMAGE_TAG", result.stderr)
        self.assertIn("manual-local is forbidden", result.stderr)

    def test_placeholders_are_rejected_without_echoing_secret_values(self) -> None:
        result = run_validator(
            {
                "BACKEND_URL": "https://<BACKEND_CLOUD_RUN_URL>",
                "SMTP_PASSWORD_SECRET": "<SECRET_DO_NOT_ECHO>",
            }
        )

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("BACKEND_URL", result.stderr)
        self.assertIn("SMTP_PASSWORD_SECRET", result.stderr)
        self.assertNotIn("SECRET_DO_NOT_ECHO", result.stderr)

    def test_invalid_ports_booleans_and_missing_secret_names_are_rejected(self) -> None:
        result = run_validator(
            {
                "SMTP_PORT": "70000",
                "SMTP_USE_TLS": "yes",
                "PUBLIC_SITE_INDEXING": "0",
                "PUBLIC_LEGAL_CONFIG_SECRET": "",
            }
        )

        self.assertNotEqual(result.returncode, 0)
        for field in (
            "SMTP_PORT",
            "SMTP_USE_TLS",
            "PUBLIC_SITE_INDEXING",
            "PUBLIC_LEGAL_CONFIG_SECRET",
        ):
            self.assertIn(field, result.stderr)


if __name__ == "__main__":
    unittest.main()
