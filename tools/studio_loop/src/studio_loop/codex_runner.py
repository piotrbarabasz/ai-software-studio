"""Controller-owned invocation of isolated Planner/Implementer/Reviewer/Debugger roles."""

from __future__ import annotations

import json
import os
import re
import tempfile
from collections.abc import Mapping
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, cast

from jsonschema import Draft202012Validator  # type: ignore[import-untyped]

from studio_loop.adapters.codex_cli import build_codex_argv
from studio_loop.adapters.subprocesses import (
    ProcessExecutableNotFound,
    ProcessResult,
    SubprocessExecutor,
)
from studio_loop.ports.codex import CodexExitCategory, CodexInvocationResult
from studio_loop.prompts import render_role_prompt
from studio_loop.redaction import known_secrets, redact
from studio_loop.roles import RoleConfigurationError, RoleName, RoleProfile, load_role_profiles

_ENV_ALLOWLIST = {
    "CODEX_HOME",
    "COMSPEC",
    "HOME",
    "LANG",
    "LOCALAPPDATA",
    "PATH",
    "PATHEXT",
    "SYSTEMDRIVE",
    "SYSTEMROOT",
    "TEMP",
    "TMP",
    "USERPROFILE",
    "WINDIR",
}
_AUTH = re.compile(r"(?:401|403|unauthori[sz]ed|authentication|not logged in|login required)", re.I)
_MODEL_UNAVAILABLE = re.compile(
    r"(?:model).*(?:not found|unavailable|unsupported|does not exist|no access|not available)", re.I
)
_BAD_EFFORT = re.compile(
    r"(?:(?:reasoning|effort).*(?:invalid|unknown|unsupported)|"
    r"(?:invalid|unknown|unsupported).*(?:reasoning|effort))",
    re.I,
)
_EVENT_KEYS = {"type", "timestamp"}
_EVENT_TYPES = {
    "error",
    "item.completed",
    "item.started",
    "item.updated",
    "thread.started",
    "turn.completed",
    "turn.failed",
    "turn.started",
}
_EVENT_TIMESTAMP = re.compile(r"^[0-9TZ:+.-]{10,40}$")


class CodexPolicyError(ValueError):
    """The requested invocation violates a controller-enforced role precondition."""


def _utc_now() -> str:
    return datetime.now(UTC).isoformat()


def _controlled_environment(source: Mapping[str, str]) -> dict[str, str]:
    return {name: value for name, value in source.items() if name.upper() in _ENV_ALLOWLIST}


def _category_for_failure(stderr: str) -> CodexExitCategory:
    if _AUTH.search(stderr):
        return CodexExitCategory.AUTH_FAILURE
    if _MODEL_UNAVAILABLE.search(stderr):
        return CodexExitCategory.MODEL_UNAVAILABLE
    if _BAD_EFFORT.search(stderr):
        return CodexExitCategory.INVALID_REASONING_EFFORT
    return CodexExitCategory.MODEL_FAILURE


def _task_id(payload: Any) -> str | None:
    if isinstance(payload, dict):
        value = payload.get("task_id")
        if isinstance(value, str):
            return value
        task = payload.get("task")
        if isinstance(task, dict) and isinstance(task.get("id"), str):
            return cast(str, task["id"])
    return None


def _has_recorded_failure(payload: Any) -> bool:
    return isinstance(payload, dict) and any(
        payload.get(key) for key in ("failure", "failures", "failure_package", "recorded_failure")
    )


class CodexRunner:
    """Run one role per fresh ephemeral Codex process and validate its final output."""

    def __init__(
        self,
        repository: Path,
        *,
        executable: str = "codex",
        evidence_directory: Path | None = None,
        executor: SubprocessExecutor | None = None,
        environment: Mapping[str, str] | None = None,
        collect_jsonl_events: bool = True,
    ) -> None:
        self.repository = repository.resolve()
        self.executable = executable
        self.evidence_directory = (
            evidence_directory.resolve()
            if evidence_directory is not None
            else self.repository / ".automation" / "state" / "codex"
        )
        self.executor = executor or SubprocessExecutor()
        self.source_environment = dict(environment if environment is not None else os.environ)
        self.collect_jsonl_events = collect_jsonl_events

    def build_argv(self, profile: RoleProfile, last_message_path: Path) -> tuple[str, ...]:
        return build_codex_argv(
            self.executable,
            profile,
            repository=self.repository,
            last_message_path=last_message_path,
        )

    def run(
        self,
        role: RoleName,
        task_package_path: Path,
        *,
        invocation_id: str,
    ) -> CodexInvocationResult:
        self.evidence_directory.mkdir(parents=True, exist_ok=True)
        package_path = task_package_path.resolve()
        try:
            package_path.relative_to(self.repository)
        except ValueError as error:
            raise CodexPolicyError(
                "task package must be inside the invocation workspace"
            ) from error
        try:
            package = json.loads(package_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise CodexPolicyError(f"task package is missing or invalid: {error}") from error

        try:
            profiles = load_role_profiles(self.repository)
        except RoleConfigurationError as error:
            category = (
                CodexExitCategory.INVALID_REASONING_EFFORT
                if "reasoning effort" in str(error)
                else CodexExitCategory.MODEL_FAILURE
            )
            return self._configuration_failure(role, invocation_id, category, str(error))
        profile = profiles[role]
        if role == "debugger" and not _has_recorded_failure(package):
            raise CodexPolicyError("debugger requires a recorded failure in the same task package")

        schema = json.loads(profile.output_schema.read_text(encoding="utf-8"))
        Draft202012Validator.check_schema(schema)
        validator = Draft202012Validator(schema)
        prompt = render_role_prompt(profile, package_path)
        controlled_env = _controlled_environment(self.source_environment)
        # These values are metadata, not authority: the controller still validates
        # paths and diffs after the process exits. They let optional project hooks
        # reject obviously out-of-contract edits before a tool call executes.
        controlled_env["STUDIO_LOOP_ROLE"] = role
        controlled_env["STUDIO_LOOP_ALLOWED_WRITE_PATHS"] = json.dumps(
            package.get("allowed_write_paths", []), separators=(",", ":")
        )
        secrets = known_secrets(self.source_environment)
        last_invalid_reason = ""

        for attempt in range(1, profile.retry_output_parsing + 2):
            if attempt > 1:
                prompt = (
                    f"{prompt.rstrip()}\nThe previous final response was rejected as invalid "
                    f"({last_invalid_reason}). Return one schema-valid JSON object only.\n"
                )
            raw_file = self._raw_output_path(invocation_id, attempt)
            argv = self.build_argv(profile, raw_file)
            started_at = _utc_now()
            try:
                process = self.executor.execute(
                    argv,
                    cwd=self.repository,
                    stdin=prompt.encode("utf-8"),
                    environment=controlled_env,
                    timeout_seconds=profile.timeout_seconds,
                    max_output_bytes=profile.max_output_bytes,
                )
            except ProcessExecutableNotFound:
                return self._finish(
                    profile,
                    invocation_id,
                    CodexExitCategory.CLI_NOT_FOUND,
                    None,
                    attempt,
                    None,
                    started_at,
                    "Codex CLI executable was not found",
                )

            if process.timed_out:
                self._remove_raw(raw_file)
                return self._finish(
                    profile,
                    invocation_id,
                    CodexExitCategory.TIMEOUT,
                    None,
                    attempt,
                    process,
                    started_at,
                    "Codex process exceeded its configured timeout",
                )
            stderr = redact(process.stderr.decode("utf-8", errors="replace"), secrets)
            if process.exit_code != 0:
                self._remove_raw(raw_file)
                return self._finish(
                    profile,
                    invocation_id,
                    _category_for_failure(stderr),
                    None,
                    attempt,
                    process,
                    started_at,
                    stderr,
                )
            try:
                raw = raw_file.read_text(encoding="utf-8")
            except OSError:
                raw = ""
            sanitized = redact(raw, secrets)
            self._remove_raw(raw_file)
            if len(sanitized.encode("utf-8")) > profile.max_output_bytes:
                last_invalid_reason = "output limit exceeded"
                continue
            try:
                output = json.loads(sanitized)
            except json.JSONDecodeError:
                last_invalid_reason = "invalid JSON"
                continue
            errors = sorted(validator.iter_errors(output), key=lambda item: list(item.path))
            if errors:
                last_invalid_reason = f"schema violation at {list(errors[0].path)}"
                continue
            expected_task = _task_id(package)
            actual_task = output.get("task_id") if isinstance(output, dict) else None
            if role != "planner" and expected_task is not None and actual_task != expected_task:
                last_invalid_reason = "task identity mismatch"
                continue
            return self._finish(
                profile,
                invocation_id,
                CodexExitCategory.SUCCESS,
                output,
                attempt,
                process,
                started_at,
                "structured output accepted",
            )

        return self._finish(
            profile,
            invocation_id,
            CodexExitCategory.INVALID_OUTPUT,
            None,
            profile.retry_output_parsing + 1,
            process,
            started_at,
            last_invalid_reason,
        )

    def _raw_output_path(self, invocation_id: str, attempt: int) -> Path:
        safe_id = re.sub(r"[^A-Za-z0-9_.-]", "_", invocation_id)[:128]
        descriptor, name = tempfile.mkstemp(
            prefix=f".{safe_id}-{attempt}-", suffix=".raw", dir=self.evidence_directory
        )
        os.close(descriptor)
        return Path(name)

    @staticmethod
    def _remove_raw(path: Path) -> None:
        try:
            path.unlink()
        except FileNotFoundError:
            pass

    def _configuration_failure(
        self,
        role: RoleName,
        invocation_id: str,
        category: CodexExitCategory,
        summary: str,
    ) -> CodexInvocationResult:
        evidence = self.evidence_directory / f"{invocation_id}.invocation.json"
        evidence.write_text(
            json.dumps(
                {
                    "role": role,
                    "category": category.value,
                    "started_at": _utc_now(),
                    "ended_at": _utc_now(),
                    "exit_code": None,
                    "attempts": 0,
                    "summary": redact(summary),
                },
                indent=2,
                sort_keys=True,
            )
            + "\n",
            encoding="utf-8",
        )
        return CodexInvocationResult(category, role, None, None, 0, evidence)

    def _finish(
        self,
        profile: RoleProfile,
        invocation_id: str,
        category: CodexExitCategory,
        output: dict[str, Any] | None,
        attempts: int,
        process: ProcessResult | None,
        started_at: str,
        summary: str,
    ) -> CodexInvocationResult:
        safe_id = re.sub(r"[^A-Za-z0-9_.-]", "_", invocation_id)[:128]
        final_path = self.evidence_directory / f"{safe_id}.final.json"
        if output is not None:
            final_path.write_text(
                json.dumps(output, indent=2, sort_keys=True, ensure_ascii=False) + "\n",
                encoding="utf-8",
            )
        events_path = self._write_events(safe_id, process) if self.collect_jsonl_events else None
        evidence_path = self.evidence_directory / f"{safe_id}.invocation.json"
        argv = list(process.argv) if process is not None else []
        evidence = {
            "role": profile.name,
            "model": profile.model,
            "reasoning_effort": profile.reasoning_effort,
            "sandbox": profile.sandbox,
            "category": category.value,
            "started_at": started_at,
            "ended_at": _utc_now(),
            "exit_code": process.exit_code if process is not None else None,
            "attempts": attempts,
            "output_truncated": process.output_truncated if process is not None else False,
            "argv": argv,
            "summary": redact(summary),
            "final_output_path": str(final_path) if output is not None else None,
            "events_path": str(events_path) if events_path is not None else None,
        }
        evidence_path.write_text(
            json.dumps(evidence, indent=2, sort_keys=True, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        return CodexInvocationResult(
            category=category,
            role=profile.name,
            output=output,
            exit_code=process.exit_code if process is not None else None,
            attempts=attempts,
            evidence_path=evidence_path,
            events_path=events_path,
        )

    def _write_events(self, safe_id: str, process: ProcessResult | None) -> Path | None:
        if process is None or not process.stdout:
            return None
        sanitized: list[dict[str, Any]] = []
        for line in process.stdout.decode("utf-8", errors="replace").splitlines():
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(event, dict):
                safe_event = {
                    key: event[key]
                    for key in _EVENT_KEYS
                    if key in event and isinstance(event[key], str)
                }
                if safe_event.get("type") not in _EVENT_TYPES:
                    continue
                timestamp = safe_event.get("timestamp")
                if timestamp is not None and not _EVENT_TIMESTAMP.fullmatch(timestamp):
                    safe_event.pop("timestamp")
                if safe_event:
                    sanitized.append(safe_event)
        if not sanitized:
            return None
        path = self.evidence_directory / f"{safe_id}.events.jsonl"
        path.write_text(
            "".join(json.dumps(event, sort_keys=True) + "\n" for event in sanitized),
            encoding="utf-8",
        )
        return path
