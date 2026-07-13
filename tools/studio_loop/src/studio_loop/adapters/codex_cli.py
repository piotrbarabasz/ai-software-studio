"""Construction of the supported Codex 0.144 non-interactive invocation."""

from __future__ import annotations

from pathlib import Path

from studio_loop.roles import RoleProfile


def build_codex_argv(
    executable: str,
    profile: RoleProfile,
    *,
    repository: Path,
    last_message_path: Path,
) -> tuple[str, ...]:
    """Return literal argv; paths with spaces remain one element and need no quoting."""

    argv = (
        executable,
        "--ask-for-approval",
        "never",
        "exec",
        "--model",
        profile.model,
        "-c",
        f'model_reasoning_effort="{profile.reasoning_effort}"',
        "-c",
        "sandbox_workspace_write.network_access=false",
        "-c",
        'web_search="disabled"',
        "-c",
        "features.apps=false",
        "-c",
        "features.multi_agent=false",
        "--sandbox",
        profile.sandbox,
        "--cd",
        str(repository),
        "--ephemeral",
        "--output-schema",
        str(profile.output_schema),
        "--output-last-message",
        str(last_message_path),
        "--json",
        "--color",
        "never",
        "-",
    )
    forbidden = {
        "danger-full-access",
        "--full-auto",
        "--search",
        "--ignore-rules",
        "--dangerously-bypass-hook-trust",
        "--dangerously-bypass-approvals-and-sandbox",
    }
    if forbidden.intersection(argv):
        raise ValueError("unsafe Codex CLI option")
    return argv
