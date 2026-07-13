"""Sequential, deterministic task selection."""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum

from .models import TaskCollection
from .task_graph import TaskGraph


class ScheduleState(StrEnum):
    READY = "READY"
    ACTIVE_TASK = "ACTIVE_TASK"
    ALL_COMPLETED = "ALL_COMPLETED"
    BLOCKED = "BLOCKED"
    NO_READY = "NO_READY"


@dataclass(frozen=True)
class ScheduleDecision:
    state: ScheduleState
    task_id: str | None = None


class TaskScheduler:
    """Derives at most one candidate and never mutates task status."""

    @staticmethod
    def select(collection: TaskCollection) -> ScheduleDecision:
        graph = TaskGraph(collection)
        if graph.all_completed():
            return ScheduleDecision(ScheduleState.ALL_COMPLETED)
        if any(task.status.value == "in_progress" for task in collection.tasks):
            return ScheduleDecision(ScheduleState.ACTIVE_TASK)
        task = graph.ready_task()
        if task is not None:
            return ScheduleDecision(ScheduleState.READY, task.id)
        if graph.blocked():
            return ScheduleDecision(ScheduleState.BLOCKED)
        return ScheduleDecision(ScheduleState.NO_READY)
