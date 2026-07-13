"""Bounded failure packaging and CI-repair budget accounting."""

from __future__ import annotations

from dataclasses import dataclass

from .adapters.gh_cli import Check
from .checks import CheckObservation
from .models import FailurePackage
from .retry_policy import RetryBudget, RetryExhausted, RetryKind


@dataclass(frozen=True)
class CiRepairDecision:
    state: str
    failure: FailurePackage
    attempt: int | None


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
