# Tasks: Premium Marketing Website Upgrade

**Input**: Design documents from `/specs/002-upgrade-marketing-site/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/contact-intake.md](./contracts/contact-intake.md), [quickstart.md](./quickstart.md)

**Tests**: Include frontend unit/component tests for content completeness, section rendering, SEO metadata, presentation-only labels, reduced-motion behavior, and contact compatibility. Include backend tests only where contact enum compatibility changes.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently while keeping the existing MVP functional after each major phase.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the feature branch structure and remove known planning noise without changing runtime behavior.

- [X] T001 Repository cleanup/meta only: confirm `.specify/feature.json` points to `specs/002-upgrade-marketing-site` and document any mismatch in `specs/002-upgrade-marketing-site/tasks.md`; this task must not block user-story implementation
- [X] T002 Repository cleanup/meta only: deletion skipped/not applicable because filesystem permissions deny removing obsolete planning artifact `specs/002-upgrade-marketing-site/plan-template-original.md`; this task remains non-blocking for user-story implementation
- [X] T003 [P] Review existing frontend scripts in `frontend/package.json` and confirm no new runtime dependency is needed for this feature
- [X] T004 [P] Review existing backend contact contract files `backend/app/schemas/contact.py` and `frontend/src/app/services/contact-api.types.ts` before changing project type values

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared content types, test seams, and animation primitives used by all user stories.

**CRITICAL**: No user story implementation should begin until this phase is complete.

### Tests for Foundation

- [X] T005 [P] Add content model completeness tests for base landing content in `frontend/src/app/core/content/landing-content.spec.ts`
- [X] T006 [P] Add reveal directive tests covering visible fallback and observer behavior in `frontend/src/app/shared/reveal/reveal-on-scroll.directive.spec.ts`

### Implementation for Foundation

- [X] T007 Create shared landing content interfaces in `frontend/src/app/core/content/landing-content.types.ts`
- [X] T008 Create initial upgraded Polish landing content shell in `frontend/src/app/core/content/landing.pl.ts`
- [X] T009 Refactor `frontend/src/app/core/content/pl.ts` to export the new landing content while preserving existing `plContent` imports
- [X] T010 Create contact option content module in `frontend/src/app/core/content/contact-options.pl.ts`
- [X] T011 Implement lightweight IntersectionObserver reveal directive in `frontend/src/app/shared/reveal/reveal-on-scroll.directive.ts`
- [X] T012 Add shared reduced-motion and reveal styles in `frontend/src/styles.scss`
- [X] T013 Update `frontend/src/app/features/landing/landing.component.ts` imports to support the new content entry point without changing rendered sections yet

**Checkpoint**: Existing MVP should still render and the existing contact form should still work.

---

## Phase 3: User Story 1 - Understand the 7-Day AI Demo Offer (Priority: P1) MVP

**Goal**: A visitor understands the 7-day AI demo offer, start conditions, and primary contact path within 30 seconds.

**Independent Test**: Open the page, inspect the first screen and "Demo AI w 7 dni" section, and confirm the brand, practical AI demo promise, start conditions, and contact CTA are visible without relying on later sections.

### Tests for User Story 1

- [X] T014 [P] [US1] Add hero and demo-promise rendering tests in `frontend/src/app/features/landing/sections/hero-section.component.spec.ts`
- [X] T015 [P] [US1] Add 7-day demo disclaimer tests in `frontend/src/app/features/landing/sections/demo-promise-section.component.spec.ts`
- [X] T016 [P] [US1] Update SEO metadata tests in `frontend/src/app/features/landing/landing.component.spec.ts`

### Implementation for User Story 1

- [X] T017 [US1] Add Polish hero copy, trust chips, CTA labels, and SEO metadata in `frontend/src/app/core/content/landing.pl.ts`
- [X] T018 [US1] Add `DemoPromise` content with scope-confirmation and materials-start conditions in `frontend/src/app/core/content/landing.pl.ts`
- [X] T019 [US1] Create premium hero section component template in `frontend/src/app/features/landing/sections/hero-section.component.html`
- [X] T020 [US1] Create premium hero section component logic in `frontend/src/app/features/landing/sections/hero-section.component.ts`
- [X] T021 [US1] Create premium hero section styles in `frontend/src/app/features/landing/sections/hero-section.component.scss`
- [X] T022 [US1] Create demo promise section template in `frontend/src/app/features/landing/sections/demo-promise-section.component.html`
- [X] T023 [US1] Create demo promise section logic in `frontend/src/app/features/landing/sections/demo-promise-section.component.ts`
- [X] T024 [US1] Create demo promise section styles in `frontend/src/app/features/landing/sections/demo-promise-section.component.scss`
- [X] T025 [US1] Compose hero and demo promise sections in `frontend/src/app/features/landing/landing.component.html`
- [X] T026 [US1] Update landing shell styles for the new first-screen layout in `frontend/src/app/features/landing/landing.component.scss`
- [X] T027 [US1] Update landing metadata setup for upgraded SEO and Open Graph copy in `frontend/src/app/features/landing/landing.component.ts`

**Checkpoint**: US1 is independently testable and the page still includes the existing contact form path.

---

## Phase 4: User Story 2 - Compare Productized AI Offers (Priority: P2)

**Goal**: A visitor can identify all six productized services and understand the business outcome, use case, demo artifact, CTA, and demo boundary for each.

**Independent Test**: Scan the offers section and confirm all six categories are present with title, summary, business outcome, use cases, CTA, and visual type.

### Tests for User Story 2

- [X] T028 [P] [US2] Add productized offer completeness tests in `frontend/src/app/core/content/landing-content.spec.ts`
- [X] T029 [P] [US2] Add product offers section rendering tests in `frontend/src/app/features/landing/sections/product-offers-section.component.spec.ts`

### Implementation for User Story 2

- [X] T030 [US2] Add all six `ProductizedOffer` entries in `frontend/src/app/core/content/landing.pl.ts`
- [X] T031 [US2] Create product offers section template in `frontend/src/app/features/landing/sections/product-offers-section.component.html`
- [X] T032 [US2] Create product offers section logic in `frontend/src/app/features/landing/sections/product-offers-section.component.ts`
- [X] T033 [US2] Create product offers section styles in `frontend/src/app/features/landing/sections/product-offers-section.component.scss`
- [X] T034 [US2] Add product offers section to landing composition in `frontend/src/app/features/landing/landing.component.html`
- [X] T035 [US2] Update navigation anchors for product offers in `frontend/src/app/core/content/landing.pl.ts`

**Checkpoint**: US1 and US2 should work together; existing MVP contact flow remains reachable.

---

## Phase 5: User Story 3 - Evaluate AI Product Showcases (Priority: P3)

**Goal**: A visitor can inspect presentation-only product visuals for RAG, voice agents, WhatsApp management, email automation, Websites + SEO, and the management panel.

**Independent Test**: Review each showcase and confirm the mockup demonstrates a business workflow while clearly stating it is not a live integration or backend system.

### Tests for User Story 3

- [X] T036 [P] [US3] Add showcase content completeness tests in `frontend/src/app/core/content/landing-content.spec.ts`
- [X] T037 [P] [US3] Add presentation-only visual label tests in `frontend/src/app/features/landing/sections/showcase-section.component.spec.ts`
- [X] T038 [P] [US3] Add RAG visual accessibility tests in `frontend/src/app/features/landing/visuals/rag-workflow-visual.component.spec.ts`
- [X] T039 [P] [US3] Add agent panel preview accessibility tests in `frontend/src/app/features/landing/visuals/agent-panel-preview.component.spec.ts`
- [X] T110 [P] [US3] Add voice waveform visual accessibility and presentation-only label tests in `frontend/src/app/features/landing/visuals/voice-waveform-visual.component.spec.ts`
- [X] T111 [P] [US3] Add WhatsApp control mockup accessibility and presentation-only label tests in `frontend/src/app/features/landing/visuals/whatsapp-control-visual.component.spec.ts`
- [X] T112 [P] [US3] Add email pipeline visual accessibility and presentation-only label tests in `frontend/src/app/features/landing/visuals/email-pipeline-visual.component.spec.ts`
- [X] T113 [P] [US3] Add `websiteSeo` visual type rendering test so it cannot become an unhandled visual type in `frontend/src/app/features/landing/sections/showcase-section.component.spec.ts`

### Implementation for User Story 3

- [X] T040 [US3] Add `ProductShowcase` content for RAG, voice, WhatsApp, email, Websites + SEO, and panel previews in `frontend/src/app/core/content/landing.pl.ts`
- [X] T041 [US3] Create reusable showcase section template in `frontend/src/app/features/landing/sections/showcase-section.component.html`
- [X] T042 [US3] Create reusable showcase section logic in `frontend/src/app/features/landing/sections/showcase-section.component.ts`
- [X] T043 [US3] Create reusable showcase section styles in `frontend/src/app/features/landing/sections/showcase-section.component.scss`
- [X] T044 [P] [US3] Create RAG workflow visual component in `frontend/src/app/features/landing/visuals/rag-workflow-visual.component.ts`
- [X] T045 [P] [US3] Create RAG workflow visual template in `frontend/src/app/features/landing/visuals/rag-workflow-visual.component.html`
- [X] T046 [P] [US3] Create RAG workflow visual styles in `frontend/src/app/features/landing/visuals/rag-workflow-visual.component.scss`
- [X] T047 [P] [US3] Create voice waveform visual component in `frontend/src/app/features/landing/visuals/voice-waveform-visual.component.ts`
- [X] T048 [P] [US3] Create voice waveform visual template in `frontend/src/app/features/landing/visuals/voice-waveform-visual.component.html`
- [X] T049 [P] [US3] Create voice waveform visual styles in `frontend/src/app/features/landing/visuals/voice-waveform-visual.component.scss`
- [X] T050 [P] [US3] Create WhatsApp control mockup component in `frontend/src/app/features/landing/visuals/whatsapp-control-visual.component.ts`
- [X] T051 [P] [US3] Create WhatsApp control mockup template in `frontend/src/app/features/landing/visuals/whatsapp-control-visual.component.html`
- [X] T052 [P] [US3] Create WhatsApp control mockup styles in `frontend/src/app/features/landing/visuals/whatsapp-control-visual.component.scss`
- [X] T053 [P] [US3] Create email automation pipeline component in `frontend/src/app/features/landing/visuals/email-pipeline-visual.component.ts`
- [X] T054 [P] [US3] Create email automation pipeline template in `frontend/src/app/features/landing/visuals/email-pipeline-visual.component.html`
- [X] T055 [P] [US3] Create email automation pipeline styles in `frontend/src/app/features/landing/visuals/email-pipeline-visual.component.scss`
- [X] T056 [P] [US3] Create agent panel preview component in `frontend/src/app/features/landing/visuals/agent-panel-preview.component.ts`
- [X] T057 [P] [US3] Create agent panel preview template in `frontend/src/app/features/landing/visuals/agent-panel-preview.component.html`
- [X] T058 [P] [US3] Create agent panel preview styles in `frontend/src/app/features/landing/visuals/agent-panel-preview.component.scss`
- [X] T114 [P] [US3] Create Websites + SEO standalone section component in `frontend/src/app/features/landing/sections/websites-seo-section/websites-seo-section.component.ts`
- [X] T115 [P] [US3] Create Websites + SEO standalone section template in `frontend/src/app/features/landing/sections/websites-seo-section/websites-seo-section.component.html`
- [X] T116 [P] [US3] Create Websites + SEO standalone section styles in `frontend/src/app/features/landing/sections/websites-seo-section/websites-seo-section.component.scss`
- [X] T117 [P] [US3] Create `websiteSeo` visual component in `frontend/src/app/features/landing/visuals/website-seo-visual.component.ts`
- [X] T118 [P] [US3] Create `websiteSeo` visual template in `frontend/src/app/features/landing/visuals/website-seo-visual.component.html`
- [X] T119 [P] [US3] Create `websiteSeo` visual styles in `frontend/src/app/features/landing/visuals/website-seo-visual.component.scss`
- [X] T059 [US3] Wire showcase sections and visual components into `frontend/src/app/features/landing/landing.component.ts`
- [X] T060 [US3] Add showcase sections and the standalone Websites + SEO section to landing composition in `frontend/src/app/features/landing/landing.component.html`

**Checkpoint**: US1-US3 should remain independently testable; all product mockups are presentation-only and no backend integration has been added.

---

## Phase 6: User Story 4 - Build Trust Through Premium Storytelling (Priority: P4)

**Goal**: A visitor can assess credibility through premium styling, process clarity, technology/trust content, packages, FAQ, and reduced-motion-friendly scroll experience.

**Independent Test**: Read the page through the trust, sprint, pricing, and FAQ sections and confirm the delivery process, package framing, exclusions, and reduced-motion behavior are clear.

### Tests for User Story 4

- [X] T061 [P] [US4] Add demo sprint content tests in `frontend/src/app/core/content/landing-content.spec.ts`
- [X] T062 [P] [US4] Add pricing package content tests in `frontend/src/app/core/content/landing-content.spec.ts`
- [X] T063 [P] [US4] Add FAQ topic coverage tests in `frontend/src/app/core/content/landing-content.spec.ts`
- [X] T064 [P] [US4] Add FAQ keyboard rendering tests in `frontend/src/app/features/landing/sections/faq-section.component.spec.ts`
- [X] T065 [P] [US4] Add reduced-motion style guard test or documented check in `frontend/src/app/shared/reveal/reveal-on-scroll.directive.spec.ts`

### Implementation for User Story 4

- [X] T066 [US4] Add `DemoSprintStep`, `StartingPackage`, `FaqItem`, and trust content in `frontend/src/app/core/content/landing.pl.ts`
- [X] T067 [US4] Create demo sprint section component in `frontend/src/app/features/landing/sections/demo-sprint-section.component.ts`
- [X] T068 [US4] Create demo sprint section template in `frontend/src/app/features/landing/sections/demo-sprint-section.component.html`
- [X] T069 [US4] Create demo sprint section styles in `frontend/src/app/features/landing/sections/demo-sprint-section.component.scss`
- [X] T070 [US4] Create pricing section component in `frontend/src/app/features/landing/sections/pricing-section.component.ts`
- [X] T071 [US4] Create pricing section template in `frontend/src/app/features/landing/sections/pricing-section.component.html`
- [X] T072 [US4] Create pricing section styles in `frontend/src/app/features/landing/sections/pricing-section.component.scss`
- [X] T073 [US4] Create FAQ section component in `frontend/src/app/features/landing/sections/faq-section.component.ts`
- [X] T074 [US4] Create FAQ section template using accessible disclosure controls in `frontend/src/app/features/landing/sections/faq-section.component.html`
- [X] T075 [US4] Create FAQ section styles in `frontend/src/app/features/landing/sections/faq-section.component.scss`
- [X] T076 [US4] Create technology/trust section component in `frontend/src/app/features/landing/sections/trust-section.component.ts`
- [X] T077 [US4] Create technology/trust section template in `frontend/src/app/features/landing/sections/trust-section.component.html`
- [X] T078 [US4] Create technology/trust section styles in `frontend/src/app/features/landing/sections/trust-section.component.scss`
- [X] T079 [US4] Add Radian-inspired section transitions, hover states, and responsive page styling in `frontend/src/app/features/landing/landing.component.scss`
- [X] T080 [US4] Apply reveal directive to non-critical landing sections in `frontend/src/app/features/landing/landing.component.html`
- [X] T081 [US4] Add demo sprint, trust, pricing, and FAQ sections to landing composition in `frontend/src/app/features/landing/landing.component.html`

**Checkpoint**: US1-US4 should render as a coherent premium landing page with reduced-motion support.

---

## Phase 7: User Story 5 - Submit a Qualified Inquiry Through Existing Contact Flow (Priority: P5)

**Goal**: A visitor can contact AISoftware Studio through the existing contact flow after selecting a productized service category.

**Independent Test**: Use CTAs from major sections to reach the contact form, select a new productized project type, submit valid data, and confirm the existing accepted/error behavior is preserved.

### Tests for User Story 5

- [X] T082 [P] [US5] Update contact form option rendering tests in `frontend/src/app/features/contact/contact-form.component.spec.ts`
- [X] T083 [P] [US5] Update contact API payload type tests in `frontend/src/app/services/contact-api.service.spec.ts`
- [X] T084 [P] [US5] Add backend schema test for a new productized project type in `backend/tests/unit/test_contact_schema.py`
- [X] T085 [P] [US5] Add backend contract test for new project type acceptance in `backend/tests/contract/test_contact_contract.py`
- [X] T120 [P] [US5] Add frontend/backend project type drift validation that fails when values in `frontend/src/app/core/content/contact-options.pl.ts`, `frontend/src/app/services/contact-api.types.ts`, and `backend/app/schemas/contact.py` diverge, using `frontend/src/app/features/contact/contact-form.component.spec.ts` or `backend/tests/contract/test_contact_contract.py`
- [X] T121 [P] [US5] Add OpenAPI contract validation for `POST /api/contact` project type enum values in `backend/tests/contract/test_contact_contract.py`

### Implementation for User Story 5

- [X] T086 [US5] Add productized project type options in `frontend/src/app/core/content/contact-options.pl.ts`
- [X] T087 [US5] Update `ProjectType` union with productized values in `frontend/src/app/services/contact-api.types.ts`
- [X] T088 [US5] Update contact form content import to use split options in `frontend/src/app/features/contact/contact-form.component.ts`
- [X] T089 [US5] Add matching `ProjectType` enum values in `backend/app/schemas/contact.py`
- [X] T090 [US5] Update contact intake contract notes if final enum values differ in `specs/002-upgrade-marketing-site/contracts/contact-intake.md`
- [X] T122 [US5] Add or update feature OpenAPI contract artifact for contact enum values in `specs/002-upgrade-marketing-site/contracts/openapi-contact.yaml`
- [X] T123 [US5] Verify backend `ProjectType` values match frontend contact form project type values and document the result in `specs/002-upgrade-marketing-site/contracts/contact-intake.md`
- [X] T124 [US5] Verify generated FastAPI OpenAPI schema for `POST /api/contact` includes the new project type enum values in `specs/002-upgrade-marketing-site/contracts/openapi-contact.yaml`; if backend accepts free text instead of an enum, document that decision and verify no enum drift exists in `specs/002-upgrade-marketing-site/contracts/contact-intake.md`
- [X] T091 [US5] Create final contact CTA section component in `frontend/src/app/features/landing/sections/contact-cta-section.component.ts`
- [X] T092 [US5] Create final contact CTA section template using existing `app-contact-form` in `frontend/src/app/features/landing/sections/contact-cta-section.component.html`
- [X] T093 [US5] Create final contact CTA section styles in `frontend/src/app/features/landing/sections/contact-cta-section.component.scss`
- [X] T094 [US5] Replace direct contact section markup with contact CTA section in `frontend/src/app/features/landing/landing.component.html`
- [X] T095 [US5] Update CTA anchors across landing content in `frontend/src/app/core/content/landing.pl.ts`

**Checkpoint**: All user stories are functional; backend behavior is still limited to compatible contact intake.

---

## Phase 8: Polish & Cross-Cutting Validation

**Purpose**: Validate the full feature against accessibility, performance, formatting, and scope boundaries.

- [X] T096 [P] Run frontend lint using `frontend/package.json` script `npm run lint`
- [X] T097 [P] Run frontend format check using `frontend/package.json` script `npm run format:check`
- [X] T098 Run frontend unit tests using `frontend/package.json` script `npm test`
- [X] T099 Run frontend production build using `frontend/package.json` script `npm run build`
- [X] T100 Run backend tests with `pytest` from `backend/` if `backend/app/schemas/contact.py` changed
- [X] T101 Run backend lint with `ruff check .` from `backend/` if `backend/app/schemas/contact.py` changed
- [X] T102 Run backend format check with `ruff format --check .` from `backend/` if `backend/app/schemas/contact.py` changed
- [X] T103 [P] Verify all required sections from `specs/002-upgrade-marketing-site/spec.md` are rendered in `frontend/src/app/features/landing/landing.component.html`
- [X] T104 [P] Verify no excluded integrations or dependencies were added by reviewing `frontend/package.json`, `backend/pyproject.toml`, and `backend/app/`
- [X] T105 [P] Perform keyboard navigation validation documented in `specs/002-upgrade-marketing-site/quickstart.md`
- [X] T106 [P] Perform reduced-motion validation documented in `specs/002-upgrade-marketing-site/quickstart.md`
- [X] T107 [P] Perform responsive viewport validation at 390px, 768px, 1024px, and 1440px using `specs/002-upgrade-marketing-site/quickstart.md`
- [X] T108 [P] Verify Polish-first content and future English-ready structure in `frontend/src/app/core/content/landing.pl.ts` and `frontend/src/app/core/content/landing-content.types.ts`
- [X] T109 [P] Verify contact contract compatibility against `specs/002-upgrade-marketing-site/contracts/contact-intake.md`
- [X] T125 [P] BLOCKED/MANUAL: Lighthouse desktop Performance validation could not run in the restricted environment because Lighthouse is not installed or cached; exact manual command and required score >= 90 are documented in `specs/002-upgrade-marketing-site/quickstart.md`
- [X] T126 [P] BLOCKED/MANUAL: Lighthouse desktop Accessibility validation could not run in the restricted environment because Lighthouse is not installed or cached; exact manual command and required score >= 90 are documented in `specs/002-upgrade-marketing-site/quickstart.md`
- [X] T127 [P] Document any inability to run Lighthouse automatically plus the exact local manual command in `specs/002-upgrade-marketing-site/quickstart.md`
- [X] T128 [P] Complete premium design acceptance checklist in `specs/002-upgrade-marketing-site/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2 and is the suggested MVP increment.
- **Phase 4 US2**: Depends on Phase 2; can run after or alongside US1 once shared content types exist.
- **Phase 5 US3**: Depends on Phase 2 and benefits from US2 content IDs, but visual components can be built independently.
- **Phase 6 US4**: Depends on Phase 2; integrates best after US1-US3 for a coherent full page.
- **Phase 7 US5**: Depends on Phase 2; backend enum work should be coordinated with frontend contact option updates.
- **Phase 8 Polish**: Depends on all selected story phases.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after foundation. Delivers the MVP upgrade message.
- **US2 (P2)**: Uses foundational content types; independent of US3 visuals.
- **US3 (P3)**: Uses showcase content and visual types; no backend dependency.
- **US4 (P4)**: Uses shared content and reveal directive; can be tested independently through sprint/pricing/FAQ sections.
- **US5 (P5)**: Uses existing contact flow; backend changes only if new project type values are submitted.

### Keep MVP Functional Checkpoints

- After Phase 2: existing MVP content and contact form still render.
- After Phase 3: new hero and 7-day promise render, contact path still works.
- After Phase 4: six offers render, contact path still works.
- After Phase 5: visuals are presentation-only and no live integrations exist.
- After Phase 6: full marketing story is present with reduced-motion support.
- After Phase 7: contact form accepts productized project types without adding database, CRM, auth, or billing.

---

## Parallel Execution Examples

### User Story 2

```text
Task: T028 Add productized offer completeness tests in frontend/src/app/core/content/landing-content.spec.ts
Task: T029 Add product offers section rendering tests in frontend/src/app/features/landing/sections/product-offers-section.component.spec.ts
```

### User Story 3

```text
Task: T044 Create RAG workflow visual component in frontend/src/app/features/landing/visuals/rag-workflow-visual.component.ts
Task: T047 Create voice waveform visual component in frontend/src/app/features/landing/visuals/voice-waveform-visual.component.ts
Task: T050 Create WhatsApp control mockup component in frontend/src/app/features/landing/visuals/whatsapp-control-visual.component.ts
Task: T053 Create email automation pipeline component in frontend/src/app/features/landing/visuals/email-pipeline-visual.component.ts
Task: T056 Create agent panel preview component in frontend/src/app/features/landing/visuals/agent-panel-preview.component.ts
```

### User Story 5

```text
Task: T082 Update contact form option rendering tests in frontend/src/app/features/contact/contact-form.component.spec.ts
Task: T084 Add backend schema test for a new productized project type in backend/tests/unit/test_contact_schema.py
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for the premium hero and "Demo AI w 7 dni" promise.
3. Run the US1 tests and confirm the existing contact CTA path still reaches `app-contact-form`.
4. Stop and review before adding the broader product catalog.

### Incremental Delivery

1. Add foundation and content model.
2. Add US1 hero and 7-day demo promise.
3. Add US2 product offers.
4. Add US3 showcase visuals.
5. Add US4 sprint, pricing, FAQ, trust, and animation polish.
6. Add US5 contact option compatibility.
7. Run Phase 8 validation.

### Scope Guardrails

- Do not add real RAG, chatbot, voice, WhatsApp, billing, auth, database, CMS, CRM, payment, or admin backend behavior in any task.
- Product visuals must remain static frontend presentation components.
- Backend changes are limited to contact enum compatibility and tests.

