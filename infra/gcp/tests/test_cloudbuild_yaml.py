from __future__ import annotations

import unittest
from pathlib import Path

import yaml

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
GCP_ROOT = REPOSITORY_ROOT / "infra" / "gcp"
CONFIG_NAMES = (
    "cloudbuild.deploy.yaml",
    "cloudbuild.backend.yaml",
    "cloudbuild.frontend.yaml",
    "cloudbuild.pr-checks.yaml",
)


def load_config(name: str) -> dict[str, object]:
    with (GCP_ROOT / name).open(encoding="utf-8") as config_file:
        parsed = yaml.safe_load(config_file)
    if not isinstance(parsed, dict):
        raise AssertionError(f"{name} did not parse to a mapping")
    return parsed


class CloudBuildYamlTest(unittest.TestCase):
    def test_all_cloud_build_files_parse_and_wait_for_known_steps(self) -> None:
        for name in CONFIG_NAMES:
            with self.subTest(name=name):
                config = load_config(name)
                steps = config.get("steps")
                self.assertIsInstance(steps, list)
                known_ids = {step.get("id") for step in steps if isinstance(step, dict)}
                for step in steps:
                    for dependency in step.get("waitFor", []):
                        self.assertTrue(
                            dependency == "-" or dependency in known_ids,
                            f"{name}: unknown waitFor dependency {dependency!r}",
                        )

    def test_production_preflight_is_first_and_receives_resolved_values(self) -> None:
        config = load_config("cloudbuild.deploy.yaml")
        first_step = config["steps"][0]

        self.assertEqual(first_step["id"], "deployment-contract-preflight")
        self.assertEqual(first_step["args"][-2:], ["--scope", "production"])
        environment = set(first_step["env"])
        self.assertIn("DEPLOY_PUBLIC_SITE_URL=$_PUBLIC_SITE_URL", environment)
        self.assertIn("DEPLOY_CORS_ALLOWED_ORIGINS=$_PUBLIC_SITE_URL", environment)
        self.assertIn("DEPLOY_IMAGE_TAG=$_IMAGE_TAG", environment)

    def test_both_images_and_backend_smoke_precede_first_deploy(self) -> None:
        config = load_config("cloudbuild.deploy.yaml")
        steps = {step["id"]: step for step in config["steps"]}

        def ancestors(step_id: str) -> set[str]:
            direct = set(steps[step_id].get("waitFor", [])) - {"-"}
            indirect = {ancestor for dependency in direct for ancestor in ancestors(dependency)}
            return direct | indirect

        before_backend_deploy = ancestors("backend-deploy")
        self.assertTrue(
            {
                "backend-checks",
                "frontend-checks",
                "backend-build",
                "frontend-build",
                "backend-image-smoke",
                "cloud-run-iam-audit",
                "backend-push",
                "frontend-push",
            }.issubset(before_backend_deploy)
        )

    def test_routine_deploy_does_not_mutate_iam_or_allow_manual_tag(self) -> None:
        source = (GCP_ROOT / "cloudbuild.deploy.yaml").read_text(encoding="utf-8")

        self.assertNotIn("--allow-unauthenticated", source)
        self.assertNotIn("manual-local", source)
        self.assertIn("audit_cloud_run_iam.py", source)
        self.assertIn("deploy_cloud_run.py", source)


if __name__ == "__main__":
    unittest.main()
