# Tasks: Demo AI w 7 dni - Landing Page UX/Copy Improvement

**Input**: Design documents from `/specs/002-upgrade-marketing-site/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/contact-intake.md](./contracts/contact-intake.md), [quickstart.md](./quickstart.md)

**Tests**: Include frontend tests for content completeness, hero/nav behavior, section rendering, presentation-only labels, reduced-motion behavior, accessibility, SEO metadata, and contact compatibility. No backend production integrations are planned.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently while keeping the existing MVP functional after each phase.

## Phase 1: Setup (Shared Content Foundation)

**Purpose**: Prepare the typed content layer and reusable copy sources before changing the landing layout.

- [X] T001 [P] Update `frontend/src/app/core/content/landing-content.types.ts` to support simplified navigation, hero copy, one demo promise section, three main offer groups, one consolidated demo-vs-production explanation, one 7-day example, pricing packages, shorter FAQ entries, and contact copy. Acceptance: the content model exposes fields for every section named in the spec without leftover placeholder structures.
- [X] T002 [P] Rewrite `frontend/src/app/core/content/landing.pl.ts` to use the new premium Polish copy, business-first hero promise, three offer families, one demo example, pricing/value framing, and shorter FAQ. Acceptance: the file contains the updated positioning and does not repeat defensive disclaimers across multiple sections.
- [X] T003 [P] Refresh `frontend/src/app/core/content/contact-options.pl.ts` so the contact project labels read like business choices and still map to the existing `ProjectType` values in `frontend/src/app/services/contact-api.types.ts`. Acceptance: the contact form options are understandable to non-technical buyers and do not require backend payload changes.
- [X] T004 [P] Keep `frontend/src/app/core/content/pl.ts` as the stable Polish content export while pointing it at the updated landing content structure. Acceptance: existing imports of `plContent` continue to compile.
- [X] T005 [P] Add or update content validation tests in `frontend/src/app/core/content/landing-content.spec.ts` to cover hero/nav fields, the three offer groups, the demo-vs-production explanation, the 7-day example, pricing packages, and FAQ coverage. Acceptance: tests fail if any required content block is missing or duplicated in the wrong place.

---

## Phase 2: Foundational (Page Shell and Layout)

**Purpose**: Wire the landing page shell to the new content structure before story-specific sections are refined.

**CRITICAL**: No user story work should start until this phase is complete.

- [X] T006 [P] Update `frontend/src/app/features/landing/landing.component.ts` to consume the revised content model, keep SEO metadata in sync with the new positioning, and preserve the existing contact flow entry points. Acceptance: page metadata reflects the new offer and the component still renders the contact CTA path.
- [X] T007 [P] Rewrite `frontend/src/app/features/landing/landing.component.html` to compose the landing page with the simplified section order and anchor structure, removing legacy clutter that does not support the new story. Acceptance: the page shell contains the required story sections and the navigation only points to the kept sections.
- [X] T008 [P] Update `frontend/src/app/features/landing/landing.component.scss` and the shared reveal base behavior in `frontend/src/app/shared/reveal/reveal-on-scroll.directive.ts` if needed to support the new section density, reduced-motion fallback, and cleaner spacing. Acceptance: the shell layout remains readable on common widths and reveal behavior does not block content visibility.
- [X] T009 [P] Add shell-level tests in `frontend/src/app/features/landing/landing.component.spec.ts`, `frontend/src/app/features/landing/landing-seo.spec.ts`, and `frontend/src/app/features/landing/landing-a11y.spec.ts` for the revised page structure, metadata, and top-level anchor count. Acceptance: tests fail if the shell loses SEO metadata, the section anchors, or the simplified navigation.

**Checkpoint**: The landing page should still render, with the new content model and shell structure in place.

---

## Phase 3: User Story 1 - Hero and Primary CTA (Priority: P1)

**Goal**: A cold visitor immediately understands the offer, timing promise, and next action.

**Independent Test**: Open the first screen and confirm the business promise, primary CTA, and simplified navigation are visible within 10 seconds.

- [X] T010 [US1] Rewrite `frontend/src/app/features/landing/sections/hero-section.component.*` so the hero leads with `Demo AI w 7 dni`, includes the premium business promise, and keeps the primary CTA clear for non-technical visitors. Acceptance: the hero copy makes the 7-day demo offer obvious before the brand name takes focus.
- [X] T011 [US1] Simplify the landing navigation labels and anchors in `frontend/src/app/core/content/landing.pl.ts` and `frontend/src/app/features/landing/landing.component.html` so the menu stays within 5-6 understandable items. Acceptance: the nav is shorter, business-friendly, and still reaches every required section.
- [X] T012 [P] [US1] Add hero and first-screen tests in `frontend/src/app/features/landing/sections/hero-section.component.spec.ts` and `frontend/src/app/features/landing/landing.component.spec.ts`. Acceptance: tests fail if the hero promise, CTA, or simplified navigation is removed or renamed into something defensive.

**Checkpoint**: US1 is independently testable and the page still routes visitors to the existing contact path.

---

## Phase 4: User Story 2 - Offer Positioning Cleanup (Priority: P2)

**Goal**: A visitor can understand the three business offer families without feeling the studio does everything.

**Independent Test**: Scan the offers section and confirm the three main categories, business outcomes, and scope boundaries are clear.

- [X] T013 [US2] Rework the three main offer families in `frontend/src/app/core/content/landing.pl.ts` and `frontend/src/app/features/landing/sections/product-offers-section.component.*` so they read as knowledge assistant, communication automation, and AI validation demo. Acceptance: the page presents three focused offer families rather than a generic service list.
- [X] T014 [US2] Update the supporting storytelling in `frontend/src/app/features/landing/sections/showcase-section.component.*` and `frontend/src/app/features/landing/sections/websites-seo-section/websites-seo-section.component.*` so each showcase reinforces the business offer instead of drifting into extra services, and so Websites + SEO stays framed as a supporting service area for AI landing pages and validation pages. Acceptance: showcase copy supports the three-category story, keeps the scope honest, and avoids making Websites + SEO look like a separate broad agency offer.
- [X] T015 [P] [US2] Add offer-grouping tests in `frontend/src/app/core/content/landing-content.spec.ts` and `frontend/src/app/features/landing/sections/product-offers-section.component.spec.ts`. Acceptance: tests fail if the content stops exposing the three main categories, business outcomes, or scope boundaries.

**Checkpoint**: US2 remains independent and keeps the page focused on the three business offers.

---

## Phase 5: User Story 3 - Demo-Stage vs Production-Stage Explanation (Priority: P3)

**Goal**: A visitor sees one clear explanation of what belongs in the demo phase and what is reserved for later production work.

**Independent Test**: Read the scope section and confirm that the demo boundary is explained once, clearly, and without repeated disclaimers.

- [X] T016 [US3] Add the consolidated `Etap demo vs etap produkcyjny` explanation in `frontend/src/app/core/content/landing.pl.ts` and wire it through `frontend/src/app/features/landing/sections/demo-promise-section.component.*`. Acceptance: one section explains the boundary and the rest of the page does not repeat defensive disclaimers.
- [X] T017 [P] [US3] Add scope-boundary tests in `frontend/src/app/features/landing/sections/demo-promise-section.component.spec.ts` and `frontend/src/app/core/content/landing-content.spec.ts`. Acceptance: tests fail if the demo-versus-production explanation is missing, duplicated, or softened into vague wording.

**Checkpoint**: US3 is independently testable and keeps the scope honest without overexposing limitations.

---

## Phase 6: User Story 4 - Example 7-Day Demo Scenario and Pricing/Value Copy (Priority: P4)

**Goal**: A visitor sees one concrete 7-day example and understands pricing/package framing as risk reduction.

**Independent Test**: Find one concrete demo example and one pricing/package section, then explain the visible result and why the package reduces risk.

- [X] T018 [US4] Add one concrete `Przyklad demo po 7 dniach` scenario in `frontend/src/app/core/content/landing.pl.ts` and `frontend/src/app/features/landing/sections/showcase-section.component.*` so the visitor can see the problem, the visible result, and the decision it supports. Acceptance: the example reads like a business validation story, not a fake case study or production claim.
- [X] T019 [US4] Reframe package and pricing copy in `frontend/src/app/core/content/landing.pl.ts` and `frontend/src/app/features/landing/sections/pricing-section.component.*` so it explains value, risk reduction, and scope clarity. Acceptance: the package section reads as a starting point for a scoped conversation rather than a mockup-only offer.
- [X] T020 [US4] Add the demo-sprint section copy and layout in `frontend/src/app/core/content/landing.pl.ts` and `frontend/src/app/features/landing/sections/demo-sprint-section.component.*` so the 7-day validation process is explicit and decision-ready. Acceptance: the section clearly explains the 7-day process, start conditions, client inputs, and deliverables without sounding like a production promise.
- [X] T021 [US4] Add the trust section copy and layout in `frontend/src/app/core/content/landing.pl.ts` and `frontend/src/app/features/landing/sections/trust-section.component.*` so it focuses on transparent scope, risk reduction, technical realism, and the demo-vs-production boundary. Acceptance: the section contains no fake clients, testimonials, logos, metrics, or production claims.
- [X] T022 [P] [US4] Add example, pricing, demo-sprint, and trust tests in `frontend/src/app/features/landing/sections/showcase-section.component.spec.ts`, `frontend/src/app/features/landing/sections/pricing-section.component.spec.ts`, `frontend/src/app/features/landing/sections/demo-sprint-section.component.spec.ts`, `frontend/src/app/features/landing/sections/trust-section.component.spec.ts`, and `frontend/src/app/core/content/landing-content.spec.ts`. Acceptance: tests fail if the example demo section, value-based package framing, demo sprint explanation, or trust section disappears or becomes fake or overly defensive.

**Checkpoint**: US4 remains independently testable and makes the offer feel commercially concrete.

---

## Phase 7: User Story 5 - FAQ Cleanup and Contact Form Copy/Options (Priority: P5)

**Goal**: A business visitor can finish the page, understand the key FAQ answers, and contact the studio without technical friction.

**Independent Test**: Read the FAQ and contact section, then submit a valid inquiry using the existing contact flow and confirm the labels are understandable.

- [X] T023 [US5] Shorten the FAQ in `frontend/src/app/core/content/landing.pl.ts` and `frontend/src/app/features/landing/sections/faq-section.component.*` so it answers the key buyer concerns directly and keeps disclosure controls accessible. Acceptance: the FAQ is shorter, clearer, and still keyboard friendly.
- [X] T024 [US5] Review contact form copy and project options in `frontend/src/app/features/contact/contact-form.component.ts`, `frontend/src/app/features/contact/contact-form.component.html`, `frontend/src/app/core/content/contact-options.pl.ts`, and `frontend/src/app/features/landing/sections/contact-cta-section.component.*` so the contact path is understandable to non-technical buyers. Acceptance: the form still uses the existing payload shape and the labels read like business choices.
- [X] T025 [P] [US5] Add FAQ and contact tests in `frontend/src/app/features/landing/sections/faq-section.component.spec.ts`, `frontend/src/app/features/contact/contact-form.component.spec.ts`, and `frontend/src/app/services/contact-api.service.spec.ts`. Acceptance: tests fail if the FAQ regresses, the contact labels become unclear, or the existing submission shape changes unexpectedly.

**Checkpoint**: US5 is independently testable and the existing contact flow still works.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final content polish, responsive/accessibility tuning, and release verification across the page.

- [X] T026 Polish the landing copy for correct Polish, diacritics, and premium tone in `frontend/src/app/core/content/landing.pl.ts`. Acceptance: no awkward English-heavy phrasing, typos, or missing diacritics remain in the main landing copy.
- [X] T027 Polish the contact options and contact CTA wording for premium Polish business tone in `frontend/src/app/core/content/contact-options.pl.ts` and `frontend/src/app/features/landing/sections/contact-cta-section.component.*`. Acceptance: contact choices remain understandable for non-technical buyers and do not sound technical or defensive.
- [X] T028 Update `frontend/src/app/features/landing/landing.component.scss` and `frontend/src/app/shared/reveal/reveal-on-scroll.directive.ts` so the page shell stays readable, premium, and usable with reduced motion enabled. Acceptance: the shell spacing, typography rhythm, and reveal fallback preserve content access without relying on animation.
- [X] T029 [P] Add reduced-motion behavior tests in `frontend/src/app/shared/reveal/reveal-on-scroll.directive.spec.ts` and the relevant section specs that use reveal styling. Acceptance: tests cover visible fallback behavior and ensure motion-dependent content is not required to read the page.
- [X] T030 [P] Add accessibility verification tests in `frontend/src/app/features/landing/landing-a11y.spec.ts` and `frontend/src/app/features/landing/landing-seo.spec.ts` to cover heading order, labels, and landmark structure. Acceptance: tests cover the top-level accessibility and SEO expectations on the landing page.
- [ ] T031 [P] Add manual browser walkthrough task for desktop, tablet, and mobile widths using `specs/002-upgrade-marketing-site/quickstart.md` as the checklist. Acceptance: the page is reviewed at common viewport sizes and the result is usable without horizontal scrolling.
- [ ] T032 [P] Add manual keyboard and reduced-motion walkthrough task covering keyboard navigation, CTA visibility, and 10-second comprehension using `specs/002-upgrade-marketing-site/quickstart.md`. Acceptance: the page can be understood quickly and all primary controls remain reachable with visible focus.
- [X] T033 [P] Record the manual QA outcome in `specs/002-upgrade-marketing-site/quickstart.md` or the projectâ€™s QA notes section if one is used. Acceptance: the documented result matches the executed walkthrough and notes any remaining follow-up.
- [X] T034 Run the final frontend verification commands from `frontend/` and capture the result in `specs/002-upgrade-marketing-site/quickstart.md` if any manual validation notes changed. Acceptance: lint, format check, test, and build all pass; backend checks remain unnecessary unless contact compatibility files changed unexpectedly.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2.
- **Phase 4 US2**: Depends on Phase 2 and the shared content model from Phase 1.
- **Phase 5 US3**: Depends on Phase 2 and the demo promise content from Phase 1.
- **Phase 6 US4**: Depends on Phase 2 and benefits from the showcase content established in Phase 4.
- **Phase 7 US5**: Depends on Phase 2 and the contact option content from Phase 1.
- **Phase 8 Polish**: Depends on all selected story phases.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after the foundational shell is complete.
- **US2 (P2)**: Independent of US3-US5, but uses the shared content model.
- **US3 (P3)**: Independent of US2 implementation details once the content model exists.
- **US4 (P4)**: Independent of US5 and can be validated on its own through the example and pricing sections.
- **US5 (P5)**: Uses the existing contact flow and should not require backend changes because the current enum values already cover the productized options.

### Suggested MVP Scope

- Complete Phase 1, Phase 2, and Phase 3 first to ship the new hero, promise, and navigation.
- If time is limited, stop after US1 and validate that a cold visitor understands the offer in 10 seconds.

### Parallel Opportunities

- T001-T005 can be split across different files and worked in parallel once the feature direction is agreed.
- T006-T009 can run in parallel where file ownership does not overlap.
- T012, T015, T017, T020, T023, and T026 are good parallel test tasks because they live in separate spec files.

## Final Verification Commands

Frontend:

```bash
cd frontend
npm run lint
npm run format:check
npm test
npm run build
```

Backend checks are not expected for this feature because `backend/app/schemas/contact.py` should remain unchanged. If a contact contract mismatch is discovered during implementation, run the existing backend validation commands separately.

