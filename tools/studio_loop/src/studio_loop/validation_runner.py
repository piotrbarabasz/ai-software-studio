"""Trusted, shell-free validation profile execution."""

from __future__ import annotations

import json
import os
import subprocess
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from .redaction import known_secrets, redact


def _now() -> str:
    return datetime.now(UTC).isoformat()


@dataclass(frozen=True)
class ValidationProfile:
    name: str
    argv: tuple[str, ...]
    working_directory: str
    timeout_seconds: int = 900
    max_output_bytes: int = 65536


@dataclass(frozen=True)
class ValidationReport:
    profile: str
    argv: tuple[str, ...]
    working_directory: str
    started_at: str
    ended_at: str
    exit_code: int | None
    stdout: str
    stderr: str
    truncated: bool
    truncation_marker: str | None
    status: str

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class TaskValidationReport:
    """Ordered controller evidence for every required validation of one task."""

    task_id: str
    required_profiles: tuple[str, ...]
    results: tuple[ValidationReport, ...]
    passed: bool

    def as_dict(self) -> dict[str, Any]:
        return {
            "task_id": self.task_id,
            "passed": self.passed,
            "required_profiles": list(self.required_profiles),
            "results": [result.as_dict() for result in self.results],
        }


class ValidationPolicyError(ValueError):
    pass


class ValidationRunner:
    """Load committed argv/cwd pairs and execute only named profiles."""

    _ENV_ALLOWLIST = {
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

    def __init__(
        self,
        repository: Path,
        *,
        config_path: Path | None = None,
        evidence_directory: Path | None = None,
        environment: dict[str, str] | None = None,
    ) -> None:
        self.repository = repository.resolve()
        self.config_path = (
            config_path or self.repository / ".studio-loop" / "validation-profiles.json"
        )
        self.evidence_directory = evidence_directory
        self.environment = dict(os.environ if environment is None else environment)
        self.profiles = self._load()

    def _load(self) -> dict[str, ValidationProfile]:
        try:
            payload = json.loads(self.config_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise ValidationPolicyError(f"cannot load validation profiles: {error}") from error
        if set(payload) != {"schema_version", "profiles"} or payload["schema_version"] != "1.0.0":
            raise ValidationPolicyError("unsupported validation profile document")
        raw_profiles = payload.get("profiles")
        if not isinstance(raw_profiles, dict):
            raise ValidationPolicyError("profiles must be an object")
        profiles: dict[str, ValidationProfile] = {}
        for name, raw in raw_profiles.items():
            if not isinstance(name, str) or not isinstance(raw, dict):
                raise ValidationPolicyError("invalid profile entry")
            allowed_keys = {"argv", "working_directory", "timeout_seconds", "max_output_bytes"}
            if set(raw) - allowed_keys:
                raise ValidationPolicyError(f"profile {name} has unsupported command fields")
            argv = raw.get("argv")
            cwd = raw.get("working_directory")
            if (
                not isinstance(argv, list)
                or not argv
                or not all(isinstance(item, str) and item and "\0" not in item for item in argv)
                or not isinstance(cwd, str)
            ):
                raise ValidationPolicyError(f"profile {name} must define literal argv and cwd")
            profile = ValidationProfile(
                name=name,
                argv=tuple(argv),
                working_directory=cwd,
                timeout_seconds=int(raw.get("timeout_seconds", 900)),
                max_output_bytes=int(raw.get("max_output_bytes", 65536)),
            )
            if profile.timeout_seconds < 1 or profile.max_output_bytes < 1024:
                raise ValidationPolicyError(f"profile {name} has unsafe limits")
            self._cwd(profile)
            profiles[name] = profile
        return profiles

    def _cwd(self, profile: ValidationProfile) -> Path:
        value = profile.working_directory.replace("\\", "/")
        candidate = self.repository / value
        try:
            resolved = candidate.resolve()
            resolved.relative_to(self.repository)
        except (OSError, ValueError) as error:
            raise ValidationPolicyError(
                f"profile {profile.name} working directory escapes repository"
            ) from error
        if not resolved.is_dir():
            raise ValidationPolicyError(f"profile {profile.name} working directory is missing")
        return resolved

    def ensure_known(self, names: tuple[str, ...]) -> None:
        unknown = sorted(set(names) - set(self.profiles))
        if unknown:
            raise ValidationPolicyError(
                "validation command is outside the committed allowlist: " + ", ".join(unknown)
            )

    def run(self, profile_name: str) -> ValidationReport:
        self.ensure_known((profile_name,))
        profile = self.profiles[profile_name]
        cwd = self._cwd(profile)
        environment = {
            key: value
            for key, value in self.environment.items()
            if key.upper() in self._ENV_ALLOWLIST
        }
        started = _now()
        exit_code: int | None
        status: str
        try:
            result = subprocess.run(
                list(profile.argv),
                cwd=cwd,
                env=environment,
                stdin=subprocess.DEVNULL,
                capture_output=True,
                timeout=profile.timeout_seconds,
                shell=False,
                check=False,
            )
            exit_code = result.returncode
            stdout_bytes, stderr_bytes = result.stdout, result.stderr
            status = "PASS" if exit_code == 0 else "FAIL"
        except subprocess.TimeoutExpired as error:
            exit_code = None
            stdout_bytes = error.stdout or b""
            stderr_bytes = error.stderr or b""
            status = "TIMEOUT"
        except OSError as error:
            exit_code = None
            stdout_bytes = b""
            stderr_bytes = str(error).encode("utf-8", errors="replace")
            status = "ERROR"
        limit = profile.max_output_bytes
        truncated = len(stdout_bytes) > limit or len(stderr_bytes) > limit
        marker = f"[output truncated to {limit} bytes]" if truncated else None
        secrets = known_secrets(self.environment)
        stdout = redact(stdout_bytes[:limit].decode("utf-8", errors="replace"), secrets)
        stderr = redact(stderr_bytes[:limit].decode("utf-8", errors="replace"), secrets)
        report = ValidationReport(
            profile=profile.name,
            argv=tuple(redact(argument, secrets) for argument in profile.argv),
            working_directory=profile.working_directory,
            started_at=started,
            ended_at=_now(),
            exit_code=exit_code,
            stdout=stdout,
            stderr=stderr,
            truncated=truncated,
            truncation_marker=marker,
            status=status,
        )
        if self.evidence_directory is not None:
            self.evidence_directory.mkdir(parents=True, exist_ok=True)
            path = self.evidence_directory / f"{profile.name}-{started.replace(':', '-')}.json"
            path.write_text(
                json.dumps(report.as_dict(), indent=2, sort_keys=True) + "\n", encoding="utf-8"
            )
        return report

    def run_many(self, task_id: str, profile_names: tuple[str, ...]) -> TaskValidationReport:
        """Run the trusted profiles in declared order and preserve every observation."""
        if not profile_names:
            raise ValidationPolicyError("task validation profiles must not be empty")
        self.ensure_known(profile_names)
        results = tuple(self.run(profile_name) for profile_name in profile_names)
        report = TaskValidationReport(
            task_id=task_id,
            required_profiles=profile_names,
            results=results,
            passed=all(result.status == "PASS" for result in results),
        )
        if self.evidence_directory is not None:
            self.evidence_directory.mkdir(parents=True, exist_ok=True)
            path = self.evidence_directory / f"{task_id}-validation-report.json"
            path.write_text(
                json.dumps(report.as_dict(), indent=2, sort_keys=True) + "\n", encoding="utf-8"
            )
        return report
