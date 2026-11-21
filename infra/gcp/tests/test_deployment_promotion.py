"""Require a Ready revision with the exact current Angular image for promotion."""

from __future__ import annotations

import subprocess
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

SCRIPT_ROOT = Path(__file__).resolve().parents[3] / "scripts" / "gcp"
sys.path.insert(0, str(SCRIPT_ROOT))

import promote_angular_cloud_run as promotion  # noqa: E402

IMAGE = (
    "europe-central2-docker.pkg.dev/ai-software-studio-501918/"
    "aisoftware-studio/aisoftware-studio-web:0814108"
)
ANGULAR = "aisoftware-studio-web-00064-vec"
PREVIEW = "aisoftware-studio-web-00063-v3x"
OLD = "aisoftware-studio-web-00062-gaj"


def service(
    *,
    created: str | None = ANGULAR,
    ready: str = PREVIEW,
    active: str = OLD,
    preview: str | None = PREVIEW,
    preview_percent: int = 0,
) -> dict:
    traffic = [{"revisionName": active, "percent": 100}]
    if preview:
        traffic.append(
            {
                "revisionName": preview,
                "tag": "v3-review",
                "percent": preview_percent,
            }
        )
    status = {"latestReadyRevisionName": ready, "traffic": traffic}
    if created is not None:
        status["latestCreatedRevisionName"] = created
    return {"metadata": {"name": promotion.SERVICE}, "status": status}


def revision(
    *,
    name: str = ANGULAR,
    image: str = IMAGE,
    is_ready: bool = True,
) -> dict:
    return {
        "metadata": {
            "name": name,
            "annotations": {"client.knative.dev/user-image": image},
            "labels": {"serving.knative.dev/service": promotion.SERVICE},
        },
        "spec": {"containers": [{"image": "sample@sha256:abc"}]},
        "status": {
            "conditions": [
                {"type": "Ready", "status": "True" if is_ready else "False"}
            ]
        },
    }


def target(
    svc: dict | None = None,
    rev: dict | None = None,
    listing: list[dict] | None = None,
) -> tuple[str, str | None]:
    return promotion.deployment_target(
        svc if svc is not None else service(),
        IMAGE,
        lambda _: rev if rev is not None else revision(),
        lambda: listing if listing is not None else [revision()],
    )


class ProductionPromotionTest(unittest.TestCase):
    def test_accepts_new_ready_angular_despite_stale_latest_ready(self) -> None:
        selected, preview = target()
        self.assertEqual(selected, ANGULAR)
        self.assertEqual(preview, PREVIEW)

    def test_resolves_missing_latest_created_using_unique_image(self) -> None:
        selected, _ = target(
            service(created=None), listing=[revision(), revision(name=OLD, image="other")]
        )
        self.assertEqual(selected, ANGULAR)

    def test_rejects_ambiguous_missing_latest_created(self) -> None:
        with self.assertRaisesRegex(promotion.TrafficError, "matching revision count: 2"):
            target(
                service(created=None),
                listing=[revision(), revision(name=OLD)],
            )

    def test_rejects_missing_image_match(self) -> None:
        with self.assertRaisesRegex(promotion.TrafficError, "does not use"):
            target(rev=revision(image="other"))

    def test_rejects_revision_not_ready(self) -> None:
        with self.assertRaisesRegex(promotion.TrafficError, "not Ready"):
            target(rev=revision(is_ready=False))

    def test_rejects_revision_identity_mismatch(self) -> None:
        with self.assertRaisesRegex(promotion.TrafficError, "identity mismatch"):
            target(rev=revision(name=OLD))

    def test_rejects_preview_promotion(self) -> None:
        with self.assertRaisesRegex(promotion.TrafficError, "points to V3 preview"):
            target(svc=service(created=PREVIEW))

    def test_rejects_preview_nonzero_traffic(self) -> None:
        with self.assertRaisesRegex(promotion.TrafficError, "0% traffic"):
            target(svc=service(preview_percent=1))

    def test_rejects_traffic_not_totalling_hundred(self) -> None:
        svc = service()
        svc["status"]["traffic"][0]["percent"] = 99
        with self.assertRaisesRegex(promotion.TrafficError, "total 100"):
            target(svc=svc)

    def test_rejects_wrong_image_contract(self) -> None:
        with self.assertRaisesRegex(promotion.TrafficError, "deployment contract"):
            promotion.deployment_target(
                service(),
                "us-east1-docker.pkg.dev/another/repo:tag",
                lambda _: revision(),
                lambda: [revision()],
            )

    def test_verifies_promoted_angular_and_stable_preview(self) -> None:
        promotion.verify_promoted(service(active=ANGULAR), ANGULAR, PREVIEW)

    def test_rejects_changed_preview_after_update(self) -> None:
        with self.assertRaisesRegex(promotion.TrafficError, "preview"):
            promotion.verify_promoted(
                service(active=ANGULAR, preview=OLD), ANGULAR, PREVIEW
            )

    def test_rejects_unpromoted_angular(self) -> None:
        with self.assertRaisesRegex(promotion.TrafficError, "not serving 100%"):
            promotion.verify_promoted(service(), ANGULAR, PREVIEW)

    def test_rejects_new_revision_racing_deploy(self) -> None:
        with self.assertRaisesRegex(promotion.TrafficError, "Another deployment"):
            promotion.verify_promoted(
                service(active=ANGULAR, created=OLD), ANGULAR, PREVIEW
            )

    def test_exact_image_and_tag_used_by_promote(self) -> None:
        before = service()
        after = service(active=ANGULAR)
        calls = []

        def fake_service(*_: str) -> dict:
            return before if not calls else after

        with (
            patch.object(promotion, "_describe_service", side_effect=fake_service),
            patch.object(promotion, "_describe_revision", return_value=revision()),
            patch.object(promotion.subprocess, "run") as command,
        ):
            command.return_value = subprocess.CompletedProcess([], 0, "", "")
            promotion.promote(
                promotion.PROJECT, promotion.REGION, promotion.SERVICE, IMAGE
            )
            calls.append("promoted")
        command.assert_called_once()
        args = command.call_args.args[0]
        self.assertIn(f"--to-revisions={ANGULAR}=100", args)
        self.assertIn(f"--update-tags=v3-review={PREVIEW}", args)
        self.assertNotIn("--to-latest", args)

    def test_no_writes_outside_approved_service(self) -> None:
        with patch.object(promotion.subprocess, "run") as run:
            with self.assertRaisesRegex(promotion.TrafficError, "approved Protolume"):
                promotion.promote("other", promotion.REGION, promotion.SERVICE, IMAGE)
            run.assert_not_called()


if __name__ == "__main__":
    unittest.main()
