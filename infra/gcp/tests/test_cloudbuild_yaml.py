from __future__ import annotations

import copy
import re
import sys
import unittest
from pathlib import Path

import yaml

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
GCP_ROOT = REPOSITORY_ROOT / "infra" / "gcp"
SCRIPT_ROOT = REPOSITORY_ROOT / "scripts" / "gcp"
sys.path.insert(0, str(SCRIPT_ROOT))

from deployment_contract import Contract, load_contract, validate_values  # noqa: E402

CONFIG_NAMES = (
    "cloudbuild.deploy.yaml",
    "cloudbuild.backend.yaml",
    "cloudbuild.frontend.yaml",
    "cloudbuild.pr-checks.yaml",
)
SUBSTITUTION_PATTERN = re.compile(
    r"\$(?:\{(?P<braced>_?[A-Z][A-Z0-9_]*)\}|(?P<plain>_?[A-Z][A-Z0-9_]*))"
)
ARTIFACT_IMAGE_PATTERN = re.compile(
    r"^[a-z][a-z0-9-]*-docker\.pkg\.dev/"
    r"[a-z][a-z0-9-]{4,28}[a-z0-9]/"
    r"[a-z][a-z0-9-]{0,62}/[a-z][a-z0-9-]{0,127}:"
    r"[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$"
)
SECRET_VERSION_PATTERN = re.compile(
    r"^projects/[a-z][a-z0-9-]{4,28}[a-z0-9]/"
    r"secrets/[A-Za-z0-9_-]{1,255}/versions/(?:latest|[1-9][0-9]*)$"
)
FRONTEND_CHECK_IMAGE = (
    "cypress/browsers:node-20.11.1-chrome-123.0.6312.58-1-ff-124.0-"
    "edge-122.0.2365.92-1@sha256:"
    "a73fe736a24ad0ba8913c7e4138a1331eb1d361ad5d63976d05a337129639c7e"
)
LEGACY_FRONTEND_CHECK_IMAGE = "cypress/browsers:node20.11.1-chrome120-ff121"
FRONTEND_CHECK_STEPS = {
    "cloudbuild.deploy.yaml": "frontend-checks",
    "cloudbuild.frontend.yaml": "manual-frontend-checks",
    "cloudbuild.pr-checks.yaml": "frontend-checks",
}


def load_config(name: str) -> dict[str, object]:
    with (GCP_ROOT / name).open(encoding="utf-8") as config_file:
        parsed = yaml.safe_load(config_file)
    if not isinstance(parsed, dict):
        raise AssertionError(f"{name} did not parse to a mapping")
    return parsed


def resolve_value(value: str, substitutions: dict[str, str]) -> str:
    def replace(match: re.Match[str]) -> str:
        key = match.group("braced") or match.group("plain")
        return substitutions.get(key, match.group(0))

    return SUBSTITUTION_PATTERN.sub(replace, value)


def resolved_substitutions(config: dict[str, object]) -> dict[str, str]:
    defaults = config.get("substitutions", {})
    if not isinstance(defaults, dict):
        raise AssertionError("substitutions must be a mapping")
    return {
        **{str(key): str(value) for key, value in defaults.items()},
        "SHORT_SHA": "deadbee",
        "PROJECT_ID": "ai-software-studio-501918",
        "BUILD_ID": "00000000-0000-0000-0000-000000000000",
        "COMMIT_SHA": "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    }


def assert_safe_image(test: unittest.TestCase, image: str) -> None:
    test.assertNotRegex(image, r"[<>$]")
    test.assertRegex(image, ARTIFACT_IMAGE_PATTERN)
    tag = image.rsplit(":", 1)[-1]
    test.assertNotEqual(tag, "")
    test.assertNotIn(tag, {"manual-local", "latest"})


def assert_safe_secret_version(test: unittest.TestCase, version_name: str) -> None:
    test.assertNotRegex(version_name, r"[<>$]")
    test.assertRegex(version_name, SECRET_VERSION_PATTERN)


def render_images(config: dict[str, object]) -> list[str]:
    substitutions = resolved_substitutions(config)
    images = config.get("images", [])
    if not isinstance(images, list):
        raise AssertionError("images must be an array")
    return [resolve_value(str(image), substitutions) for image in images]


def assert_pinned_frontend_check_image(test: unittest.TestCase, image: str) -> None:
    test.assertEqual(image, FRONTEND_CHECK_IMAGE)
    match = re.fullmatch(r"cypress/browsers:[^@]+@sha256:([0-9a-f]{64})", image)
    test.assertIsNotNone(match)


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
        self.assertIn("DEPLOY_IMAGE_TAG=$SHORT_SHA", environment)

    def test_all_frontend_check_steps_use_the_exact_pinned_browser_image(self) -> None:
        for config_name, step_id in FRONTEND_CHECK_STEPS.items():
            with self.subTest(config=config_name, step=step_id):
                config = load_config(config_name)
                matching_steps = [
                    step for step in config["steps"] if step.get("id") == step_id
                ]
                self.assertEqual(len(matching_steps), 1)
                assert_pinned_frontend_check_image(
                    self, str(matching_steps[0].get("name", ""))
                )
                command = " ".join(
                    str(argument) for argument in matching_steps[0]["args"]
                )
                self.assertIn("--karma-config=karma.ci.conf.cjs", command)
                self.assertIn("--browsers=ChromeHeadlessCI", command)

    def test_legacy_missing_browser_manifest_reference_is_rejected(self) -> None:
        with self.assertRaises(AssertionError):
            assert_pinned_frontend_check_image(self, LEGACY_FRONTEND_CHECK_IMAGE)

    def test_parse_time_image_and_secret_fields_are_syntactically_safe(self) -> None:
        for name in CONFIG_NAMES:
            with self.subTest(name=name):
                config = load_config(name)
                for image in render_images(config):
                    assert_safe_image(self, image)

                substitutions = resolved_substitutions(config)
                available_secrets = config.get("availableSecrets", {})
                secret_manager = available_secrets.get("secretManager", [])
                for secret in secret_manager:
                    version_name = resolve_value(
                        str(secret["versionName"]), substitutions
                    )
                    assert_safe_secret_version(self, version_name)

    def test_parse_time_validator_rejects_all_known_bad_reference_forms(self) -> None:
        image_prefix = (
            "europe-central2-docker.pkg.dev/ai-software-studio-501918/"
            "aisoftware-studio/aisoftware-studio-api:"
        )
        invalid_images = (
            f"{image_prefix}<REQUIRED_COMMIT_SHA>",
            f"{image_prefix}$UNRESOLVED",
            image_prefix,
            f"{image_prefix}manual-local",
            f"{image_prefix}latest",
        )
        for image in invalid_images:
            with self.subTest(image=image):
                with self.assertRaises(AssertionError):
                    assert_safe_image(self, image)

        secret_prefix = "projects/ai-software-studio-501918/secrets/"
        for version_name in (
            f"{secret_prefix}<REQUIRED_SECRET>/versions/latest",
            f"{secret_prefix}$UNRESOLVED/versions/latest",
            f"{secret_prefix}/versions/latest",
        ):
            with self.subTest(version_name=version_name):
                with self.assertRaises(AssertionError):
                    assert_safe_secret_version(self, version_name)

    def test_production_uses_only_builtin_short_sha_for_image_tags(self) -> None:
        config = load_config("cloudbuild.deploy.yaml")
        source = (GCP_ROOT / "cloudbuild.deploy.yaml").read_text(encoding="utf-8")

        self.assertNotIn("_IMAGE_TAG", config["substitutions"])
        self.assertNotIn("$_IMAGE_TAG", source)
        self.assertIn("$SHORT_SHA", source)
        for image in render_images(config):
            self.assertEqual(image.rsplit(":", 1)[-1], "deadbee")

    def test_production_defaults_match_repository_contract_invariants(self) -> None:
        config = load_config("cloudbuild.deploy.yaml")
        contract = load_contract()
        substitutions = config["substitutions"]

        for field, expected in contract.invariants.items():
            if field == "CORS_ALLOWED_ORIGINS":
                continue
            with self.subTest(field=field):
                self.assertEqual(substitutions[f"_{field}"], expected)

    def test_manual_image_tag_sentinel_is_parse_safe_but_contract_invalid(self) -> None:
        contract = load_contract()
        image_only_contract = Contract(
            schema_version=contract.schema_version,
            invariants=contract.invariants,
            secret_reference_fields=contract.secret_reference_fields,
            scopes={**contract.scopes, "image-only": ("IMAGE_TAG",)},
        )

        for name in ("cloudbuild.backend.yaml", "cloudbuild.frontend.yaml"):
            with self.subTest(name=name):
                config = load_config(name)
                self.assertEqual(
                    config["substitutions"]["_IMAGE_TAG"], "required-commit-sha"
                )
                for image in render_images(config):
                    assert_safe_image(self, image)
                errors = validate_values(
                    {"IMAGE_TAG": "required-commit-sha"},
                    image_only_contract,
                    "image-only",
                )
                self.assertTrue(any(error.startswith("IMAGE_TAG:") for error in errors))

    def test_required_commit_sha_angle_placeholder_reproduces_parse_time_failure(
        self,
    ) -> None:
        config = copy.deepcopy(load_config("cloudbuild.deploy.yaml"))
        config["substitutions"]["_IMAGE_TAG"] = "<REQUIRED_COMMIT_SHA>"
        config["images"] = [
            image.replace("$SHORT_SHA", "$_IMAGE_TAG") for image in config["images"]
        ]

        rendered = render_images(config)
        self.assertIn("<REQUIRED_COMMIT_SHA>", rendered[0])
        with self.assertRaises(AssertionError):
            assert_safe_image(self, rendered[0])

    def test_both_images_and_backend_smoke_precede_first_deploy(self) -> None:
        config = load_config("cloudbuild.deploy.yaml")
        steps = {step["id"]: step for step in config["steps"]}

        def ancestors(step_id: str) -> set[str]:
            direct = set(steps[step_id].get("waitFor", [])) - {"-"}
            indirect = {
                ancestor for dependency in direct for ancestor in ancestors(dependency)
            }
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
