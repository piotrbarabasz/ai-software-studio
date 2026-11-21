"""Production V3 promotion requires immutable artifact/revision digest match."""

from __future__ import annotations

import subprocess
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts" / "gcp"))
import promote_v3_cloud_run as v3  # noqa: E402

IMAGE = (
    "europe-central2-docker.pkg.dev/ai-software-studio-501918/"
    "aisoftware-studio/aisoftware-studio-web:e9e9c48"
)
DIGEST = "sha256:" + "1" * 64
OTHER_DIGEST = "sha256:" + "2" * 64
TARGET = "aisoftware-studio-web-00070-gns"
PREVIEW = "aisoftware-studio-web-00069-v3a"
OLD = "aisoftware-studio-web-00068-abc"


def service(
    created: str | None = TARGET,
    active: str = OLD,
    preview: str | None = PREVIEW,
    preview_percent: int = 0,
) -> dict:
    traffic = [{"revisionName": active, "percent": 100}]
    if preview:
        traffic.append(
            {"revisionName": preview, "tag": "v3-review", "percent": preview_percent}
        )
    status = {"latestReadyRevisionName": OLD, "traffic": traffic}
    if created is not None:
        status["latestCreatedRevisionName"] = created
    return {"metadata": {"name": v3.SERVICE}, "status": status}


def revision(
    name: str = TARGET,
    *,
    status_digest: str | None = DIGEST,
    spec_image: str = IMAGE,
    ready: bool = True,
) -> dict:
    status = {"conditions": [{"type": "Ready", "status": "True" if ready else "False"}]}
    if status_digest is not None:
        status["imageDigest"] = status_digest
    return {
        "metadata": {
            "name": name,
            "labels": {"serving.knative.dev/service": v3.SERVICE},
            # A legacy annotation may be absent, pointing at a tag, or stale.
            "annotations": {"client.knative.dev/user-image": "not-a-match"},
        },
        "spec": {"containers": [{"image": spec_image}]},
        "status": status,
    }


def target(svc: dict | None = None, rev: dict | None = None) -> tuple[str, str | None]:
    return v3.deployment_target(
        svc if svc is not None else service(),
        IMAGE,
        DIGEST,
        lambda _: rev if rev is not None else revision(),
        lambda: [revision()],
    )


class PromoteV3DigestTests(unittest.TestCase):
    def test_selects_new_ready_revision_by_digest_when_annotation_is_unset(
        self,
    ) -> None:
        self.assertEqual(target(), (TARGET, PREVIEW))

    def test_supports_full_image_uri_in_revision_status(self) -> None:
        rev = revision(
            status_digest=IMAGE.rsplit(":", 1)[0] + "@" + DIGEST,
        )
        self.assertEqual(target(rev=rev), (TARGET, PREVIEW))

    def test_supports_revision_digest_qualified_container_image(self) -> None:
        rev = revision(
            status_digest=None, spec_image=IMAGE.rsplit(":", 1)[0] + "@" + DIGEST
        )
        self.assertEqual(target(rev=rev), (TARGET, PREVIEW))

    def test_rejects_tag_only_revision_without_verified_digest(self) -> None:
        with self.assertRaisesRegex(v3.TrafficError, "digest does not match"):
            target(rev=revision(status_digest=None, spec_image=IMAGE))

    def test_rejects_wrong_digest_even_when_tag_looks_correct(self) -> None:
        with self.assertRaisesRegex(v3.TrafficError, "digest does not match"):
            target(rev=revision(status_digest=OTHER_DIGEST))

    def test_rejects_non_ready_revision_and_preview_traffic(self) -> None:
        with self.assertRaisesRegex(v3.TrafficError, "not Ready"):
            target(rev=revision(ready=False))
        with self.assertRaisesRegex(v3.TrafficError, "0% traffic"):
            target(svc=service(preview_percent=1))

    def test_rejects_attempt_to_promote_preview_revision(self) -> None:
        with self.assertRaisesRegex(v3.TrafficError, "tagged V3 preview"):
            target(svc=service(created=PREVIEW))

    def test_rejects_invalid_image_or_digest(self) -> None:
        with self.assertRaisesRegex(v3.TrafficError, "deployment contract"):
            v3.deployment_target(
                service(),
                "untrusted/repo:latest",
                DIGEST,
                lambda _: revision(),
                lambda: [],
            )
        with self.assertRaisesRegex(v3.TrafficError, "deployment contract"):
            v3.deployment_target(
                service(), IMAGE, "no-digest", lambda _: revision(), lambda: []
            )

    def test_missing_latest_created_requires_unique_digest_match(self) -> None:
        selected, preview = v3.deployment_target(
            service(created=None),
            IMAGE,
            DIGEST,
            lambda _: revision(),
            lambda: [revision(), revision(name=OLD, status_digest=OTHER_DIGEST)],
        )
        self.assertEqual((selected, preview), (TARGET, PREVIEW))
        with self.assertRaisesRegex(v3.TrafficError, "matching revision count: 2"):
            v3.deployment_target(
                service(created=None),
                IMAGE,
                DIGEST,
                lambda _: revision(),
                lambda: [revision(), revision(name=OLD)],
            )

    def test_resolves_registry_digest_from_tag_without_guessing(self) -> None:
        with patch.object(
            v3, "_json_command", return_value={"image_summary": {"digest": DIGEST}}
        ) as request:
            self.assertEqual(v3._artifact_digest(IMAGE), DIGEST)
        command = request.call_args.args[0]
        self.assertIn("artifacts", command)
        self.assertIn("describe", command)
        self.assertIn(IMAGE, command)
        self.assertIn(f"--project={v3.PROJECT}", command)

    def test_registry_missing_digest_fails_closed(self) -> None:
        with patch.object(v3, "_json_command", return_value={"image_summary": {}}):
            with self.assertRaisesRegex(v3.TrafficError, "valid image digest"):
                v3._artifact_digest(IMAGE)

    def test_promotes_only_verified_v3_and_preserves_noindex_preview_tag(self) -> None:
        before = service()
        after = service(active=TARGET)

        def service_snapshot(*_: str) -> dict:
            return before if command.call_count == 0 else after

        with (
            patch.object(v3, "_artifact_digest", return_value=DIGEST),
            patch.object(v3, "_describe_service", side_effect=service_snapshot),
            patch.object(v3, "_describe_revision", return_value=revision()),
            patch.object(v3.subprocess, "run") as command,
        ):
            command.return_value = subprocess.CompletedProcess([], 0, "", "")
            v3.promote(v3.PROJECT, v3.REGION, v3.SERVICE, IMAGE)
        command.assert_called_once()
        args = command.call_args.args[0]
        self.assertIn(f"--to-revisions={TARGET}=100", args)
        self.assertIn(f"--update-tags=v3-review={PREVIEW}", args)
        self.assertNotIn("--to-latest", args)

    def test_rejects_wrong_project_before_registry_or_traffic_calls(self) -> None:
        with (
            patch.object(v3, "_artifact_digest") as fetch,
            patch.object(v3.subprocess, "run") as call,
        ):
            with self.assertRaisesRegex(v3.TrafficError, "approved Protolume"):
                v3.promote("other-project", v3.REGION, v3.SERVICE, IMAGE)
            fetch.assert_not_called()
            call.assert_not_called()

    def test_refuses_traffic_writes_after_revision_digest_mismatch(self) -> None:
        with (
            patch.object(v3, "_artifact_digest", return_value=DIGEST),
            patch.object(v3, "_describe_service", return_value=service()),
            patch.object(
                v3,
                "_describe_revision",
                return_value=revision(status_digest=OTHER_DIGEST),
            ),
            patch.object(v3.subprocess, "run") as command,
        ):
            with self.assertRaisesRegex(v3.TrafficError, "digest does not match"):
                v3.promote(v3.PROJECT, v3.REGION, v3.SERVICE, IMAGE)
            command.assert_not_called()

    def test_rejects_change_to_preview_after_promotion(self) -> None:
        with self.assertRaisesRegex(v3.TrafficError, "preview"):
            v3.verify_promoted(service(active=TARGET, preview=OLD), TARGET, PREVIEW)


if __name__ == "__main__":
    unittest.main()
