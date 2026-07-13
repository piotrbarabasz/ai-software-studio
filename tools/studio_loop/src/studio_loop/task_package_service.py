"""Controller-owned, atomic task and failure package construction."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any

from .models import TaskDefinition


def _now() -> str:
    return datetime.now(UTC).isoformat()


def _atomic_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with NamedTemporaryFile(
        "w", encoding="utf-8", dir=path.parent, prefix=f".{path.name}.", delete=False
    ) as stream:
        json.dump(payload, stream, ensure_ascii=False, indent=2, sort_keys=True)
        stream.write("\n")
        stream.flush()
        os.fsync(stream.fileno())
        temporary = Path(stream.name)
    os.replace(temporary, path)


@dataclass(frozen=True)
class BuiltPackage:
    path: Path
    payload: dict[str, Any]


class TaskPackageService:
    """Build bounded packages from controller observations, never agent claims."""

    def __init__(self, runtime_directory: Path) -> None:
        self.runtime_directory = runtime_directory.resolve()

    def task_package(
        self,
        *,
        feature_id: str,
        run_id: str,
        task: TaskDefinition,
        base_sha: str,
        branch: str,
        attempt: int,
        validation_profiles: tuple[str, ...],
        write: bool = True,
    ) -> BuiltPackage:
        payload: dict[str, Any] = {
            "schema_version": "1.0.0",
            "package_type": "task",
            "created_at": _now(),
            "feature_id": feature_id,
            "run_id": run_id,
            "task_id": task.id,
            "task": task.model_dump(mode="json"),
            "base_sha": base_sha,
            "branch": branch,
            "allowed_read_paths": list(task.allowed_read_paths),
            "allowed_write_paths": list(task.allowed_write_paths),
            "validation_profiles": list(validation_profiles),
            "attempt": attempt,
        }
        path = self.runtime_directory / run_id / task.id / "task-package.json"
        if write:
            _atomic_json(path, payload)
        return BuiltPackage(path, payload)

    def failure_package(
        self,
        package: BuiltPackage,
        *,
        failure_class: str,
        summary: str,
        diff: str,
        validation_reports: list[dict[str, Any]],
        reviewer_output: dict[str, Any] | None,
        remaining_debugger_attempts: int,
        write: bool = True,
    ) -> BuiltPackage:
        payload = dict(package.payload)
        payload.update(
            {
                "package_type": "failure",
                "failure_package": {
                    "schema_version": "1.0.0",
                    "feature_id": payload["feature_id"],
                    "task_id": payload["task_id"],
                    "failure_class": failure_class,
                    "summary": summary[:2000],
                    "diff": diff[:131072],
                    "validation_reports": validation_reports,
                    "reviewer_output": reviewer_output,
                    "remaining_debugger_attempts": remaining_debugger_attempts,
                },
                "recorded_failure": {"class": failure_class, "summary": summary[:2000]},
            }
        )
        path = package.path.with_name("failure-package.json")
        if write:
            _atomic_json(path, payload)
        return BuiltPackage(path, payload)

    def review_package(
        self,
        package: BuiltPackage,
        *,
        diff: str,
        changed_paths: tuple[str, ...],
        validation_reports: list[dict[str, Any]],
        write: bool = True,
    ) -> BuiltPackage:
        payload = dict(package.payload)
        payload.update(
            {
                "package_type": "review",
                "controller_evidence": {
                    "diff": diff[:131072],
                    "changed_paths": list(changed_paths),
                    "validation_reports": validation_reports,
                    "all_validations_passed": all(
                        report.get("status") == "PASS" for report in validation_reports
                    ),
                },
            }
        )
        path = package.path.with_name("review-package.json")
        if write:
            _atomic_json(path, payload)
        return BuiltPackage(path, payload)
