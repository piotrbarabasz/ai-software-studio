"""Unit tests for Cloud Run preview traffic isolation."""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from v3_cloudrun_preview_guard import active_traffic, check_before, check_after  # noqa: E402


def service(traffic, latest=None):
    return {
        "metadata": {"name": "aisoftware-studio-web"},
        "status": {
            "traffic": traffic,
            "latestCreatedRevisionName": latest or "aisoftware-studio-web-00050-gtf",
        },
    }


class PreviewGuardTests(unittest.TestCase):
    def setUp(self):
        self.live = {"revisionName": "aisoftware-studio-web-00050-gtf", "percent": 100}

    def test_before_requires_full_live_traffic(self):
        self.assertEqual(check_before(service([self.live])), [(self.live["revisionName"], 100)])
        with self.assertRaisesRegex(ValueError, "100%"):
            check_before(service([{"revisionName": "r", "percent": 90}]))
        with self.assertRaisesRegex(ValueError, "100%"):
            check_before(service([]))

    def test_tagged_zero_percent_preview_does_not_change_live_traffic(self):
        preview = {
            "revisionName": "aisoftware-studio-web-00051-preview",
            "percent": 0,
            "tag": "v3-review",
            "url": "https://v3-review---aisoftware-studio-web-xxxx.run.app",
        }
        state = service([self.live, preview], latest=preview["revisionName"])
        self.assertEqual(active_traffic(state), [(self.live["revisionName"], 100)])
        self.assertEqual(check_after(state, [(self.live["revisionName"], 100)]), preview["url"])

    def test_omitted_percent_on_tagged_revision_means_zero(self):
        # Cloud Run serializes the default zero as an omitted JSON field.
        preview = {
            "revisionName": "aisoftware-studio-web-00051-preview",
            "tag": "v3-review",
            "url": "https://v3-review---aisoftware-studio-web-xxxx.run.app",
        }
        state = service([self.live, preview], latest=preview["revisionName"])
        baseline = [(self.live["revisionName"], 100)]
        self.assertEqual(active_traffic(state), baseline)
        self.assertEqual(check_after(state, baseline), preview["url"])

    def test_positive_percent_on_preview_tag_is_rejected(self):
        preview = {
            "revisionName": "aisoftware-studio-web-00051-preview",
            "tag": "v3-review",
            "percent": 1,
        }
        state = service([
            {"revisionName": self.live["revisionName"], "percent": 99},
            preview,
        ], latest=preview["revisionName"])
        with self.assertRaisesRegex(ValueError, "Production traffic changed"):
            check_after(state, [(self.live["revisionName"], 100)])

    def test_missing_tag_reports_observed_status(self):
        state = service([self.live])
        with self.assertRaisesRegex(ValueError, "found 0 matching entries"):
            check_after(state, [(self.live["revisionName"], 100)])

    def test_tag_with_live_traffic_fails_closed(self):
        changed = service([{"revisionName": "r", "percent": 99},
                           {"revisionName": "p", "percent": 1, "tag": "v3-review"}])
        with self.assertRaisesRegex(ValueError, "already serving production"):
            check_before(changed)

    def test_after_detects_live_traffic_mutation(self):
        state = service([
            {"revisionName": "unexpected", "percent": 100},
            {"revisionName": "preview", "percent": 0, "tag": "v3-review"},
        ], latest="preview")
        with self.assertRaisesRegex(ValueError, "Production traffic changed"):
            check_after(state, [(self.live["revisionName"], 100)])

    def test_after_requires_new_tag_with_exactly_zero_percent(self):
        state = service([self.live])
        with self.assertRaisesRegex(ValueError, "exactly one tag"):
            check_after(state, [(self.live["revisionName"], 100)])
        state["status"]["traffic"].append({
            "revisionName": "preview",
            "percent": 0,
            "tag": "v3-review",
        })
        with self.assertRaisesRegex(ValueError, "newly created"):
            check_after(state, [(self.live["revisionName"], 100)])


if __name__ == "__main__":
    unittest.main()
