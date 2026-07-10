# Agent workflow

This repository uses Spec Kit as the source of truth.

## Rules

- `specs/**/spec.md` defines product requirements.
- `specs/**/plan.md` defines technical approach.
- `specs/**/tasks.md` defines implementation order.
- Implement one task at a time.
- Do not start another task without explicit manager approval.
- Do not modify Spec Kit artifacts during implementation unless explicitly requested.
- Reviewer is read-only.
- Explorer is read-only.
- Programmer may edit files only inside the task package scope.
- Debugger may run validation and apply only minimal task-related fixes.
- One task should result in one focused diff.
- Do not use force push, destructive git commands, production deployment, or secrets changes.

## Standard validation

Frontend:
- npm run build
- npm test, if relevant

Backend:
- cd backend
- python -m pytest
- python -m ruff check ., if available

Before commit:
- git status
- git diff --stat
- git diff