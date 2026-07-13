# CLI Contract: `studio-loop`

**Contract version**: 1.0.0  
**Transport**: local process, UTF-8 stdin/stdout/stderr  
**Entrypoint**: `python -m studio_loop` after installation from `tools/studio_loop/`

## Global rules

- Commands are non-interactive by default. Required choices must be explicit flags; no hidden prompt may authorize an effect.
- `--repo PATH` defaults to discovery from the current directory but resolves to a canonical repository root.
- `--feature NNN-slug` selects one feature. Mutating/resume commands require it once initialized.
- `--mode` accepts only `dry-run`, `local`, or `draft-pr`; omitted mode defaults to `dry-run` for initialization and never broadens an existing run. Dry-run is not persisted and therefore cannot be resumed.
- `--json` emits exactly one final JSON status object to stdout. Progress/events go to stderr as JSONL only with `--events-json`.
- Human output does not rely on color; `--no-color` is supported and CI/non-TTY defaults to no color.
- Paths printed to humans are repository-relative where possible. Secret-like values are redacted before either stream.
- No CLI command exists for merge, rebase, force-push, PR approval/readiness, or deployment.

## Commands

### `doctor`

```text
studio-loop doctor [--mode MODE] [--json]
```

Read-only checks: Python/controller/config/schema compatibility, repository identity, Git version/features, Codex CLI flags, runtime ignore rule, writable state/worktree parents, protected-path policy, and (draft-pr only) `gh` version/auth/repository access. It reports every failed prerequisite in one run when safe.

### `init`

```text
studio-loop init --request-file FILE [--slug SLUG] [--base BRANCH]
                 [--mode MODE] [--json]
```

Accepts one UTF-8 request file, computes the next feature proposal, validates safety, and in dry-run reports proposed artifacts/branch/worktree/effects. `local` or `draft-pr` may reserve the feature, branch, and worktree only after capability checks. Raw request content is not copied to runtime logs; a digest and sanitized feature description are recorded.

### `plan`

```text
studio-loop plan --feature FEATURE [--mode MODE] [--json]
```

Runs one Planner process to create/complete allowed feature artifacts and a canonical `tasks.json`, validates schemas/semantics/paths, renders `tasks.md`, and stops at `ready`. It cannot implement tasks, commit, push, or open a PR.

### `validate-tasks`

```text
studio-loop validate-tasks --feature FEATURE [--json]
```

Read-only validation of canonical task schema, requirement coverage, paths, profiles, graph, deterministic order, and generated Markdown digest/drift.

### `render-tasks`

```text
studio-loop render-tasks --feature FEATURE [--check] [--json]
```

Without `--check`, rewrites only the declared generated `tasks.md` from validated `tasks.json`. With `--check`, performs no write and fails on drift. It never reads runtime task state as task authority.

### `run`

```text
studio-loop run --feature FEATURE --mode MODE [--until TASK_OR_STATE]
                [--json] [--events-json]
```

Acquires the feature lock, reconciles state, and executes eligible tasks sequentially. `--until` may narrow work to a declared task/state but cannot skip dependencies or gates. `dry-run` reports decisions only; `local` may write/validate/review/commit locally; `draft-pr` additionally may push, create/reconcile one Draft PR, and observe checks.

### `status`

```text
studio-loop status --feature FEATURE [--rebuild] [--json]
```

Read-only status. Default validates snapshot/event head against cheap repository facts. `--rebuild` ignores the snapshot and reconstructs from events, feature artifacts, Git/worktrees/trailers, remote SHA, and GitHub facts when available/authorized; it makes no mutation beyond a fresh local cache snapshot.

### `resume`

```text
studio-loop resume --feature FEATURE [--mode MODE] [--allow-mode-upgrade]
                   [--json] [--events-json]
```

Reconciles every in-flight effect, validates compatibility and budgets, clears a satisfied stop request through an explicit event, and continues from the derived safe state. It blocks on ambiguity. Mode may remain the same or narrow. The only supported upgrade is a reconciled `local` run at a safe stopped or locally-complete boundary to `draft-pr`, requested with the exact pair `--mode draft-pr --allow-mode-upgrade`; the controller must then run fresh draft-pr doctor/preflight before any push/PR/check effect. The flag is invalid for every other source/target/state combination.

### `stop`

```text
studio-loop stop --feature FEATURE [--reason TEXT] [--json]
```

Records a durable stop request. If another process owns the lock, it observes the request before dispatching another task and stops after its current atomic adapter operation. The command does not call `resume`, kill Git, clean files, or remove the worktree.

### `abort`

```text
studio-loop abort --feature FEATURE --reason TEXT
                  [--remove-clean-worktree] [--json]
```

Records an irreversible terminal automation decision after safe-boundary reconciliation. Default preserves worktree, branch, commits, artifacts, event log, and evidence. Optional worktree removal is allowed only when policy permits, ownership is proven, the tree is clean, no effect is in flight, and Git removes it without force. Branch/history/remote/PR are never deleted automatically.

### `events`

```text
studio-loop events --feature FEATURE [--after SEQUENCE] [--type TYPE]
                   [--jsonl]
```

Read-only sanitized audit stream with chain validation. Raw prompts, environment values, and unredacted process output are not exposed.

## Final JSON response

Every `--json` command returns a closed object containing:

```json
{
  "contract_version": "1.0.0",
  "ok": true,
  "exit_category": "success",
  "feature_id": "007-example",
  "run_id": "run-opaque",
  "feature_state": "ready",
  "mode": "dry-run",
  "effects_performed": [],
  "next_safe_action": "run --mode local",
  "diagnostics": []
}
```

Fields may be null when no feature/run exists, but they are never omitted. `effects_performed` contains redacted effect kinds/IDs only. Diagnostics contain stable code, category, summary, retryability, and evidence references.

## Stable exit categories

| Code | Category | Meaning |
|---:|---|---|
| 0 | `success` | Requested operation reached its expected safe result. |
| 2 | `usage_error` | Invalid CLI syntax or incompatible flag. |
| 3 | `preflight_failed` | Missing/unsupported dependency or configuration. |
| 4 | `policy_rejected` | Mode, path, command, secret, diff, or role policy denied an action. |
| 5 | `task_failed` | Task/review/validation exhausted or non-retryable. |
| 6 | `external_failed` | Git/Codex/GitHub/CI failed conclusively. |
| 7 | `interrupted` | Safe stop or external interruption; resumable unless reported otherwise. |
| 8 | `reconciliation_required` | Evidence is ambiguous/conflicting; no automatic continuation. |
| 9 | `lock_unavailable` | Another valid owner holds repository/feature lock. |

Specific underlying tool exit codes are evidence, not the public controller exit contract.

## Command capability matrix

| Effect | doctor/status/events | dry-run | local | draft-pr |
|---|---:|---:|---:|---:|
| Read artifacts/Git facts | yes | yes | yes | yes |
| Create runtime cache/lock | bounded status cache only when explicitly rebuilding an existing feature | no | yes | yes |
| Create feature branch/worktree | no | no | yes | yes |
| Agent workspace write | no | no | yes | yes |
| Trusted validation | probe only | report | yes | yes |
| Local task commit | no | no | yes | yes |
| Push feature branch | no | no | no | yes |
| Create/reconcile Draft PR | no mutation | no | no | yes |
| Observe required checks | explicit read probe | report only | no | yes |
| Merge/deploy/rebase/force-clean | never | never | never | never |

## Compatibility

- Major contract/schema mismatch: fail preflight without mutation.
- Newer minor contract with unknown optional behavior: fail closed unless the compatibility table explicitly permits it.
- Patch updates may clarify validation without changing accepted semantics.
- Migrations are explicit commands/tasks in a future version; V1 never silently rewrites committed artifacts during `run`/`resume`.
