import asyncio
from concurrent.futures import ThreadPoolExecutor

import pytest
from app.crm.models import InboundEvent, ProposedFields, Receipt, SandboxTarget, Stage
from app.crm.workflow import (
    AdapterUnavailable,
    CapacityExceeded,
    DefinitelyNotWritten,
    EventConflict,
    InvalidTransition,
    SandboxWorkflow,
)
from pydantic import ValidationError

TARGET = SandboxTarget(workspace_id="unit-test-workspace")
FIELDS = ProposedFields(customer_reference="synthetic-customer", summary="Test", owner_id="owner")
EVENT = InboundEvent(channel="email", account_id="test-account", event_id="test-event", body="Test")


class FixtureAdapter:
    """Test-only storage; never public integration evidence."""

    target = TARGET

    def __init__(self):
        self.calls = []
        self.records = {}

    async def write_once(self, command):
        self.calls.append(command)
        existing = self.records.get(command.idempotency_key)
        if existing:
            assert existing.fields == command.fields
            return existing
        receipt = Receipt(**command.model_dump(), record_id="fixture-record")
        self.records[command.idempotency_key] = receipt
        return receipt

    async def find_by_key(self, key):
        return self.records.get(key)


def ready(adapter=None, **kwargs):
    workflow = SandboxWorkflow(TARGET, adapter=adapter, **kwargs)
    proposal = workflow.propose(EVENT, FIELDS)
    workflow.approve(proposal.id, proposal.revision, actor="test-reviewer")
    return workflow, proposal.id


def test_disabled_by_default_and_no_public_routes(client):
    workflow, key = ready()
    with pytest.raises(AdapterUnavailable):
        asyncio.run(workflow.execute(key, 1))
    paths = client.app.openapi()["paths"]
    assert not any("crm" in path or "webhook" in path for path in paths)
    assert client.post("/api/crm", json={}).status_code == 404


@pytest.mark.parametrize("missing", ["customer_reference", "summary", "owner_id"])
def test_missing_fields_cannot_be_approved_or_written(missing):
    adapter = FixtureAdapter()
    workflow = SandboxWorkflow(TARGET, adapter=adapter)
    fields = ProposedFields(**{**FIELDS.model_dump(), missing: None})
    proposal = workflow.propose(EVENT, fields)
    assert proposal.stage == Stage.NEEDS_FIELDS
    assert fields.missing == (missing,)
    with pytest.raises(InvalidTransition):
        workflow.approve(proposal.id, 1, actor="reviewer")
    with pytest.raises(InvalidTransition):
        asyncio.run(workflow.execute(proposal.id, 1))
    assert adapter.calls == []


def test_approval_binds_revision_and_edits_invalidate_it():
    adapter = FixtureAdapter()
    workflow, key = ready(adapter)
    edited = workflow.revise(key, 1, ProposedFields(**{**FIELDS.model_dump(), "summary": "Edited"}))
    assert edited.revision == 2 and edited.approved_by is None
    for revision in (1, 2):
        with pytest.raises(InvalidTransition):
            asyncio.run(workflow.execute(key, revision))
    with pytest.raises(InvalidTransition):
        workflow.approve(key, 1, actor="reviewer")
    workflow.approve(key, 2, actor="reviewer")
    result = asyncio.run(workflow.execute(key, 2))
    assert result.stage == Stage.SUCCEEDED
    assert adapter.calls[0].fields == edited.fields


def test_completing_missing_fields_still_requires_explicit_approval():
    adapter = FixtureAdapter()
    workflow = SandboxWorkflow(TARGET, adapter=adapter)
    proposal = workflow.propose(EVENT, ProposedFields())
    complete = workflow.revise(proposal.id, 1, FIELDS)
    assert complete.stage == Stage.PENDING
    with pytest.raises(InvalidTransition):
        asyncio.run(workflow.execute(complete.id, complete.revision))
    assert adapter.calls == []
    workflow.approve(complete.id, complete.revision, actor="reviewer")
    assert asyncio.run(workflow.execute(complete.id, complete.revision)).stage == Stage.SUCCEEDED


def test_fresh_coordinator_sends_same_key_to_adapter_for_remote_deduplication():
    # A fixture contract check only; real restart safety requires durable provider tests.
    adapter = FixtureAdapter()
    first, key = ready(adapter)
    original = asyncio.run(first.execute(key, 1))
    restarted, same_key = ready(adapter)
    repeated = asyncio.run(restarted.execute(same_key, 1))
    assert same_key == key
    assert original.record_id == repeated.record_id
    assert len(adapter.calls) == 2 and len(adapter.records) == 1


def test_exact_replay_returns_current_state_without_a_second_call():
    adapter = FixtureAdapter()
    workflow, key = ready(adapter)
    first = asyncio.run(workflow.execute(key, 1))
    assert workflow.propose(EVENT, FIELDS) == first
    assert asyncio.run(workflow.execute(key, 1)) == first
    assert len(adapter.calls) == 1
    assert first.record_id == "fixture-record"
    with pytest.raises(InvalidTransition):
        workflow.revise(key, 1, FIELDS)


def test_same_event_with_changed_payload_is_a_conflict():
    workflow, _ = ready()
    with pytest.raises(EventConflict):
        workflow.propose(EVENT.model_copy(update={"body": "Changed"}), FIELDS)
    with pytest.raises(EventConflict):
        workflow.propose(EVENT, ProposedFields(**{**FIELDS.model_dump(), "owner_id": "other"}))


def test_event_keys_are_namespaced_by_channel_account_and_target():
    workflow = SandboxWorkflow(TARGET)
    keys = {workflow.propose(EVENT, FIELDS).id}
    keys.add(workflow.propose(EVENT.model_copy(update={"channel": "whatsapp"}), FIELDS).id)
    keys.add(workflow.propose(EVENT.model_copy(update={"account_id": "other"}), FIELDS).id)
    other = SandboxWorkflow(SandboxTarget(workspace_id="other"))
    keys.add(other.propose(EVENT, FIELDS).id)
    assert len(keys) == 4


def test_concurrent_ingest_is_atomic_and_capacity_does_not_evict_keys():
    workflow = SandboxWorkflow(TARGET, maximum_entries=1)
    with ThreadPoolExecutor(max_workers=8) as pool:
        keys = list(pool.map(lambda _: workflow.propose(EVENT, FIELDS).id, range(30)))
    assert len(set(keys)) == 1
    with pytest.raises(CapacityExceeded):
        workflow.propose(EVENT.model_copy(update={"event_id": "second"}), FIELDS)
    assert workflow.propose(EVENT, FIELDS).id == keys[0]


def test_concurrent_execute_allows_only_one_inflight_write():
    async def scenario():
        entered, release = asyncio.Event(), asyncio.Event()

        class WaitingAdapter(FixtureAdapter):
            async def write_once(self, command):
                entered.set()
                await release.wait()
                return await super().write_once(command)

        adapter = WaitingAdapter()
        workflow, key = ready(adapter)
        task = asyncio.create_task(workflow.execute(key, 1))
        await entered.wait()
        with pytest.raises(InvalidTransition):
            await workflow.execute(key, 1)
        with pytest.raises(InvalidTransition):
            workflow.reject(key, 1)
        release.set()
        assert (await task).stage == Stage.SUCCEEDED
        assert len(adapter.calls) == 1

    asyncio.run(scenario())


def test_lost_response_is_reconciled_from_readback_without_retry():
    class LostReplyAdapter(FixtureAdapter):
        async def write_once(self, command):
            await super().write_once(command)
            raise ConnectionError("private provider message")

    adapter = LostReplyAdapter()
    workflow, key = ready(adapter)
    assert asyncio.run(workflow.execute(key, 1)).stage == Stage.UNCERTAIN
    with pytest.raises(InvalidTransition):
        asyncio.run(workflow.execute(key, 1))
    with pytest.raises(InvalidTransition):
        workflow.revise(key, 1, FIELDS)
    assert asyncio.run(workflow.reconcile(key)).stage == Stage.SUCCEEDED
    assert len(adapter.calls) == 1
    assert "private" not in workflow.snapshot(key).model_dump_json()


def test_timeout_and_missing_readback_remain_uncertain():
    class TimeoutAdapter(FixtureAdapter):
        async def write_once(self, command):
            self.calls.append(command)
            await asyncio.Event().wait()

    adapter = TimeoutAdapter()
    workflow, key = ready(adapter, timeout_seconds=0.01)
    assert asyncio.run(workflow.execute(key, 1)).stage == Stage.UNCERTAIN
    assert asyncio.run(workflow.reconcile(key)).stage == Stage.UNCERTAIN
    assert len(adapter.calls) == 1


def test_caller_cancellation_marks_possible_write_uncertain():
    async def scenario():
        entered = asyncio.Event()

        class WaitingAdapter(FixtureAdapter):
            async def write_once(self, command):
                entered.set()
                await asyncio.Event().wait()

        workflow, key = ready(WaitingAdapter())
        task = asyncio.create_task(workflow.execute(key, 1))
        await entered.wait()
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await task
        assert workflow.snapshot(key).stage == Stage.UNCERTAIN

    asyncio.run(scenario())


def test_verified_no_write_failure_can_retry_only_the_approved_command():
    class RejectedAdapter(FixtureAdapter):
        async def write_once(self, command):
            if not self.calls:
                self.calls.append(command)
                raise DefinitelyNotWritten()
            return await super().write_once(command)

    adapter = RejectedAdapter()
    workflow, key = ready(adapter)
    assert asyncio.run(workflow.execute(key, 1)).stage == Stage.APPROVED
    with pytest.raises(InvalidTransition):
        workflow.revise(key, 1, FIELDS)
    assert asyncio.run(workflow.execute(key, 1)).stage == Stage.SUCCEEDED
    assert adapter.calls[0] == adapter.calls[1]


@pytest.mark.parametrize(
    "change",
    [
        {"target": SandboxTarget(workspace_id="wrong")},
        {"idempotency_key": "wrong"},
        {"fields": ProposedFields(**{**FIELDS.model_dump(), "summary": "wrong"})},
    ],
)
def test_wrong_receipt_never_becomes_success(change):
    class WrongAdapter(FixtureAdapter):
        async def write_once(self, command):
            return (await super().write_once(command)).model_copy(update=change)

        async def find_by_key(self, key):
            return self.records[key].model_copy(update=change)

    workflow, key = ready(WrongAdapter())
    assert asyncio.run(workflow.execute(key, 1)).stage == Stage.UNCERTAIN
    assert asyncio.run(workflow.reconcile(key)).stage == Stage.UNCERTAIN


def test_rejection_is_final_and_preserves_duplicate_identity():
    adapter = FixtureAdapter()
    workflow, key = ready(adapter)
    workflow.reject(key, 1)
    assert workflow.propose(EVENT, FIELDS).stage == Stage.REJECTED
    with pytest.raises(InvalidTransition):
        asyncio.run(workflow.execute(key, 1))
    assert adapter.calls == []


def test_input_bounds_extra_fields_target_and_blank_actor_are_rejected():
    with pytest.raises(ValidationError):
        SandboxTarget(workspace_id="prod", environment="production")
    with pytest.raises(ValidationError):
        InboundEvent(**{**EVENT.model_dump(), "body": "x" * 4001})
    with pytest.raises(ValidationError):
        ProposedFields(**{**FIELDS.model_dump(), "send_reply": True})
    workflow = SandboxWorkflow(TARGET)
    proposal = workflow.propose(EVENT, FIELDS)
    with pytest.raises(ValidationError):
        workflow.approve(proposal.id, 1, actor=" ")
    assert workflow.snapshot(proposal.id).stage == Stage.PENDING
    with pytest.raises(ValueError):
        SandboxWorkflow(SandboxTarget(workspace_id="other"), adapter=FixtureAdapter())
