from __future__ import annotations

from datetime import UTC, datetime

import pytest

from studio_loop.models import TaskCollection


@pytest.fixture
def now() -> datetime:
    return datetime(2026, 7, 12, 10, 0, tzinfo=UTC)


@pytest.fixture
def task_payload() -> dict[str, object]:
    return {
        "id": "T001",
        "phase": "foundation",
        "title": "Create model",
        "description": "Create the typed model.",
        "dependencies": [],
        "requirement_ids": ["FR-001"],
        "allowed_read_paths": ["tools/studio_loop"],
        "allowed_write_paths": ["tools/studio_loop/src/studio_loop/models.py"],
        "writes": True,
        "validation_profile": "python",
        "completion_criteria": ["model validates"],
        "tests": ["pytest tests/test_models.py"],
        "status": "pending",
    }


@pytest.fixture
def collection(task_payload: dict[str, object]) -> TaskCollection:
    second = dict(task_payload)
    second.update(
        {
            "id": "T002",
            "title": "Render tasks",
            "description": "Render canonical tasks.",
            "dependencies": ["T001"],
            "allowed_write_paths": [],
            "writes": False,
        }
    )
    return TaskCollection.model_validate(
        {
            "schema_version": "1.0.0",
            "feature_id": "007-autonomous-loop",
            "requirements": ["FR-001"],
            "tasks": [task_payload, second],
        }
    )
