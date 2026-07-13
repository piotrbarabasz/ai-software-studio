from __future__ import annotations

import pytest
from pydantic import ValidationError

from studio_loop.models import (
    FailurePackage,
    FeatureMetadata,
    ReviewResult,
    TaskCollection,
    TaskPackage,
    ValidationResult,
)


def test_models_accept_valid_boundaries(collection: TaskCollection) -> None:
    feature = FeatureMetadata(feature_id="007-autonomous-loop", title="Loop")
    package = TaskPackage(feature=feature, tasks=collection)
    assert package.tasks.tasks[0].id == "T001"
    assert ValidationResult(task_id="T001", profile_id="python", passed=True, summary="ok").passed
    assert ReviewResult(task_id="T001", decision="accept", summary="ok").decision == "accept"
    assert (
        FailurePackage(
            feature_id="007-autonomous-loop", failure_class="state", summary="blocked"
        ).task_id
        is None
    )


@pytest.mark.parametrize(
    "payload",
    [
        {"schema_version": "2.0.0", "feature_id": "007-autonomous-loop", "title": "x"},
        {"schema_version": "1.0.0", "feature_id": "bad id", "title": "x"},
        {
            "schema_version": "1.0.0",
            "feature_id": "007-autonomous-loop",
            "title": "x",
            "extra": True,
        },
    ],
)
def test_feature_model_rejects_unknown_versions_ids_and_fields(payload: dict[str, object]) -> None:
    with pytest.raises(ValidationError):
        FeatureMetadata.model_validate(payload)


def test_task_collection_rejects_duplicate_tasks_and_unknown_status(
    task_payload: dict[str, object],
) -> None:
    duplicate = dict(task_payload)
    payload = {
        "schema_version": "1.1.0",
        "feature_id": "007-autonomous-loop",
        "requirements": ["FR-001"],
        "tasks": [task_payload, duplicate],
    }
    with pytest.raises(ValidationError, match="unique"):
        TaskCollection.model_validate(payload)
    task_payload["status"] = "ready"
    with pytest.raises(ValidationError):
        TaskCollection.model_validate({**payload, "tasks": [task_payload]})


def test_task_collection_rejects_more_than_one_active_task(
    task_payload: dict[str, object],
) -> None:
    second = dict(task_payload)
    second["id"] = "T002"
    task_payload["status"] = "in_progress"
    second["status"] = "in_progress"
    payload = {
        "schema_version": "1.1.0",
        "feature_id": "007-autonomous-loop",
        "requirements": ["FR-001"],
        "tasks": [task_payload, second],
    }
    with pytest.raises(ValidationError, match="at most one"):
        TaskCollection.model_validate(payload)


def test_legacy_validation_profile_is_normalized_to_canonical_v11(
    task_payload: dict[str, object],
) -> None:
    task_payload.pop("validation_profiles")
    task_payload["validation_profile"] = "python"
    collection = TaskCollection.model_validate(
        {
            "schema_version": "1.0.0",
            "feature_id": "007-autonomous-loop",
            "requirements": ["FR-001"],
            "tasks": [task_payload],
        }
    )
    assert collection.schema_version == "1.1.0"
    assert collection.tasks[0].validation_profiles == ("python",)
    assert "validation_profile" not in collection.model_dump(mode="json")["tasks"][0]


@pytest.mark.parametrize("profiles", [[], ["python", "python"]])
def test_task_collection_rejects_empty_or_duplicate_validation_profiles(
    task_payload: dict[str, object], profiles: list[str]
) -> None:
    task_payload["validation_profiles"] = profiles
    with pytest.raises(ValidationError, match="validation_profiles|validation profiles"):
        TaskCollection.model_validate(
            {
                "schema_version": "1.1.0",
                "feature_id": "007-autonomous-loop",
                "requirements": ["FR-001"],
                "tasks": [task_payload],
            }
        )


def test_task_collection_rejects_legacy_and_canonical_profiles_together(
    task_payload: dict[str, object],
) -> None:
    task_payload["validation_profile"] = "python"
    with pytest.raises(ValidationError, match="cannot both"):
        TaskCollection.model_validate(
            {
                "schema_version": "1.1.0",
                "feature_id": "007-autonomous-loop",
                "requirements": ["FR-001"],
                "tasks": [task_payload],
            }
        )


def test_validation_profile_order_is_stable(task_payload: dict[str, object]) -> None:
    task_payload["validation_profiles"] = ["frontend-tests", "frontend-lint", "frontend-build"]
    collection = TaskCollection.model_validate(
        {
            "schema_version": "1.1.0",
            "feature_id": "007-autonomous-loop",
            "requirements": ["FR-001"],
            "tasks": [task_payload],
        }
    )
    assert collection.tasks[0].validation_profiles == (
        "frontend-tests",
        "frontend-lint",
        "frontend-build",
    )


@pytest.mark.parametrize("unsafe", ["../outside", "..\\outside", "C:/outside", "safe\\file.py"])
def test_task_paths_require_canonical_relative_posix_form(
    task_payload: dict[str, object], unsafe: str
) -> None:
    task_payload["allowed_write_paths"] = [unsafe]
    with pytest.raises(ValidationError, match="repository-relative POSIX"):
        TaskCollection.model_validate(
            {
                "schema_version": "1.1.0",
                "feature_id": "007-autonomous-loop",
                "requirements": ["FR-001"],
                "tasks": [task_payload],
            }
        )
