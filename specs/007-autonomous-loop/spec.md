# Feature Specification: Autonomous Loop v2

**Feature Branch**: `007-autonomous-loop`

**Created**: 2026-07-12

**Status**: In Progress

**Release reconciliation (2026-07-13)**: The specification remains the target contract, not a claim of implementation completeness. [`reconciliation.md`](reconciliation.md) records per-task implementation, executed tests and blockers. The current CLI completes the tested local slice, but Draft-PR publication composition, complete resume/stop recovery, contract synchronization and cross-platform CI evidence remain open; therefore the feature is not ready for a real remote smoke test.

**Input**: Original specification request: "Specify a safe, deterministic Autonomous Loop v2 that converts one user request into one isolated feature workflow ending at a Draft PR ready for manual review. Do not implement the controller or agents." The final sentence constrained the original Spec Kit authoring pass; implementation is separately authorized and tracked by `tasks.md`.

## Business Context *(mandatory)*

**Primary Business Outcome**: Trust building and clear explanation of AI Software Studio services through a repeatable, auditable software-delivery process.

**Target Visitor**: The studio owner or delegated maintainer who turns a client request into a reviewable feature without surrendering control of merge or deployment.

**Conversion or Trust Signal**: Every accepted request produces traceable feature artifacts and, in the most capable allowed mode, one Draft PR that a human can inspect before any release decision.

**Localization Scope**: Operator-facing skills and documentation MUST be Polish-first while allowing English variants without changing workflow semantics. Machine-readable identifiers, event names, schemas, and CLI tokens remain language-neutral.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Safely prepare a feature (Priority: P1)

As the studio owner, I submit one feature request and receive a uniquely numbered, isolated feature workspace containing a specification and canonical dependency-ordered tasks, without the workflow changing unrelated files or relying on conversation history.

**Why this priority**: A safe and reproducible feature boundary is the minimum useful outcome and the prerequisite for all later automation.

**Independent Test**: Start from a repository with existing features and an unrelated local modification, initialize a request in dry-run mode, and verify the proposed number, branch, workspace, artifacts, allowed paths, and validation profile without Git or GitHub mutation.

**Acceptance Scenarios**:

1. **Given** a valid repository and a new request, **When** the operator initializes a dry run, **Then** the workflow proposes exactly one next feature number, one feature branch, one isolated worktree, one canonical-task-generation step, and no agent invocation or persistent mutation; canonical tasks are produced only by a later authorized Planner run.
2. **Given** unrelated local changes, **When** initialization evaluates repository safety, **Then** those changes remain untouched and the workflow either uses an isolated safe base or stops with an exact blocker.
3. **Given** generated tasks, **When** a human compares the machine-readable task source with its Markdown view, **Then** every task, dependency, requirement mapping, write flag, path, completion criterion, and test agrees.

---

### User Story 2 - Execute and review tasks under policy (Priority: P2)

As the studio owner, I can run eligible tasks sequentially through isolated Codex roles while a deterministic controller validates structured outputs, file boundaries, repository changes, and trusted checks before recording a task as complete.

**Why this priority**: Controlled execution delivers useful implementation progress while retaining deterministic policy enforcement outside the language model.

**Independent Test**: Run a fixture feature with dependent read-only and write tasks in local mode, inject one invalid response and one forbidden-path diff, and verify scheduling, schema rejection, diff rejection, validation, review, retry limits, and one logical controller-owned commit per successful task.

**Acceptance Scenarios**:

1. **Given** a task whose dependencies are complete, **When** the controller dispatches it, **Then** exactly one permitted role invocation receives only the task context, declared paths, trusted validation profile, and required output contract.
2. **Given** an agent response that violates its output contract or modifies an undeclared path, **When** the controller evaluates the attempt, **Then** completion is refused, the violation is logged, and Git history is not mutated for that attempt.
3. **Given** an implementation that passes policy and validation, **When** review accepts it, **Then** the controller creates exactly one logical local commit linked to the task and records evidence sufficient for recovery.
4. **Given** an execution or validation failure, **When** retry budget remains, **Then** the Debugger runs only for that failure and the controller performs no more attempts than the configured budget permits.

---

### User Story 3 - Publish a reviewable Draft PR (Priority: P3)

As the studio owner, I can publish a completed feature branch as one Draft PR, observe required GitHub checks, and receive a clear ready-for-manual-review or failed state without automatic merge or deployment.

**Why this priority**: A Draft PR is the automation boundary that creates a useful handoff while preserving human release control.

**Independent Test**: Use a disposable remote fixture to push an eligible feature branch, create or reconcile one Draft PR, simulate passing and failing checks, and verify that the loop stops before merge and deployment.

**Acceptance Scenarios**:

1. **Given** a fully validated local feature in draft-pr mode, **When** publication is requested, **Then** only the controller pushes the feature branch and creates or reconciles exactly one Draft PR.
2. **Given** a Draft PR with required checks pending, **When** the workflow observes GitHub, **Then** it records check state without declaring the feature ready.
3. **Given** a required CI failure, **When** the workflow handles the failure, **Then** it records diagnostics, applies the bounded debug/retry policy if eligible, and never merges or deploys.
4. **Given** all required checks passing, **When** the workflow reaches its terminal automation state, **Then** the Draft PR remains unmerged and is explicitly marked ready for manual review.

---

### User Story 4 - Resume, stop, and audit a run (Priority: P4)

As the studio owner, I can interrupt, resume, stop, or abort a feature safely and understand every material decision from durable artifacts rather than model memory.

**Why this priority**: Long-running automation is trustworthy only when recovery is deterministic and operator control is explicit.

**Independent Test**: Interrupt fixtures at each durable boundary, delete disposable process memory, and verify reconstruction from feature artifacts, Git evidence, remote SHA, commit trailers, Draft PR state, and the append-only event log.

**Acceptance Scenarios**:

1. **Given** a process interruption after a durable boundary, **When** the operator resumes, **Then** the workflow reconstructs state, reconciles external facts, and continues without duplicating completed effects.
2. **Given** contradictory local and remote evidence, **When** recovery runs, **Then** the workflow stops with a precise reconciliation error rather than guessing.
3. **Given** a stop request, **When** the current atomic operation reaches a safe boundary, **Then** no new task is dispatched and the feature remains resumable.
4. **Given** an abort request, **When** policy permits cleanup, **Then** disposable runtime resources are removed without deleting committed feature evidence, rewriting history, or touching unrelated worktrees.

### Edge Cases

- Two initializations discover the same next feature number.
- The requested branch already exists locally, in another worktree, or on the remote.
- The worktree target exists, is dirty, disappears, or points at the wrong branch.
- The canonical task graph contains a missing dependency, duplicate ID, cycle, unreachable task, or dependency on a later-invalid task.
- Generated `tasks.md` is manually edited and diverges from `tasks.json`.
- An agent emits malformed JSON, extra prose, an unknown schema version, an oversized response, or a syntactically valid but semantically inconsistent result.
- A task declares overlapping or unsafe paths, path traversal, symlink escape, a protected path, or a write although marked read-only.
- A command or validation profile attempts shell expansion, an untrusted executable, network access, secret access, Git mutation, or deployment.
- A task passes tests but review rejects correctness, scope, security, or maintainability.
- The Debugger proposes a change outside the failed task's declared paths or retry budget.
- Commit creation is interrupted before or after the object is written but before state is recorded.
- Push succeeds but the response is lost; the remote branch moves unexpectedly; or the Draft PR already exists.
- Required checks are missing, renamed, pending indefinitely, cancelled, flaky, or fail after a later push.
- Runtime state is missing or corrupt while durable Git and GitHub evidence remains valid.
- Stop or abort arrives during agent execution, validation, commit, push, or PR reconciliation.
- Logs or agent output contain values matching known secret patterns.

## Requirements *(mandatory)*

### Functional Requirements

#### Workflow boundary and modes

- **FR-001**: The system MUST accept one user request as exactly one feature workflow and MUST reject attempts to attach the same run to multiple feature branches or pull requests.
- **FR-002**: The system MUST support only `dry-run`, `local`, and `draft-pr` modes in V1, with progressively broader effects documented for each mode. Dry-run creates no resumable run. An existing local run MAY upgrade to `draft-pr` only from reconciled `stopped` or `locally_complete` state through the explicit `resume --mode draft-pr --allow-mode-upgrade` operator action followed by fresh draft-pr preflight; all other resume operations keep or narrow authority.
- **FR-003**: The system MUST NOT provide an auto-merge mode or perform merge, rebase, deployment, production release, or destructive repository cleanup.
- **FR-004**: The system MUST end successful automation at one Draft PR ready for manual review; converting it to a non-draft PR, approving, merging, and deploying remain human actions outside scope.
- **FR-005**: The system MUST be controlled by deterministic policy and state transitions, not by an LLM agent, hook, conversation transcript, or model response acting as runtime authority.
- **FR-006**: V1 MUST execute tasks sequentially and MUST allow at most one writing executor at a time.

#### Feature initialization and isolation

- **FR-007**: The system MUST allocate the next unique feature number deterministically from durable repository evidence and MUST detect allocation conflicts before mutation.
- **FR-008**: The system MUST derive a safe feature identifier and create exactly one feature branch per accepted request without changing the operator's unrelated working branch.
- **FR-009**: Each feature MUST execute in a dedicated Git worktree whose branch, base revision, root path, and cleanliness are verified before every mutating phase.
- **FR-010**: Initialization MUST refuse ambiguous branch/worktree ownership, unsafe paths, unsupported repository state, or unrelated changes that cannot be isolated without overwrite.
- **FR-011**: Dry-run initialization MUST report all proposed branch, worktree, artifact, task, validation, agent, Git, and GitHub effects without performing them and MUST NOT persist a lock, runtime cache, feature artifact, or other filesystem state.

#### Specification and task artifacts

- **FR-012**: Each feature MUST own durable specification, planning, research, data-model, quickstart, contract, and task artifacts sufficient to understand and recover the workflow without conversation history.
- **FR-013**: `tasks.json` MUST be the canonical task source for future automated features; `tasks.md` MUST be a generated human-readable view and MUST never be treated as runtime authority.
- **FR-014**: Every task MUST have a unique stable ID, requirement mappings, dependencies, concrete allowed paths, completion criteria, required tests, write/read-only classification, and a non-empty ordered list of trusted validation profiles.
- **FR-015**: Task ingestion MUST reject duplicate IDs, missing requirements, invalid paths, empty or duplicate profile lists, unknown profiles, contradictory write declarations, missing dependencies, cycles, and schemas newer than the controller supports. The canonical task schema is `1.1.0` with `validation_profiles`; a boundary loader MAY normalize a legacy `1.0.0` singular `validation_profile`, but a payload containing both is invalid.
- **FR-016**: The generated Markdown task view MUST be deterministic, carry a generated-file warning and source digest, and expose all decision-relevant canonical fields without semantic loss.

#### Scheduling and role execution

- **FR-017**: The scheduler MUST select only tasks whose dependencies are complete and MUST produce the same next-task decision for the same canonical state.
- **FR-018**: A failed, blocked, aborted, or policy-rejected task MUST prevent dependent tasks from becoming eligible unless an explicit recovery transition returns it to an eligible state.
- **FR-019**: The system MUST support four logical Codex roles: Planner, Implementer, Reviewer, and Debugger; the Debugger MUST run only in response to a recorded failure.
- **FR-020**: Each role invocation MUST be a separate `codex exec` process with a bounded prompt, explicit role, task ID, declared paths, ordered validation profile IDs, sandbox policy, retry context, and output schema.
- **FR-021**: Agent responses MUST be validated against versioned JSON Schemas before any response field can influence workflow state or privileged actions.
- **FR-022**: Schema-valid responses MUST also pass semantic validation, including task identity, attempt identity, allowed decisions, referenced paths, evidence, and consistency with observed repository state.
- **FR-023**: Agent narrative, prior chat, hidden reasoning, and remembered state MUST NOT substitute for controller-observed artifacts or durable evidence.
- **FR-024**: Model and reasoning settings MUST come from committed named role profiles with safe defaults; tasks MAY select only a permitted profile and MUST NOT inject arbitrary model flags.
- **FR-025**: Every role MUST run in the least-privileged sandbox compatible with its task, with Git/GitHub mutation and secret access unavailable to agents.

#### Paths, commands, validation, and review

- **FR-026**: Each task MUST declare the minimal repository-relative paths it may read or write, and path resolution MUST prevent traversal, symlink escape, protected-path access, and case-normalization bypass.
- **FR-027**: Before and after every writing invocation, the controller MUST capture repository state and MUST reject unstaged, staged, untracked, renamed, deleted, or mode changes outside the task's allowed write set.
- **FR-028**: A read-only task that produces any repository change MUST fail policy validation.
- **FR-029**: Validation MUST execute only committed, named, trusted profiles composed of fixed commands and constrained parameters; Planner and other agents MUST NOT supply arbitrary shell commands.
- **FR-030**: Command execution MUST avoid shell interpolation by default, constrain working directory, environment, timeout, output size, network policy, and executable allowlist, and record redacted results.
- **FR-031**: A task MUST pass its required trusted validations and diff guard before review can accept it.
- **FR-032**: Reviewer MUST assess requirement fulfillment, test evidence, scope, security, maintainability, and diff boundaries through a schema-validated decision; it MUST NOT mutate files.
- **FR-033**: Controller-observed facts MUST override conflicting agent claims, and any conflict MUST be logged and resolved as failure or operator-required reconciliation.

#### Failure, debug, and retry

- **FR-034**: Each task and CI-repair cycle MUST have explicit attempt and debugger budgets that count all eligible failed invocations and cannot be reset by process restart.
- **FR-035**: Debugger context MUST be limited to the failed task, sanitized diagnostics, current permitted diff, declared paths, and remaining budget.
- **FR-036**: A retry MUST repeat all applicable schema, semantic, diff, validation, and review gates; prior partial success MUST NOT bypass a gate.
- **FR-037**: Exhausted budget, non-retryable policy failure, irreconcilable external state, or repeated no-progress outcome MUST produce a durable blocked/failed terminal state with an actionable reason.

#### Controller-owned Git and GitHub effects

- **FR-038**: Git and GitHub mutations MUST be performed only by the controller through dedicated policy-enforcing services; agents MUST NOT commit, push, merge, rebase, create PRs, alter checks, or deploy.
- **FR-039**: One completed writing task MUST produce exactly one logical local commit; read-only tasks MUST produce no commit.
- **FR-040**: Every task commit MUST be based on the expected parent, contain only the accepted task diff, use a deterministic message policy, and include trailers linking feature ID, task ID, attempt, and artifact/schema versions.
- **FR-041**: Before push, the controller MUST verify branch ownership, expected local and remote SHAs, accepted task commits, clean worktree state, and mode authorization.
- **FR-042**: GitHub CLI `gh` MUST be the primary V1 transport for Draft PR and check operations; any later GitHub MCP integration MUST remain optional and MUST NOT be required for core recovery.
- **FR-043**: Draft PR creation MUST be idempotent and reconcile an existing PR by repository, head branch, base branch, and recorded PR identity rather than creating duplicates.
- **FR-044**: The controller MUST record the remote SHA returned or subsequently observed after each push and MUST stop on unexpected remote movement.
- **FR-045**: Required GitHub checks MUST be identified by committed policy, polled with bounded intervals/timeouts, and classified as pending, passed, failed, cancelled, missing, or indeterminate.
- **FR-046**: CI failure handling MAY invoke bounded diagnosis and repair for a mapped task or dedicated repair task, but every repair MUST traverse the normal diff, validation, review, commit, and push gates.

#### Durable state, recovery, control, and audit

- **FR-047**: Committed configuration MUST reside under `.studio-loop/`, controller source under `tools/studio_loop/`, and ignored runtime state under `.automation/state/`.
- **FR-048**: Runtime state MUST be treated as a rebuildable cache; authoritative recovery evidence MUST include feature artifacts, Git graph and trailers, observed worktree/branch facts, recorded remote SHA, and GitHub Draft PR/check state.
- **FR-049**: State transitions and privileged effects MUST use crash-safe write-ahead/intention and completion records so resume can distinguish not-started, in-flight, succeeded, and ambiguous operations.
- **FR-050**: Resume MUST validate artifact versions and digests, reconstruct task status, reconcile local and remote effects idempotently, and stop rather than guess when evidence conflicts. Mode authority MUST remain unchanged or narrow unless a reconciled local run in `stopped` or `locally_complete` state receives the exact `--mode draft-pr --allow-mode-upgrade` action and passes fresh draft-pr preflight before any broader effect.
- **FR-051**: Stop MUST prevent new dispatch after the current safe atomic boundary while preserving resumability; abort MUST follow explicit cleanup policy without deleting durable feature evidence or rewriting Git history.
- **FR-052**: The system MUST maintain an append-only, ordered, machine-readable event log with feature/run/task/attempt correlation, timestamps, actor, transition, sanitized evidence references, and integrity checks.

#### Security, hooks, documentation, and compatibility

- **FR-053**: Secrets MUST never be placed in prompts, task artifacts, logs, command arguments, committed configuration, commits, or PR bodies; inherited environment and outputs MUST be allowlisted and redacted.
- **FR-054**: The system MUST detect likely secret-bearing changes before commit/push and stop for operator resolution without printing the suspected value.
- **FR-055**: Hooks and command rules MAY add defense in depth but MUST NOT own scheduling or state transitions; a Stop hook MUST NOT automatically continue the Feature Loop.
- **FR-056**: Operator skills and documentation MUST explain initialization, allowed modes, configuration, task authoring, validation profiles, inspection, resume, stop, abort, recovery, security boundaries, and the manual-review handoff.
- **FR-057**: Controller behavior MUST be compatible with Python 3.11 or later and MUST reject unsupported runtime versions clearly.
- **FR-058**: The planned implementation MUST avoid modifications to application source under `frontend/` and `backend/` unless a future canonical task explicitly scopes such work for its own feature.
- **FR-059**: V1 MUST expose machine-readable status and diagnostics alongside concise operator-readable output, using stable exit categories for success, policy rejection, task failure, external failure, interruption, and reconciliation required.
- **FR-060**: Configuration, artifact, event, and agent-output formats MUST be explicitly versioned with a documented compatibility and migration policy.

### Mandated Architecture Constraints

- A deterministic Python 3.11+ controller, not an LLM agent, is the orchestrator.
- Controller source is planned for `tools/studio_loop/`; committed configuration is planned for `.studio-loop/`; ignored runtime state is planned for `.automation/state/`.
- Planner, Implementer, Reviewer, and failure-only Debugger are separate `codex exec` invocations with JSON Schema outputs.
- Git and GitHub are controller-only capabilities; `gh` is the primary V1 PR/CI transport.
- Feature work is sequential and isolated in one Git worktree per feature.
- One request maps to one feature branch and one Draft PR; one completed writing task maps to one logical commit.
- `tasks.json` is canonical and `tasks.md` is generated.
- Allowed modes are `dry-run`, `local`, and `draft-pr`; auto-merge does not exist.
- Automation stops at a Draft PR ready for manual review. Merge and deployment are outside scope.

### Constitution Constraints *(mandatory)*

- **Complexity Justification**: The controller, durable event/state model, subprocess isolation, Git service, and GitHub integration are necessary because the feature's purpose is safe orchestration. V1 deliberately excludes a database, queue, web service, parallel scheduler, auto-merge, and deployment.
- **API Contract Impact**: No frontend/backend HTTP endpoint or OpenAPI change. Contracts are local versioned JSON Schemas and controller CLI/artifact interfaces under the feature specification.
- **Security Impact**: The feature introduces privileged local Git/GitHub operations and untrusted agent output. Least privilege, path/diff guards, trusted commands, secret isolation/redaction, schema validation, controller-only mutation, and manual review are release gates.
- **Deployment Impact**: No frontend, backend, or GCP deployment. The deliverable is local developer tooling and documentation; deployment remains prohibited.
- **Accessibility & Performance Impact**: No visitor-facing UI. Operator output MUST be readable, structured, and usable without color alone. Dry-run and status operations SHOULD complete within the measurable targets below for a normal repository fixture.

### Key Entities *(include if feature involves data)*

- **Feature**: One accepted request, identified by number and slug, bound to one base revision, branch, worktree, artifact set, mode, and optional Draft PR.
- **Run**: One controller session for a feature, including mode, configuration digest, lifecycle state, timestamps, and recovery evidence.
- **Task**: A canonical unit of work with ID, requirement mappings, dependencies, paths, write flag, ordered `validation_profiles`, completion criteria, tests, and attempt budget. Runtime status is a controller-owned projection associated with the task and is not serialized into canonical `tasks.json` or written by an agent.
- **Task Graph**: The validated directed acyclic graph used to determine sequential eligibility.
- **Role Invocation**: One bounded Planner, Implementer, Reviewer, or Debugger process with input/output schema versions, sandbox, task/attempt identity, and sanitized evidence.
- **Validation Profile**: A committed named set of permitted checks with fixed executables, arguments, environment, timeouts, and applicability.
- **Attempt**: A counted execution or repair try linked to a task, role invocations, observed diff, validations, review decision, and outcome.
- **Commit Evidence**: Expected parent, resulting commit SHA, tree/diff identity, message, and task-linking trailers created by the controller.
- **Pull Request Evidence**: Repository, branch/base identity, Draft PR number/URL, head SHA, and required-check observations.
- **Event**: An append-only record of a transition, decision, intention, effect, or reconciliation result with correlation IDs and redacted evidence.
- **Runtime Snapshot**: A disposable cached projection under `.automation/state/` that accelerates operation but is never the sole recovery authority.
- **Policy Configuration**: Versioned committed definitions for modes, protected/allowed paths, role/model profiles, validation profiles, budgets, Git rules, GitHub checks, redaction, and lifecycle behavior.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In an acceptance suite covering all lifecycle phases, 100% of forbidden merge, rebase, deployment, agent-owned Git/GitHub mutation, arbitrary-command, protected-path, and secret-exposure attempts are stopped before the prohibited effect.
- **SC-002**: For the same request, repository evidence, artifacts, and configuration, 100 repeated dry runs produce the same feature identity proposal, task order, policy decisions, and planned effects, excluding timestamps and unique run identifiers.
- **SC-003**: Every accepted canonical task set renders a Markdown view with 100% field agreement, and every intentional divergence or manual edit is detected before task execution.
- **SC-004**: Recovery tests interrupted before and after every privileged-effect boundary resume without duplicate commits, pushes, or Draft PRs in 100% of covered cases; ambiguous evidence always stops for reconciliation.
- **SC-005**: Every completed writing task in integration tests maps to exactly one logical task commit, and every such commit is traceable back to one feature, task, attempt, and artifact version without runtime cache access.
- **SC-006**: Every role response used by the workflow passes its declared JSON Schema and semantic checks; malformed, mismatched, or unsupported responses influence no privileged action.
- **SC-007**: On a local repository fixture with 200 tasks and warm filesystem cache, graph validation plus next-task selection complete within 2 seconds on the reference minimum benchmark of 4 logical CPU cores, 8 GB RAM, and local SSD; the benchmark performs no network call or agent invocation.
- **SC-008**: In a recorded usability protocol with at least 10 first-time maintainers, at least 9 can identify current state, next safe action, last failure, and whether external effects occurred within 5 minutes using only documented status and quickstart guidance.
- **SC-009**: A successful draft-pr-mode acceptance run creates exactly one feature branch and one Draft PR, reports required checks accurately, and stops with zero merge or deployment actions.
- **SC-010**: Automated tests cover every state transition, policy rejection class, retry exhaustion path, recovery boundary, and allowed mode, with no unresolved CRITICAL or HIGH consistency findings before implementation begins.

## Assumptions

- V1 is operated by one trusted repository maintainer on a local workstation with Git, Codex CLI, and (for `draft-pr`) authenticated GitHub CLI available.
- The repository uses GitHub as its remote collaboration system, and branch protection/check names can be represented in committed policy.
- Only the deterministic controller receives authority for allowed filesystem, Git, network, and GitHub effects; agent processes are treated as untrusted contributors.
- Runtime state may be lost at any time, so recovery correctness is valued above automatic continuation when evidence is ambiguous.
- Task parallelism, multiple writing executors, auto-merge, deployment, long-lived services, databases, queues, GitHub MCP as a required dependency, and restoration of the removed manager loop are outside V1.
- Existing feature specifications 001-006 remain unchanged.
- The specification describes future controller behavior; it is not runtime state and does not authorize implementation during this phase.
