from __future__ import annotations

import json
import tomllib
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


def test_all_loop_json_and_toml_documents_parse_and_schema_documents_self_validate() -> None:
    root = Path(__file__).parents[3]
    json_roots = (
        root / ".studio-loop",
        root / ".codex",
        root / "specs" / "007-autonomous-loop" / "contracts",
    )
    documents = [path for directory in json_roots for path in directory.rglob("*.json")]
    assert documents
    for path in documents:
        payload = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(payload, dict) and payload.get("$schema") == (
            "https://json-schema.org/draft/2020-12/schema"
        ):
            Draft202012Validator.check_schema(payload)

    toml_documents = list(root.glob("*.toml")) + list((root / ".codex").rglob("*.toml"))
    toml_documents += list((root / "tools" / "studio_loop").glob("*.toml"))
    assert toml_documents
    for path in toml_documents:
        tomllib.loads(path.read_text(encoding="utf-8"))
