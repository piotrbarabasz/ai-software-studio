"""Canonical role profile loading and validation."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal, cast

RoleName = Literal["planner", "implementer", "reviewer", "debugger"]
Sandbox = Literal["read-only", "workspace-write"]
_ROLES = {"planner", "implementer", "reviewer", "debugger"}
_EFFORTS = {"none", "minimal", "low", "medium", "high", "xhigh"}
_SANDBOXES = {"read-only", "workspace-write"}


class RoleConfigurationError(ValueError):
    """Raised before process start when a role profile is unsafe or unsupported."""


@dataclass(frozen=True)
class RoleProfile:
    name: RoleName
    model: str
    reasoning_effort: str
    sandbox: Sandbox
    prompt_template: Path
    output_schema: Path
    timeout_seconds: int
    retry_output_parsing: int
    max_output_bytes: int
    allowed_tools: tuple[str, ...]
    restrictions: tuple[str, ...]


def _required_string(data: dict[str, Any], key: str) -> str:
    value = data.get(key)
    if not isinstance(value, str) or not value:
        raise RoleConfigurationError(f"role field {key!r} must be a non-empty string")
    return value


def load_role_profiles(repository: Path) -> dict[RoleName, RoleProfile]:
    repository = repository.resolve()
    config_path = repository / ".studio-loop" / "roles.json"
    try:
        payload = json.loads(config_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise RoleConfigurationError(
            f"cannot load canonical role configuration: {error}"
        ) from error
    if set(payload) != {"schema_version", "roles"} or payload["schema_version"] != "1.0.0":
        raise RoleConfigurationError("unsupported or malformed roles.json")
    roles = payload.get("roles")
    if not isinstance(roles, dict) or set(roles) != _ROLES:
        raise RoleConfigurationError("roles.json must define exactly four canonical roles")

    profiles: dict[RoleName, RoleProfile] = {}
    for name, raw in roles.items():
        if not isinstance(raw, dict):
            raise RoleConfigurationError(f"role {name!r} must be an object")
        effort = _required_string(raw, "reasoning_effort")
        if effort not in _EFFORTS:
            raise RoleConfigurationError(f"unknown reasoning effort: {effort}")
        sandbox = _required_string(raw, "sandbox")
        if sandbox not in _SANDBOXES:
            raise RoleConfigurationError(f"unsafe or unknown sandbox: {sandbox}")
        if name in {"planner", "reviewer"} and sandbox != "read-only":
            raise RoleConfigurationError(f"role {name} must use read-only sandbox")
        timeout = raw.get("timeout_seconds")
        retries = raw.get("retry_output_parsing")
        output_limit = raw.get("max_output_bytes")
        if not isinstance(timeout, int) or not 1 <= timeout <= 3600:
            raise RoleConfigurationError(f"invalid timeout for role {name}")
        if not isinstance(retries, int) or not 0 <= retries <= 2:
            raise RoleConfigurationError(f"invalid output retry count for role {name}")
        if not isinstance(output_limit, int) or not 1024 <= output_limit <= 1_048_576:
            raise RoleConfigurationError(f"invalid output limit for role {name}")
        tools = raw.get("allowed_tools")
        restrictions = raw.get("restrictions")
        if not isinstance(tools, list) or not all(isinstance(item, str) for item in tools):
            raise RoleConfigurationError(f"invalid allowed tools for role {name}")
        if not isinstance(restrictions, list) or not all(
            isinstance(item, str) for item in restrictions
        ):
            raise RoleConfigurationError(f"invalid restrictions for role {name}")
        prompt_template = _contained_policy_file(
            repository, _required_string(raw, "prompt_template"), name, "prompt"
        )
        output_schema = _contained_policy_file(
            repository, _required_string(raw, "output_schema"), name, "schema"
        )
        profile = RoleProfile(
            name=name,
            model=_required_string(raw, "model"),
            reasoning_effort=effort,
            sandbox=cast(Sandbox, sandbox),
            prompt_template=prompt_template,
            output_schema=output_schema,
            timeout_seconds=timeout,
            retry_output_parsing=retries,
            max_output_bytes=output_limit,
            allowed_tools=tuple(tools),
            restrictions=tuple(restrictions),
        )
        if not profile.prompt_template.is_file() or not profile.output_schema.is_file():
            raise RoleConfigurationError(f"role {name} references a missing prompt or schema")
        profiles[name] = profile
    return profiles


def _contained_policy_file(repository: Path, raw_path: str, role: str, kind: str) -> Path:
    path = Path(raw_path)
    if path.is_absolute() or ".." in path.parts:
        raise RoleConfigurationError(f"role {role} {kind} path must be repository-relative")
    unresolved = repository / path
    current = repository
    for part in path.parts:
        current /= part
        if current.is_symlink():
            raise RoleConfigurationError(f"role {role} {kind} path uses a symlink")
    candidate = unresolved.resolve()
    try:
        candidate.relative_to(repository)
    except ValueError as error:
        raise RoleConfigurationError(f"role {role} {kind} path escapes repository") from error
    if not candidate.is_file():
        raise RoleConfigurationError(f"role {role} references a missing or unsafe {kind}")
    return candidate
