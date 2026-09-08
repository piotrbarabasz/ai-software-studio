"""Normalized inputs supplied by a future authenticated channel/operator boundary."""

import hashlib
from enum import StrEnum
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, StringConstraints

Identifier = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=128)]
Summary = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=500)]


class FrozenModel(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid", strict=True)


class SandboxTarget(FrozenModel):
    workspace_id: Identifier
    environment: Literal["sandbox"] = "sandbox"


class InboundEvent(FrozenModel):
    channel: Literal["email", "whatsapp"]
    account_id: Identifier
    event_id: Identifier
    body: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=4000)]


class ProposedFields(FrozenModel):
    customer_reference: Identifier | None = None
    summary: Summary | None = None
    owner_id: Identifier | None = None
    status: Literal["new"] = "new"

    @property
    def missing(self) -> tuple[str, ...]:
        return tuple(
            name
            for name in ("customer_reference", "summary", "owner_id")
            if getattr(self, name) is None
        )


class Stage(StrEnum):
    NEEDS_FIELDS = "needs_fields"
    PENDING = "pending_approval"
    APPROVED = "approved"
    WRITING = "writing"
    SUCCEEDED = "succeeded"
    UNCERTAIN = "uncertain"
    REJECTED = "rejected"


class Proposal(FrozenModel):
    id: Identifier
    revision: int
    fields: ProposedFields
    stage: Stage
    approved_by: Identifier | None = None
    record_id: Identifier | None = None


class WriteCommand(FrozenModel):
    target: SandboxTarget
    idempotency_key: Identifier
    fields: ProposedFields


class Receipt(FrozenModel):
    target: SandboxTarget
    idempotency_key: Identifier
    fields: ProposedFields
    record_id: Identifier


def digest(value: BaseModel | dict) -> str:
    import json

    data = value.model_dump(mode="json") if isinstance(value, BaseModel) else value
    return hashlib.sha256(
        json.dumps(data, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()
    ).hexdigest()
