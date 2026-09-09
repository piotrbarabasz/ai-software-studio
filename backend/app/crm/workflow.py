"""In-memory sandbox coordinator, not durable execution or an authentication boundary.

Only trusted callers may create/revise/approve proposals. A future adapter must enforce
the actual sandbox target and durable atomic idempotency in the remote system.
"""

import asyncio
import threading
from dataclasses import dataclass
from typing import Protocol

from app.crm.models import (
    InboundEvent,
    Proposal,
    ProposedFields,
    Receipt,
    SandboxTarget,
    Stage,
    WriteCommand,
    digest,
)


class WorkflowError(Exception):
    """Public-safe workflow rejection; no channel body or provider details."""


class AdapterUnavailable(WorkflowError):
    pass


class InvalidTransition(WorkflowError):
    pass


class EventConflict(WorkflowError):
    pass


class CapacityExceeded(WorkflowError):
    pass


class DefinitelyNotWritten(Exception):
    """Adapter guarantees no remote write occurred, e.g. a verified pre-write rejection.

    Never map an ambiguous timeout, connection loss or generic HTTP 5xx to this.
    """


class SandboxAdapter(Protocol):
    @property
    def target(self) -> SandboxTarget: ...

    async def write_once(self, command: WriteCommand) -> Receipt:
        """Atomically deduplicate the key; reject a same-key/different-fields conflict."""
        ...

    async def find_by_key(self, key: str) -> Receipt | None:
        """Read back actual target/fields/record ID. Never synthesize a success receipt."""
        ...


@dataclass
class _Entry:
    input_digest: str
    proposal: Proposal
    attempted: bool = False
    reconciling: bool = False


class SandboxWorkflow:
    def __init__(
        self,
        target: SandboxTarget,
        *,
        adapter: SandboxAdapter | None = None,
        maximum_entries: int = 100,
        timeout_seconds: float = 5,
    ) -> None:
        if type(maximum_entries) is not int or not 1 <= maximum_entries <= 1000:
            raise ValueError("Invalid workflow capacity")
        if not 0 < timeout_seconds <= 30:
            raise ValueError("Invalid adapter timeout")
        if adapter is not None and adapter.target != target:
            raise ValueError("Adapter target differs from approved sandbox")
        self._target = target
        self._adapter = adapter
        self._maximum = maximum_entries
        self._timeout = timeout_seconds
        self._entries: dict[str, _Entry] = {}
        self._lock = threading.Lock()

    def propose(self, event: InboundEvent, fields: ProposedFields) -> Proposal:
        # Namespace remote event IDs by target, channel and connected account.
        key = digest(
            {
                "target": self._target.model_dump(),
                "channel": event.channel,
                "account": event.account_id,
                "event": event.event_id,
            }
        )
        fingerprint = digest({"event": event.model_dump(), "fields": fields.model_dump()})
        with self._lock:
            existing = self._entries.get(key)
            if existing:
                if existing.input_digest != fingerprint:
                    raise EventConflict("Event identity was reused with different input")
                return existing.proposal
            if len(self._entries) >= self._maximum:
                # Never evict deduplication state and silently allow a replayed write.
                raise CapacityExceeded("Workflow capacity reached")
            proposal = Proposal(
                id=key,
                revision=1,
                fields=fields,
                stage=Stage.NEEDS_FIELDS if fields.missing else Stage.PENDING,
            )
            self._entries[key] = _Entry(fingerprint, proposal)
            return proposal

    def snapshot(self, key: str) -> Proposal:
        with self._lock:
            return self._entry(key).proposal

    def revise(self, key: str, revision: int, fields: ProposedFields) -> Proposal:
        with self._lock:
            entry = self._entry(key, revision)
            if entry.attempted or entry.proposal.stage not in (
                Stage.NEEDS_FIELDS,
                Stage.PENDING,
                Stage.APPROVED,
            ):
                raise InvalidTransition("Cannot edit this proposal")
            entry.proposal = Proposal(
                id=key,
                revision=revision + 1,
                fields=fields,
                stage=Stage.NEEDS_FIELDS if fields.missing else Stage.PENDING,
            )
            return entry.proposal

    def approve(self, key: str, revision: int, *, actor: str) -> Proposal:
        # An actor label is an audit field, NOT proof of authenticated human approval.
        with self._lock:
            entry = self._entry(key, revision)
            if entry.proposal.stage != Stage.PENDING or entry.proposal.fields.missing:
                raise InvalidTransition("Complete fields and review the current revision first")
            validated = Proposal(
                **{**entry.proposal.model_dump(), "stage": Stage.APPROVED, "approved_by": actor}
            )
            entry.proposal = validated
            return validated

    def reject(self, key: str, revision: int) -> Proposal:
        with self._lock:
            entry = self._entry(key, revision)
            if entry.attempted or entry.proposal.stage not in (
                Stage.NEEDS_FIELDS,
                Stage.PENDING,
                Stage.APPROVED,
            ):
                raise InvalidTransition("Cannot reject an attempted or closed proposal")
            entry.proposal = entry.proposal.model_copy(
                update={"stage": Stage.REJECTED, "approved_by": None}
            )
            return entry.proposal

    async def execute(self, key: str, revision: int) -> Proposal:
        adapter = self._require_adapter()
        with self._lock:
            entry = self._entry(key, revision)
            if entry.proposal.stage == Stage.SUCCEEDED:
                return entry.proposal
            if entry.proposal.stage != Stage.APPROVED:
                raise InvalidTransition("Current proposal must be approved before writing")
            entry.attempted = True
            command = WriteCommand(
                target=self._target, idempotency_key=key, fields=entry.proposal.fields
            )
            entry.proposal = entry.proposal.model_copy(update={"stage": Stage.WRITING})
        try:
            receipt = await asyncio.wait_for(adapter.write_once(command), timeout=self._timeout)
            self._validate_receipt(receipt, command)
        except DefinitelyNotWritten:
            return self._finish(key, Stage.APPROVED)
        except asyncio.CancelledError:
            self._finish(key, Stage.UNCERTAIN)
            raise
        except Exception:
            # A timeout or malformed reply may follow a committed remote write.
            return self._finish(key, Stage.UNCERTAIN)
        return self._finish(key, Stage.SUCCEEDED, receipt.record_id)

    async def reconcile(self, key: str) -> Proposal:
        adapter = self._require_adapter()
        with self._lock:
            entry = self._entry(key)
            if entry.proposal.stage != Stage.UNCERTAIN or entry.reconciling:
                raise InvalidTransition("Only an uncertain write can be reconciled")
            entry.reconciling = True
            command = WriteCommand(
                target=self._target, idempotency_key=key, fields=entry.proposal.fields
            )
        try:
            receipt = await asyncio.wait_for(adapter.find_by_key(key), timeout=self._timeout)
            if receipt is None:
                # Eventual consistency: absence is not proof that no write happened.
                return self.snapshot(key)
            self._validate_receipt(receipt, command)
            return self._finish(key, Stage.SUCCEEDED, receipt.record_id)
        except asyncio.CancelledError:
            raise
        except Exception:
            return self.snapshot(key)
        finally:
            with self._lock:
                self._entry(key).reconciling = False

    def _require_adapter(self) -> SandboxAdapter:
        if self._adapter is None or self._adapter.target != self._target:
            raise AdapterUnavailable("No matching sandbox adapter is installed")
        return self._adapter

    def _entry(self, key: str, revision: int | None = None) -> _Entry:
        entry = self._entries.get(key)
        if entry is None:
            raise InvalidTransition("Unknown proposal")
        if revision is not None and revision != entry.proposal.revision:
            raise InvalidTransition("Stale proposal revision")
        return entry

    def _finish(self, key: str, stage: Stage, record_id: str | None = None) -> Proposal:
        with self._lock:
            entry = self._entry(key)
            entry.proposal = entry.proposal.model_copy(
                update={"stage": stage, "record_id": record_id}
            )
            return entry.proposal

    @staticmethod
    def _validate_receipt(receipt: Receipt, command: WriteCommand) -> None:
        if (
            not isinstance(receipt, Receipt)
            or receipt.target != command.target
            or receipt.idempotency_key != command.idempotency_key
            or receipt.fields != command.fields
        ):
            raise WorkflowError("Remote receipt does not confirm the approved write")
