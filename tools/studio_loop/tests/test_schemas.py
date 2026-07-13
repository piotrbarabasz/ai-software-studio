from __future__ import annotations

import json
from pathlib import Path

import pytest
from jsonschema import Draft202012Validator, ValidationError

SCHEMAS = Path(__file__).parents[3] / ".studio-loop" / "schemas"


def test_all_committed_schemas_are_draft_2020_12_valid() -> None:
    ids: set[str] = set()
    for path in sorted(SCHEMAS.glob("*.schema.json")):
        schema = json.loads(path.read_text(encoding="utf-8"))
        Draft202012Validator.check_schema(schema)
        assert schema["$id"] not in ids
        ids.add(schema["$id"])


def test_tasks_schema_rejects_extra_field_and_unknown_status(collection: object) -> None:
    schema = json.loads((SCHEMAS / "tasks.schema.json").read_text(encoding="utf-8"))
    payload = collection.model_dump(mode="json")  # type: ignore[attr-defined]
    Draft202012Validator(schema).validate(payload)
    payload["extra"] = True
    with pytest.raises(ValidationError):
        Draft202012Validator(schema).validate(payload)
    payload.pop("extra")
    payload["tasks"][0]["status"] = "ready"
    with pytest.raises(ValidationError):
        Draft202012Validator(schema).validate(payload)
