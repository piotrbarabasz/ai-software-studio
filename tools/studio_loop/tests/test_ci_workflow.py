from pathlib import Path

ROOT = Path(__file__).parents[3]
WORKFLOW = ROOT / ".github" / "workflows" / "autonomous-loop-ci.yml"


def test_autonomous_loop_workflow_is_read_only_cross_platform_and_complete() -> None:
    text = WORKFLOW.read_text(encoding="utf-8")

    for watched_path in (
        "tools/studio_loop/**",
        ".studio-loop/**",
        ".codex/**",
        ".agents/skills/studio-*/**",
        "specs/007-autonomous-loop/**",
        ".github/workflows/autonomous-loop-ci.yml",
    ):
        assert watched_path in text
    assert "permissions:\n  contents: read" in text
    assert "os: [ubuntu-latest, windows-latest]" in text
    assert "persist-credentials: false" in text
    uses = [line.strip() for line in text.splitlines() if line.strip().startswith("uses:")]
    assert uses
    assert all("@" in line and len(line.split("@", 1)[1].split()[0]) == 40 for line in uses)

    for gate in (
        "Full pytest suite",
        "Ruff lint",
        "Ruff format check",
        "MyPy strict",
        "Compile Python sources",
        "Validate JSON Schemas and TOML",
        "Test hooks",
        "Test skills and controller configuration",
        "Dry-run E2E",
        "Local E2E in a temporary repository",
        "Mocked draft-PR E2E",
    ):
        assert gate in text

    assert "vars.RUN_CODEX_EXECPOLICY == 'true'" in text
    assert "Require Codex CLI explicitly" in text
    forbidden = ("git push", "gh pr create", "gh pr merge", "git merge", "deploy")
    assert all(command not in text.lower() for command in forbidden)
