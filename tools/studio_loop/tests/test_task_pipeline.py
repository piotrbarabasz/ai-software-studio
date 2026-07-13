from __future__ import annotations

import json
from pathlib import Path

import pytest

from studio_loop.errors import TaskGraphError
from studio_loop.models import TaskCollection
from studio_loop.task_graph import TaskGraph
from studio_loop.task_renderer import render_tasks
from studio_loop.task_scheduler import ScheduleState, TaskScheduler


def test_graph_detects_missing_dependency_and_cycles(collection: TaskCollection) -> None:
    missing = collection.model_copy(
        update={"tasks": (collection.tasks[0].model_copy(update={"dependencies": ("T999",)}),)}
    )
    with pytest.raises(TaskGraphError, match="T999"):
        TaskGraph(missing)
    first, second = collection.tasks
    cycle = collection.model_copy(
        update={"tasks": (first.model_copy(update={"dependencies": ("T002",)}), second)}
    )
    with pytest.raises(TaskGraphError, match="cycle"):
        TaskGraph(cycle)


def test_stable_topology_ready_all_completed_and_blocked(collection: TaskCollection) -> None:
    graph = TaskGraph(collection)
    assert graph.topological_order == ("T001", "T002")
    assert TaskScheduler.select(collection).state is ScheduleState.READY
    completed_payload = collection.model_dump(mode="json")
    for task in completed_payload["tasks"]:
        task["status"] = "completed"
    completed = TaskCollection.model_validate(completed_payload)
    assert TaskScheduler.select(completed).state is ScheduleState.ALL_COMPLETED
    blocked_payload = collection.model_dump(mode="json")
    blocked_payload["tasks"][0]["status"] = "failed"
    blocked = TaskCollection.model_validate(blocked_payload)
    assert TaskScheduler.select(blocked).state is ScheduleState.BLOCKED


def test_renderer_is_deterministic_and_consistent_with_json_fixture() -> None:
    fixture = Path(__file__).parent / "fixtures" / "tasks.json"
    collection = TaskCollection.model_validate(json.loads(fixture.read_text(encoding="utf-8")))
    first = render_tasks(collection)
    assert first == render_tasks(collection)
    for task in collection.tasks:
        assert task.id in first
        assert task.title in first
        assert task.description in first
        assert ", ".join(task.validation_profiles) in first
