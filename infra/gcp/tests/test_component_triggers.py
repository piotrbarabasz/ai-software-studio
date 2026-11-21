"""Regression checks for component trigger filters and safe activation."""

from __future__ import annotations

import fnmatch
import json
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

import yaml

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "scripts/gcp"))
import configure_component_triggers as triggers  # noqa: E402


class ComponentTriggersTest(unittest.TestCase):
    def setUp(self) -> None:
        self.manifest = triggers.load_manifest()

    def matches(self, component: str, path: str) -> bool:
        return any(
            fnmatch.fnmatchcase(path, pattern)
            for pattern in self.manifest[component]["included_files"]
        )

    def test_isolated_frontend_backend_and_shared_changes(self) -> None:
        cases = (
            ("landing/styles.css", True, False),
            ("landing/assets/favicon.svg", True, False),
            ("backend/app/api/contact.py", False, True),
            ("backend/requirements.lock", False, True),
            ("infra/gcp/production-contract.json", True, True),
            (".dockerignore", True, True),
            ("README.md", False, False),
            ("docs/operations.md", False, False),
        )
        for path, frontend, backend in cases:
            with self.subTest(path=path):
                self.assertEqual(self.matches("frontend", path), frontend)
                self.assertEqual(self.matches("backend", path), backend)

    def test_config_and_helpers_also_trigger_own_pipeline(self) -> None:
        self.assertTrue(self.matches("frontend", "infra/gcp/cloudbuild.deploy.yaml"))
        self.assertTrue(self.matches("frontend", "scripts/gcp/promote_v3_cloud_run.py"))
        self.assertTrue(self.matches("backend", "infra/gcp/cloudbuild.backend-ci.yaml"))
        self.assertTrue(self.matches("backend", "scripts/gcp/smoke-backend-image.sh"))
        self.assertTrue(self.matches("backend", "infra/gcp/tests/test_cloudbuild_yaml.py"))

    def test_backend_ci_builds_and_smokes_but_does_not_deploy(self) -> None:
        config = yaml.safe_load(
            (ROOT / "infra/gcp/cloudbuild.backend-ci.yaml").read_text()
        )
        ids = [step["id"] for step in config["steps"]]
        self.assertEqual(
            ids,
            [
                "backend-ci-checks",
                "backend-ci-image-build",
                "backend-ci-image-smoke",
                "backend-ci-image-push",
            ],
        )
        self.assertEqual(
            config["steps"][1]["waitFor"], ["backend-ci-checks"]
        )
        self.assertEqual(
            config["steps"][2]["waitFor"], ["backend-ci-image-build"]
        )
        self.assertEqual(
            config["steps"][3]["waitFor"], ["backend-ci-image-smoke"]
        )
        source = (ROOT / "infra/gcp/cloudbuild.backend-ci.yaml").read_text()
        self.assertIn("backend/Dockerfile", source)
        self.assertIn("smoke-backend-image.sh", source)
        self.assertIn("$SHORT_SHA", source)
        self.assertNotIn("gcloud run deploy", source)
        self.assertNotIn("update-traffic", source)
        self.assertNotIn("SMTP_PASSWORD_SECRET", source)

    def test_dry_run_never_contacts_gcp(self) -> None:
        with (
            patch.object(sys, "argv", ["configure_component_triggers.py"]),
            patch.object(triggers.subprocess, "run") as process,
        ):
            self.assertEqual(triggers.main(), 0)
            process.assert_not_called()

    def test_rejects_wrong_trigger_event_or_config(self) -> None:
        good = {
            "name": "deploy-prod",
            "id": self.manifest["frontend"]["id"],
            "filename": self.manifest["frontend"]["config"],
            "github": {"owner": "piotrbarabasz", "name": "ai-software-studio", "push": {"branch": "^master$"}},
        }
        triggers.validate_trigger(self.manifest, "frontend", good)
        for modifications in (
            {"filename": "unsafe.yaml"},
            {"github": {"pullRequest": {"branch": "^master$"}}},
            {"github": {"push": {"branch": "^feature$"}}},
            {"github": {"owner": "someone-else", "push": {"branch": "^master$"}}},
        ):
            with self.subTest(modifications=modifications):
                bad = {**good, **modifications}
                with self.assertRaises(triggers.TriggerConfigurationError):
                    triggers.validate_trigger(self.manifest, "frontend", bad)

    def test_commands_preserve_branch_repo_and_use_path_filters(self) -> None:
        create = triggers.backend_create(
            self.manifest, "projects/a/serviceAccounts/build@example.invalid"
        )
        self.assertIn("--branch-pattern=^master$", create)
        self.assertIn("--repo-owner=piotrbarabasz", create)
        self.assertIn("--repo-name=ai-software-studio", create)
        self.assertIn("--region=global", create)
        self.assertIn(
            "--service-account=projects/a/serviceAccounts/build@example.invalid", create
        )
        self.assertTrue(any(item.startswith("--included-files=backend/**") for item in create))
        update = triggers.frontend_update(self.manifest)
        self.assertIn(self.manifest["frontend"]["id"], update)
        self.assertTrue(any(item.startswith("--included-files=landing/**") for item in update))

    def test_filter_verification_fails_closed(self) -> None:
        for component in ("frontend", "backend"):
            with self.subTest(component=component):
                with self.assertRaises(triggers.TriggerConfigurationError):
                    triggers.verify_filters(self.manifest, component, {"includedFiles": []})
                with self.assertRaises(triggers.TriggerConfigurationError):
                    triggers.verify_filters(
                        self.manifest, component,
                        {"includedFiles": self.manifest[component]["included_files"], "ignoredFiles": ["**"]},
                    )


if __name__ == "__main__":
    unittest.main()
