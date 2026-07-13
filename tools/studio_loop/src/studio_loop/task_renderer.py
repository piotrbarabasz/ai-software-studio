"""Deterministic human-readable view of canonical ``tasks.json`` data."""

from __future__ import annotations

from hashlib import sha256

from .models import TaskCollection
from .task_graph import TaskGraph

GENERATOR_VERSION = "1.0.0"


def source_digest(collection: TaskCollection) -> str:
    return sha256(collection.canonical_json().encode("utf-8")).hexdigest()


def _items(values: tuple[str, ...]) -> str:
    return ", ".join(values) if values else "—"


def render_tasks(collection: TaskCollection) -> str:
    """Render all canonical fields in stable dependency-aware canonical order."""
    graph = TaskGraph(collection)
    digest = source_digest(collection)
    lines = [
        "<!-- GENERATED FILE: edit tasks.json, then re-render. -->",
        "# Canonical tasks",
        "",
        f"- Feature: `{collection.feature_id}`",
        f"- Task schema: `{collection.schema_version}`",
        f"- Generator: `{GENERATOR_VERSION}`",
        f"- Source SHA-256: `{digest}`",
        f"- Requirements: {_items(collection.requirements)}",
        f"- Task count: {len(collection.tasks)}",
        "",
    ]
    for task_id in graph.topological_order:
        task = graph.tasks[task_id]
        lines.extend(
            [
                f"## {task.id} — {task.title}",
                "",
                task.description,
                "",
                f"- Phase: {task.phase}",
                f"- Dependencies: {_items(task.dependencies)}",
                f"- Requirements: {_items(task.requirement_ids)}",
                f"- Writes: {'yes' if task.writes else 'no'}",
                f"- Read paths: {_items(task.allowed_read_paths)}",
                f"- Write paths: {_items(task.allowed_write_paths)}",
                f"- Validation profiles: {_items(task.validation_profiles)}",
                f"- Completion criteria: {_items(task.completion_criteria)}",
                f"- Tests: {_items(task.tests)}",
                "",
            ]
        )
    return "\n".join(lines)
