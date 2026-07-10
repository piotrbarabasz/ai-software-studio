---
name: speckit-implement
description: Execute exactly one selected Spec Kit task package.
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: templates/commands/implement.md
---

# Speckit Implement

## User Input

```text
$ARGUMENTS
```

Consider the user input before proceeding. The input must identify a selected task package from `spec_manager`, or the selected task package must already be available in the conversation.

## Non-Negotiable Scope

- Execute exactly one selected Spec Kit task package.
- If no selected task package is provided, stop and ask `spec_manager` to prepare one.
- Do not process the entire `tasks.md` queue automatically.
- Do not execute every task.
- Do not complete phases automatically.
- Do not continue to another task without explicit manager approval.
- Respect the allowed files and forbidden files from the task package.
- Mark only the selected task as complete, and only after validation and review criteria are met.
- Never mark unrelated tasks as `[X]`.

## Required Task Package

The selected task package must include:

- Selected task ID and exact task text from `tasks.md`
- Feature directory and relevant Spec Kit artifact paths
- Acceptance criteria
- Allowed files
- Forbidden files
- Validation commands
- Reviewer expectations

If any of these are missing and cannot be safely inferred from the selected task, stop and ask `spec_manager` for a complete package.

## Pre-Execution Checks

1. Confirm the selected task package is present.
2. Confirm all planned edits are within the package's allowed files.
3. Read only the Spec Kit artifacts needed for the selected task:
   - `spec.md` for product requirements
   - `plan.md` for technical approach
   - `tasks.md` for the selected task and nearby dependency context
   - optional artifacts named by the task package
4. Check `.specify/extensions.yml` for `hooks.before_implement`.
   - Skip silently if the file is missing or invalid.
   - Ignore hooks where `enabled` is explicitly `false`.
   - Treat hooks without `enabled` as enabled.
   - Do not evaluate non-empty hook conditions.
   - For mandatory executable hooks, emit `EXECUTE_COMMAND: {command}`, invoke the hook, and wait for it to finish before implementation.
   - For optional hooks, report the command and continue unless the user asks to run it.

## Execution Rules

- Make the smallest defensible change that satisfies the selected task.
- Keep all edits inside the selected task package scope.
- Preserve existing project patterns and local helper APIs.
- Do not refactor unrelated code.
- Do not modify Spec Kit artifacts unless the selected task package explicitly permits it.
- Halt if implementation requires a forbidden file or broader scope; report the scope issue to `spec_manager`.

## Validation

Run only the validation commands requested by the task package unless a failure requires a narrower diagnostic command. Record every command and result.

If validation fails:

- Diagnose the failure.
- Apply only minimal fixes directly related to the selected task and allowed files.
- If the fix would broaden scope, stop and return the failure evidence to `spec_manager`.

## Completion Rules

Before reporting completion:

1. Confirm the selected task's acceptance criteria are satisfied.
2. Confirm validation passed, or clearly report unresolved failures.
3. Confirm the diff contains only allowed files.
4. Check `.specify/extensions.yml` for `hooks.after_implement` using the same hook rules as pre-execution.
5. Mark the selected task as `[X]` only when the task package allows editing `tasks.md` and validation/review criteria are met.

## Forbidden Behavior

These behaviors are explicitly forbidden:

- Running the whole task queue
- Performing broad phase completion
- Starting another task after the selected task is done
- Marking unrelated tasks as `[X]`
- Editing files outside the selected task package

## Completion Report

Report:

1. Selected task completed
2. Files changed
3. Implementation summary
4. Validation commands and results
5. Any unresolved issues or scope blockers
6. Whether the task is ready for `spec_reviewer`

## Done When

- [ ] Exactly one selected task package was handled
- [ ] Only allowed files were changed
- [ ] Requested validation was run and reported
- [ ] No unrelated tasks were marked `[X]`
- [ ] Completion was reported with review-ready evidence
