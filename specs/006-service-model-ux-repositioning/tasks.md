# Tasks: Service Model UX Repositioning

**Input**: Design documents from `specs/006-service-model-ux-repositioning/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui-contact-context.md`, `quickstart.md`

**Tests**: Required. The implementation touches business-critical lead-generation paths, route-backed product navigation, contact intent mapping, accessibility-sensitive navigation, and Polish-first content integrity.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested as an independent increment after the shared typed-content foundation is complete.

## Phase 1: Setup (Shared Readiness)

**Purpose**: Verify the active feature context and establish the exact implementation baseline before editing application code.

**Active feature path**: `specs/006-service-model-ux-repositioning`

- [X] T001 Confirm `.specify/feature.json` points to `specs/006-service-model-ux-repositioning` and record the active feature path in `specs/006-service-model-ux-repositioning/tasks.md`
- [X] T002 [P] Review current route and shell behavior in `frontend/src/app/app.routes.ts` and `frontend/src/app/features/shell/site-shell.component.ts`
- [X] T003 [P] Review current typed content and contact option baseline in `frontend/src/app/core/content/site-content.types.ts`, `frontend/src/app/core/content/site.pl.ts`, and `frontend/src/app/core/content/contact-options.pl.ts`
- [X] T004 [P] Review current page component baselines in `frontend/src/app/features/home/home.component.html`, `frontend/src/app/features/products/products-page.component.html`, `frontend/src/app/features/demo/demo-page.component.html`, `frontend/src/app/features/studio/studio-page.component.html`, and `frontend/src/app/features/contact/contact-form.component.ts`
- [X] T005 [P] Review existing style token and breakpoint patterns in `frontend/src/styles.scss`, `frontend/src/app/features/home/home.component.scss`, `frontend/src/app/features/products/products-page.component.scss`, `frontend/src/app/features/demo/demo-page.component.scss`, `frontend/src/app/features/studio/studio-page.component.scss`, and `frontend/src/app/features/contact/contact-form.component.scss`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the shared typed content model and contract checks before page-specific story work begins.

**CRITICAL**: No user story implementation should begin until this phase is complete.

- [X] T006 Add `ServiceModel`, `CollaborationTrack`, `ResearchDirection`, `SolutionCategory`, `ProjectJourneyStep`, and `ContactIntentOption` types in `frontend/src/app/core/content/site-content.types.ts`
- [X] T007 Extend `ProductCatalogEntry` with category, value, example use cases, demo boundaries, production scope, development path, and contact intent fields in `frontend/src/app/core/content/site-content.types.ts`
- [X] T008 Add backend-compatible contact intent options for demo/quick validation, MVP, full development, AI automation/solution, and technology consultation in `frontend/src/app/core/content/contact-options.pl.ts`
- [X] T009 Update `ProjectType` only if needed for already-supported backend-compatible values in `frontend/src/app/services/contact-api.types.ts`
- [X] T010 Populate Validate, Build, R&D directions, solution categories, journey steps, route metadata, and extended product details in `frontend/src/app/core/content/site.pl.ts`
- [X] T011 [P] Add typed content completeness tests for service models, solution categories, journey steps, R&D claim boundaries, and no `/lab` route in `frontend/src/app/core/content/site-content.spec.ts`
- [X] T012 [P] Add content integrity assertions for no fictional-client proof, no unverified metrics, and no production-MVP-in-seven-days claim in `frontend/src/app/core/content/site-content.spec.ts`
- [X] T013 [P] Add contact option allowlist tests for required visitor intents and backend payload compatibility in `frontend/src/app/features/contact/contact-form.component.spec.ts`
- [X] T014 Run the frontend content and contact test subset for the foundational model in `frontend/package.json`

**Checkpoint**: Shared content model, route metadata, and contact intent foundation are ready for independent user-story implementation.

---

## Phase 3: User Story 1 - Validate an idea quickly (Priority: P1) MVP

**Goal**: A visitor can land on the homepage, find the quick validation path, understand seven-day demo/PoC boundaries, open demo details, and continue to contact with validation intent preserved.

**Independent Test**: Start at `/`, identify the validation path and seven-day boundary, open `/demo-w-7-dni`, distinguish demo/PoC/MVP/production, and open `/kontakt` with quick validation selected through an allowed query value.

### Tests for User Story 1

- [X] T015 [P] [US1] Add homepage validation-path tests for hero copy, exactly two primary CTAs, Validate wording, seven-day boundary, and contact query mapping in `frontend/src/app/features/home/home.component.spec.ts`
- [X] T016 [P] [US1] Add demo page tests for demo, PoC, MVP, production, exclusions, client inputs, sprint result, next-stage decision, and full-development transition in `frontend/src/app/features/demo/demo-page.component.spec.ts`
- [X] T017 [P] [US1] Add contact form tests for quick-validation query preselection and invalid query fallback in `frontend/src/app/features/contact/contact-form.component.spec.ts`

### Implementation for User Story 1

- [X] T018 [US1] Update homepage hero and Validate track rendering from typed content in `frontend/src/app/features/home/home.component.html`
- [X] T019 [US1] Style the homepage hero and Validate/Build decision area for mobile and desktop hierarchy in `frontend/src/app/features/home/home.component.scss`
- [X] T020 [US1] Update validation-path content, CTA labels, and allowed contact intent query params in `frontend/src/app/core/content/site.pl.ts`
- [X] T021 [US1] Replace or reframe demo page content so it clearly separates demo, PoC, MVP, and production in `frontend/src/app/features/demo/demo-page.component.html`
- [X] T022 [US1] Style demo page boundary/process sections with responsive, readable layouts in `frontend/src/app/features/demo/demo-page.component.scss`
- [X] T023 [US1] Update demo page typed content for exclusions, client inputs, sprint result, and transition to Build in `frontend/src/app/core/content/site.pl.ts`
- [X] T024 [US1] Ensure demo and validation CTAs route to `/kontakt` with an allowlisted quick-validation value in `frontend/src/app/features/home/home.component.html` and `frontend/src/app/features/demo/demo-page.component.html`

**Checkpoint**: User Story 1 is independently functional and testable as the MVP.

---

## Phase 4: User Story 2 - Choose full product development without buying a demo first (Priority: P1)

**Goal**: A visitor can see Build as a first-class service path, understand full development scope, review solution classes, learn the studio approach, and contact without being forced through demo.

**Independent Test**: Start at `/`, find the Build path, confirm it is not seven-day limited, review full development scope and solution categories, open Studio details, and reach contact with full development intent.

### Tests for User Story 2

- [X] T025 [P] [US2] Add homepage Build-path tests for independent Build positioning, full development scope, no demo-first requirement, and Build contact query mapping in `frontend/src/app/features/home/home.component.spec.ts`
- [X] T026 [P] [US2] Add route metadata tests for repositioned homepage, products, demo, Studio, contact, and product titles/descriptions in `frontend/src/app/core/content/site-content.spec.ts`
- [X] T027 [P] [US2] Add shell metadata and navigation CTA tests for the repositioned public routes in `frontend/src/app/features/shell/site-shell.component.spec.ts`

### Implementation for User Story 2

- [X] T028 [US2] Update Build track content with product analysis, UX, frontend, backend, API, AI/RAG, agents, integrations, security, testing, deployment, monitoring, costs, maintenance, and iteration in `frontend/src/app/core/content/site.pl.ts`
- [X] T029 [US2] Update homepage Build CTA and final full-development CTA to route directly to `/kontakt` with an allowed full-development value in `frontend/src/app/features/home/home.component.html`
- [X] T030 [US2] Update route titles and descriptions to reposition the company beyond "Demo AI w 7 dni" in `frontend/src/app/core/content/site.pl.ts`
- [X] T031 [US2] Update shell primary CTA label if needed to support full development without demo-first framing in `frontend/src/app/features/shell/site-shell.component.ts`
- [X] T032 [US2] Refine homepage section order so the first decision area stays short and does not become a full catalog in `frontend/src/app/features/home/home.component.html`
- [X] T033 [US2] Adjust homepage layout spacing, composition, and CTA sizing for Build/Validate hierarchy in `frontend/src/app/features/home/home.component.scss`

**Checkpoint**: User Story 2 is independently functional and does not depend on a visitor buying a demo first.

---

## Phase 5: User Story 3 - Assess studio credibility and technical maturity (Priority: P2)

**Goal**: A visitor can use the Studio page to understand who is responsible for delivery, how projects are run, what quality rules apply, and how R&D feeds client work without fictional proof.

**Independent Test**: Open `/studio`, identify the operating model, prototype/production split, quality/security/testing/documentation principles, AI cost approach, provider choice, R&D directions, and no large-agency or fake-proof claims.

### Tests for User Story 3

- [X] T034 [P] [US3] Add Studio page tests for owner/responsibility, cooperation model, prototype-production split, engineering principles, quality, testing, documentation, security, AI cost, provider choice, and R&D transfer in `frontend/src/app/features/studio/studio-page.component.spec.ts`
- [X] T035 [P] [US3] Add R&D direction content tests for bounded status, claim boundaries, and no client-result framing in `frontend/src/app/core/content/site-content.spec.ts`

### Implementation for User Story 3

- [X] T036 [US3] Expand Studio typed content for motivation, responsibility, process, engineering principles, quality, testing, documentation, security, cost control, provider choice, automation use, and R&D in `frontend/src/app/core/content/site.pl.ts`
- [X] T037 [US3] Rebuild Studio page sections around transparent trust and R&D content in `frontend/src/app/features/studio/studio-page.component.html`
- [X] T038 [US3] Style Studio page trust, process, quality, and R&D sections using existing tokens and responsive layouts in `frontend/src/app/features/studio/studio-page.component.scss`
- [X] T039 [US3] Audit reused landing sections and remove any misleading agency-size, pricing-first, or demo-only framing from Studio imports in `frontend/src/app/features/studio/studio-page.component.ts`
- [X] T040 [US3] Update homepage Studio trust teaser and R&D teaser to match the Studio page boundaries in `frontend/src/app/core/content/site.pl.ts`
- [X] T041 [US3] Render the updated Studio and R&D teasers on the homepage without implying client deployments in `frontend/src/app/features/home/home.component.html`

**Checkpoint**: User Story 3 is independently functional as a trust-building Studio experience.

---

## Phase 6: User Story 4 - Find a solution by business problem (Priority: P2)

**Goal**: A visitor can browse products by business problem, open existing direct solution URLs, compare demo and production scope, and contact with selected context preserved.

**Independent Test**: Open `/produkty`, find a category by business problem, open each existing product URL directly, verify richer solution details, use browser back/forward, and reach contact through an allowed context.

### Tests for User Story 4

- [X] T042 [P] [US4] Add product category and product detail completeness tests for problem, audience, value, examples, demo scope, demo limits, production scope, development path, and CTA in `frontend/src/app/features/products/products-page.component.spec.ts`
- [X] T043 [P] [US4] Add direct product route, route-backed selector, active state, and browser back/forward tests in `frontend/src/app/features/products/products-page.component.spec.ts`
- [X] T044 [P] [US4] Add content model tests that every product has one category and every category references existing product IDs in `frontend/src/app/core/content/site-content.spec.ts`

### Implementation for User Story 4

- [X] T045 [US4] Populate product category assignments and richer solution fields for all existing products in `frontend/src/app/core/content/site.pl.ts`
- [X] T046 [US4] Update products page category overview and route-backed selector markup in `frontend/src/app/features/products/products-page.component.html`
- [X] T047 [US4] Update products page component state derivation for categories while keeping product selection derived from Angular Router in `frontend/src/app/features/products/products-page.component.ts`
- [X] T048 [US4] Render demo scope, demo limits, production scope, and development path separately in `frontend/src/app/features/products/products-page.component.html`
- [X] T049 [US4] Style category navigation, selector rail, and detail sections for touch, keyboard focus, and responsive layouts in `frontend/src/app/features/products/products-page.component.scss`
- [X] T050 [US4] Map product CTAs to safe allowed contact intent values without adding backend payload fields in `frontend/src/app/core/content/site.pl.ts`
- [X] T051 [US4] Preserve all existing `productRoutePaths` values and route metadata entries in `frontend/src/app/core/content/site-content.types.ts` and `frontend/src/app/core/content/site.pl.ts`

**Checkpoint**: User Story 4 is independently functional with route-stable solution discovery.

---

## Phase 7: User Story 5 - Contact with a clear intent (Priority: P3)

**Goal**: A visitor can indicate a main contact intent from the existing contact page, and CTA context from homepage, demo, Studio, or product pages remains compatible with the current form submission process.

**Independent Test**: Follow CTAs from each main page to `/kontakt`, confirm intent preselection where allowed, verify invalid URL fallback, submit a valid form, and confirm unchanged backend payload keys.

### Tests for User Story 5

- [X] T052 [P] [US5] Add contact form tests for all required intent labels and allowlisted preselection values in `frontend/src/app/features/contact/contact-form.component.spec.ts`
- [X] T053 [P] [US5] Add contact API payload-shape regression tests for selected intent values in `frontend/src/app/services/contact-api.service.spec.ts`
- [X] T054 [P] [US5] Add cross-page CTA href/query tests for homepage, products, demo, and Studio entry paths in `frontend/src/app/features/home/home.component.spec.ts`, `frontend/src/app/features/products/products-page.component.spec.ts`, `frontend/src/app/features/demo/demo-page.component.spec.ts`, and `frontend/src/app/features/studio/studio-page.component.spec.ts`

### Implementation for User Story 5

- [X] T055 [US5] Update contact form visible labels and helper copy for demo/quick validation, MVP, full development, AI automation/solution, and technology consultation in `frontend/src/app/core/content/contact-options.pl.ts`
- [X] T056 [US5] Keep query-param validation allowlisted and default invalid values to an empty selection in `frontend/src/app/features/contact/contact-form.component.ts`
- [X] T057 [US5] Update contact page copy to explain intent selection without changing payload shape in `frontend/src/app/core/content/site.pl.ts`
- [X] T058 [US5] Update contact form template if needed to display clearer intent labels, help text, validation, and status messages in `frontend/src/app/features/contact/contact-form.component.html`
- [X] T059 [US5] Style contact intent controls and validation messages for mobile, keyboard focus, and readable error states in `frontend/src/app/features/contact/contact-form.component.scss`
- [X] T060 [US5] Verify no new payload fields are added to `frontend/src/app/services/contact-api.types.ts` or `frontend/src/app/services/contact-api.service.ts`

**Checkpoint**: User Story 5 is independently functional with existing backend compatibility.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validate accessibility, responsiveness, content integrity, performance, and repository workflow after selected user stories are complete.

- [X] T061 [P] Run and record frontend lint results for the feature in `specs/006-service-model-ux-repositioning/quickstart.md`
- [X] T062 [P] Run and record frontend test results for the feature in `specs/006-service-model-ux-repositioning/quickstart.md`
- [X] T063 [P] Run and record frontend production build results and bundle budget status in `specs/006-service-model-ux-repositioning/quickstart.md`
- [X] T064 [P] Manually verify `/`, `/produkty`, all direct product URLs, `/demo-w-7-dni`, `/studio`, and `/kontakt` against responsive and reduced-motion criteria in `specs/006-service-model-ux-repositioning/quickstart.md`
- [X] T065 [P] Manually verify keyboard navigation, skip link, mobile menu, active nav state, product selector focus, and contact form controls in `specs/006-service-model-ux-repositioning/quickstart.md`
- [X] T066 [P] Perform final content integrity review for fake clients, fake deployments, fake testimonials, unverified metrics, unauthorized logos, and misleading seven-day MVP claims in `frontend/src/app/core/content/site.pl.ts`
- [X] T067 [P] Confirm no `/lab` route, no new backend endpoint, no CMS, no UI library, and no new dependency were introduced in `frontend/src/app/app.routes.ts`, `frontend/package.json`, and `backend/app/api/router.py`
- [X] T068 Update the implementation validation notes and any deviations from the no-backend-change plan in `specs/006-service-model-ux-repositioning/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; recommended MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational; can run after or alongside US1, but should not weaken US1 validation framing.
- **User Story 3 (Phase 5)**: Depends on Foundational; can run independently after shared R&D content types exist.
- **User Story 4 (Phase 6)**: Depends on Foundational; can run independently after solution categories and product fields exist.
- **User Story 5 (Phase 7)**: Depends on Foundational; integrates CTA mappings from earlier stories but remains testable through contact entry paths.
- **Polish (Phase 8)**: Runs after the desired user-story scope is complete.

### User Story Dependencies

- **US1 Validate quickly (P1)**: No dependency on other user stories after Foundational.
- **US2 Full development (P1)**: No dependency on other user stories after Foundational; shares homepage content with US1.
- **US3 Studio credibility (P2)**: No dependency on US1/US2 after Foundational; homepage teaser integration may be validated after US1/US2 markup exists.
- **US4 Solution discovery (P2)**: No dependency on US1/US2 after Foundational; contact mapping should align with US5.
- **US5 Contact intent (P3)**: Should be finalized after CTA values from US1, US2, US3, and US4 are known.

### Within Each User Story

- Write or update tests first and confirm they fail for the missing behavior.
- Update typed content before page templates when the page renders content-driven data.
- Update templates before SCSS refinements.
- Preserve router-derived state and existing backend payload shape throughout.
- Validate the story independently before moving to another story in the manager-gated workflow.

## Parallel Opportunities

- T002, T003, T004, and T005 can run in parallel during setup.
- T011, T012, and T013 can run in parallel after shared type definitions are drafted.
- Test tasks within each user story can run in parallel because they target separate specs or isolated assertions.
- US3 and US4 can proceed in parallel after Foundational if different agents own Studio and Products files.
- Polish validation tasks T061 through T067 can run in parallel once implementation is complete.

## Parallel Example: User Story 1

```text
Task: "T015 Add homepage validation-path tests in frontend/src/app/features/home/home.component.spec.ts"
Task: "T016 Add demo page distinction tests in frontend/src/app/features/demo/demo-page.component.spec.ts"
Task: "T017 Add contact quick-validation query tests in frontend/src/app/features/contact/contact-form.component.spec.ts"
```

## Parallel Example: User Story 4

```text
Task: "T042 Add product detail completeness tests in frontend/src/app/features/products/products-page.component.spec.ts"
Task: "T044 Add category integrity tests in frontend/src/app/core/content/site-content.spec.ts"
Task: "T045 Populate richer product content in frontend/src/app/core/content/site.pl.ts"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1.
2. Complete Phase 2.
3. Complete Phase 3 for US1.
4. Stop and validate the quick-validation journey independently.

### Incremental Delivery

1. Add US1 to fix the most misleading seven-day demo framing.
2. Add US2 to make full development a first-class path.
3. Add US3 to strengthen trust and R&D credibility.
4. Add US4 to make solution discovery problem-based.
5. Add US5 to complete intent-preserving contact behavior.
6. Run Phase 8 validation before implementation review.

### Manager-Gated Execution

Implementation must follow the repository workflow in `AGENTS.md`: one selected task package at a time, bounded allowed files, validation commands per package, and reviewer PASS before marking completion.
