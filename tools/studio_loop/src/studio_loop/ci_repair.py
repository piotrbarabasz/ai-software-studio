"""Bounded failure packaging and CI-repair budget accounting."""

from __future__ import annotations

from dataclasses import dataclass

from .adapters.gh_cli import Check
from .checks import CheckObservation
from .models import FailurePackage, TaskCollection
from .retry_policy import RetryBudget, RetryExhausted, RetryKind


@dataclass(frozen=True)
class CiRepairDecision:
    state: str
    failure: FailurePackage
    attempt: int | None


def map_failure_to_task(
    observation: CheckObservation,
    tasks: TaskCollection,
    *,
    check_task_map: dict[str, str] | None = None,
    current_task_id: str | None = None,
) -> str | None:
    """Map CI only through committed check/profile metadata and require one answer.

    A caller may provide a committed explicit check-to-task map.  Otherwise a
    failed check name must exactly match a task's trusted validation profile.
    Multiple matching tasks are deliberately ambiguous.
    """

    if observation.state.value != "failed":
        return None
    task_ids = {task.id for task in tasks.tasks}
    candidates: set[str] = set()
    explicit = check_task_map or {}
    for check in observation.checks:
        state = check.state.casefold().replace(" ", "_")
        if state not in {"failure", "failed", "error", "timed_out", "timeout"}:
            continue
        mapped = explicit.get(check.name)
        if mapped is not None:
            if mapped not in task_ids:
                return None
            candidates.add(mapped)
            continue
        candidates.update(task.id for task in tasks.tasks if check.name in task.validation_profiles)
    if current_task_id is not None and current_task_id in candidates:
        return current_task_id
    return next(iter(candidates)) if len(candidates) == 1 else None


class CiRepairService:
    def schedule(
        self,
        *,
        feature_id: str,
        task_id: str | None,
        observation: CheckObservation,
        budget: RetryBudget,
    ) -> CiRepairDecision:
        if task_id is None:
            return CiRepairDecision(
                "BLOCKED",
                FailurePackage(
                    feature_id=feature_id,
                    task_id=None,
                    failure_class="validation",
                    summary="CI failure cannot be mapped to a task",
                ),
                None,
            )
        summary = self._summary(observation.checks)
        try:
            attempt = budget.consume(RetryKind.CI_REPAIR)
        except RetryExhausted:
            return CiRepairDecision(
                "BLOCKED",
                FailurePackage(
                    feature_id=feature_id,
                    task_id=task_id,
                    failure_class="validation",
                    summary="CI repair budget exhausted",
                ),
                None,
            )
        return CiRepairDecision(
            "DEBUGGER",
            FailurePackage(
                feature_id=feature_id, task_id=task_id, failure_class="validation", summary=summary
            ),
            attempt,
        )

    @staticmethod
    def _summary(checks: tuple[Check, ...]) -> str:
        parts = [f"{check.name}: {check.state}" for check in checks]
        return "; ".join(parts)[:2000] or "required CI check failed"
