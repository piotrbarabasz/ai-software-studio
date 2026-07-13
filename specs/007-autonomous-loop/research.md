# Research: Autonomous Loop v2

**Date**: 2026-07-12  
**Status**: Complete — no unresolved clarification markers remain  
**Scope**: Decisions needed to plan the controller; no controller or agent implementation

## Evidence inspected

- Repository instructions, Spec Kit templates/scripts, constitution, existing specifications, Git status, and local tool availability.
- Local `codex-cli 0.144.0-alpha.4` help: `codex exec` exposes `--output-schema`, `--json`, `--output-last-message`, `--sandbox`, `--profile`, `--ephemeral`, and explicit working directory.
- Local Git is 2.35.1 and supports worktrees. The implementation MUST declare/test its minimum supported Git version rather than assuming the planning machine's version.
- Local Python is 3.9.12 and `gh` is absent. These are implementation/quickstart preflight failures, not documentation blockers.
- Primary references: [Git worktree](https://git-scm.com/docs/git-worktree.html), [GitHub CLI PR create](https://cli.github.com/manual/gh_pr_create), [GitHub CLI PR checks](https://cli.github.com/manual/gh_pr_checks), [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12), and [JSON Schema validation](https://json-schema.org/draft/2020-12/json-schema-validation).

## R-001 — Deterministic orchestration

**Decision**: Use an explicit Python state machine and deterministic scheduler. LLM roles only propose bounded artifacts/decisions through schemas; they never select transitions or execute controller privileges.

**Rationale**: The required safety and recovery invariants depend on observable facts and idempotent transitions. A deterministic core can be exhaustively unit/property tested and reconstructed without conversation memory.

**Alternatives considered**:

- Agent-led manager loop — rejected because model output/history would become implicit runtime authority.
- General workflow/orchestration framework — rejected for V1 because sequential execution and local recovery do not justify its state semantics or dependencies.
- Hooks as scheduler — rejected because hooks are defense in depth and a Stop hook must not continue work.

## R-002 — Python packaging and dependencies

**Decision**: Create an independent `tools/studio_loop/` package requiring Python 3.11+. Use Pydantic v2 for internal typed boundary models, `jsonschema` for committed Draft 2020-12 contracts, and the standard library for CLI, TOML, subprocess, hashing, and filesystem operations. Use pytest/Hypothesis/Ruff/MyPy for quality gates.

**Rationale**: Python 3.11 satisfies the owner constraint and includes `tomllib`. Separating internal models from external JSON Schema validation prevents implementation conveniences from silently weakening published contracts. The small dependency set supports cross-platform testing.

**Alternatives considered**:

- Python 3.12 minimum — rejected because the explicit compatibility floor is 3.11 and no planned feature needs 3.12.
- Dataclasses only — rejected because boundary parsing/error reporting and tagged unions would require custom validation, but domain decisions remain plain and testable.
- Typer/Click — deferred; `argparse` avoids another runtime dependency and supports the bounded V1 CLI.
- SQLite — rejected; durable authority already resides in artifacts/Git/GitHub, and a database would add migration/locking complexity.

## R-003 — Versioned JSON contracts

**Decision**: Use JSON Schema Draft 2020-12 with explicit `$schema`, stable `$id`, `schema_version`, closed objects (`additionalProperties: false`), bounded strings/arrays, and role-specific output schemas. Validate schema structure at startup, instance structure at ingestion, and domain semantics afterward.

**Rationale**: Draft 2020-12 is the current JSON Schema meta-schema and supports precise unions and unevaluated-property control. The JSON Schema spec warns that `format` is annotation by default, so critical paths, IDs, SHAs, and timestamps also receive controller-side semantic validation.

**Alternatives considered**:

- One universal role schema — rejected as over-permissive and weakens least authority.
- Parsing JSON without schema — rejected because malformed/extra fields could influence decisions.
- Schema validation only — rejected because repository facts and cross-field invariants cannot be expressed safely in portable schema alone.

## R-004 — Canonical tasks and generated Markdown

**Decision**: For controller-managed features after bootstrap, store canonical tasks in `specs/<feature>/tasks.json`. Render `tasks.md` deterministically from canonical order and include generator/schema versions and SHA-256 source digest. Reject drift before execution.

**Rationale**: Machines require stable types and explicit dependencies; maintainers require readable review artifacts. A digest and regeneration check makes authority unambiguous.

**Alternatives considered**:

- Parse task state from Markdown — rejected due to ambiguity and lossy edits.
- Maintain JSON and Markdown independently — rejected because they inevitably diverge.
- Treat feature 007's tasks as runtime state — rejected; this bootstrap feature uses Spec Kit before the controller exists.

## R-005 — Task graph and scheduler

**Decision**: Validate the complete graph at load, including uniqueness, known dependencies, acyclicity, path/profile policy, and requirement mappings. V1 chooses one ready task sequentially using canonical input order with task ID as a deterministic tie-break. Dependents remain ineligible unless every dependency is `completed`.

**Rationale**: Full validation fails early and deterministic ordering makes dry-run and resume reproducible.

**Alternatives considered**:

- Dynamic best-task selection by Planner — rejected because it is non-deterministic runtime authority.
- Parallel DAG executor — deferred until concurrency, locking, and conflict semantics are designed.
- Continue dependents after a failed dependency — rejected because it violates the declared graph.

## R-006 — Runtime state and event journal

**Decision**: Use one append-only JSONL event stream per feature, flushed at effect boundaries, plus an atomically replaced JSON snapshot derived from events and durable facts. Use monotonically increasing sequence numbers, previous-event digest chaining, correlation IDs, and an explicit last-line truncation rule. A corrupt non-tail event blocks recovery.

**Rationale**: JSONL is inspectable and append-friendly; snapshots make status fast. Write-ahead effect intentions distinguish a crash before/after privileged operations, while digest chaining detects accidental corruption.

**Alternatives considered**:

- Snapshot only — rejected because it cannot reliably reconcile partially completed effects.
- Event log as sole durable authority — rejected because artifacts/Git/GitHub are the actual externally observable facts.
- Database/event broker — rejected for V1 complexity and portability.

## R-007 — Locking and feature numbering

**Decision**: Acquire a repository-scoped exclusive initialization lock in `.automation/state/locks/`, rescan committed spec directories plus local/remote branch names, reserve the lowest unused three-digit number, and create the branch/worktree before releasing. If a contender or stale/ambiguous lock is observed, stop or reconcile; never guess.

**Rationale**: Directory scanning alone races. Reservation without immediate Git identity creation can be lost. Locking plus a final rescan and non-forced Git creation provides a deterministic boundary.

**Alternatives considered**:

- Timestamp numbering — rejected because repository convention and request require sequential feature numbers.
- Remote issue number — rejected as an unnecessary network dependency for dry-run/local.
- Branch name as sole authority — rejected because specs and branch names are deliberately independent in Spec Kit.

## R-008 — Worktree isolation

**Decision**: Use a linked worktree created without force, locked with a feature/run reason, and verified via `git worktree list --porcelain -z`. Canonicalize the configured worktree parent; reject symlink/reparse escape, existing non-owned directories, detached/wrong branch, unexpected HEAD, dirty state, submodules in V1, and prunable ambiguity.

**Rationale**: Git documents porcelain format as stable for scripts and `-z` as safe for unusual paths. Worktree locks prevent pruning and accidental move/removal. Avoiding `--force` preserves Git's ownership safeguards.

**Alternatives considered**:

- Run in the operator's current checkout — rejected because unrelated changes could be overwritten or committed.
- Clone per feature — rejected because it adds remote/network setup and loses shared local object efficiency.
- Forced cleanup/recreation — rejected because destructive cleanup is forbidden and could delete user work.

## R-009 — Codex role boundary

**Decision**: Invoke Planner, Implementer, Reviewer, and Debugger through separate fresh `codex exec --ephemeral` processes. Supply prompt on stdin, explicit `--cd`, named model profile, explicit sandbox, `--output-schema`, JSON event mode, and a controller-owned last-message file. Treat stdout/stderr and the final file as untrusted until size, JSON, schema, identity, and semantic validation pass.

**Rationale**: The locally inspected CLI exposes the required boundaries. Separate processes prevent role-memory bleed, and ephemeral sessions ensure recovery never depends on a Codex session transcript.

**Alternatives considered**:

- Resume one Codex session across roles/tasks — rejected because conversation state would become hidden runtime state.
- Parse prose — rejected because policy decisions require closed structured contracts.
- Give agents GitHub credentials — rejected; all Git/GitHub effects are controller-only.

## R-010 — Model profiles

**Decision**: Commit named profiles for each role/use case with permitted model, reasoning level, sandbox, timeout, output limit, and capability class. Planner may choose only an allowed validation profile; controller chooses role model profile according to committed policy. Profile changes alter a configuration digest recorded in runs/commits.

**Rationale**: Named profiles make cost/capability/security reviewable and prevent arbitrary CLI flags from tasks or agents.

**Alternatives considered**:

- Agent-selected model and flags — rejected as privilege escalation and non-reproducible.
- One profile for every role — rejected because Reviewer requires read-only capability while Implementer may need scoped workspace writes.

## R-011 — Paths and diff guard

**Decision**: Paths are normalized repository-relative POSIX strings in contracts. Controller resolves them against the canonical worktree root, rejects absolute paths, `..`, NUL/control characters, `.git`, `.automation`, protected control/config paths unless task policy explicitly permits them, symlink/reparse escapes, case collisions, and submodule boundaries. Capture NUL-delimited Git status/diff before and after writes and compare all change kinds to the allowed set.

**Rationale**: Prompt restrictions alone cannot contain writes. Git status includes tracked/untracked/rename/mode changes that a simple textual diff may miss.

**Alternatives considered**:

- Glob-only prompt instructions — rejected because enforcement would remain with the agent.
- `git diff --name-only` only — rejected because untracked files and encoding/path edge cases can be missed.
- Automatic revert of forbidden files — rejected because it could overwrite unrelated work; quarantine and block instead.

## R-012 — Trusted validation and command safety

**Decision**: Validation profiles contain fixed argv arrays, working directory enum, environment allowlist, timeout, output cap, network class, and applicability. No shell, interpolation, pipes, redirection, or task-provided executable/arguments. Resolve executable identity during preflight and log redacted argv plus exit/timeout metadata.

**Rationale**: Fixed vectors are portable and prevent shell injection. Profiles let Planner select intent without acquiring command authority.

**Alternatives considered**:

- Arbitrary shell strings in tasks — rejected as direct command injection.
- Let Codex run final validation — rejected because controller must observe evidence independently.
- Only repository CI — rejected because local gates are required before commits/pushes.

## R-013 — Review, debugger, and retry budget

**Decision**: Reviewer is read-only and returns `accept`, `changes_requested`, or `blocked`. Debugger is invoked only after a classified retryable failure and returns a diagnosis/repair plan, not a privileged action. Count every started eligible attempt durably before invocation; budgets survive restart. Require a changed evidence/diff/failure signature for further no-progress retries.

**Rationale**: Separate review reduces self-approval. Durable counting prevents restart from resetting cost/safety limits. Failure-only Debugger follows the immutable role decision.

**Alternatives considered**:

- Unlimited self-correction — rejected for cost and runaway-loop risk.
- Reviewer edits code — rejected because review should not silently expand the diff.
- Debugger on every task — rejected by scope and unnecessary cost.

## R-014 — Safe commit protocol

**Decision**: Controller verifies expected parent, clean index ownership, accepted working-tree diff, and validation/review evidence; stages only explicit accepted paths; verifies cached diff/tree; commits non-interactively with deterministic subject/body and trailers; then observes SHA/tree/parent. One writing task has one final logical commit even if Git internally writes objects during a failed attempt.

**Rationale**: `git add .` risks unrelated files. Trailers allow recovery without runtime cache and bind commits to feature/task/attempt/schema/config/artifact digests.

**Alternatives considered**:

- Agent commits — rejected because agents have no Git mutation authority.
- Commit every retry — rejected because requirement is one completed task per logical commit and failed attempts should remain uncommitted.
- Amend/squash later — rejected because history rewriting and rebase are outside V1.

## R-015 — Push, Draft PR, and checks

**Decision**: In `draft-pr` mode, verify `gh` auth/repository identity, use Git for an explicit feature refspec with expected remote SHA/lease semantics, then reconcile PR identity using non-interactive `gh` JSON calls. Create with explicit base/head/title/body file/`--draft`; never rely on `gh pr create --dry-run` because the official manual warns it may still push. Poll required checks using `gh pr checks --required --json ...` and classify its structured fields/exit outcomes.

**Rationale**: `gh` is the mandated primary V1 transport for PR/CI, while Git remains the precise transport for branch push. Explicit flags prevent prompts and unintended fork/push behavior. Polling permits durable controller state between observations.

**Alternatives considered**:

- `gh pr create --dry-run` as the controller dry-run — rejected because official behavior may still push.
- GitHub MCP as foundation — deferred by immutable decision.
- `gh pr checks --watch` as state engine — rejected because controller needs bounded polling, stop handling, and durable check observations.

## R-016 — CI failure mapping

**Decision**: Normalize failed required checks into sanitized diagnostics. Map a check to a canonical task only through committed validation/profile metadata and changed-path evidence; otherwise create a controller-recorded feature repair decision requiring the bounded policy. Every repair uses a new attempt and normal gates/commit/push.

**Rationale**: Guessing task ownership could grant overly broad paths. Reusing normal gates preserves safety after remote feedback.

**Alternatives considered**:

- Ask an agent to pick any task/path — rejected as non-deterministic privilege expansion.
- Force-push amended task commits — rejected because history rewrite is outside V1.
- Ignore CI after local success — rejected because the Draft PR is not ready for review with failed required checks.

## R-017 — Resume, stop, and abort

**Decision**: Resume rebuilds/reconciles in a fixed order and never trusts snapshot alone. Stop sets a durable request and dispatches no new unit after the current atomic adapter operation returns. Abort also prevents dispatch and may remove only a clean controller-owned worktree after evidence is preserved; default behavior retains branch, commits, artifacts, and logs. No force removal.

**Rationale**: OS process termination cannot safely split Git/GitHub operations. Safe-boundary stop gives deterministic behavior. Conservative abort avoids destroying recoverable user work.

**Alternatives considered**:

- Kill subprocess and clean/reset immediately — rejected as destructive and ambiguous.
- Delete branch/worktree on abort by default — rejected because evidence or user work could be lost.
- Hook-driven auto-resume — rejected because Stop hooks cannot continue the feature loop.

## R-018 — Secret protection and observability

**Decision**: Build child environments from an allowlist; keep GitHub/Codex authentication outside prompts and artifacts; redact exact known values plus high-confidence token patterns; cap outputs; store sanitized full artifacts with restricted permissions; show summaries by default. Event records include correlation IDs, state transitions, effect ids, digests, exit categories, and evidence file references, never raw secrets or full prompts.

**Rationale**: Redaction after logging is too late, so isolation and bounded capture precede persistence. Correlated events support recovery/audit without model memory.

**Alternatives considered**:

- Inherit all environment variables — rejected because prompts/commands could expose credentials.
- Log complete agent prompts and environment — rejected as unnecessary sensitive retention.
- Regex redaction only — rejected because known secret values should be removed exactly and patterns can over/under-match.

## R-019 — Rules and hooks

**Decision**: Add command rules denying Git/GitHub/deployment operations to agent contexts and optional hooks for policy checks/stop requests only after controller enforcement exists. Controller behavior remains correct if hooks are absent or disabled. A Stop hook records/requests stop and exits; it does not call start/run/resume.

**Rationale**: Defense in depth protects against accidental agent commands but cannot replace central scheduling/state policy.

**Alternatives considered**:

- Recreate the removed manager loop from Git history — explicitly prohibited.
- Encode runtime state in `AGENTS.md` or skills — rejected because documentation is not state.
- Make hook success authoritative — rejected because hooks can be skipped or misconfigured.

## R-020 — Test and release boundary

**Decision**: Gate V1 with contract, unit, property, temporary-Git integration, fake-Codex/fake-gh, fault-injection recovery, cross-platform, secret-canary, mode-capability, and smoke tests. The final smoke test ends at a Draft PR in a disposable test repository and verifies it remains draft/unmerged with no deployment.

**Rationale**: Safety claims require negative and crash-boundary tests, not only happy paths. Fakes make CI deterministic; the opt-in disposable remote test validates transport assumptions.

**Alternatives considered**:

- Test against the production repository — rejected as unsafe.
- Unit tests only — rejected because Git/worktree/subprocess and recovery behavior are integration-heavy.
- Treat successful PR creation as permission to merge — rejected; manual review is the terminal boundary.
