"""Atomic snapshot and append-only JSONL storage for rebuildable runtime state."""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any

from pydantic import ValidationError

from .errors import RevisionConflictError, SecretDetectedError, StateCorruptionError
from .locking import RepositoryLock
from .models import RunEvent, RunState, utc_now

_SECRET_KEY = re.compile(r"(?:secret|password|token|authorization|api[_-]?key)", re.IGNORECASE)
_SECRET_VALUE = re.compile(r"(?:gh[pousr]_[A-Za-z0-9_]{16,}|sk-[A-Za-z0-9_-]{16,})")


class StateStore:
    """Owns only cache files; callers remain responsible for durable reconciliation."""

    def __init__(self, directory: Path) -> None:
        self.directory = directory
        self.snapshot_path = directory / "snapshot.json"
        self.events_path = directory / "events.jsonl"

    @staticmethod
    def _contains_secret(value: Any, key: str | None = None) -> bool:
        if key and _SECRET_KEY.search(key):
            return True
        if isinstance(value, str):
            return bool(_SECRET_VALUE.search(value))
        if isinstance(value, dict):
            return any(StateStore._contains_secret(item, str(name)) for name, item in value.items())
        if isinstance(value, (list, tuple)):
            return any(StateStore._contains_secret(item) for item in value)
        return False

    @staticmethod
    def _json_bytes(value: dict[str, Any]) -> bytes:
        return (
            json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n"
        ).encode("utf-8")

    def read_state(self) -> RunState | None:
        if not self.snapshot_path.exists():
            return None
        try:
            payload = json.loads(self.snapshot_path.read_text(encoding="utf-8"))
            if self._contains_secret(payload):
                raise SecretDetectedError("snapshot contains secret-like content")
            return RunState.model_validate(payload)
        except (json.JSONDecodeError, UnicodeDecodeError, ValidationError) as error:
            raise StateCorruptionError("snapshot.json is corrupt or invalid") from error

    def write_state(self, state: RunState, *, expected_revision: int | None = None) -> RunState:
        """Validate then atomically replace a same-directory snapshot with a monotonic revision."""
        with RepositoryLock(self.directory / ".state-write.lock"):
            return self._write_state_locked(state, expected_revision=expected_revision)

    def _write_state_locked(
        self, state: RunState, *, expected_revision: int | None = None
    ) -> RunState:
        current = self.read_state()
        actual_revision = 0 if current is None else current.revision
        if expected_revision is not None and expected_revision != actual_revision:
            raise RevisionConflictError(
                f"expected revision {expected_revision}, found {actual_revision}"
            )
        next_state = state.model_copy(
            update={"revision": actual_revision + 1, "updated_at": utc_now()}
        )
        payload = next_state.model_dump(mode="json")
        if self._contains_secret(payload):
            raise SecretDetectedError("runtime state must not contain secret-like content")
        # Validate once before any persistent write.
        RunState.model_validate(payload)
        self.directory.mkdir(parents=True, exist_ok=True)
        with NamedTemporaryFile(
            "wb", delete=False, dir=self.directory, prefix="snapshot.", suffix=".tmp"
        ) as temp:
            temp.write(self._json_bytes(payload))
            temp.flush()
            os.fsync(temp.fileno())
            temporary_path = Path(temp.name)
        try:
            os.replace(temporary_path, self.snapshot_path)
        finally:
            if temporary_path.exists():
                temporary_path.unlink()
        return next_state

    def read_events(self) -> tuple[RunEvent, ...]:
        if not self.events_path.exists():
            return ()
        events: list[RunEvent] = []
        try:
            with self.events_path.open("r", encoding="utf-8", newline="") as stream:
                for line_number, line in enumerate(stream, start=1):
                    if not line.endswith("\n"):
                        raise StateCorruptionError("events.jsonl has an incomplete final event")
                    payload = json.loads(line)
                    if self._contains_secret(payload):
                        raise SecretDetectedError("events.jsonl contains secret-like content")
                    event = RunEvent.model_validate(payload)
                    if event.sequence != line_number:
                        raise StateCorruptionError(
                            "event sequences must be contiguous and monotonic"
                        )
                    events.append(event)
        except (json.JSONDecodeError, UnicodeDecodeError, ValidationError) as error:
            raise StateCorruptionError("events.jsonl is corrupt or invalid") from error
        return tuple(events)

    def append_event(self, event: RunEvent) -> RunEvent:
        """Append one validated event; the existing log is never rewritten."""
        with RepositoryLock(self.directory / ".state-write.lock"):
            return self._append_event_locked(event)

    def _append_event_locked(self, event: RunEvent) -> RunEvent:
        events = self.read_events()
        expected_sequence = len(events) + 1
        if event.sequence != expected_sequence:
            raise StateCorruptionError(
                f"expected event sequence {expected_sequence}, got {event.sequence}"
            )
        payload = event.model_dump(mode="json")
        if self._contains_secret(payload):
            raise SecretDetectedError("runtime events must not contain secret-like content")
        RunEvent.model_validate(payload)
        self.directory.mkdir(parents=True, exist_ok=True)
        with self.events_path.open("ab") as stream:
            stream.write(self._json_bytes(payload))
            stream.flush()
            os.fsync(stream.fileno())
        return event
