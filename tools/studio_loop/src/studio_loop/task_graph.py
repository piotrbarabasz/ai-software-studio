"""Validated deterministic dependency graph for canonical tasks."""

from __future__ import annotations

from .errors import TaskGraphError
from .models import TaskCollection, TaskDefinition, TaskStatus


class TaskGraph:
    """A validated task DAG retaining canonical input order as its tie breaker."""

    def __init__(self, collection: TaskCollection) -> None:
        self.collection = collection
        self.tasks: dict[str, TaskDefinition] = {task.id: task for task in collection.tasks}
        self.order = {task.id: index for index, task in enumerate(collection.tasks)}
        self.reverse: dict[str, tuple[str, ...]] = {
            task.id: tuple(task.dependencies) for task in collection.tasks
        }
        self.children: dict[str, list[str]] = {task.id: [] for task in collection.tasks}
        for task in collection.tasks:
            for dependency in task.dependencies:
                if dependency not in self.tasks:
                    raise TaskGraphError(f"task {task.id} has missing dependency {dependency}")
                if dependency == task.id:
                    raise TaskGraphError(f"task {task.id} has a self-dependency")
                self.children[dependency].append(task.id)
        self.topological_order = self._stable_topological_order()

    def _stable_topological_order(self) -> tuple[str, ...]:
        indegree = {task_id: len(dependencies) for task_id, dependencies in self.reverse.items()}
        ready = [task_id for task_id, degree in indegree.items() if degree == 0]
        ready.sort(key=self.order.__getitem__)
        result: list[str] = []
        while ready:
            task_id = ready.pop(0)
            result.append(task_id)
            for child in sorted(self.children[task_id], key=self.order.__getitem__):
                indegree[child] -= 1
                if indegree[child] == 0:
                    ready.append(child)
                    ready.sort(key=self.order.__getitem__)
        if len(result) != len(self.tasks):
            cycle_nodes = sorted(task_id for task_id, degree in indegree.items() if degree > 0)
            raise TaskGraphError(f"task graph contains cycle involving: {', '.join(cycle_nodes)}")
        return tuple(result)

    def ready_task(self) -> TaskDefinition | None:
        """Return the first dynamic READY task without persisting a READY status."""
        if any(task.status is TaskStatus.IN_PROGRESS for task in self.tasks.values()):
            return None
        for task_id in self.topological_order:
            task = self.tasks[task_id]
            if task.status is not TaskStatus.PENDING:
                continue
            if all(
                self.tasks[dependency].status is TaskStatus.COMPLETED
                for dependency in task.dependencies
            ):
                return task
        return None

    def all_completed(self) -> bool:
        return all(task.status is TaskStatus.COMPLETED for task in self.tasks.values())

    def blocked(self) -> bool:
        if self.all_completed() or any(
            task.status is TaskStatus.IN_PROGRESS for task in self.tasks.values()
        ):
            return False
        return self.ready_task() is None and any(
            task.status is TaskStatus.PENDING for task in self.tasks.values()
        )
