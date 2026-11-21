"""Production Angular traffic must be promoted without moving the V3 preview tag."""

from __future__ import annotations

import subprocess
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

SCRIPT_ROOT = Path(__file__).resolve().parents[3] / "scripts" / "gcp"
sys.path.insert(0, str(SCRIPT_ROOT))

import promote_angular_cloud_run as promotion  # noqa: E402


def service(
    latest: str = "aisoftware-studio-web-00062-gaj",
    active: str = "aisoftware-studio-web-00060-old",
    preview: str | None = "aisoftware-studio-web-00061-v3x",
) -> dict:
    traffic = [{"revisionName": active, "percent": 100}]
    if preview:
        traffic.append({"revisionName": preview, "tag": "v3-review"})
    return {
        "metadata": {"name": "aisoftware-studio-web"},
        "status": {
            "latestCreatedRevisionName": latest,
            "latestReadyRevisionName": latest,
            "traffic": traffic,
        },
    }


class ProductionPromotionTest(unittest.TestCase):
    def test_production_can_be_pinned_while_preview_stays_zero(self) -> None:
        latest, preview = promotion.deployment_target(service())
        self.assertEqual(latest, "aisoftware-studio-web-00062-gaj")
        self.assertEqual(preview, "aisoftware-studio-web-00061-v3x")

    def test_cloud_run_may_omit_zero_percent_value(self) -> None:
        latest, preview = promotion.deployment_target(service())
        promoted = service(active=latest, preview=preview)
        promotion.verify_promoted(promoted, latest, preview)

    def test_missing_preview_tag_is_supported(self) -> None:
        latest, preview = promotion.deployment_target(service(preview=None))
        self.assertIsNone(preview)
        promotion.verify_promoted(service(active=latest, preview=None), latest, None)

    def test_rejects_preview_at_positive_percent(self) -> None:
        data = service()
        data["status"]["traffic"][1]["percent"] = 1
        with self.assertRaises(promotion.TrafficError):
            promotion.deployment_target(data)

    def test_rejects_tag_pointing_to_latest_angular_revision(self) -> None:
        data = service()
        data["status"]["traffic"][1]["revisionName"] = data["status"]["latestReadyRevisionName"]
        with self.assertRaises(promotion.TrafficError):
            promotion.deployment_target(data)

    def test_rejects_an_unready_latest_revision(self) -> None:
        data = service()
        data["status"]["latestReadyRevisionName"] = "aisoftware-studio-web-00060-old"
        with self.assertRaises(promotion.TrafficError):
            promotion.deployment_target(data)

    def test_rejects_traffic_not_totalling_100(self) -> None:
        data = service()
        data["status"]["traffic"][0]["percent"] = 90
        with self.assertRaises(promotion.TrafficError):
            promotion.deployment_target(data)

    def test_rejects_preview_changed_during_promotion(self) -> None:
        latest, preview = promotion.deployment_target(service())
        altered = service(active=latest, preview="aisoftware-studio-web-00059-v3z")
        with self.assertRaises(promotion.TrafficError):
            promotion.verify_promoted(altered, latest, preview)

    def test_rejects_promoted_revision_not_actually_serving(self) -> None:
        latest, preview = promotion.deployment_target(service())
        with self.assertRaises(promotion.TrafficError):
            promotion.verify_promoted(service(), latest, preview)

    def test_only_updates_expected_service_and_preserves_preview_tag(self) -> None:
        before = service()
        latest, preview = promotion.deployment_target(before)
        after = service(active=latest, preview=preview)
        calls: list[list[str]] = []

        def fake_run(command: list[str], **_: object) -> subprocess.CompletedProcess:
            calls.append(command)
            if "describe" in command:
                import json

                payload = before if len(calls) == 1 else after
                return subprocess.CompletedProcess(
                    command, 0, stdout=json.dumps(payload), stderr=""
                )
            return subprocess.CompletedProcess(command, 0, stdout="", stderr="")

        with patch.object(promotion.subprocess, "run", side_effect=fake_run):
            promotion.promote(
                "ai-software-studio-501918", "europe-central2", "aisoftware-studio-web"
            )
        self.assertEqual(len(calls), 3)
        self.assertIn(f"--to-revisions={latest}=100", calls[1])
        self.assertIn(f"--update-tags=v3-review={preview}", calls[1])
        self.assertNotIn("--to-latest", calls[1])
        self.assertNotIn("--clear-tags", calls[1])

    def test_never_updates_any_unapproved_service(self) -> None:
        with patch.object(promotion.subprocess, "run") as run:
            with self.assertRaises(promotion.TrafficError):
                promotion.promote(
                    "other-project", "europe-central2", "aisoftware-studio-web"
                )
            run.assert_not_called()


if __name__ == "__main__":
    unittest.main()
