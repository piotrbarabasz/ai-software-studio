from __future__ import annotations

import argparse
import contextlib
import importlib.util
import io
import json
import subprocess
import unittest
from pathlib import Path
from unittest.mock import patch

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
SCRIPT_ROOT = REPOSITORY_ROOT / "scripts" / "gcp"


def load_script(name: str):
    spec = importlib.util.spec_from_file_location(name, SCRIPT_ROOT / f"{name}.py")
    if spec is None or spec.loader is None:
        raise AssertionError(f"cannot import {name}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class DeploymentHelperTest(unittest.TestCase):
    def test_shell_and_powershell_release_wrappers_submit_only_combined_pipeline(
        self,
    ) -> None:
        shell = (SCRIPT_ROOT / "deploy-production.sh").read_text(encoding="utf-8")
        powershell = (SCRIPT_ROOT / "deploy-production.ps1").read_text(encoding="utf-8")

        for expected in (
            "infra/gcp/cloudbuild.deploy.yaml",
            "SHORT_SHA",
            "_CONTACT_RECIPIENT_EMAIL",
            "_CONTACT_FROM_EMAIL",
            "_SMTP_HOST",
            "_SMTP_PORT",
            "_SMTP_USERNAME",
            "_SMTP_USE_TLS",
            "status --porcelain",
        ):
            with self.subTest(expected=expected):
                self.assertIn(expected, shell.replace("\\", "/"))
                self.assertIn(expected, powershell.replace("\\", "/"))
        self.assertNotIn("SMTP_PASSWORD=", shell)
        self.assertNotIn("SMTP_PASSWORD=", powershell)
        self.assertNotIn("PUBLIC_LEGAL_CONFIG_JSON", shell)
        self.assertNotIn("PUBLIC_LEGAL_CONFIG_JSON", powershell)

    def test_trigger_wrappers_support_both_exact_trigger_contracts(self) -> None:
        shell = (SCRIPT_ROOT / "create-triggers.sh").read_text(encoding="utf-8")
        powershell = (SCRIPT_ROOT / "create-triggers.ps1").read_text(encoding="utf-8")

        for expected in ("production", "pull-request", "trigger-kind"):
            self.assertIn(expected.lower(), shell.lower())
            self.assertIn(expected.lower(), powershell.lower())

    def test_deploy_diagnostics_never_mask_original_exit_code(self) -> None:
        module = load_script("deploy_cloud_run")
        arguments = argparse.Namespace(
            project="project-id",
            region="europe-central2",
            service="service-name",
            gcloud_args=["--image=image:tag"],
        )
        failed_revision = [
            {
                "metadata": {"name": "service-name-00002-failed"},
                "status": {
                    "conditions": [
                        {
                            "type": "Ready",
                            "status": "False",
                            "message": "startup failed",
                        }
                    ]
                },
            }
        ]
        command_results = [
            subprocess.CompletedProcess([], 23),
            subprocess.CompletedProcess([], 0, stdout=json.dumps(failed_revision)),
            subprocess.CompletedProcess([], 7),
        ]

        with (
            patch.object(module, "parse_args", return_value=arguments),
            patch.object(module.shutil, "which", return_value="gcloud"),
            patch.object(module.subprocess, "run", side_effect=command_results),
            contextlib.redirect_stderr(io.StringIO()) as stderr,
        ):
            result = module.main()

        self.assertEqual(result, 23)
        self.assertIn("Newest failed revision", stderr.getvalue())
        self.assertIn(
            "original deploy failure remains authoritative", stderr.getvalue()
        )

    def test_iam_audit_rejects_conditional_all_users_binding(self) -> None:
        module = load_script("audit_cloud_run_iam")
        arguments = argparse.Namespace(
            project="project-id", region="europe-central2", service=["service-name"]
        )
        conditional_policy = {
            "bindings": [
                {
                    "role": "roles/run.invoker",
                    "members": ["allUsers"],
                    "condition": {
                        "expression": "request.time < timestamp('2030-01-01T00:00:00Z')"
                    },
                }
            ]
        }
        command_result = subprocess.CompletedProcess(
            [], 0, stdout=json.dumps(conditional_policy), stderr=""
        )

        with (
            patch.object(module, "parse_args", return_value=arguments),
            patch.object(module.shutil, "which", return_value="gcloud"),
            patch.object(module.subprocess, "run", return_value=command_result),
            contextlib.redirect_stderr(io.StringIO()) as stderr,
        ):
            result = module.main()

        self.assertEqual(result, 1)
        self.assertIn("missing roles/run.invoker for allUsers", stderr.getvalue())


if __name__ == "__main__":
    unittest.main()
