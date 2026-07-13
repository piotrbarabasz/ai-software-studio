"""Closed, versioned models used by the autonomous-loop foundations."""

from __future__ import annotations

from datetime import UTC, datetime
from enum import StrEnum
from hashlib import sha256
from json import dumps
from re import compile
from typing import Any, Final, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from .errors import ContractValidationError
from .state_machine import LoopState

SCHEMA_VERSION = "1.0.0"
TASK_SCHEMA_VERSION: Final[TaskSchemaVersion] = "1.1.0"
SchemaVersion = Literal["1.0.0"]
TaskSchemaVersion = Literal["1.0.0", "1.1.0"]
FEATURE_ID = compile(r"^[0-9]{3}-[a-z0-9]+(?:-[a-z0-9]+)*$")
TASK_ID = compile(r"^T[0-9]{3,}$")
DIGEST = compile(r"^[a-f0-9]{64}$")


def utc_now() -> datetime:
    """Return a timezone-aware UTC timestamp."""
    return datetime.now(UTC)


class StrictModel(BaseModel):
    """Every persisted boundary object rejects undeclared fields."""

    model_config = ConfigDict(extra="forbid", frozen=True, use_enum_values=False)

    def canonical_json(self) -> str:
        return dumps(
            self.model_dump(mode="json"), ensure_ascii=False, sort_keys=True, separators=(",", ":")
        )

    def digest(self) -> str:
        return sha256(self.canonical_json().encode("utf-8")).hexdigest()


class TaskStatus(StrEnum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    FAILED = "failed"
    ABORTED = "aborted"


class FeatureMetadata(StrictModel):
    schema_version: SchemaVersion = "1.0.0"
    feature_id: str
    title: str = Field(min_length=1, max_length=200)
    request_digest: str | None = None

    @field_validator("feature_id")
    @classmethod
    def valid_feature_id(cls, value: str) -> str:
        if not FEATURE_ID.fullmatch(value):
            raise ValueError("feature_id must match NNN-safe-slug")
        return value

    @field_validator("request_digest")
    @classmethod
    def valid_digest(cls, value: str | None) -> str | None:
        if value is not None and not DIGEST.fullmatch(value):
            raise ValueError("request_digest must be a lowercase SHA-256 digest")
        return value


class TaskDefinition(StrictModel):
    id: str
    phase: str = Field(min_length=1, max_length=100)
    title: str = Field(min_length=1, max_length=300)
    description: str = Field(min_length=1, max_length=4_000)
    dependencies: tuple[str, ...] = ()
    requirement_ids: tuple[str, ...] = Field(min_length=1)
    allowed_read_paths: tuple[str, ...] = ()
    allowed_write_paths: tuple[str, ...] = ()
    writes: bool
    validation_profiles: tuple[str, ...] = Field(min_length=1, max_length=32)
    completion_criteria: tuple[str, ...] = Field(min_length=1)
    tests: tuple[str, ...] = Field(min_length=1)
    status: TaskStatus = TaskStatus.PENDING

    @model_validator(mode="before")
    @classmethod
    def migrate_legacy_validation_profile(cls, value: Any) -> Any:
        """Accept v1.0 input once, while retaining one canonical in-memory field."""
        if not isinstance(value, dict):
            return value
        payload = dict(value)
        has_legacy = "validation_profile" in payload
        has_canonical = "validation_profiles" in payload
        if has_legacy and has_canonical:
            raise ValueError("validation_profile and validation_profiles cannot both be supplied")
        if has_legacy:
            payload["validation_profiles"] = [payload.pop("validation_profile")]
        return payload

    @field_validator("id")
    @classmethod
    def valid_task_id(cls, value: str) -> str:
        if not TASK_ID.fullmatch(value):
            raise ValueError("task id must match T followed by at least three digits")
        return value

    @field_validator("dependencies")
    @classmethod
    def unique_dependencies(cls, value: tuple[str, ...]) -> tuple[str, ...]:
        if len(value) != len(set(value)):
            raise ValueError("task dependencies must be unique")
        if any(not TASK_ID.fullmatch(item) for item in value):
            raise ValueError("dependency task ids must match T followed by at least three digits")
        return value

    @field_validator("validation_profiles")
    @classmethod
    def unique_validation_profiles(cls, value: tuple[str, ...]) -> tuple[str, ...]:
        if len(value) != len(set(value)):
            raise ValueError("validation profiles must be unique")
        if any(not profile.strip() for profile in value):
            raise ValueError("validation profiles must be non-empty")
        return value

    @field_validator("allowed_read_paths", "allowed_write_paths")
    @classmethod
    def safe_relative_paths(cls, value: tuple[str, ...]) -> tuple[str, ...]:
        for path in value:
            normal = path.replace("\\", "/")
            if (
                not normal
                or normal.startswith("/")
                or ":" in normal.split("/", 1)[0]
                or any(part in {"", ".", ".."} for part in normal.split("/"))
                or any(ord(character) < 32 for character in normal)
            ):
                raise ValueError("paths must be non-empty repository-relative POSIX paths")
            if normal != path:
                raise ValueError("paths must use repository-relative POSIX separators")
        return value

    @model_validator(mode="after")
    def write_paths_match_write_flag(self) -> TaskDefinition:
        if self.writes and not self.allowed_write_paths:
            raise ValueError("writing tasks require allowed_write_paths")
        if not self.writes and self.allowed_write_paths:
            raise ValueError("read-only tasks cannot declare allowed_write_paths")
        if self.id in self.dependencies:
            raise ValueError("task cannot depend on itself")
        return self


class TaskCollection(StrictModel):
    schema_version: TaskSchemaVersion = TASK_SCHEMA_VERSION
    feature_id: str
    requirements: tuple[str, ...] = Field(min_length=1)
    tasks: tuple[TaskDefinition, ...] = Field(min_length=1, max_length=200)

    @model_validator(mode="before")
    @classmethod
    def normalize_legacy_task_document(cls, value: Any) -> Any:
        """Read v1.0 task documents but always materialize canonical v1.1 data."""
        if not isinstance(value, dict):
            return value
        payload = dict(value)
        if payload.get("schema_version") == "1.0.0":
            payload["schema_version"] = TASK_SCHEMA_VERSION
        return payload

    @field_validator("feature_id")
    @classmethod
    def valid_feature_id(cls, value: str) -> str:
        return FeatureMetadata(feature_id=value, title="validation").feature_id

    @model_validator(mode="after")
    def unique_task_ids_and_known_requirements(self) -> TaskCollection:
        ids = [task.id for task in self.tasks]
        if len(ids) != len(set(ids)):
            raise ValueError("task IDs must be unique")
        active_tasks = sum(task.status is TaskStatus.IN_PROGRESS for task in self.tasks)
        if active_tasks > 1:
            raise ValueError("V1 permits at most one in-progress task")
        known = set(self.requirements)
        if len(known) != len(self.requirements):
            raise ValueError("requirements must be unique")
        unknown = sorted(
            requirement
            for task in self.tasks
            for requirement in task.requirement_ids
            if requirement not in known
        )
        if unknown:
            raise ValueError(f"unknown requirement IDs: {', '.join(dict.fromkeys(unknown))}")
        return self


class RunState(StrictModel):
    schema_version: SchemaVersion = "1.0.0"
    feature_id: str
    run_id: str = Field(min_length=8, max_length=128)
    state: LoopState
    revision: int = Field(ge=0)
    updated_at: datetime
    active_task_id: str | None = None
    mode: Literal["local", "draft-pr"] = "local"
    branch: str | None = None
    worktree: str | None = None
    local_sha: str | None = None
    remote_sha: str | None = None
    pull_request: int | None = Field(default=None, ge=1)
    ci_status: str | None = None
    human_gate: bool = False
    feature_validation_passed: bool = False
    completed_tasks: tuple[str, ...] = ()
    validation_summary: str = ""
    ci_history: tuple[str, ...] = ()
    blocking_issues: tuple[str, ...] = ()

    @field_validator("feature_id")
    @classmethod
    def valid_feature_id(cls, value: str) -> str:
        return FeatureMetadata(feature_id=value, title="validation").feature_id

    @field_validator("active_task_id")
    @classmethod
    def valid_active_task(cls, value: str | None) -> str | None:
        if value is not None and not TASK_ID.fullmatch(value):
            raise ValueError("active_task_id must be a valid task ID")
        return value

    @field_validator("updated_at")
    @classmethod
    def utc_timestamp(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() != UTC.utcoffset(value):
            raise ValueError("updated_at must be UTC")
        return value


class RunEvent(StrictModel):
    schema_version: SchemaVersion = "1.0.0"
    event_id: str = Field(min_length=8, max_length=128)
    sequence: int = Field(ge=1)
    occurred_at: datetime
    feature_id: str
    run_id: str = Field(min_length=8, max_length=128)
    event_type: str = Field(min_length=1, max_length=100)
    from_state: str | None = None
    to_state: str | None = None
    task_id: str | None = None
    evidence: tuple[str, ...] = ()

    @field_validator("feature_id")
    @classmethod
    def valid_feature_id(cls, value: str) -> str:
        return FeatureMetadata(feature_id=value, title="validation").feature_id

    @field_validator("task_id")
    @classmethod
    def valid_task_id(cls, value: str | None) -> str | None:
        if value is not None and not TASK_ID.fullmatch(value):
            raise ValueError("task_id must be a valid task ID")
        return value

    @field_validator("occurred_at")
    @classmethod
    def utc_timestamp(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() != UTC.utcoffset(value):
            raise ValueError("occurred_at must be UTC")
        return value


class TaskPackage(StrictModel):
    schema_version: SchemaVersion = "1.0.0"
    feature: FeatureMetadata
    tasks: TaskCollection

    @model_validator(mode="after")
    def task_feature_matches_metadata(self) -> TaskPackage:
        if self.feature.feature_id != self.tasks.feature_id:
            raise ValueError("task package feature_id must match task collection")
        return self


class ValidationResult(StrictModel):
    schema_version: SchemaVersion = "1.0.0"
    task_id: str
    profile_id: str = Field(min_length=1, max_length=100)
    passed: bool
    summary: str = Field(min_length=1, max_length=2_000)

    @field_validator("task_id")
    @classmethod
    def valid_task_id(cls, value: str) -> str:
        if not TASK_ID.fullmatch(value):
            raise ValueError("invalid task ID")
        return value


class ReviewResult(StrictModel):
    schema_version: SchemaVersion = "1.0.0"
    task_id: str
    decision: Literal["accept", "changes_requested", "blocked"]
    summary: str = Field(min_length=1, max_length=2_000)

    @field_validator("task_id")
    @classmethod
    def valid_task_id(cls, value: str) -> str:
        if not TASK_ID.fullmatch(value):
            raise ValueError("invalid task ID")
        return value


class FailurePackage(StrictModel):
    schema_version: SchemaVersion = "1.0.0"
    feature_id: str
    task_id: str | None = None
    failure_class: Literal["schema", "policy", "validation", "review", "state", "graph"]
    summary: str = Field(min_length=1, max_length=2_000)

    @field_validator("feature_id")
    @classmethod
    def valid_feature_id(cls, value: str) -> str:
        return FeatureMetadata(feature_id=value, title="validation").feature_id

    @field_validator("task_id")
    @classmethod
    def valid_task_id(cls, value: str | None) -> str | None:
        if value is not None and not TASK_ID.fullmatch(value):
            raise ValueError("invalid task ID")
        return value


def parse_model(model: type[StrictModel], payload: Any) -> StrictModel:
    """Normalise Pydantic validation errors at this package's public boundary."""
    try:
        return model.model_validate(payload)
    except Exception as error:  # Pydantic's public exception text is enough for a controlled error.
        raise ContractValidationError(str(error)) from error
