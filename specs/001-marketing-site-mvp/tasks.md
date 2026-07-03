# Tasks: Marketing Website MVP

**Input**: Design documents from `/specs/001-marketing-site-mvp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Required for this feature because the plan calls for Angular frontend tests plus pytest contract, validation, and endpoint coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the separated Angular/FastAPI repository structure and baseline developer tooling.

- [ ] T001 Create repository directories and placeholder documentation files in `frontend/`, `backend/`, `infra/README.md`, `docs/local-development.md`, and `docs/deployment-notes.md`
- [ ] T002 Initialize Angular project configuration with standalone component support in `frontend/package.json`, `frontend/angular.json`, `frontend/tsconfig.json`, and `frontend/src/main.ts`
- [ ] T003 Initialize FastAPI backend dependency manifest in `backend/pyproject.toml` with FastAPI, Pydantic, uvicorn, pytest, httpx, email validation, Ruff, and CORS-related dependencies
- [ ] T004 [P] Add frontend environment configuration placeholders in `frontend/src/environments/environment.ts` and `frontend/src/environments/environment.prod.ts`
- [ ] T005 [P] Add backend package structure markers in `backend/app/__init__.py`, `backend/app/api/__init__.py`, `backend/app/core/__init__.py`, `backend/app/schemas/__init__.py`, and `backend/app/services/__init__.py`
- [ ] T006 [P] Add concrete frontend npm scripts for `lint`, `format`, `test`, and `build` in `frontend/package.json`
- [ ] T007 Add Ruff lint/format configuration and pytest configuration in `backend/pyproject.toml`, plus backend developer command scripts in `backend/scripts/lint.ps1`, `backend/scripts/format.ps1`, and `backend/scripts/test.ps1`
- [ ] T008 [P] Add root README with frontend, backend, docs, infra, and specs overview in `README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish cross-cutting configuration, API shell, typed frontend boundaries, and content/data structures needed by every story.

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T009 Create FastAPI app factory and route registration shell in `backend/app/main.py`
- [ ] T010 Create environment-driven backend settings in `backend/app/core/config.py`
- [ ] T011 Create restricted CORS configuration helper in `backend/app/core/cors.py`
- [ ] T012 [P] Add shared API router registry shell for later health and contact routers in `backend/app/api/router.py`
- [ ] T013 [P] Add backend test client fixture in `backend/tests/conftest.py`
- [ ] T014 [P] Add Angular route configuration with landing route and anchor-scroll support in `frontend/src/app/app.routes.ts`
- [ ] T015 Create Angular app configuration wiring router, HTTP client, and environment API URL in `frontend/src/app/app.config.ts`
- [ ] T016 [P] Create typed frontend API configuration model in `frontend/src/app/core/api-config.ts`
- [ ] T017 [P] Create shared frontend content directory and Polish content entry point in `frontend/src/app/core/content/pl.ts`
- [ ] T018 [P] Create global mobile-first styling baseline in `frontend/src/styles.scss`
- [ ] T019 [P] Copy API contract reference into generated planning docs by verifying `specs/001-marketing-site-mvp/contracts/openapi.yaml`
- [ ] T020 [P] Document no database, no auth, and no CMS MVP boundaries in `docs/local-development.md`

**Checkpoint**: Foundation ready. User story implementation can now proceed in priority order or in parallel where noted.

---

## Phase 3: User Story 1 - Understand Offer and Start Contact (Priority: P1) MVP

**Goal**: A visitor immediately understands AISoftware Studio's offer and can move toward contact from the first screen.

**Independent Test**: A Polish-speaking visitor can identify the brand, main services, and contact CTA from the first screen without external context.

### Tests for User Story 1

- [ ] T021 [P] [US1] Add frontend unit tests for landing hero content and CTA anchor target in `frontend/src/app/features/landing/landing.component.spec.ts`
- [ ] T022 [P] [US1] Add frontend unit tests for SEO metadata setup in `frontend/src/app/features/landing/landing-seo.spec.ts`
- [ ] T023 [P] [US1] Add frontend WCAG 2.2 AA accessibility tests for skip link, semantic landmarks, heading order, keyboard CTA reachability, visible focus, and CTA accessible names in `frontend/src/app/features/landing/landing-a11y.spec.ts`

### Implementation for User Story 1

- [ ] T024 [P] [US1] Create landing page standalone component shell in `frontend/src/app/features/landing/landing.component.ts`
- [ ] T025 [P] [US1] Create landing page template with hero, primary CTA, skip link, and section anchors in `frontend/src/app/features/landing/landing.component.html`
- [ ] T026 [P] [US1] Create landing page mobile-first styles in `frontend/src/app/features/landing/landing.component.scss`
- [ ] T027 [US1] Define Polish hero, value proposition, CTA, and trust-copy content in `frontend/src/app/core/content/pl.ts`
- [ ] T028 [US1] Wire landing component into app routing in `frontend/src/app/app.routes.ts`
- [ ] T029 [US1] Implement SEO title, description, canonical path, Open Graph title, and Open Graph description handling in `frontend/src/app/features/landing/landing.component.ts`
- [ ] T030 [US1] Add header or top navigation anchor links to hero, services, process, technology, examples, about, and contact in `frontend/src/app/features/landing/landing.component.html`
- [ ] T031 [US1] Ensure CTA targets the contact section anchor without requiring a separate page in `frontend/src/app/features/landing/landing.component.html`

**Checkpoint**: User Story 1 is independently testable as a Polish landing hero with clear offer, trust copy, metadata, and contact CTA.

---

## Phase 4: User Story 2 - Evaluate Services and Cooperation Model (Priority: P2)

**Goal**: A visitor can match their need to a service category and understand the cooperation process.

**Independent Test**: A visitor can identify at least one matching service and understand the flow from discovery to delivery.

### Tests for User Story 2

- [ ] T032 [P] [US2] Add frontend unit tests for required service offerings in `frontend/src/app/features/landing/services-section.spec.ts`
- [ ] T033 [P] [US2] Add frontend unit tests for process step ordering and client outcomes in `frontend/src/app/features/landing/process-section.spec.ts`
- [ ] T034 [P] [US2] Add content model tests for service offering and process step completeness in `frontend/src/app/core/content/services-process.content.spec.ts`

### Implementation for User Story 2

- [ ] T035 [US2] Add Service Offering content objects with six required services in `frontend/src/app/core/content/pl.ts`
- [ ] T036 [US2] Add Process Step content objects for discovery, scope, implementation, validation, and delivery in `frontend/src/app/core/content/pl.ts`
- [ ] T037 [US2] Implement services section markup with service titles, outcomes, and use cases in `frontend/src/app/features/landing/landing.component.html`
- [ ] T038 [US2] Implement process section markup with ordered cooperation stages and client outcomes in `frontend/src/app/features/landing/landing.component.html`
- [ ] T039 [US2] Add responsive services and process layouts in `frontend/src/app/features/landing/landing.component.scss`
- [ ] T040 [US2] Add service and process anchor targets to navigation labels in `frontend/src/app/features/landing/landing.component.html`

**Checkpoint**: User Stories 1 and 2 are independently testable as a single page explaining the offer and cooperation model.

---

## Phase 5: User Story 3 - Build Trust Before Inquiry (Priority: P3)

**Goal**: A visitor can assess technical credibility, example project thinking, and owner positioning before contacting AISoftware Studio.

**Independent Test**: A visitor can identify technology capabilities, placeholder examples, and technical-partner positioning without confusing placeholders for real projects.

### Tests for User Story 3

- [ ] T041 [P] [US3] Add frontend unit tests for required technology capability labels and business-use descriptions in `frontend/src/app/features/landing/technology-section.spec.ts`
- [ ] T042 [P] [US3] Add frontend unit tests ensuring placeholder examples are clearly labeled in `frontend/src/app/features/landing/examples-section.spec.ts`
- [ ] T043 [P] [US3] Add frontend unit tests for about section technical-partner positioning in `frontend/src/app/features/landing/about-section.spec.ts`
- [ ] T044 [P] [US3] Add content model tests for technology capabilities and placeholder case studies in `frontend/src/app/core/content/trust.content.spec.ts`

### Implementation for User Story 3

- [ ] T045 [US3] Add Technology Capability content objects for Angular, FastAPI, Python, cloud, GCP, APIs, databases, AI/RAG/LLM tools, integrations, and automation in `frontend/src/app/core/content/pl.ts`
- [ ] T046 [US3] Add Placeholder Case Study content objects with labels, problem, approach, outcome, and service tags in `frontend/src/app/core/content/pl.ts`
- [ ] T047 [US3] Add about section Polish copy positioning AISoftware Studio as a technical partner in `frontend/src/app/core/content/pl.ts`
- [ ] T048 [US3] Implement technology section markup in `frontend/src/app/features/landing/landing.component.html`
- [ ] T049 [US3] Implement clearly labeled placeholder examples section in `frontend/src/app/features/landing/landing.component.html`
- [ ] T050 [US3] Implement about section markup in `frontend/src/app/features/landing/landing.component.html`
- [ ] T051 [US3] Add responsive trust-section, example-card, and about-section styles in `frontend/src/app/features/landing/landing.component.scss`

**Checkpoint**: User Stories 1, 2, and 3 are independently testable as a trust-building Polish marketing page.

---

## Phase 6: User Story 4 - Submit a Qualified Project Inquiry (Priority: P4)

**Goal**: A visitor can submit a valid project inquiry, and invalid or undeliverable submissions are handled clearly without storing data in a database.

**Independent Test**: A visitor can submit valid contact data and sees Polish success feedback only after backend acceptance; invalid data, missing consent, rate limits, and delivery failure produce clear non-sensitive errors.

### Tests for User Story 4

- [ ] T052 [P] [US4] Add backend contract tests for reachability-only `GET /health` that does not verify email provider readiness in `backend/tests/contract/test_health_contract.py`
- [ ] T053 [P] [US4] Add backend contract tests for `POST /api/contact` accepted, validation, rate-limit, and delivery-failure responses in `backend/tests/contract/test_contact_contract.py`
- [ ] T054 [P] [US4] Add backend schema validation unit tests for Contact Inquiry field limits, enums, and consent in `backend/tests/unit/test_contact_schema.py`
- [ ] T055 [P] [US4] Add backend integration tests for contact email delivery success, non-sensitive logged failure paths, and local contact processing under 1 second with external email provider mocked in `backend/tests/integration/test_contact_delivery.py`
- [ ] T056 [P] [US4] Add backend CORS tests for local frontend origin and rejected unapproved origin in `backend/tests/integration/test_cors.py`
- [ ] T057 [P] [US4] Add frontend reactive form validation tests for required fields, consent, accessible labels, and associated Polish error messages in `frontend/src/app/features/contact/contact-form.component.spec.ts`
- [ ] T058 [P] [US4] Add frontend contact API service tests for success, validation error, rate-limit, and delivery-failure responses in `frontend/src/app/services/contact-api.service.spec.ts`

### Implementation for User Story 4

- [ ] T059 [P] [US4] Implement Contact Inquiry Pydantic schema with project type and budget range enums in `backend/app/schemas/contact.py`
- [ ] T060 [P] [US4] Implement reachability-only health endpoint in `backend/app/api/health.py` without checking SMTP or email provider readiness
- [ ] T061 [US4] Implement contact delivery email adapter with environment-driven SMTP configuration, no database persistence, clear failure responses, and non-sensitive backend logging in `backend/app/services/contact_delivery.py`
- [ ] T062 [US4] Implement rate-limit-ready contact intake service boundary in `backend/app/services/contact_intake.py`
- [ ] T063 [US4] Implement `POST /api/contact` route with validation, delivery, `202`, `422`, `429`, and `503` behavior in `backend/app/api/contact.py`
- [ ] T064 [US4] Register health and contact routers through `backend/app/api/router.py` and `backend/app/main.py`
- [ ] T065 [US4] Implement backend CORS origin loading from environment settings in `backend/app/core/cors.py`
- [ ] T066 [P] [US4] Create typed frontend contact inquiry models matching OpenAPI fields in `frontend/src/app/services/contact-api.types.ts`
- [ ] T067 [US4] Implement Angular contact API service using environment API URL in `frontend/src/app/services/contact-api.service.ts`
- [ ] T068 [P] [US4] Create standalone reactive contact form component in `frontend/src/app/features/contact/contact-form.component.ts`
- [ ] T069 [P] [US4] Create contact form template with name, email, company, project type, budget range, message, consent, accessible labels, and associated Polish validation messages in `frontend/src/app/features/contact/contact-form.component.html`
- [ ] T070 [P] [US4] Create contact form styles with mobile-first layout, WCAG 2.2 AA contrast, and visible focus states in `frontend/src/app/features/contact/contact-form.component.scss`
- [ ] T071 [US4] Embed contact form component in the landing contact section in `frontend/src/app/features/landing/landing.component.html`
- [ ] T072 [US4] Add Polish success, validation, rate-limit, and clear non-sensitive delivery-failure copy to `frontend/src/app/core/content/pl.ts`
- [ ] T073 [US4] Update OpenAPI contract if implementation refines schemas in `specs/001-marketing-site-mvp/contracts/openapi.yaml`

**Checkpoint**: All user stories are independently functional and the qualified inquiry path is testable end to end.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate quality gates across the complete MVP and prepare developer handoff documentation.

- [ ] T074 [P] Add frontend lint, format, test, build, and environment configuration instructions in `frontend/README.md`
- [ ] T075 [P] Add backend run, Ruff lint, Ruff format, pytest, environment variable, email notification, and no-database instructions in `backend/README.md`
- [ ] T076 Update root project instructions for running both apps locally in `README.md`
- [ ] T077 Add local development guide with two-terminal workflow and CORS details in `docs/local-development.md`
- [ ] T078 [P] Add future GCP deployment notes for static/container frontend and Cloud Run-ready backend in `docs/deployment-notes.md`
- [ ] T079 [P] Add infra placeholder scope note stating no deployment implementation is included in `infra/README.md`
- [ ] T080 Run quickstart validation and record any required documentation adjustments in `specs/001-marketing-site-mvp/quickstart.md`
- [ ] T081 Run frontend WCAG 2.2 AA responsive and accessibility review notes for semantic HTML, keyboard navigation, labels, validation messages, contrast, and visible focus in `docs/local-development.md`
- [ ] T082 Run API contract alignment review between backend implementation and `specs/001-marketing-site-mvp/contracts/openapi.yaml`
- [ ] T083 Run security review for secrets, CORS, non-sensitive errors, logged email delivery failures, consent handling, and rate-limit readiness in `docs/local-development.md`
- [ ] T084 Run Polish copy review and English-ready content structure review in `frontend/src/app/core/content/pl.ts`
- [ ] T085 Confirm no database, auth, CMS, admin panel, payment, blog, queue, Cloud Build, Terraform, or production GCP resources were added in `docs/deployment-notes.md`
- [ ] T086 Run or document desktop Lighthouse validation for the frontend production build with Performance >= 90 and Accessibility >= 90, directly covering SC-009 in `docs/local-development.md`
- [ ] T087 Review frontend production build initial JS/CSS/assets and unnecessary dependency weight, documenting any required reductions and directly covering FR-023 in `docs/local-development.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; starts immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user story work.
- **User Story 1 (Phase 3)**: Depends on Foundation; recommended MVP slice.
- **User Story 2 (Phase 4)**: Depends on Foundation and can be developed after or alongside US1 content work, but final navigation depends on US1 shell.
- **User Story 3 (Phase 5)**: Depends on Foundation and can be developed after or alongside US2 content work, but final navigation depends on US1 shell.
- **User Story 4 (Phase 6)**: Depends on Foundation; can be developed in parallel with content stories after shared API/config boundaries exist.
- **Polish (Phase 7)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after Foundation; provides shell, navigation, hero, metadata, and contact anchor.
- **US2 (P2)**: Depends on US1 shell for final page integration; service/process content can be prepared independently.
- **US3 (P3)**: Depends on US1 shell for final page integration; trust content can be prepared independently.
- **US4 (P4)**: Depends on Foundation; backend/contact implementation can proceed independently and integrates into US1 contact section.

### Within Each User Story

- Tests first, expected to fail before implementation.
- Content/data models before templates that render them.
- Backend schemas before backend services and endpoints.
- OpenAPI contract alignment before frontend contact API service completion.
- Validation and safe error handling before public contact form release.

---

## Parallel Opportunities

- Setup tasks T004-T006 and T008 can run in parallel after T001-T003 are complete; T007 follows T003 because both update `backend/pyproject.toml`.
- Foundational tasks T012-T014 and T016-T020 can run in parallel after T009-T011.
- US1 tests T021-T023 and component file tasks T024-T026 can run in parallel before route/metadata wiring; T027 updates the shared Polish content file sequentially.
- US2 tests T032-T034 can run in parallel; content tasks T035-T036 are sequential because both update `frontend/src/app/core/content/pl.ts`.
- US3 tests T041-T044 can run in parallel; content tasks T045-T047 are sequential because they update `frontend/src/app/core/content/pl.ts`.
- US4 backend tests T052-T056 and frontend tests T057-T058 can run in parallel.
- US4 backend schema/health tasks T059-T060 can run in parallel with frontend type/component tasks T066 and T068-T070.
- Polish tasks T074-T075 and T078-T079 can run in parallel after user stories are complete; T076-T077 and T081-T087 are sequential checks because they update shared documentation, contract, or content files.

## Parallel Example: User Story 4

```bash
Task: "T052 [P] [US4] Add backend contract tests for reachability-only GET /health that does not verify email provider readiness in backend/tests/contract/test_health_contract.py"
Task: "T053 [P] [US4] Add backend contract tests for POST /api/contact accepted, validation, rate-limit, and delivery-failure responses in backend/tests/contract/test_contact_contract.py"
Task: "T057 [P] [US4] Add frontend reactive form validation tests in frontend/src/app/features/contact/contact-form.component.spec.ts"
Task: "T058 [P] [US4] Add frontend contact API service tests for success, validation error, rate-limit, and delivery-failure responses in frontend/src/app/services/contact-api.service.spec.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T032 [P] [US2] Add frontend unit tests for required service offerings in frontend/src/app/features/landing/services-section.spec.ts"
Task: "T033 [P] [US2] Add frontend unit tests for process step ordering and client outcomes in frontend/src/app/features/landing/process-section.spec.ts"
Task: "T034 [P] [US2] Add content model tests for service offering and process step completeness in frontend/src/app/core/content/services-process.content.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: US1 hero, offer, navigation, metadata, and contact CTA anchor.
4. Stop and validate that a visitor understands the offer and can reach contact.

### Incremental Delivery

1. Add US1 to create the visible marketing shell and CTA path.
2. Add US2 to explain services and cooperation model.
3. Add US3 to build trust through technology, examples, and about content.
4. Add US4 to enable validated contact submission through the backend API.
5. Complete Phase 7 for docs, accessibility, security, contract, and quickstart validation.

### Team Parallel Strategy

After Foundation:
- Frontend UI and test work can proceed on US1, US2, and US3 in separate files; shared Polish content updates in `frontend/src/app/core/content/pl.ts` should be coordinated sequentially.
- Backend API/contact work can proceed on US4 while frontend content sections are built.
- Documentation and deployment notes can begin once directory structure and commands stabilize.

## Notes

- `[P]` tasks touch different files and have no dependency on incomplete tasks.
- `[US#]` labels map tasks to user stories from `spec.md`.
- This task list intentionally excludes database, authentication, admin panel, payment, blog, CMS, queue, and full GCP deployment tasks.
- Full implementation should keep frontend and backend independently runnable and deployable later.
