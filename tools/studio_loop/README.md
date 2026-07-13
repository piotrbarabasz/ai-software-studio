# studio-loop

Deterministic Python 3.11+ controller for one isolated feature at a time. Install from the
repository root with:

```powershell
py -3.11 -m pip install -e "tools/studio_loop[dev]"
studio-loop --help
```

`dry-run` is read-only. `local` may create an isolated branch/worktree, invoke configured Codex
roles, validate the real Git diff, and create controller-owned local commits. Agents never own
Git or runtime state. Future-feature `tasks.json` is canonical; `tasks.md` is generated.

The `gh`, Draft-PR, required-check and recovery services have isolated tests, but the current
CLI lifecycle does not compose remote publication. `draft-pr` performs preflight and stops at an
explicit `BLOCKED` boundary without push or PR creation. There is no merge, PR-close or
deployment capability.

Run the complete controller gate:

```powershell
python -m pytest tools/studio_loop/tests -ra
python -m ruff check tools/studio_loop .codex/hooks
python -m ruff format --check tools/studio_loop .codex/hooks
python -m mypy tools/studio_loop/src
python -m compileall -q tools/studio_loop/src .codex/hooks
```

See [the feature quickstart](../../specs/007-autonomous-loop/quickstart.md) for the supported CLI,
known resume boundary, temporary-repository E2E commands, and the mandatory prerequisites for
the first real smoke test.
