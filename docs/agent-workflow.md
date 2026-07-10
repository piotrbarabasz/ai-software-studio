# Agent Workflow Playbook

## Purpose

Use this workflow to keep Spec Kit implementation manager-gated, scoped, and
reviewable. Each loop handles exactly one selected task package.

```text
spec_manager -> spec_explorer -> spec_programmer -> spec_debugger -> spec_reviewer -> spec_manager
```

## Agent Use

- `spec_manager`: Selects one task, prepares the task package, coordinates
  handoffs, and marks completion only after reviewer PASS.
- `spec_explorer`: Investigates the repo read-only before implementation and
  identifies evidence, risks, tests, and recommended allowed files.
- `spec_programmer`: Implements the selected task package only.
- `spec_debugger`: Runs requested validation and applies minimal selected-task
  fixes when needed.
- `spec_reviewer`: Reviews the diff read-only and returns PASS or FAIL.

## Task Package Format

```text
Selected task:
- ID:
- Text:

Spec Kit context:
- spec.md:
- plan.md:
- tasks.md:
- Other artifacts:

Acceptance criteria:
- ...

Allowed files:
- ...

Forbidden files:
- ...

Validation commands:
- ...

Reviewer expectations:
- ...
```

## Expected Explorer Output

- Relevant files with evidence
- Dependencies and prior-task assumptions
- Existing tests and validation commands
- Risks or ambiguity
- Recommended allowed files and forbidden files

## Expected Programmer Output

- Files changed
- Implementation summary
- Validation commands run locally, if any
- Anything not completed
- Confirmation that no next task was started

## Expected Debugger Output

- Commands run
- PASS/FAIL result
- Failure cause, if any
- Minimal fix summary or recommendation
- Scope concerns, if fixing would exceed the task package

## Reviewer PASS/FAIL Format

```text
Result: PASS | FAIL

Blocking issues:
- ...

Non-blocking issues:
- ...

Missing validation:
- ...

Scope drift:
- ...

Safe to mark selected task [X]: yes | no
```

## Marking Tasks Complete

A task may be marked `[X]` only when:

- The selected task package is complete.
- Validation requested by the package has passed or accepted exceptions are
  documented.
- `spec_reviewer` returns PASS.
- Only the selected task is being marked complete.

## Failed Validation

If validation fails, `spec_debugger` diagnoses the failure and applies only
minimal fixes inside the allowed files. If the fix requires broader scope,
return to `spec_manager` for a new task package or explicit approval.

## Scope Drift

If any agent discovers work outside the selected task package, stop expanding
the diff. Report the drift to `spec_manager` with the file path, reason, and
recommended next task.

## Forbidden Actions

- Running unrelated implementation work
- Starting another task without manager approval
- Marking unrelated tasks as `[X]`
- Editing forbidden files
- Broad refactors
- Force push or destructive git commands
- Production deployment
- Secrets changes
