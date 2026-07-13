# State Machine Contract: Autonomous Loop v2

**Version**: 1.0.0  
**Owner**: deterministic controller  
**Non-owners**: Codex roles, hooks, command rules, Spec Kit documents, conversation history

## Core invariants

1. One feature lock and at most one writing executor per feature/repository.
2. Same authoritative inputs and state yield the same next eligible task/action.
3. No agent response changes state until JSON Schema and semantic validation succeed.
4. No writing task completes until diff, trusted validation, Reviewer, and controller-owned commit gates pass.
5. No external action is retried after interruption until its observed result is reconciled.
6. No state transition represents merge, deployment, auto-approval, force-push, rebase, reset-hard, or clean.
7. Runtime snapshot is disposable; contradictory durable evidence results in `reconciliation_required`.

## Feature flow

```text
proposed
  -> initialized -> planning -> ready
  -> executing -> locally_complete
  -> publishing -> ci_pending
  -> [ci_repair -> executing -> publishing -> ci_pending]*
  -> ready_for_manual_review

Any non-terminal safe state
  -> stopped -> resume/reconcile -> prior safe state
  -> blocked -> explicit resolution/reconcile -> permitted safe state
  -> aborted

Ambiguous effect/evidence
  -> reconciliation_required -> operator resolution -> blocked/prior safe state

Non-retryable or exhausted failure
  -> failed
```

For `dry-run`, the flow is an in-memory proposal/effect-plan projection, invokes no agent, persists no run/lock/cache/artifact, and does not enter mutating states. For `local`, `locally_complete` is the successful terminal outcome. For `draft-pr`, only `ready_for_manual_review` is successful completion. The only mode upgrade is reconciled local `stopped` or `locally_complete` to `draft-pr` via the exact CLI flag pair and fresh draft-pr preflight.

## Task gate sequence

```text
pending -> ready -> running -> validating -> reviewing
                                    |             |
                                    |             +-> committing -> completed  (write)
                                    |             +---------------> completed  (read-only)
                                    v
                            retryable_failed -> ready (budget remains)
                                    |
                                    +-> blocked / failed / aborted
```

The controller rechecks task graph, mode, worktree identity, task paths, budget, and configuration/artifact digests before every dispatch. A transition from `reviewing` to `committing` requires Reviewer `accept` and independent controller gates. Reviewer output cannot waive a failed controller gate.

## Effect protocol

Every privileged effect has a deterministic `effect_id` and idempotency key.

| Step | Required durable evidence | Crash interpretation |
|---|---|---|
| Validate | Current state/artifact/config/Git facts | No effect intended. Safe to reevaluate. |
| Intend | Flushed `effect_intended` event | Outcome unknown until target queried. |
| Execute | Adapter call only; no next dispatch | Process memory is non-authoritative. |
| Observe | Independent target facts | Determines success/absence/conflict. |
| Complete | Flushed success/failure/ambiguous event | Projection may advance. |
| Snapshot | Atomic derived cache | Missing/corrupt snapshot is rebuilt. |

### Reconciliation by effect

| Effect | Success proof | Proven absence permits retry | Ambiguity/block examples |
|---|---|---|---|
| Branch create | exact ref at expected base | ref absent | ref exists at other SHA/ownership |
| Worktree create | porcelain record, path, branch, HEAD, lock | path/ref record absent and safe path unused | existing directory, wrong worktree, prunable record |
| Agent write | completed process plus accepted schema and observed diff | no accepted output; retry consumes budget | process lost while files changed → diff quarantine/review |
| Validation | completed command evidence for exact diff/profile | no completed evidence; rerun safe | executable/profile identity changed |
| Commit | reachable commit with expected parent/tree/trailers | HEAD remains expected parent and index/worktree match accepted diff | unexpected HEAD or multiple matching commits |
| Push | remote ref equals intended local SHA | remote remains expected prior SHA | remote moved to another SHA |
| Draft PR create | one open Draft PR matching repo/base/head/metadata | no matching/open conflicting PR | multiple PRs, non-draft, wrong base/head |
| Checks | observation tied to current PR head SHA | polling is read-only | required check set missing/renamed or PR head moves |
| Worktree removal | no worktree record/path and evidence retained | clean owned worktree still exists | dirty/unowned/locked by another run |

## Stop

- `stop` appends `stop_requested` using a controller-owned signaling/locking path.
- The active controller checks it before each new effect and task dispatch.
- If an adapter call is active, stop waits for bounded completion or classifies interruption; it does not split a Git/GitHub operation.
- Once evidence is flushed, state becomes `stopped` and lock is released.
- A Stop hook may issue only this request. It MUST NOT call `run` or `resume`.

## Abort

- Requires an explicit reason and reconciled current effect.
- Prevents every new role, validation, commit, push, PR, or check-repair action.
- Preserves artifacts, branch, commits, remote ref, PR, and audit evidence.
- May remove a clean, controller-owned linked worktree only with explicit flag/policy and non-forced Git behavior.
- Never deletes a branch/remote/PR, rewrites history, resets, cleans, merges, or deploys.

## Retry and no-progress rules

- Attempt is counted before invocation; crash/restart does not refund it.
- Debugger runs only when the current failure class is retryable and debugger budget remains.
- Repair scope is the same task paths; proposed expansion is rejected and requires an explicit future task/artifact change outside the active run.
- Every retry repeats structured-output, semantic, diff, validation, and review gates.
- Repeated identical failure signature without a changed accepted diff/evidence consumes budget and stops at the configured no-progress threshold.
- CI repair is also budgeted and creates a new normal logical commit; no amend/force-push.

## Readiness predicate

`ready_for_manual_review` is true only when all conditions hold simultaneously:

- all canonical tasks are completed with valid evidence;
- local branch history is expected and worktree/index are clean;
- remote feature ref equals the last accepted local SHA;
- exactly one matching open PR exists and remains Draft;
- PR head SHA equals remote SHA;
- every configured required check for that SHA is passed;
- no stop/abort request, active effect, policy violation, secret finding, or reconciliation conflict remains.

The predicate never changes the PR out of Draft and never merges or deploys.
