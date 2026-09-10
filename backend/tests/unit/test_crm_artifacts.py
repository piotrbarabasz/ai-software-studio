import hashlib
import json
import subprocess
import sys
from datetime import date, timedelta
from pathlib import Path

import pytest
from app.crm.artifacts import CrmArtifact, publication_issues


def package(tmp_path, **changes):
    # These bytes and declarations test the gate ONLY; they are not real artifacts.
    files = []
    for kind, name, data in (
        ("trace", "trace.json", b'{"fixture": true}'),
        ("screenshot", "screen.png", b"test-only-non-image"),
    ):
        (tmp_path / name).write_bytes(data)
        files.append({"kind": kind, "path": name, "sha256": hashlib.sha256(data).hexdigest()})
    data = {
        "schema_version": 1,
        "origin": "sandbox-run",
        "channel": "email",
        "data_origin": "synthetic",
        "executed_on": date.today().isoformat(),
        "target_reference": "fixture-target",
        "event_reference": "fixture-event",
        "record_reference": "fixture-record",
        "scope": "Gate test only",
        "limitations": "Not a real CRM write or media-validation test",
        "review_reference": "fixture-review",
        "approval_verified": True,
        "duplicate_verified": True,
        "missing_field_verified": True,
        "fields_match_verified": True,
        "privacy_and_rights_reviewed": True,
        "files": files,
        **changes,
    }
    return CrmArtifact.model_validate_json(json.dumps(data))


def test_gate_checks_declared_metadata_and_file_integrity_not_truth(tmp_path):
    assert publication_issues(package(tmp_path), tmp_path) == ()


@pytest.mark.parametrize(
    "changes,expected",
    [
        ({"origin": "fixture"}, "test_fixture_is_not_execution_evidence"),
        ({"data_origin": "customer"}, "public_sandbox_example_requires_synthetic_data"),
        ({"review_reference": None}, "review_reference_missing"),
        ({"approval_verified": False}, "approval_verified_missing"),
        ({"duplicate_verified": False}, "duplicate_verified_missing"),
        ({"missing_field_verified": False}, "missing_field_verified_missing"),
        ({"fields_match_verified": False}, "fields_match_verified_missing"),
        ({"privacy_and_rights_reviewed": False}, "privacy_and_rights_reviewed_missing"),
        ({"channel": "whatsapp"}, "official_channel_verification_missing"),
    ],
)
def test_incomplete_or_fixture_evidence_is_not_eligible(tmp_path, changes, expected):
    assert expected in publication_issues(package(tmp_path, **changes), tmp_path)


def test_future_date_is_not_execution_evidence(tmp_path):
    artifact = package(tmp_path, executed_on=(date.today() + timedelta(days=1)).isoformat())
    assert "execution_date_is_in_the_future" in publication_issues(artifact, tmp_path)


@pytest.mark.parametrize(
    "path", ["../outside.png", "C:/outside.png", "https://remote/a.png", "a\\b.png"]
)
def test_gate_does_not_follow_remote_or_escaping_paths(tmp_path, path):
    artifact = package(tmp_path)
    bad = artifact.files[0].model_copy(update={"path": path})
    artifact = artifact.model_copy(update={"files": (bad, artifact.files[1])})
    assert "invalid_artifact_path" in publication_issues(artifact, tmp_path)


def test_missing_altered_duplicate_and_incomplete_artifacts_fail(tmp_path):
    artifact = package(tmp_path)
    (tmp_path / "screen.png").write_bytes(b"changed")
    assert "artifact_empty_or_hash_mismatch" in publication_issues(artifact, tmp_path)
    (tmp_path / "screen.png").unlink()
    assert "artifact_file_unavailable" in publication_issues(artifact, tmp_path)
    duplicate = artifact.model_copy(update={"files": (artifact.files[0], artifact.files[0])})
    issues = publication_issues(duplicate, tmp_path)
    assert "outside_or_duplicate_artifact_path" in issues
    assert "trace_and_visual_artifact_required" in issues


def test_cli_rejects_bad_manifest_without_echoing_private_data(tmp_path):
    manifest = tmp_path / "manifest.json"
    manifest.write_text('{"private": "do-not-print-this"}', encoding="utf-8")
    script = Path(__file__).resolve().parents[2] / "scripts/validate_crm_artifact.py"
    result = subprocess.run(
        [sys.executable, str(script), str(manifest)], capture_output=True, text=True
    )
    assert result.returncode == 1
    assert "invalid_or_unavailable_manifest" in result.stdout
    assert "do-not-print-this" not in result.stdout + result.stderr
