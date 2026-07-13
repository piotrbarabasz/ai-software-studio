"""Typed Codex invocation result exposed to controller use cases."""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path
from typing import Any


class CodexExitCategory(StrEnum):
    SUCCESS = "success"
    TIMEOUT = "timeout"
    AUTH_FAILURE = "auth_failure"
    INVALID_OUTPUT = "invalid_output"
    MODEL_FAILURE = "model_failure"
    MODEL_UNAVAILABLE = "model_unavailable"
    CLI_NOT_FOUND = "cli_not_found"
    INVALID_REASONING_EFFORT = "invalid_reasoning_effort"


@dataclass(frozen=True)
class CodexInvocationResult:
    category: CodexExitCategory
    role: str
    output: dict[str, Any] | None
    exit_code: int | None
    attempts: int
    evidence_path: Path
    events_path: Path | None = None

    @property
    def succeeded(self) -> bool:
        return self.category is CodexExitCategory.SUCCESS
