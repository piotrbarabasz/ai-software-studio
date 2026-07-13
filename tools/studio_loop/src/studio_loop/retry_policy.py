"""Fixed retry budgets for the autonomous task controller."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum


class RetryKind(StrEnum):
    IMPLEMENTER = "implementer"
    DEBUGGER = "debugger"
    OUTPUT_REPAIR = "output_repair"
    CI_REPAIR = "ci_repair"


@dataclass(frozen=True)
class RetryPolicy:
    """Controller-owned limits; callers cannot grow them during a run."""

    implementer: int = 2
    debugger: int = 2
    output_repair: int = 1
    ci_repair: int = 2

    def __post_init__(self) -> None:
        values = (self.implementer, self.debugger, self.output_repair, self.ci_repair)
        if any(value < 0 for value in values):
            raise ValueError("retry limits cannot be negative")

    def limit(self, kind: RetryKind) -> int:
        return int(getattr(self, kind.value))


@dataclass
class RetryBudget:
    """Monotonic attempt accounting suitable for JSON persistence."""

    policy: RetryPolicy = field(default_factory=RetryPolicy)
    used: dict[str, int] = field(default_factory=dict)

    def consume(self, kind: RetryKind) -> int:
        current = self.used.get(kind.value, 0)
        if current >= self.policy.limit(kind):
            raise RetryExhausted(kind, current, self.policy.limit(kind))
        current += 1
        self.used[kind.value] = current
        return current

    def remaining(self, kind: RetryKind) -> int:
        return max(0, self.policy.limit(kind) - self.used.get(kind.value, 0))


class RetryExhausted(RuntimeError):
    def __init__(self, kind: RetryKind, used: int, limit: int) -> None:
        self.kind = kind
        self.used = used
        self.limit = limit
        super().__init__(f"{kind.value} retry budget exhausted ({used}/{limit})")
