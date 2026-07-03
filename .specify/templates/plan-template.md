# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript for Angular frontend; Python 3.12+ for
FastAPI backend, or NEEDS CLARIFICATION if a feature requires a different
runtime.

**Primary Dependencies**: Angular, FastAPI, Pydantic, OpenAPI tooling, or NEEDS
CLARIFICATION for feature-specific additions.

**Storage**: N/A by default. Any CMS, database, queue, or persistent storage
requires constitution justification.

**Testing**: Angular unit/component tests for frontend behavior; pytest and API
contract/integration tests for FastAPI behavior.

**Target Platform**: Independently deployable frontend and backend on Google
Cloud Platform-compatible targets.

**Project Type**: Marketing website with separate Angular frontend and FastAPI
backend.

**Performance Goals**: Fast mobile and desktop page loads, accessible UI, and
responsive lead-generation flows; quantify per feature.

**Constraints**: Polish-first content, English-ready architecture, no secrets in
repo, restricted CORS, validated public inputs, explicit OpenAPI contracts.

**Scale/Scope**: Solo-service professional marketing site MVP; expand only when
the feature proves business value.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Business value**: Feature states how it supports lead generation, trust
  building, or service explanation, with measurable success criteria.
- **MVP simplicity**: No CMS, authentication, database, queue, or persistent
  infrastructure is introduced unless justified in Complexity Tracking.
- **Architecture separation**: Angular frontend and FastAPI backend remain
  independently buildable, testable, configurable, and deployable.
- **API contract**: Every backend endpoint is represented in OpenAPI, with
  typed frontend usage and contract or integration test coverage.
- **UX and localization**: UI is responsive, accessible, fast, Polish-first, and
  structured for later English support.
- **Security**: Environment variables are documented, secrets stay out of the
  repo, CORS is restricted, public inputs are validated, and contact flows are
  rate-limit-ready.
- **Developer readiness**: Folder structure, scripts, local run instructions,
  and deployment notes are updated for the feature.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: AI Software Studio features MUST use the separated web app
  layout unless the constitution is amended. Start from frontend/ for Angular
  and backend/ for FastAPI, then expand with real paths for this feature. The
  delivered plan must not include Option labels, mobile examples, or unused
  single-project placeholders.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
