# Implementation Plan: Demo AI w 7 dni - Landing Page Upgrade

**Branch**: `002-upgrade-marketing-site` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-upgrade-marketing-site/spec.md`

## Summary

Rework the existing Angular 17 marketing landing page so it leads with the business promise "Demo AI w 7 dni - zanim inwestujesz w pelne wdrozenie", simplifies navigation, groups the offer into three clear business categories, and removes repeated defensive disclaimers. The implementation should reuse existing landing sections and content files where possible, keep the FastAPI backend unchanged unless contact copy or select labels force a tiny compatibility update, and preserve the current Cloud Run deployment assumptions.

The page must stay Polish-first, accessible, responsive, and credible. It should explain the demo-vs-production boundary in one place, add one concrete 7-day demo example, keep the demo sprint and trust sections in scope, treat Websites + SEO as a supporting service area for AI landing pages and product validation pages, recast pricing as value and risk reduction, shorten the FAQ, and keep the contact path understandable for non-technical business buyers.

## Technical Context

**Language/Version**: TypeScript with Angular 17 on the frontend; Python 3.12+ with FastAPI on the backend.

**Primary Dependencies**: Existing Angular standalone components, reactive forms, SCSS, typed content modules, FastAPI/Pydantic/pytest. No new UI or animation libraries are required.

**Storage**: None. This is a marketing/content upgrade and should remain static apart from the existing contact flow.

**Testing**: Angular unit/component tests for content, navigation, a11y, responsive behavior, and SEO; backend tests only if contact contract values change unexpectedly.

**Target Platform**: Existing independently deployable frontend and backend on Google Cloud Run-compatible infrastructure.

**Project Type**: Marketing website with separate Angular frontend and FastAPI backend.

**Performance Goals**: Fast first-screen comprehension, no horizontal scrolling on common widths, reduced-motion support, lightweight visuals, and no degradation of current build/test performance.

**Constraints**: Polish-first copy, no fake clients or metrics, no unnecessary libraries, preserve accessibility and responsive behavior, and avoid introducing real demo runtimes or backend systems that are not already part of the MVP.

**Scale/Scope**: One landing page, a small set of reusable section components, and typed content updates centralized under `frontend/src/app/core/content/`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Business value**: PASS. The feature improves lead generation, trust, and service clarity for the new 7-day demo positioning.
- **MVP simplicity**: PASS. No CMS, auth, database, billing, payment flow, or real AI runtime is introduced.
- **Architecture separation**: PASS. The Angular frontend and FastAPI backend stay independently buildable and deployable.
- **API contract**: PASS. The backend should remain unchanged unless a contact-select label requires a small compatibility tweak, and the current enums already cover the needed values.
- **UX and localization**: PASS. The plan keeps Polish-first copy, responsive layout, semantic structure, keyboard access, and reduced-motion support.
- **Security**: PASS. Public input remains limited to the existing contact flow; mockups and previews stay presentation-only.
- **Developer readiness**: PASS. The plan names the likely files, tests, and validation commands, and keeps the work in the existing repo structure.

**Post-design re-check**: PASS. The design artifacts keep the same boundaries: frontend content and presentation changes, no new backend capability, and verification through existing tests plus targeted landing-page coverage.

## Project Structure

### Documentation (this feature)

```text
specs/002-upgrade-marketing-site/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- contact-intake.md
`-- checklists/
    `-- requirements.md
```

### Source Code (repository root)

```text
frontend/
|-- src/app/core/content/
|   |-- pl.ts
|   |-- landing-content.types.ts
|   |-- landing.pl.ts
|   `-- contact-options.pl.ts
|-- src/app/features/landing/
|   |-- landing.component.ts
|   |-- landing.component.html
|   |-- landing.component.scss
|   |-- sections/
|   |   |-- hero-section.component.*
|   |   |-- demo-promise-section.component.*
|   |   |-- product-offers-section.component.*
|   |   |-- showcase-section.component.*
|   |   |-- websites-seo-section/
|   |   |   `-- websites-seo-section.component.*
|   |   |-- demo-sprint-section.component.*
|   |   |-- trust-section.component.*
|   |   |-- pricing-section.component.*
|   |   |-- faq-section.component.*
|   |   `-- contact-cta-section.component.*
|   `-- visuals/
|       |-- rag-workflow-visual.component.*
|       |-- voice-waveform-visual.component.*
|       |-- whatsapp-control-visual.component.*
|       |-- email-pipeline-visual.component.*
|       `-- agent-panel-preview.component.*
|-- src/app/features/contact/
|   `-- contact-form.component.*
|-- src/app/shared/reveal/
|   `-- reveal-on-scroll.directive.*
`-- src/app/services/
    `-- contact-api.types.ts

backend/
`-- src/app/schemas/contact.py   # only if contact values need explicit backend sync
```

**Structure Decision**: Keep the existing separated frontend and backend applications. Most work belongs in the typed content layer and the landing page sections under `frontend/src/app/features/landing/`. Reuse existing section components when possible; split only where a section has distinct content, visuals, or accessibility behavior that benefits from its own component. Backend changes are not expected because the current contact enums already include the needed project types.

## Files To Change

- `frontend/src/app/core/content/pl.ts`
- `frontend/src/app/core/content/landing-content.types.ts`
- `frontend/src/app/core/content/landing.pl.ts`
- `frontend/src/app/core/content/contact-options.pl.ts`
- `frontend/src/app/features/landing/landing.component.ts`
- `frontend/src/app/features/landing/landing.component.html`
- `frontend/src/app/features/landing/landing.component.scss`
- `frontend/src/app/features/landing/sections/hero-section.component.*`
- `frontend/src/app/features/landing/sections/demo-promise-section.component.*`
- `frontend/src/app/features/landing/sections/product-offers-section.component.*`
- `frontend/src/app/features/landing/sections/showcase-section.component.*`
- `frontend/src/app/features/landing/sections/websites-seo-section/websites-seo-section.component.*`
- `frontend/src/app/features/landing/sections/demo-sprint-section.component.*`
- `frontend/src/app/features/landing/sections/trust-section.component.*`
- `frontend/src/app/features/landing/sections/pricing-section.component.*`
- `frontend/src/app/features/landing/sections/faq-section.component.*`
- `frontend/src/app/features/landing/sections/contact-cta-section.component.*`
- `frontend/src/app/features/landing/visuals/*.component.*`
- `frontend/src/app/features/contact/contact-form.component.ts`
- `frontend/src/app/features/contact/contact-form.component.html`
- `frontend/src/app/features/contact/contact-form.component.spec.ts`
- `frontend/src/app/features/landing/*.spec.ts`
- `frontend/src/app/core/content/*.spec.ts`

Optional backend-only files if a contact compatibility change becomes necessary:

- `backend/src/app/schemas/contact.py`
- `backend/tests/**`

## Implementation Phases

### Phase 1: Content Architecture and Copy System

Goal: make the landing-page copy maintainable and business-first before changing layout.

Tasks:
- Update `landing-content.types.ts` so the page model explicitly covers hero, simplified nav, three offer families, one demo-vs-production explanation, one example demo, package framing, shorter FAQ, and contact copy.
- Rewrite `landing.pl.ts` to express the new positioning and remove repeated defensive framing.
- Adjust `pl.ts` if it currently acts as the aggregate content entry point.
- Refresh `contact-options.pl.ts` so labels read like business choices rather than technical taxonomy.

Deliverable:
- A typed, centralized copy source that matches the new spec and can be consumed by sections without hardcoded strings.

### Phase 2: Page Composition and Navigation Simplification

Goal: reduce the landing page to a sharper sales narrative with a simple navigation model.

Tasks:
- Update `landing.component.ts` to wire the new content shape, page metadata, and section composition.
- Rewrite `landing.component.html` to use a 5-6 item navigation and remove legacy section clutter that no longer supports the new story.
- Preserve the skip link, semantic landmarks, and anchor behavior.
- Keep the main conversion path visible from the hero and repeated in later sections.

Deliverable:
- A cleaner landing shell with a focused information architecture and simple anchor navigation.

### Phase 3: Section Copy, Visuals, and Storytelling

Goal: turn the page into a premium business pitch without claiming fake production capabilities.

Tasks:
- Rewrite the hero, demo promise, product offers, showcase, websites/SEO, demo sprint, trust, pricing, FAQ, and contact CTA sections.
- Ensure the three offer groups read as business categories: knowledge assistant, communication automation, and AI validation demo, while Websites + SEO remains a supporting area for AI landing pages, demo pages, and product validation pages.
- Make the demo sprint section explain the 7-day validation flow and the trust section explain transparent scope, risk reduction, technical realism, and the demo-vs-production boundary.
- Add the consolidated "Etap demo vs etap produkcyjny" explanation in one place, not repeated across the page.
- Add one concrete "Przyklad demo po 7 dniach" narrative that shows the visible demo result and the business decision it supports.
- Reframe pricing as starting packages or ranges that reduce risk and clarify scope.
- Update visual components so any mock dashboard, workflow, or panel is clearly marked as presentation-only.

Deliverable:
- A landing page that feels focused, premium, and honest, with fewer defensive disclaimers and clearer commercial framing.

### Phase 4: Contact Copy and Content Polish

Goal: make the contact path understandable to non-technical buyers and remove language issues.

Tasks:
- Review `contact-form.component.*` and related content to make project-type wording business-friendly.
- Keep the existing contact payload shape unless an unavoidable compatibility issue appears.
- Correct Polish wording, diacritics, and tone across the landing content.
- Make sure no fake clients, testimonials, integrations, or metrics are introduced while polishing the copy.

Deliverable:
- A contact experience and page copy that feel credible to a Polish business audience.

### Phase 5: Verification and Release Readiness

Goal: prove the landing page still works and matches the spec.

Tasks:
- Add or update targeted Angular tests for hero copy, navigation count, section presence, FAQ behavior, visual labeling, accessibility, and SEO metadata.
- Run responsive checks for mobile, tablet, laptop, and desktop widths.
- Validate reduced-motion behavior and keyboard accessibility.
- Run the frontend build/test commands and backend checks only if contact compatibility files changed.

Deliverable:
- A verified landing page change set ready for review and implementation merge.

## Risks And Mitigations

- **Risk**: The page still reads like a mockup catalog instead of a business offer. **Mitigation**: Keep the hero, offers, pricing, and FAQ anchored in business outcomes, risk reduction, and the 7-day demo promise.
- **Risk**: Navigation and section count remain too dense. **Mitigation**: Cap nav items at 5-6 and remove legacy sections that do not support the new narrative.
- **Risk**: Mock visuals are mistaken for real integrations. **Mitigation**: Label visuals as presentation-only and test the copy that surrounds them.
- **Risk**: Polish copy quality slips under deadline pressure. **Mitigation**: Treat diacritics and tone cleanup as a phase-gate item before verification.
- **Risk**: Accessibility regresses when sections are split or restyled. **Mitigation**: Preserve semantic headings, keyboard targets, focus states, and reduced-motion fallbacks in the section tests.
- **Risk**: Backend contract work is introduced unnecessarily. **Mitigation**: Keep contact project types aligned with existing enums and avoid touching FastAPI unless a real mismatch appears.

## Verification Checklist

- Hero leads with the business promise and makes the 7-day demo offer obvious in the first screen.
- Navigation is reduced to 5-6 understandable items.
- The page presents three main offer categories and does not feel like "we do everything".
- One consolidated "Etap demo vs etap produkcyjny" section replaces repeated negative disclaimers.
- One concrete "Przyklad demo po 7 dniach" section is present.
- Pricing/packages explain business value and risk reduction.
- FAQ is shorter, sharper, and less defensive.
- Contact options are understandable for non-technical business visitors.
- Polish copy is corrected for diacritics, typos, and premium tone.
- No fake clients, testimonials, integrations, production capabilities, or metrics are added.
- Responsive and accessible behavior is preserved.
- Existing build and test commands pass.

## Commands To Run After Implementation

Frontend:

```bash
cd frontend
npm run lint
npm run format:check
npm test
npm run build
```

Backend, only if contact compatibility files change:

```bash
cd backend
ruff check .
ruff format --check .
pytest
```

## Notes

- The backend is expected to remain unchanged for this feature because the current contact enums already cover the proposed productized project types.
- The plan assumes the current landing-page sections can be reused and restyled rather than replaced wholesale.
