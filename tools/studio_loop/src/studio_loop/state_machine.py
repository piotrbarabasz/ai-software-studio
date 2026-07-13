"""Explicit, controller-owned feature state transitions."""

from enum import StrEnum

from .errors import InvalidTransitionError


class LoopState(StrEnum):
    CREATED = "CREATED"
    PREFLIGHT = "PREFLIGHT"
    WORKTREE_CREATED = "WORKTREE_CREATED"
    SPECIFICATION = "SPECIFICATION"
    PLANNING = "PLANNING"
    TASK_GENERATION = "TASK_GENERATION"
    SPEC_VALIDATION = "SPEC_VALIDATION"
    DRAFT_PR_CREATED = "DRAFT_PR_CREATED"
    TASK_SELECTED = "TASK_SELECTED"
    IMPLEMENTING = "IMPLEMENTING"
    VALIDATING = "VALIDATING"
    REVIEWING = "REVIEWING"
    REPAIRING = "REPAIRING"
    COMMITTING = "COMMITTING"
    PUSHING = "PUSHING"
    CI_PENDING = "CI_PENDING"
    FEATURE_VALIDATION = "FEATURE_VALIDATION"
    READY_FOR_REVIEW = "READY_FOR_REVIEW"
    BLOCKED = "BLOCKED"
    ABORTED = "ABORTED"


TRANSITIONS: dict[LoopState, frozenset[LoopState]] = {
    LoopState.CREATED: frozenset({LoopState.PREFLIGHT, LoopState.BLOCKED, LoopState.ABORTED}),
    LoopState.PREFLIGHT: frozenset(
        {LoopState.WORKTREE_CREATED, LoopState.BLOCKED, LoopState.ABORTED}
    ),
    LoopState.WORKTREE_CREATED: frozenset(
        {LoopState.SPECIFICATION, LoopState.BLOCKED, LoopState.ABORTED}
    ),
    LoopState.SPECIFICATION: frozenset({LoopState.PLANNING, LoopState.BLOCKED, LoopState.ABORTED}),
    LoopState.PLANNING: frozenset(
        {LoopState.TASK_GENERATION, LoopState.BLOCKED, LoopState.ABORTED}
    ),
    LoopState.TASK_GENERATION: frozenset(
        {LoopState.SPEC_VALIDATION, LoopState.BLOCKED, LoopState.ABORTED}
    ),
    LoopState.SPEC_VALIDATION: frozenset(
        {LoopState.DRAFT_PR_CREATED, LoopState.TASK_SELECTED, LoopState.BLOCKED, LoopState.ABORTED}
    ),
    LoopState.DRAFT_PR_CREATED: frozenset(
        {LoopState.TASK_SELECTED, LoopState.BLOCKED, LoopState.ABORTED}
    ),
    LoopState.TASK_SELECTED: frozenset(
        {LoopState.IMPLEMENTING, LoopState.BLOCKED, LoopState.ABORTED}
    ),
    LoopState.IMPLEMENTING: frozenset(
        {LoopState.VALIDATING, LoopState.REPAIRING, LoopState.BLOCKED, LoopState.ABORTED}
    ),
    LoopState.VALIDATING: frozenset(
        {LoopState.REVIEWING, LoopState.REPAIRING, LoopState.BLOCKED, LoopState.ABORTED}
    ),
    LoopState.REVIEWING: frozenset(
        {LoopState.COMMITTING, LoopState.REPAIRING, LoopState.BLOCKED, LoopState.ABORTED}
    ),
    LoopState.REPAIRING: frozenset(
        {LoopState.TASK_SELECTED, LoopState.IMPLEMENTING, LoopState.BLOCKED, LoopState.ABORTED}
    ),
    LoopState.COMMITTING: frozenset(
        {
            LoopState.TASK_SELECTED,
            LoopState.FEATURE_VALIDATION,
            LoopState.BLOCKED,
            LoopState.ABORTED,
        }
    ),
    LoopState.PUSHING: frozenset({LoopState.CI_PENDING, LoopState.BLOCKED, LoopState.ABORTED}),
    LoopState.CI_PENDING: frozenset(
        {LoopState.FEATURE_VALIDATION, LoopState.REPAIRING, LoopState.BLOCKED, LoopState.ABORTED}
    ),
    LoopState.FEATURE_VALIDATION: frozenset(
        {LoopState.PUSHING, LoopState.READY_FOR_REVIEW, LoopState.BLOCKED, LoopState.ABORTED}
    ),
    LoopState.READY_FOR_REVIEW: frozenset(),
    LoopState.BLOCKED: frozenset({LoopState.PREFLIGHT, LoopState.TASK_SELECTED, LoopState.ABORTED}),
    LoopState.ABORTED: frozenset(),
}


def transition(current: LoopState, target: LoopState) -> LoopState:
    """Return ``target`` only if it is explicitly allowed from ``current``."""
    if target not in TRANSITIONS[current]:
        raise InvalidTransitionError(f"transition {current} -> {target} is not allowed")
    return target
