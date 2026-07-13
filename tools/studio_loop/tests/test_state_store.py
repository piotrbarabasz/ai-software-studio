from __future__ import annotations

from pathlib import Path

import pytest

from studio_loop.errors import RevisionConflictError, SecretDetectedError, StateCorruptionError
from studio_loop.models import RunEvent, RunState
from studio_loop.state_store import StateStore


def test_atomic_state_write_is_monotonic_and_uses_utc_timestamp(
    tmp_path: Path, now: object
) -> None:
    store = StateStore(tmp_path)
    initial = RunState(
        feature_id="007-autonomous-loop",
        run_id="run-0001",
        state="CREATED",
        revision=0,
        updated_at=now,
    )
    written = store.write_state(initial, expected_revision=0)
    assert written.revision == 1
    assert store.read_state() == written
    assert not list(tmp_path.glob("*.tmp"))
    second = store.write_state(written, expected_revision=1)
    assert second.revision == 2


def test_corrupt_json_and_optimistic_locking_are_rejected(tmp_path: Path, now: object) -> None:
    store = StateStore(tmp_path)
    store.snapshot_path.write_text("{", encoding="utf-8")
    with pytest.raises(StateCorruptionError):
        store.read_state()
    store.snapshot_path.unlink()
    state = RunState(
        feature_id="007-autonomous-loop",
        run_id="run-0001",
        state="CREATED",
        revision=0,
        updated_at=now,
    )
    store.write_state(state)
    with pytest.raises(RevisionConflictError):
        store.write_state(state, expected_revision=0)


def test_event_log_is_append_only_and_rejects_secrets(tmp_path: Path, now: object) -> None:
    store = StateStore(tmp_path)
    event = RunEvent(
        event_id="event-001",
        sequence=1,
        occurred_at=now,
        feature_id="007-autonomous-loop",
        run_id="run-0001",
        event_type="feature_transition",
    )
    store.append_event(event)
    assert store.read_events() == (event,)
    with pytest.raises(StateCorruptionError):
        store.append_event(event)
    secret_event = event.model_copy(
        update={"event_id": "event-002", "sequence": 2, "evidence": ("ghp_abcdefghijklmnopqrstuv",)}
    )
    with pytest.raises(SecretDetectedError):
        store.append_event(secret_event)
