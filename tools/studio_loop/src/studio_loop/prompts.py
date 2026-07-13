"""Small prompt rendering boundary; task details stay in a task package file."""

from __future__ import annotations

from pathlib import Path

from studio_loop.roles import RoleProfile


def render_role_prompt(profile: RoleProfile, task_package: Path) -> str:
    template = profile.prompt_template.read_text(encoding="utf-8")
    rendered = template.replace("{{TASK_PACKAGE_PATH}}", str(task_package))
    tools = ", ".join(profile.allowed_tools)
    restrictions = ", ".join(profile.restrictions)
    return (
        f"{rendered.rstrip()}\nAllowed capability classes: {tools}. Restrictions: {restrictions}.\n"
    )
