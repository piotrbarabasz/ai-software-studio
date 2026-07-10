# Agent Workflow

This repository uses Spec Kit as the source of truth and Codex agents as a
manager-gated implementation loop.

## Source of Truth

- `specs/**/spec.md` defines product requirements.
- `specs/**/plan.md` defines the technical approach.
- `specs/**/tasks.md` defines the implementation queue.
- Do not modify Spec Kit artifacts during implementation unless the selected
  task package explicitly allows it.

## Repo Workflow

Use this loop for Spec Kit work:

```text
spec_manager -> spec_explorer -> spec_programmer -> spec_debugger -> spec_reviewer -> spec_manager
```

The manager selects one task, prepares a bounded task package, and gates every
handoff. Implementation does not continue to another task without explicit
manager approval.

## Agent Roles

- `spec_manager`: read-only coordinator. Selects exactly one task, prepares the
  task package, assigns agents, and marks completion only after reviewer PASS.
- `spec_explorer`: read-only investigator. Inspects files, dependencies, tests,
  and risks, then returns evidence and recommended allowed files.
- `spec_programmer`: workspace-write implementer. Edits only files allowed by
  the selected task package and makes one focused diff.
- `spec_debugger`: workspace-write validation agent. Runs requested validation
  and applies only minimal fixes directly related to the selected task.
- `spec_reviewer`: read-only reviewer. Checks the diff against the selected
  task package, Spec Kit artifacts, acceptance criteria, and file boundaries.

## One-Task-at-a-Time Rule

- Implement exactly one selected task package at a time.
- Do not start another task without explicit manager approval.
- Do not complete phases automatically.
- Do not mark unrelated tasks as `[X]`.
- One task should result in one focused diff.

## Task Package Format

Each implementation handoff should include:

- Selected task ID and text from `tasks.md`
- Relevant spec, plan, and task references
- Acceptance criteria
- Allowed files
- Forbidden files
- Validation commands
- Reviewer expectations

## Validation Expectations

Frontend:

- `npm run build`
- `npm test`, if relevant

Backend:

- `cd backend`
- `python -m pytest`
- `python -m ruff check .`, if available

Before commit:

- `git status`
- `git diff --stat`
- `git diff`

## Safety Rules

- Explorer and reviewer are read-only.
- Programmer edits only the selected task scope.
- Debugger applies minimal task-related fixes only.
- Respect allowed and forbidden files from the task package.
- Keep unrelated refactors out of the diff.

## Forbidden Actions

- Force push
- Destructive git commands
- Production deployment
- Secrets changes
- Broad unrelated refactors
- Product code changes outside the selected task package
