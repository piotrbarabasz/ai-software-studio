# Data Model: Autonomous Loop v2

**Status**: Design complete  
**Schema dialect**: JSON Schema Draft 2020-12  
**Authority rule**: Runtime objects are projections. Feature artifacts, Git facts/trailers, expected/observed remote SHA, and GitHub Draft PR/check facts are the recovery evidence.

## 1. Common value objects

### VersionedArtifact

| Field | Type | Rules |
|---|---|---|
| `schema_version` | string | Required semantic version; V1 accepts only configured compatible major. |
| `artifact_id` | string | Stable namespaced identifier. |
| `feature_id` | string | `NNN-slug`; must equal enclosing feature. |
| `created_at` | RFC 3339 UTC timestamp | Informational; never used alone for ordering. |
| `content_sha256` | lowercase hex | Digest of canonical serialized content excluding this digest field where defined. |

All external JSON objects are closed. Unknown fields, duplicate JSON object keys, unsupported encodings, non-finite numbers, oversized documents, and unsupported schema versions are rejected before domain use.

### RepositoryPath

A non-empty repository-relative POSIX path. It cannot be absolute, empty, `.`, contain `..`, NUL/control characters, a drive/UNC prefix, or resolve outside the canonical worktree. Case-fold collisions, symlink/reparse escapes, `.git`, runtime state, protected configuration, and submodule boundaries are rejected according to policy.

### EvidenceRef

| Field | Type | Rules |
|---|---|---|
| `kind` | enum | `artifact`, `git`, `remote`, `github`, `command`, `invocation`, `event`. |
| `uri` | string | Controller-local opaque reference or public GitHub URL; never embeds a secret. |
| `sha256` | hex or null | Required for local immutable evidence. |
| `redacted` | boolean | Must be true for command/invocation output persisted after filtering. |

### Budget

| Field | Type | Rules |
|---|---|---|
| `limit` | integer | `0..10`, committed policy maximum. |
| `used` | integer | `0..limit`; incremented durably before an eligible attempt starts. |
| `remaining` | integer | Derived as `limit-used`, never accepted from an agent. |

## 2. Policy entities

### ControllerConfig

Parsed from committed `.studio-loop/*.toml` and validated after conversion to a plain object.

| Field | Type | Description |
|---|---|---|
| `config_version` | semantic version | Compatibility boundary. |
| `repository` | RepositoryPolicy | Remote/base/worktree parent, protected paths, supported Git host. |
| `modes` | map of ModePolicy | Capability matrix for `dry-run`, `local`, `draft-pr`. |
| `roles` | map of RoleProfile | Planner/Implementer/Reviewer/Debugger profile references. |
| `models` | map | Named permitted model/reasoning/timeout/output settings. |
| `validations` | map | Trusted ValidationProfiles. |
| `git` | GitPolicy | Identity, branch/commit/trailer/push policy. |
| `github` | GitHubPolicy | Host/repo/base, Draft PR template, required checks, poll/time limits. |
| `security` | SecurityPolicy | Environment, redaction, protected paths, output retention. |
| `recovery` | RecoveryPolicy | Lock timeout, tail repair rule, stop/abort defaults. |

The canonical configuration digest is recorded in Run, Event, role invocation, commit trailers, and PR body metadata.

### ModePolicy

| Mode | Read/analyze | Agent writes | Local commit | Push | Draft PR/checks | Merge/deploy |
|---|---:|---:|---:|---:|---:|---:|
| `dry-run` | yes | no | no | no | read-only probe only when explicitly requested | never |
| `local` | yes | yes | yes | no | no mutation | never |
| `draft-pr` | yes | yes | yes | yes | create/reconcile one Draft PR and observe checks | never |

Capabilities are controller constants narrowed by configuration; configuration cannot add capabilities absent from V1.

### RoleProfile

| Field | Type | Rules |
|---|---|---|
| `role` | enum | `planner`, `implementer`, `reviewer`, `debugger`. |
| `model_profile` | string | Must reference a committed allowed profile. |
| `sandbox` | enum | Planner/Reviewer default `read-only`; Implementer/Debugger repair default `workspace-write`. Never `danger-full-access`. |
| `output_schema` | path | Protected committed role schema. |
| `timeout_seconds` | positive integer | Bounded by security policy. |
| `max_output_bytes` | positive integer | Bounded and enforced while streaming. |
| `network` | enum | `denied` by default; any future exception requires explicit profile and task policy. |

### ValidationProfile

| Field | Type | Rules |
|---|---|---|
| `profile_id` | string | Stable committed name. |
| `steps` | ordered array | At least one fixed ValidationStep. |
| `applicable_paths` | array | Controller policy patterns; cannot expand task paths. |
| `required_for` | array | Lifecycle gates at which the profile is mandatory. |

Each ValidationStep stores an executable identifier, literal argv array, controlled cwd enum, environment-name allowlist, timeout, output cap, network class, and success exit codes. Shell fragments and task/agent-supplied argv are invalid.

## 3. Feature and task entities

### Feature

| Field | Type | Rules |
|---|---|---|
| `feature_id` | string | Unique `NNN-slug`. |
| `feature_number` | integer | `1..999`; formatted as three digits in V1. |
| `slug` | string | Lowercase safe slug, bounded length. |
| `request_digest` | hex | Digest of normalized accepted request; request body is not runtime memory. |
| `base_branch` | string | Explicit configured base. |
| `base_sha` | Git SHA | Full observed SHA at initialization. |
| `feature_branch` | string | Exactly one safe branch for feature. |
| `worktree_path` | absolute canonical path | Must remain below configured worktree parent. |
| `mode` | enum | `dry-run`, `local`, `draft-pr`. |
| `artifacts` | array of ArtifactRef | Required spec/task/design artifacts and digests. |
| `lifecycle_state` | FeatureState | Projection from events and external facts. |
| `draft_pr` | PullRequestEvidence or null | At most one. |

Identity tuple: repository identity + feature ID + base SHA + feature branch. Conflicts stop initialization.

### TaskSet

Canonical document at `specs/<feature>/tasks.json` for post-bootstrap features.

| Field | Type | Rules |
|---|---|---|
| `schema_version` | string | Supported task schema version. |
| `feature_id` | string | Matches Feature. |
| `requirements` | array of string | Known requirement IDs available for mapping. |
| `tasks` | ordered array of Task | Unique IDs; canonical order is stable. |
| `source_digest` | derived hex | Computed from canonical serialized `tasks.json`; it is not serialized inside that self-digested document. It is recorded in generated `tasks.md`, artifact inventory, events, and runtime projection. |

### Task

| Field | Type | Rules |
|---|---|---|
| `id` | string | `T` plus three or more digits; unique and stable. |
| `phase` | string | Stable phase identifier and label. |
| `title` | string | Concrete outcome, bounded length. |
| `description` | string | Scope without executable command injection. |
| `dependencies` | array of Task ID | Unique, known, no self-reference; graph must be acyclic. |
| `requirement_ids` | non-empty array | Every ID exists in feature spec; every requirement is covered by at least one task or an explicit verification task. |
| `allowed_read_paths` | array of RepositoryPath/policy pattern | Minimal read scope. |
| `allowed_write_paths` | array of RepositoryPath/policy pattern | Empty when `writes=false`; cannot include runtime/protected paths without explicit policy. |
| `writes` | boolean | Determines sandbox and commit expectation. |
| `validation_profile` | string | Must reference committed trusted profile. |
| `completion_criteria` | non-empty array | Observable, task-specific conditions. |
| `tests` | non-empty array | Named test expectations; no arbitrary shell. |
| `attempt_budget` | integer | Within committed policy limit. |
| `status` | TaskState | Controller-owned runtime projection associated by task ID; not serialized in canonical `tasks.json` and never written back by agents. |

### TaskGraph

Derived from TaskSet. Stores adjacency and reverse-adjacency maps, canonical order index, and graph digest. It is valid only when all Task rules pass, no cycle exists, every dependency is reachable in the same feature, and there is at least one root. Scheduler returns zero or one task: the earliest canonical task whose status is eligible and all dependencies are completed.

### GeneratedTaskView

`tasks.md` contains a generated warning, generator version, task schema version, source digest, requirement coverage summary, phase/task counts, and every canonical field. It contains no runtime status unless rendered from an explicitly identified snapshot, and such status is never canonical. Drift means re-render is required and execution is blocked.

## 4. Execution entities

### Run

| Field | Type | Rules |
|---|---|---|
| `run_id` | unguessable string | Unique per controller invocation. |
| `feature_id` | string | Parent Feature. |
| `mode` | Mode | Remains the same or narrows. The only broadening is reconciled `local` in `stopped`/`locally_complete` state to `draft-pr` via `--mode draft-pr --allow-mode-upgrade` plus fresh preflight. Dry-run has no persisted Run. |
| `controller_version` | semantic version | Recorded. |
| `config_digest` | hex | Recorded. |
| `artifact_digest` | hex | Aggregate of authoritative inputs. |
| `started_at`, `ended_at` | timestamps | Informational. |
| `state` | RunState | Active/stopping/stopped/completed/blocked/failed/aborted/reconciliation_required. |
| `stop_requested` | boolean | Durable request projection. |
| `active_task_id` | string or null | At most one in V1. |

### Attempt

| Field | Type | Rules |
|---|---|---|
| `attempt_id` | string | Unique within task; sequence is monotonic. |
| `task_id` | string | Parent Task. |
| `number` | integer | Starts at 1, never reused/reset. |
| `trigger` | enum | `initial`, `implementation_retry`, `review_retry`, `ci_repair`. |
| `failure_class` | enum or null | Schema, policy, execution, diff, validation, review, Git, GitHub, CI, interruption, reconciliation. |
| `failure_signature` | hex or null | Digest of sanitized diagnostics/diff/evidence used for no-progress detection. |
| `state` | AttemptState | Started/running/validating/reviewing/accepted/retryable_failed/non_retryable_failed/interrupted. |
| `invocations` | array of Invocation IDs | Role processes for this attempt. |
| `diff_evidence` | EvidenceRef or null | Controller observed. |
| `validations` | array of ValidationResult | Controller observed. |
| `review` | ReviewDecision or null | Schema + semantic validated. |

Attempt budget is incremented by an event before launching Implementer/repair. A process crash cannot refund it.

### RoleInvocation

| Field | Type | Rules |
|---|---|---|
| `invocation_id` | string | Unique correlation ID included in prompt and required output. |
| `role` | role enum | Debugger requires a recorded failure; Reviewer is read-only. |
| `task_id`, `attempt_id` | strings | Must match controller context. |
| `profile_id` | string | Committed profile. |
| `input_digest` | hex | Digest of sanitized bounded context. |
| `schema_id`, `schema_version` | strings | Exact output contract. |
| `sandbox`, `cwd`, `timeout`, `output_limit` | constrained values | From controller policy. |
| `started_at`, `ended_at` | timestamps | Observed by controller. |
| `exit_category` | enum | Success, process_failure, timeout, output_limit, interrupted. |
| `raw_evidence`, `validated_output` | EvidenceRef or null | Persisted sanitized; output used only after all validation. |

### ValidationResult

Stores profile/step ID, fixed argv digest, executable identity, cwd, controlled environment-name list, start/end, exit code/category, timeout/output-truncation flags, sanitized evidence reference, and result `passed|failed|error|interrupted`. It never stores secret environment values.

### ReviewDecision

Reviewer output plus controller verification:

- Decision: `accept`, `changes_requested`, or `blocked`.
- Requirement findings: one entry per task requirement.
- Findings: severity, stable code, allowed-path location, sanitized description, evidence refs.
- Test/diff assessment.
- Controller semantic result and conflicts.

Only `accept` with all mandatory controller gates passing permits commit.

## 5. Git and GitHub evidence

### CommitEvidence

| Field | Type | Rules |
|---|---|---|
| `task_id`, `attempt_id` | strings | Link accepted task/attempt. |
| `expected_parent_sha` | full SHA | Must equal pre-commit HEAD. |
| `commit_sha` | full SHA | Observed after commit. |
| `tree_sha` | full SHA | Matches accepted staged tree. |
| `diff_sha256` | hex | Matches accepted diff representation. |
| `trailers` | map | Feature, Task, Attempt, Task-Schema, Config, Artifacts. |
| `message_policy_version` | string | Reproducible format version. |

Exactly one matching reachable commit means task completion. Zero means incomplete; more than one or conflicting trailers means reconciliation required.

### PushEvidence

Stores remote name/URL identity (credential-free), refspec, expected prior remote SHA or explicit absence, local SHA, observed resulting remote SHA, effect id, time, and result. A lost process response is reconciled with `git ls-remote` before retry.

### PullRequestEvidence

| Field | Type | Rules |
|---|---|---|
| `host`, `repository` | strings | Match committed policy and Git remote. |
| `number`, `url` | GitHub identity | Exactly one per feature. |
| `base_ref`, `head_ref` | strings | Match feature policy. |
| `head_sha` | full SHA | Must match last published remote SHA. |
| `is_draft` | boolean | Must remain true; false blocks automation. |
| `state` | enum | `open` required for active workflow. |
| `body_metadata_digest` | hex | Feature/config/task evidence in PR body marker. |

### CheckObservation

Stores PR number/head SHA, check name/workflow/link, raw provider state, normalized state `pending|passed|failed|cancelled|missing|indeterminate|skipped`, required flag, start/completion timestamps, observation time, and sanitized diagnostics reference. Observations for an older head SHA cannot make the current head ready.

## 6. Event and effect entities

### Event

| Field | Type | Rules |
|---|---|---|
| `schema_version` | string | Supported event schema. |
| `event_id` | unique string | No reuse. |
| `sequence` | integer | Starts at 1 and increases exactly by one. |
| `previous_event_sha256` | hex or null | Null only for first event; otherwise matches prior canonical event. |
| `occurred_at` | RFC 3339 UTC | Informational, not ordering authority. |
| `feature_id`, `run_id` | strings | Required correlation. |
| `task_id`, `attempt_id`, `invocation_id` | strings or null | Present when applicable. |
| `actor` | enum | `operator`, `controller`, `codex`, `git`, `github`, `validation`. |
| `type` | closed enum | Lifecycle, attempt, effect, validation, review, stop/abort, reconciliation events. |
| `from_state`, `to_state` | strings or null | Required for transitions. |
| `effect` | EffectRecord or null | Required for privileged-effect events. |
| `evidence` | array of EvidenceRef | Redacted/bounded references. |
| `config_digest`, `artifact_digest` | hex | Context at event time. |
| `event_sha256` | hex | Canonical digest used by next event. |

### EffectRecord

| Field | Type | Rules |
|---|---|---|
| `effect_id` | string | Stable across reconciliation/retry of the same logical effect. |
| `kind` | enum | Worktree, branch, invocation, validation, stage, commit, push, PR, checks, cleanup. |
| `idempotency_key` | string | Deterministically derived from feature/task/attempt/effect target. |
| `status` | enum | `intended`, `succeeded`, `failed`, `ambiguous`. |
| `target_digest` | hex | Redacted operation target/arguments. |
| `observed_result_digest` | hex or null | Independent observation. |

## 7. Runtime snapshot

`snapshot.json` is a cached projection containing schema/controller/config/artifact versions, last applied event sequence/digest, Feature summary, Run summary, task status/budget map, current effect, commit/push/PR/check summaries, stop flag, and last failure. It MUST NOT contain prompts, secrets, raw command output, or facts absent from replay/reconciliation. Atomic write is temporary file in the same directory → flush file → replace → best-effort directory flush where supported.

Snapshot validation failure causes rebuild. Event-chain failure anywhere except one incomplete final line causes `reconciliation_required`; the controller never silently discards valid complete events.

## 8. State machines

### FeatureState

| State | Allowed next states | Entry evidence |
|---|---|---|
| `proposed` | `initialized`, `blocked`, `aborted` | Valid dry-run proposal. |
| `initialized` | `planning`, `ready`, `blocked`, `stopped`, `aborted` | Unique identity and verified worktree/artifacts. |
| `planning` | `ready`, `blocked`, `stopped`, `aborted` | Planner artifacts are being validated. |
| `ready` | `executing`, `locally_complete`, `stopped`, `aborted`, `blocked` | Valid canonical tasks and graph. |
| `executing` | `executing`, `locally_complete`, `blocked`, `stopped`, `aborted`, `failed` | At most one active task. |
| `locally_complete` | `publishing`, `ready_for_manual_review`, `stopped`, `aborted`, `blocked` | All tasks complete and commits verified; local mode may terminate here. |
| `publishing` | `ci_pending`, `blocked`, `stopped`, `failed`, `reconciliation_required` | Remote SHA and Draft PR effects in progress. |
| `ci_pending` | `ci_repair`, `ready_for_manual_review`, `blocked`, `stopped`, `failed` | Draft PR remains draft at current head. |
| `ci_repair` | `executing`, `publishing`, `blocked`, `stopped`, `failed` | Bounded mapped repair. |
| `stopped` | `ready`, `executing`, `locally_complete`, `publishing`, `ci_pending`, `blocked`, `aborted` | Resume re-reconciles facts before selecting destination. |
| `ready_for_manual_review` | terminal automation state | Draft PR open/draft, head matches, required checks pass. |
| `blocked` | `ready`, `executing`, `publishing`, `ci_pending`, `aborted` | Explicit operator resolution plus full revalidation. |
| `reconciliation_required` | `blocked` or prior safe state | Operator resolves conflicting evidence; never automatic guess. |
| `failed` | terminal unless explicit recovery policy allows `blocked` | Non-retryable/exhausted failure. |
| `aborted` | terminal | Evidence retained; no new effects. |

No transition exists from any state to merged or deployed.

### TaskState

| State | Allowed next states | Condition |
|---|---|---|
| `pending` | `ready`, `blocked`, `aborted` | Dependencies/policy evaluated. |
| `ready` | `running`, `blocked`, `aborted` | Selected sequentially and budget available. |
| `running` | `validating`, `retryable_failed`, `blocked`, `aborted` | Role output and diff policy evaluated. |
| `validating` | `reviewing`, `retryable_failed`, `blocked`, `aborted` | All trusted steps observed. |
| `reviewing` | `committing`, `completed`, `retryable_failed`, `blocked`, `aborted` | Read-only tasks can complete without commit; writes require commit. |
| `committing` | `completed`, `reconciliation_required`, `blocked` | Exactly one matching commit observed. |
| `retryable_failed` | `ready`, `blocked`, `failed`, `aborted` | Budget/no-progress policy. |
| `reconciliation_required` | `completed`, `ready`, `blocked` | External evidence resolved. |
| `completed` | terminal | Dependencies may become eligible. |
| `blocked` | `ready`, `aborted` | Explicit resolution and revalidation. |
| `failed` | terminal | Budget exhausted/non-retryable. |
| `aborted` | terminal | Feature abort. |

### RunState and stop semantics

`active → stop_requested → stopped` occurs only after the current adapter operation and evidence append complete. An agent subprocess may receive graceful termination after a configured deadline, but its result is not accepted unless normal gates finish. `abort_requested → aborted` preserves evidence and never force-cleans. A crash is not a state transition; next invocation enters reconciliation before deriving a RunState.

## 9. Cross-entity invariants

1. At most one Feature per request digest is active under the repository lock unless the operator explicitly starts a distinct request.
2. At most one Run owns a feature lock; stale ownership is reconciled using process/host token and event evidence, never time alone.
3. At most one Task is `running|validating|reviewing|committing` per feature.
4. Debugger Invocation requires a prior retryable failure in the same Task/Attempt context.
5. Reviewer and Planner invocations produce no repository changes.
6. Every accepted agent output matches feature/run/task/attempt/invocation/role and schema identity.
7. Every changed path is allowed by the current writing Task and policy; forbidden diffs are never auto-reverted over possible user work.
8. Task `completed` with `writes=true` requires exactly one matching CommitEvidence; `writes=false` requires unchanged repository state and no commit.
9. Push target SHA must be a verified local accepted commit and expected remote state must match.
10. Draft PR head SHA must equal observed remote SHA; check results apply only to that SHA.
11. `ready_for_manual_review` requires open Draft PR, matching identity/head, all configured required checks passed, no active effect, and clean verified worktree.
12. Merge/deployment states and effects are unrepresentable in V1 schemas/enums.
