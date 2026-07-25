from __future__ import annotations

import argparse
import contextlib
import importlib.util
import io
import json
import os
import subprocess
import tempfile
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


def ps_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


class DeploymentHelperTest(unittest.TestCase):
    def write_command_shims(
        self, temp_dir: Path, *, fail_on_build: bool = False
    ) -> Path:
        shim_dir = temp_dir / "shims"
        shim_dir.mkdir(parents=True, exist_ok=True)
        log_path = temp_dir / "npm.log"
        py_stub = (
            "@echo off\r\n"
            "exit /b 0\r\n"
        )
        npm_stub = (
            "@echo off\r\n"
            "if defined SMOKE_LOG echo npm %* PUBLIC_BUILD_SHA=%PUBLIC_BUILD_SHA% PUBLIC_SITE_INDEXING=%PUBLIC_SITE_INDEXING%>>\"%SMOKE_LOG%\"\r\n"
            "echo %* | findstr /I /C:\"run build\" >nul\r\n"
            "if not errorlevel 1 if defined FAIL_ON_BUILD exit /b 13\r\n"
            "exit /b 0\r\n"
        )
        for name in ("py.cmd", "python.cmd"):
            (shim_dir / name).write_text(py_stub, encoding="utf-8")
        (shim_dir / "npm.cmd").write_text(npm_stub, encoding="utf-8")
        if fail_on_build:
            (shim_dir / "FAIL_ON_BUILD.flag").write_text("1", encoding="utf-8")
        return log_path

    def run_preflight(
        self,
        temp_dir: Path,
        *,
        legal_config_path: Path,
        enable_indexing: str,
        build_sha: str | None,
        fail_on_build: bool = False,
    ) -> tuple[subprocess.CompletedProcess[str], Path]:
        preflight = SCRIPT_ROOT / "preflight.ps1"
        log_path = self.write_command_shims(temp_dir, fail_on_build=fail_on_build)
        if log_path.exists():
            log_path.unlink()
        build_sha_fragment = (
            f" -BuildSha {ps_quote(build_sha)}" if build_sha is not None else ""
        )
        wrapper = temp_dir / "run-preflight.ps1"
        wrapper.write_text(
            "\n".join(
                [
                    "$ErrorActionPreference = 'Stop'",
                    "$env:PUBLIC_BUILD_SHA = 'sentinel-build-sha'",
                    "$env:API_URL = 'sentinel-api-url'",
                    "$env:PUBLIC_SITE_URL = 'sentinel-site-url'",
                    "$env:PUBLIC_SITE_INDEXING = 'sentinel-indexing'",
                    "$env:PUBLIC_SALES_EMAIL = 'sentinel-sales@example.test'",
                    "$env:PUBLIC_PRIVACY_EMAIL = 'sentinel-privacy@example.test'",
                    "$env:PUBLIC_LEGAL_CONFIG_PATH = 'sentinel-legal-path'",
                    f"try {{",
                    f"  . {ps_quote(str(preflight))} -PublicLegalConfigPath {ps_quote(str(legal_config_path))} -ApiUrl 'https://aisoftware-studio-api.example' -PublicSiteUrl 'https://protolume.pl' -EnableIndexing {ps_quote(enable_indexing)}{build_sha_fragment}",
                    "  Write-Output 'RESULT|success'",
                    "  $scriptExitCode = 0",
                    "} catch {",
                    "  Write-Output ('ERROR|' + $_.Exception.Message)",
                    "  $scriptExitCode = 1",
                    "}",
                    "Write-Output ('AFTER|' + $env:PUBLIC_BUILD_SHA + '|' + $env:API_URL + '|' + $env:PUBLIC_SITE_URL + '|' + $env:PUBLIC_SITE_INDEXING + '|' + $env:PUBLIC_SALES_EMAIL + '|' + $env:PUBLIC_PRIVACY_EMAIL + '|' + $env:PUBLIC_LEGAL_CONFIG_PATH)",
                    "exit $scriptExitCode",
                    "",
                ]
            ),
            encoding="utf-8",
        )
        environment = os.environ.copy()
        environment["PATH"] = f"{temp_dir / 'shims'}{os.pathsep}{environment['PATH']}"
        environment["SMOKE_LOG"] = str(log_path)
        if fail_on_build:
            environment["FAIL_ON_BUILD"] = "1"
        result = subprocess.run(
            [
                "powershell.exe",
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                str(wrapper),
            ],
            cwd=REPOSITORY_ROOT,
            env=environment,
            text=True,
            capture_output=True,
            check=False,
        )
        return result, log_path

    def test_preflight_rejects_indexing_contradicting_the_contract(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            result, log_path = self.run_preflight(
                Path(temp_dir),
                legal_config_path=REPOSITORY_ROOT / "infra" / "gcp" / "production-contract.json",
                enable_indexing="false",
                build_sha=None,
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("production-contract.json", result.stdout + result.stderr)
            self.assertIn("EnableIndexing", result.stdout + result.stderr)
            self.assertFalse(log_path.exists() and log_path.read_text(encoding="utf-8"))

    def test_preflight_accepts_the_head_build_sha_and_passes_it_to_the_build(self) -> None:
        head_sha = subprocess.run(
            ["git", "-C", str(REPOSITORY_ROOT), "rev-parse", "HEAD"],
            text=True,
            capture_output=True,
            check=True,
        ).stdout.strip()
        with tempfile.TemporaryDirectory() as temp_dir:
            legal_config = Path(temp_dir) / "public-legal.json"
            legal_config.write_text("{}", encoding="utf-8")
            result, log_path = self.run_preflight(
                Path(temp_dir),
                legal_config_path=legal_config,
                enable_indexing="true",
                build_sha=head_sha,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn(f"Preflight complete for build SHA {head_sha}.", result.stdout)
            log_text = log_path.read_text(encoding="utf-8")
            self.assertIn(f"PUBLIC_BUILD_SHA={head_sha}", log_text)
            self.assertIn("PUBLIC_SITE_INDEXING=true", log_text)
            self.assertIn("validate:site:production", result.stdout)
            self.assertIn("validate:legal:production", result.stdout)
            self.assertIn("validate:seo:production", result.stdout)
            self.assertIn("validate:csp:production", result.stdout)
            self.assertIn("validate:site-artifact:production", result.stdout)
            self.assertIn("validate:artifact:production", result.stdout)

    def test_preflight_rejects_invalid_build_shas_and_placeholders(self) -> None:
        head_sha = subprocess.run(
            ["git", "-C", str(REPOSITORY_ROOT), "rev-parse", "HEAD"],
            text=True,
            capture_output=True,
            check=True,
        ).stdout.strip()
        mismatch = ("0" if head_sha[0] != "0" else "1") + head_sha[1:]
        with tempfile.TemporaryDirectory() as temp_dir:
            legal_config = Path(temp_dir) / "public-legal.json"
            legal_config.write_text("{}", encoding="utf-8")
            for value in ("unknown", "local", "test", mismatch):
                with self.subTest(value=value):
                    result, log_path = self.run_preflight(
                        Path(temp_dir),
                        legal_config_path=legal_config,
                        enable_indexing="true",
                        build_sha=value,
                    )

                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn("BuildSha", result.stdout + result.stderr)
                    self.assertFalse(log_path.exists() and log_path.read_text(encoding="utf-8"))

    def test_preflight_restores_environment_after_a_build_failure(self) -> None:
        head_sha = subprocess.run(
            ["git", "-C", str(REPOSITORY_ROOT), "rev-parse", "HEAD"],
            text=True,
            capture_output=True,
            check=True,
        ).stdout.strip()
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            legal_config = temp_path / "public-legal.json"
            legal_config.write_text("{}", encoding="utf-8")
            result, _ = self.run_preflight(
                temp_path,
                legal_config_path=legal_config,
                enable_indexing="true",
                build_sha=head_sha,
                fail_on_build=True,
            )

            self.assertNotEqual(result.returncode, 0)
            after_line = next(
                line for line in result.stdout.splitlines() if line.startswith("AFTER|")
            )
            self.assertEqual(
                after_line,
                "AFTER|sentinel-build-sha|sentinel-api-url|sentinel-site-url|sentinel-indexing|sentinel-sales@example.test|sentinel-privacy@example.test|sentinel-legal-path",
            )

    def test_preflight_reports_missing_operator_legal_config(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            missing_legal = Path(temp_dir) / "missing-public-legal.json"
            result, log_path = self.run_preflight(
                Path(temp_dir),
                legal_config_path=missing_legal,
                enable_indexing="true",
                build_sha=None,
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Cannot find path", result.stdout + result.stderr)
            self.assertFalse(log_path.exists() and log_path.read_text(encoding="utf-8"))

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
