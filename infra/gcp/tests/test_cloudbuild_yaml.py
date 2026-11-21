"""Contracts for the active Protolume V3 Cloud Build pipelines."""

from __future__ import annotations

import unittest
from pathlib import Path

import yaml

INFRA = Path(__file__).resolve().parents[1]
CONFIGS = (
    "cloudbuild.deploy.yaml",
    "cloudbuild.landing-cloudrun-preview.yaml",
    "cloudbuild.pr-checks.yaml",
    "cloudbuild.backend.yaml",
)


def read(name: str) -> dict:
    config = yaml.safe_load((INFRA / name).read_text(encoding="utf-8"))
    if not isinstance(config, dict):
        raise AssertionError(f"{name} must contain YAML mapping")
    return config


class CloudBuildV3Test(unittest.TestCase):
    def test_pipelines_parse_with_unique_ordered_steps(self) -> None:
        for name in CONFIGS:
            with self.subTest(config=name):
                config = read(name)
                existing: set[str] = set()
                for step in config["steps"]:
                    step_id = step["id"]
                    self.assertNotIn(step_id, existing)
                    for dependency in step.get("waitFor", []):
                        self.assertTrue(
                            dependency == "-" or dependency in existing,
                            f"{name}: {step_id} waits for unknown {dependency}",
                        )
                    existing.add(step_id)

    def test_deploy_prod_publishes_static_v3_not_angular(self) -> None:
        config = read("cloudbuild.deploy.yaml")
        steps = {step["id"]: step for step in config["steps"]}
        self.assertIn("v3-production-preflight", steps)
        self.assertIn("v3-production-checks", steps)
        self.assertIn("v3-production-image-smoke", steps)
        self.assertIn("v3-production-deploy-zero-traffic", steps)
        self.assertIn("v3-production-promote-traffic", steps)
        self.assertIn("v3-production-live-smoke", steps)
        self.assertEqual(
            steps["v3-production-promote-traffic"]["waitFor"],
            ["v3-production-deploy-zero-traffic"],
        )
        self.assertEqual(
            steps["v3-production-live-smoke"]["waitFor"],
            ["v3-production-promote-traffic"],
        )
        source = (INFRA / "cloudbuild.deploy.yaml").read_text()
        for marker in (
            "landing/Dockerfile.cloudrun",
            "landing/nginx.production.conf",
            "landing/.public-legal-config.json",
            "FORM_ENDPOINT=/api/contact/brief",
            "PUBLIC_BUILD_SHA=$SHORT_SHA",
            "--no-traffic",
        ):
            self.assertIn(marker, source)
        self.assertNotIn("frontend/Dockerfile", source)
        self.assertNotIn("npm ci", source)
        self.assertNotIn("firebase deploy", source)

    def test_preview_still_blocks_indexing_and_live_traffic(self) -> None:
        source = (INFRA / "cloudbuild.landing-cloudrun-preview.yaml").read_text()
        self.assertIn("--no-traffic", source)
        self.assertIn("--tag=$_PREVIEW_TAG", source)
        self.assertIn("landing/.public-legal-config.json", source)
        self.assertIn("v3_cloudrun_preview_guard.py", source)
        self.assertNotIn("landing/nginx.production.conf", source)

    def test_pr_checks_include_backend_and_supported_v3(self) -> None:
        config = read("cloudbuild.pr-checks.yaml")
        ids = {step["id"] for step in config["steps"]}
        self.assertIn("backend-checks", ids)
        self.assertIn("v3-static-checks", ids)
        self.assertIn("production-helper-tests", ids)
        self.assertIn("preview-traffic-guard-tests", ids)
        self.assertNotIn("frontend-checks", ids)

    def test_manual_backend_does_not_publish_without_approval(self) -> None:
        config = read("cloudbuild.backend.yaml")
        ids = {step["id"] for step in config["steps"]}
        self.assertIn("manual-backend-build", ids)
        self.assertIn("manual-backend-smoke", ids)
        self.assertIn("manual-backend-push", ids)
        self.assertNotIn("backend-deploy", ids)
        self.assertNotIn("frontend-deploy", ids)


if __name__ == "__main__":
    unittest.main()
