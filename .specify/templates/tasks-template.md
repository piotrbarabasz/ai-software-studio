---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include tests for API contracts, validation boundaries, critical
frontend journeys, accessibility-sensitive UI behavior, and business-critical
lead-generation paths. Omit a test category only when plan.md explicitly states
that the feature has no relevant behavior in that category.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/app/`, `frontend/src/assets/`,
  `frontend/src/environments/`, and frontend tests/e2e paths
- **Backend**: `backend/app/`, `backend/tests/contract/`,
  `backend/tests/integration/`, `backend/tests/unit/`
- **Contracts/Docs**: feature contracts under `specs/[###-feature]/contracts/`
  and developer instructions in `README.md`, `docs/`, or `quickstart.md`
- Paths shown below assume the AI Software Studio Angular/FastAPI split; adjust
  only when plan.md documents a constitution-compliant reason

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit-tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create or update Angular/FastAPI project structure per implementation plan
- [ ] T002 Initialize required Angular frontend and/or FastAPI backend dependencies
- [ ] T003 [P] Configure linting, formatting, and typed build checks
- [ ] T004 [P] Document local run/test scripts and required environment variables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T005 [P] Setup FastAPI routing, OpenAPI metadata, and contract export path
- [ ] T006 [P] Setup Angular API service boundaries and typed request/response models
- [ ] T007 Configure environment-based settings and restricted CORS defaults
- [ ] T008 Add shared validation, error handling, and safe logging infrastructure
- [ ] T009 Add rate-limit-ready boundary for contact or public submission endpoints
- [ ] T010 Confirm no CMS, auth, database, queue, or storage is added unless justified in plan.md

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (required where behavior exists)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T011 [P] [US1] Contract test for [endpoint] in backend/tests/contract/test_[name].py
- [ ] T012 [P] [US1] Integration test for [user journey] in backend/tests/integration/test_[name].py

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create [Entity1] model/schema in backend/app/models/[entity1].py
- [ ] T014 [P] [US1] Create Angular feature UI in frontend/src/app/features/[feature]/
- [ ] T015 [US1] Implement FastAPI service/endpoint in backend/app/[location]/[file].py
- [ ] T016 [US1] Implement typed Angular API integration in frontend/src/app/services/[service].ts
- [ ] T017 [US1] Add validation, error handling, and safe logging
- [ ] T018 [US1] Update OpenAPI contract and frontend types

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (required where behavior exists)

- [ ] T019 [P] [US2] Contract test for [endpoint] in backend/tests/contract/test_[name].py
- [ ] T020 [P] [US2] Integration test for [user journey] in backend/tests/integration/test_[name].py

### Implementation for User Story 2

- [ ] T021 [P] [US2] Create [Entity] model/schema in backend/app/models/[entity].py
- [ ] T022 [US2] Implement [Service] in backend/app/services/[service].py
- [ ] T023 [US2] Implement Angular UI/API changes in frontend/src/app/features/[feature]/
- [ ] T024 [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (required where behavior exists)

- [ ] T025 [P] [US3] Contract test for [endpoint] in backend/tests/contract/test_[name].py
- [ ] T026 [P] [US3] Integration test for [user journey] in backend/tests/integration/test_[name].py

### Implementation for User Story 3

- [ ] T027 [P] [US3] Create [Entity] model/schema in backend/app/models/[entity].py
- [ ] T028 [US3] Implement [Service] in backend/app/services/[service].py
- [ ] T029 [US3] Implement Angular UI/API changes in frontend/src/app/features/[feature]/

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests in frontend/ and backend/tests/unit/
- [ ] TXXX [P] Accessibility and responsive viewport verification
- [ ] TXXX [P] OpenAPI contract verification and frontend type alignment
- [ ] TXXX Security hardening, CORS review, and contact rate-limit readiness check
- [ ] TXXX Confirm Polish-first content and English-ready structure
- [ ] TXXX Confirm frontend and backend deployment instructions remain independent
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Required tests MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- OpenAPI contract before frontend integration against new backend behavior
- Validation and security boundaries before public input release
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
