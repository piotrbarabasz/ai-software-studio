# Quickstart and validation guide: Autonomous Loop

This guide describes the controller slice that exists in this checkout. Python 3.11+ is
required. `dry-run` is read-only. `local` creates an isolated feature branch/worktree, invokes
Planner and the sequential task roles, validates controller-observed diffs, and creates local
controller-owned commits. `draft-pr` additionally performs GitHub preflight, publishes only the
feature branch, reconciles one Draft PR, observes required checks for the exact remote SHA, runs
bounded CI repair when a failure maps unambiguously to a task, and stops at controller state
`READY_FOR_REVIEW`. It never marks the GitHub PR ready, approves, merges, closes, or deploys.

## Install and validate

From the repository root:

```powershell
py -3.11 -m venv tools/studio_loop/.venv
tools/studio_loop/.venv/Scripts/python -m pip install -e "tools/studio_loop[dev]"
tools/studio_loop/.venv/Scripts/python -m pytest tools/studio_loop/tests -ra
tools/studio_loop/.venv/Scripts/python -m ruff check tools/studio_loop .codex/hooks
tools/studio_loop/.venv/Scripts/python -m ruff format --check tools/studio_loop .codex/hooks
tools/studio_loop/.venv/Scripts/python -m mypy tools/studio_loop/src
tools/studio_loop/.venv/Scripts/python -m compileall -q tools/studio_loop/src .codex/hooks
```

On POSIX use `.venv/bin/python`. A skipped Codex ExecPolicy test means only that Codex CLI was
not installed; it is not evidence that command rules passed.

## Task validation profiles

Canonical task documents use schema `1.1.0` and the ordered, non-empty
`validation_profiles` list. Every identifier must exist in
`.studio-loop/validation-profiles.json`; duplicate or unknown IDs are rejected. The loader can
read a legacy schema `1.0.0` task containing the singular `validation_profile`, immediately
normalizes it to a one-item list, and writes/renders only the `1.1.0` format. Payloads that
contain both fields are invalid.

For frontend UX work the committed choices are `frontend-tests`, `frontend-lint`,
`frontend-format-check`, and `frontend-build`. The Planner selects identifiers only; it never
provides commands or runs installation steps. The controller runs every selected profile in
order, persists the ordered aggregate report, and permits review and commit only when all
results are `PASS`.

## CLI inspection and read-only dry-run

```powershell
tools/studio_loop/.venv/Scripts/studio-loop --help
$request = Join-Path $env:TEMP "studio-loop-request.md"
Set-Content -LiteralPath $request -Encoding utf8 -Value "title: Safe local change`nAdd a controlled local fixture."
tools/studio_loop/.venv/Scripts/studio-loop start --request-file $request --base 007-autonomous-loop --mode dry-run --json
```

The JSON response proposes a content-derived slug, branch, worktree and planned effects. The
command must not create a branch, worktree, runtime state, commit, remote update or PR. The
temporary filename never becomes the slug.

## Local lifecycle

Run `local` only from a clean source worktree and only after reviewing the dry-run proposal:

```powershell
tools/studio_loop/.venv/Scripts/studio-loop start --request-file $request --base 007-autonomous-loop --mode local --json
```

This is a mutating local operation. It creates a feature branch and linked worktree, calls the
configured Codex roles, writes validated Spec Kit artifacts through the controller, and may
create local commits. It never pushes, creates a PR, merges or deploys. Save the returned
`feature_id` and use the supported inspection commands:

```powershell
tools/studio_loop/.venv/Scripts/studio-loop status --feature <feature-id> --json
tools/studio_loop/.venv/Scripts/studio-loop status --feature <feature-id> --rebuild --json
tools/studio_loop/.venv/Scripts/studio-loop validate --feature <feature-id> --json
tools/studio_loop/.venv/Scripts/studio-loop render-tasks --feature <feature-id> --check --json
tools/studio_loop/.venv/Scripts/studio-loop resume --feature <feature-id> --mode local --json
tools/studio_loop/.venv/Scripts/studio-loop abort --feature <feature-id> --reason "operator decision" --json
```

`init` aliases `start`, and `validate-tasks` aliases `validate`. There is no `stop` command in
the current CLI. `abort` records the operator decision and preserves the branch, worktree,
commits and evidence. Recovery is conservative and blocks contradictory or ambiguous facts.
Resume first invokes conservative artifact/Git/remote/GitHub reconciliation. It can recover
missing lifecycle/controller cache from controller commit trailers and re-observe a lost push,
Draft PR creation, interrupted check poll, CI success, or in-progress CI repair. Contradictory
SHAs, PR identities, commit evidence, or multiple candidates return `BLOCKED`; never use a force
reset to make those facts agree.

## Local and Draft-PR integration fixtures

These tests create only temporary repositories/fake transports:

```powershell
tools/studio_loop/.venv/Scripts/python -m pytest tools/studio_loop/tests/test_cli_feature_git.py::test_start_dry_run_is_json_only_and_does_not_mutate -q
tools/studio_loop/.venv/Scripts/python -m pytest tools/studio_loop/tests/test_cli_feature_git.py::test_cli_local_lifecycle_and_draft_pr_controlled_stop -q
tools/studio_loop/.venv/Scripts/python -m pytest tools/studio_loop/tests/test_draft_pr_services.py -q
tools/studio_loop/.venv/Scripts/python -m pytest tools/studio_loop/tests/test_draft_pr_lifecycle.py -q
```

The Draft-PR lifecycle fixtures use a local bare remote, fake Codex roles and fake GitHub
transport. They verify planning/task pushes, one idempotent Draft PR, exact-head checks, bounded
repair through normal validation/review/commit gates, feature validation, manual PR-body text,
cache rebuild and crash recovery. They do not authorize a real GitHub operation.

## First real smoke test prerequisites

Do not run a real smoke test until every item is independently verified:

- the controller source worktree is clean;
- Codex CLI is installed;
- Codex is logged in correctly for the intended account;
- `gh` is installed;
- `gh auth status` succeeds for the intended GitHub host/account;
- the operator has access to the configured remote;
- branch `007-autonomous-loop` was pushed manually by the user;
- all local controller tests are PASS;
- the Autonomous Loop GitHub Actions workflow is PASS on Windows and Ubuntu;
- there are no unrelated changes in the participating worktrees;
- the user explicitly consents to exactly one test branch and one Draft PR.

These prerequisites do not themselves authorize the smoke test. The operator must still grant
explicit consent for exactly one disposable branch and one Draft PR. Merge and deployment remain
outside controller capabilities.
