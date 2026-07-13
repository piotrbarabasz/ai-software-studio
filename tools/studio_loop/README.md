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

`draft-pr` composes the `gh`, publication, one-Draft-PR, exact-SHA required-check, bounded repair
and recovery services. It stops at controller state `READY_FOR_REVIEW` while the GitHub PR stays
Draft for manual review. There is no merge, approval, PR-close, force-push or deployment
capability.

Run the complete controller gate:

```powershell
python -m pytest tools/studio_loop/tests -ra
python -m ruff check tools/studio_loop .codex/hooks
python -m ruff format --check tools/studio_loop .codex/hooks
python -m mypy tools/studio_loop/src
python -m compileall -q tools/studio_loop/src .codex/hooks
```

See [the feature quickstart](../../specs/007-autonomous-loop/quickstart.md) for the supported CLI,
recovery boundaries, temporary-repository E2E commands, and the mandatory prerequisites for
the first real smoke test.
