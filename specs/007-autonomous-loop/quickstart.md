# Quickstart and Validation Guide: Autonomous Loop v2

**Purpose**: Validate the implemented safe local lifecycle slice and document the remaining controller boundaries.

## Current repository preflight (2026-07-12)

| Requirement | Observed | Result |
|---|---|---|
| Branch | `007-autonomous-loop` | Ready; do not switch. |
| Python | 3.9.12 | Not ready for implementation; install Python 3.11+ without changing application runtimes. |
| Git | 2.35.1.windows.2 | Available; implementation must define/probe its tested minimum and required flags. |
| Codex CLI | 0.144.0-alpha.4 | Exposes required non-interactive/schema/sandbox flags. |
| GitHub CLI | not installed/on PATH | Required only for `draft-pr`; dry-run/local must remain usable without it. |
| Existing worktree | `.specify/integrations/codex.manifest.json` modified by user | Preserve untouched; do not include in feature artifacts/commits. |

No command in this guide authorizes commit, push, PR creation, merge, or deployment during the specification phase.

## Planned prerequisites

1. Python 3.11 or newer, Git at the tested minimum, and Codex CLI with `exec --output-schema --json --sandbox --ephemeral`.
2. For `draft-pr` only: GitHub CLI on PATH and authenticated to the configured host/repository.
3. An implementation checkout or disposable test repository with no unrelated changes in the controller-owned feature worktree.
4. `.automation/state/` ignored by Git and committed `.studio-loop/` configuration validated.
5. Installation from the standalone tool directory, for example:

```powershell
py -3.11 -m venv tools/studio_loop/.venv
tools/studio_loop/.venv/Scripts/python -m pip install -e "tools/studio_loop[dev]"
```

POSIX shells use the corresponding `.venv/bin/python`. Dependency installation is an implementation-phase action and may require approved network access.

## Implemented foundation checks (2026-07-12)

The package foundations are now implemented. From the repository root, the commands below install and validate only the typed contracts, state store, task graph/scheduler, and renderer; they do not call Codex, GitHub, hooks, skills, commit, push, merge, or deployment.

```powershell
py -3.12 -m venv tools/studio_loop/.venv
tools/studio_loop/.venv/Scripts/python -m pip install -e "tools/studio_loop[dev]"
tools/studio_loop/.venv/Scripts/python -m pytest tools/studio_loop/tests -q
tools/studio_loop/.venv/Scripts/python -m ruff check tools/studio_loop
tools/studio_loop/.venv/Scripts/python -m ruff format --check tools/studio_loop
tools/studio_loop/.venv/Scripts/python -m mypy tools/studio_loop/src
```

## Implemented CLI slice

The package now exposes a non-interactive PowerShell-compatible CLI. `--json` emits exactly one structured object on stdout; readable diagnostics go to stderr. The implemented commands do not invoke Codex or GitHub and never commit, push, merge, rebase, reset, clean, delete a branch, or remove a worktree.

```powershell
tools/studio_loop/.venv/Scripts/studio-loop start --request-file C:\Temp\request.txt --slug "safe local change" --mode dry-run --json
tools/studio_loop/.venv/Scripts/studio-loop start --request-file C:\Temp\request.txt --slug "safe local change" --mode local --worktree-root C:\Temp\studio-worktrees --json
tools/studio_loop/.venv/Scripts/studio-loop status --feature 008-safe-local-change --json
tools/studio_loop/.venv/Scripts/studio-loop validate --feature 008-safe-local-change --json
tools/studio_loop/.venv/Scripts/studio-loop resume --feature 008-safe-local-change --mode local --json
tools/studio_loop/.venv/Scripts/studio-loop abort --feature 008-safe-local-change --reason "operator stop" --json
tools/studio_loop/.venv/Scripts/studio-loop render-tasks --feature 008-safe-local-change --check --json
```

`init` is an alias for `start`; `validate-tasks` is an alias for `validate`. `draft-pr` deliberately returns `NOT_IMPLEMENTED` before any mutation, until the GitHub publication service is implemented. `render-tasks` requires a previously created canonical `tasks.json` and is intentionally not a Planner.

`dry-run` only reads Git/specification evidence and reports the proposed number, branch, worktree and effects. `local` creates a non-forced branch and an isolated linked worktree only after verifying that the source worktree is clean. It writes `feature.json` only inside that isolated worktree. The default worktree root is a sibling named `<repository>-worktrees`, so it is portable on Windows and is not tied to a user profile.

## 1. Contract and static validation

```powershell
tools/studio_loop/.venv/Scripts/python -m pytest tools/studio_loop/tests/contract
tools/studio_loop/.venv/Scripts/python -m ruff check tools/studio_loop
tools/studio_loop/.venv/Scripts/python -m ruff format --check tools/studio_loop
tools/studio_loop/.venv/Scripts/python -m mypy tools/studio_loop/src
```

Expected:

- Every schema validates against Draft 2020-12 and accepts/rejects the documented fixtures.
- Role schemas reject extra fields, mismatched role/IDs, oversized collections, and unsupported versions.
- Static checks pass without modifying `frontend/` or `backend/`.

## 2. Environment doctor

The full `doctor` command remains planned. The available `start --mode dry-run` command performs the current safe repository and feature-allocation probes.

Expected:

- Dry-run/local do not require `gh` auth.
- Draft-pr reports missing/unauthenticated `gh`, wrong repository, or insufficient access precisely.
- Unsupported Python/Codex/Git/schema/config versions fail before branch/worktree/runtime mutation.
- Output contains no environment values or tokens.

## 3. Dry-run initialization

Create a request file outside committed paths, then run:

```powershell
studio-loop start --request-file C:\Temp\request.txt --slug sample-safe-change --mode dry-run --json
```

Expected:

- Reports exactly one next feature number, branch, worktree path, planned artifacts, role/profile, tasks, and effects.
- Creates no filesystem/runtime-cache/lock/branch/worktree/commit/remote/PR effect.
- Repeating with identical authoritative inputs gives identical decisions apart from run ID/timestamps.
- Existing unrelated modifications remain byte-for-byte unchanged.

## 4. Canonical task validation and rendering

Against a fixture feature created by tests:

```powershell
studio-loop validate --feature 008-sample-safe-change --json
studio-loop render-tasks --feature 008-sample-safe-change --check --json
```

Expected:

- Duplicate IDs, missing dependencies, cycles, unknown requirement/profile, unsafe paths, read-only writes, and missing tests fail.
- Valid graphs select a stable sequential order.
- Manual `tasks.md` edits cause drift failure; regeneration restores the view from `tasks.json`.

## 5. Local-mode integration fixture

Run only in a temporary repository constructed by the test suite:

```powershell
tools/studio_loop/.venv/Scripts/python -m pytest tools/studio_loop/tests/integration/test_local_loop.py -vv
```

Expected fixture flow:

1. Lock repository allocation and create one non-forced, locked linked worktree.
2. Invoke Planner/Implementer/Reviewer as separate fake-Codex processes; Debugger appears only after injected failure.
3. Reject malformed output and forbidden-path diff without a commit.
4. Execute fixed validation argv with shell disabled and sanitized environment.
5. Create exactly one logical commit for the accepted writing task with required trailers.
6. Leave read-only task without a commit and stop at `locally_complete` with no push/PR.

## 6. Recovery fault matrix

```powershell
tools/studio_loop/.venv/Scripts/python -m pytest tools/studio_loop/tests/recovery -vv
```

Inject a process loss immediately before and after every intended branch, worktree, invocation, validation, commit, push, and PR effect.

Expected:

- Deleting/corrupting `snapshot.json` triggers reconstruction.
- One incomplete final JSONL line may be quarantined under the documented rule; a corrupt complete/middle event blocks.
- Resume never duplicates a task commit, remote push effect, or Draft PR.
- Unexpected HEAD/remote/PR head or multiple matching PRs yields exit category `reconciliation_required`.
- Attempt budgets and stop requests survive restart.

## 7. Stop and abort

In a temporary long-running validation fixture:

```powershell
studio-loop stop --feature 008-sample-safe-change --reason "operator test" --json
studio-loop status --feature 008-sample-safe-change --rebuild --json
studio-loop resume --feature 008-sample-safe-change --mode local --json
studio-loop abort --feature 008-sample-safe-change --reason "abort test" --json
```

Expected:

- Stop dispatches no next task after the safe boundary and remains resumable.
- Resume reconciles before continuing.
- Mode remains unchanged/narrowed unless a local fixture in `stopped` or `locally_complete` is resumed with the exact `--mode draft-pr --allow-mode-upgrade` pair and passes fresh draft-pr preflight; every other upgrade attempt fails before a broader effect.
- Abort preserves evidence/branch/commits and does not force-remove a dirty worktree.
- No hook invokes automatic continuation.

## 8. Draft PR and CI with fake transport

```powershell
tools/studio_loop/.venv/Scripts/python -m pytest tools/studio_loop/tests/integration/test_draft_pr_loop.py -vv
```

Expected:

- Explicit push verifies expected remote SHA.
- Lost push response is reconciled before retry.
- One matching Draft PR is created or reused; duplicate/non-draft/wrong-head PR blocks.
- Pending, pass, fail, cancel, missing, and indeterminate checks are normalized for the current head SHA.
- CI repair is bounded and traverses normal task/diff/validation/review/commit/push gates.
- Passing checks stop at `ready_for_manual_review`; fake logs show no merge/deploy command.

## 9. Opt-in disposable GitHub smoke test

This test is implementation-phase only and requires an explicitly named disposable repository, dedicated test branch namespace, authenticated `gh`, and operator opt-in environment flag. It must refuse the production repository.

```powershell
tools/studio_loop/.venv/Scripts/python -m pytest tools/studio_loop/tests/smoke/test_disposable_github.py -m external -vv
```

Success criteria:

- Exactly one feature branch and one open Draft PR exist for the run.
- Draft PR head matches recorded remote SHA and required test checks are accurately reported.
- PR remains Draft and unmerged.
- No GCP/deployment operation occurs.
- Test cleanup, if enabled, is handled by the test harness under separate explicit authorization; controller V1 itself never auto-deletes remote evidence.

## 10. Final acceptance suite

```powershell
tools/studio_loop/.venv/Scripts/python -m pytest tools/studio_loop/tests --cov=studio_loop --cov-report=term-missing
studio-loop render-tasks --feature 008-sample-safe-change --check --json
git status --short
```

Expected:

- All lifecycle transitions, policy rejection classes, modes, retry exhaustion, recovery boundaries, secret canaries, and cross-platform path cases pass.
- Generated view is current.
- Only explicitly expected test fixture paths differ; application source is untouched.
- The feature is ready for human review, never merge or deployment.
