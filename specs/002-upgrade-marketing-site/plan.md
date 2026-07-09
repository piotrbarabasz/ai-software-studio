# Implementation Plan: Premium Marketing Website Upgrade

**Branch**: `002-upgrade-marketing-site` | **Date**: 2026-07-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-upgrade-marketing-site/spec.md`

## Summary

Upgrade the existing single-page AISoftware Studio marketing site into a premium, Polish-first AI productized-services landing page while preserving the current Angular 17 frontend, FastAPI backend, frontend/backend separation, and contact intake flow. The implementation will refactor the large landing content model into maintainable productized content structures, split the landing page into focused standalone section/presentation components where useful, add CSS/SVG/Angular-template product visuals, use small IntersectionObserver-based scroll reveal helpers, update SEO metadata and contact project-type options, and keep backend changes limited to contact enum/contract compatibility.

No real RAG service, chatbot runtime, voice runtime, WhatsApp API integration, cost tracking backend, billing, authentication, database, CMS, payment, or admin backend will be introduced.

## Technical Context

**Language/Version**: TypeScript with Angular 17 for the frontend; Python 3.12+ with FastAPI for the existing backend.

**Primary Dependencies**: Existing Angular packages, Angular Reactive Forms, RxJS, SCSS/CSS, existing FastAPI/Pydantic/pytest/Ruff stack. No GSAP, Three.js, Lottie, WebGL, animation framework, CMS, database driver, auth package, billing SDK, WhatsApp SDK, voice SDK, or AI/RAG runtime dependency is planned.

**Storage**: None. Content remains static frontend content. Contact submissions continue through the existing no-database contact intake flow.

**Testing**: Angular unit/component tests for content rendering, section composition, SEO metadata, reveal behavior, reduced-motion behavior, and contact form options; existing frontend lint/format/test/build scripts; backend pytest contract/unit tests only for contact enum compatibility if project types change.

**Target Platform**: Existing independently deployable Angular frontend and FastAPI backend on Google Cloud Platform-compatible targets. Local validation continues through the Angular dev server and FastAPI dev server.

**Project Type**: Marketing website with separate Angular frontend and FastAPI backend.

**Performance Goals**: Preserve or improve MVP targets: production desktop Lighthouse Performance >= 90 and Accessibility >= 90, no horizontal scrolling on common mobile/tablet/desktop viewports, no heavy animation dependencies, first screen message and contact CTA understandable within 30 seconds, and visual previews implemented with static markup/SVG/CSS rather than runtime-heavy graphics.

**Constraints**: Polish-first content, English-ready content organization, semantic HTML, keyboard navigation, visible focus states, reduced-motion fallback, SEO metadata, existing contact API compatibility, no new persistent infrastructure, no live product integrations, and presentation-only labels for mock dashboards/workflows where confusion is possible.

**Scale/Scope**: One upgraded public landing page, static productized content and visuals, optional small frontend helper for scroll reveal, compatible contact form project-type updates, and no new backend capability beyond accepted enum values if required.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Business value**: PASS. The feature supports lead generation, trust building, and service explanation for the new 7-day AI demo positioning with measurable comprehension and contact outcomes.
- **MVP simplicity**: PASS. The plan excludes CMS, authentication, database, queues, payment, billing, live AI integrations, real WhatsApp/voice/RAG systems, and admin backend functionality.
- **Architecture separation**: PASS. The Angular frontend and FastAPI backend remain independently buildable, testable, configurable, and deployable.
- **API contract**: PASS. No new endpoint is planned. If contact project-type enum values change, the existing `POST /api/contact` OpenAPI contract and backend/frontend types will be updated together and covered by tests.
- **UX and localization**: PASS. The upgrade remains Polish-first, responsive, accessible, reduced-motion friendly, SEO-oriented, and content-structured for future English support.
- **Security**: PASS. Public input remains limited to the existing contact form. Presentation mockups do not collect data, authenticate users, or call external services.
- **Developer readiness**: PASS. The plan names files to change/add, validation commands, content model changes, component structure, and risk controls.

**Post-design re-check**: PASS. Phase 1 artifacts preserve the same boundaries: frontend presentation-first implementation, no new runtime integrations, no storage, compatible contact contract updates only, and focused validation through existing scripts and targeted tests.

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
|-- package.json
|-- src/
|   |-- app/
|   |   |-- core/
|   |   |   `-- content/
|   |   |       |-- pl.ts
|   |   |       |-- landing-content.types.ts
|   |   |       |-- landing.pl.ts
|   |   |       `-- contact-options.pl.ts
|   |   |-- features/
|   |   |   |-- landing/
|   |   |   |   |-- landing.component.*
|   |   |   |   |-- sections/
|   |   |   |   `-- visuals/
|   |   |   `-- contact/
|   |   |       `-- contact-form.component.*
|   |   `-- services/
|   |       |-- contact-api.service.*
|   |       `-- contact-api.types.ts
|   `-- assets/

backend/
|-- app/
|   |-- schemas/
|   |   `-- contact.py
|   `-- api/
|       `-- contact.py
`-- tests/
    |-- contract/
    `-- unit/
```

**Structure Decision**: Keep the existing separated `frontend/` and `backend/` applications. The landing page should be decomposed inside `frontend/src/app/features/landing/` only when it reduces template/SCSS complexity. Static content should move out of hardcoded HTML and into typed content models under `frontend/src/app/core/content/`. Backend work is limited to preserving the contact contract if marketing-specific project type values are introduced.

## Files To Change

- `frontend/src/app/core/content/pl.ts`: Convert to an aggregate export or keep as the public Polish content entry point while moving large content blocks into smaller typed files.
- `frontend/src/app/core/content/landing-content.types.ts`: Add shared content interfaces for navigation, hero, productized offers, showcases, visual labels, sprint steps, packages, FAQ, trust content, SEO metadata, and contact options.
- `frontend/src/app/core/content/landing.pl.ts`: Add the upgraded Polish content for the premium AI products landing page.
- `frontend/src/app/core/content/contact-options.pl.ts`: Add or split contact select options when doing so keeps contact copy reusable.
- `frontend/src/app/features/landing/landing.component.html`: Replace the monolithic template with section component composition or smaller semantic blocks.
- `frontend/src/app/features/landing/landing.component.scss`: Move global page layout tokens and shared section styles here or into local section SCSS as appropriate; add reduced-motion rules.
- `frontend/src/app/features/landing/landing.component.ts`: Keep SEO metadata setup, import new standalone section/visual components, and wire the reveal directive/helper if used.
- `frontend/src/app/features/contact/contact-form.component.ts`: Continue using the existing form shape; update content source and tests for new project type labels.
- `frontend/src/app/features/contact/contact-form.component.html`: No payload shape change planned; minor label/help copy may be added if it improves clarity without changing backend compatibility.
- `frontend/src/app/services/contact-api.types.ts`: Add marketing-specific `ProjectType` enum values if the form exposes them.
- `backend/app/schemas/contact.py`: Add matching `ProjectType` enum values only if the frontend sends new values.
- `specs/002-upgrade-marketing-site/contracts/contact-intake.md`: Document the compatible contact contract and allowed project-type values.

## Files To Add

- `frontend/src/app/features/landing/sections/hero-section.component.*`
- `frontend/src/app/features/landing/sections/demo-sprint-section.component.*`
- `frontend/src/app/features/landing/sections/product-offers-section.component.*`
- `frontend/src/app/features/landing/sections/showcase-section.component.*`
- `frontend/src/app/features/landing/sections/pricing-section.component.*`
- `frontend/src/app/features/landing/sections/faq-section.component.*`
- `frontend/src/app/features/landing/sections/contact-cta-section.component.*`
- `frontend/src/app/features/landing/visuals/rag-workflow-visual.component.*`
- `frontend/src/app/features/landing/visuals/voice-waveform-visual.component.*`
- `frontend/src/app/features/landing/visuals/whatsapp-control-visual.component.*`
- `frontend/src/app/features/landing/visuals/email-pipeline-visual.component.*`
- `frontend/src/app/features/landing/visuals/agent-panel-preview.component.*`
- `frontend/src/app/shared/reveal/reveal-on-scroll.directive.ts` if a reusable IntersectionObserver helper is preferable to local component code.
- Targeted `.spec.ts` files for new section components, visuals, and reveal behavior where logic or accessibility state is non-trivial.

Exact component count may be reduced during implementation if a section is static and clearer as part of `landing.component.html`. The maintainability threshold is: split when a section has repeated content, a distinct visual, or more than one testable behavior.

## Data/Content Model Changes

- Replace the generic `ServiceOffering` model with a richer `ProductizedOffer` model containing `id`, `title`, `shortLabel`, `summary`, `businessOutcome`, `useCases`, `demoArtifact`, `scopeBoundary`, `visualKind`, and `ctaLabel`.
- Add `ProductShowcase` content for RAG, voice, WhatsApp management, email automation, Websites + SEO, and management panel storytelling.
- Add `DemoSprintStep` content for inquiry, scope confirmation, materials, build, review, and next-step recommendation.
- Add `StartingPackage` content for pricing/package framing with included outcomes, assumptions, starting point/range copy, and CTA.
- Add `FaqItem` content with accessible question/answer text covering demo scope, materials, timeline, exclusions, integrations, production readiness, handoff, and contact.
- Add `PresentationVisualCopy` labels so mock dashboards/workflows can be explicitly described as presentation-only.
- Update SEO metadata to the new positioning: practical AI demos in 7 days, productized AI services, Websites + SEO, and contact intent.
- Update contact project type options to include productized service values: `rag_chatbot_demo`, `website_seo`, `voice_agent_demo`, `whatsapp_agent_management`, `email_automation`, and `agent_management_panel`, while keeping broad existing values if useful for backward compatibility.

## Component Structure

- `LandingComponent`: page shell, SEO metadata, top navigation, section composition, and contact form placement. Avoid detailed product markup here once sections are split.
- `HeroSectionComponent`: premium first viewport with hero copy, CTA links, trust chips, and a lightweight product/workflow preview.
- `DemoSprintSectionComponent`: explains the 7-day promise, start conditions, material handoff, and exclusions.
- `ProductOffersSectionComponent`: renders the six productized offers from content data with anchor links and CTA prompts.
- `ShowcaseSectionComponent`: reusable section for a showcase plus a projected or selected visual component.
- Visual components: static SVG/CSS/HTML previews for RAG workflow, voice waveform, WhatsApp conversation/control, email pipeline, and agent panel. They must expose accessible names/descriptions and must not contain form fields that look submit-capable unless clearly disabled/presentation-only.
- `PricingSectionComponent`: renders starting packages or ranges from content.
- `FaqSectionComponent`: uses native `details`/`summary` or accessible buttons with state; native `details` is preferred for low JavaScript and keyboard support.
- `ContactCtaSectionComponent`: final conversion section that embeds or links to the existing `app-contact-form`.

## Animation Approach

- Use CSS transitions/transforms/opacity and small Angular-friendly state classes for reveal effects.
- Use a reusable `RevealOnScrollDirective` backed by `IntersectionObserver` for progressive reveal. It should add a class when an element enters the viewport, unobserve after first reveal by default, and no-op gracefully when `IntersectionObserver` is unavailable.
- Respect `prefers-reduced-motion: reduce` in CSS and directive logic. Reduced motion should render content visible immediately with no transform animation.
- Use CSS-only loops sparingly for non-essential visuals such as waveform bars or pipeline pulses. They must pause/disable under reduced motion.
- Do not add GSAP, Three.js, Lottie, WebGL, canvas animation libraries, or runtime-heavy visual dependencies for the first implementation.
- Keep animations non-blocking: content must be readable before animation completes, CTAs must remain interactive, and focus states must not depend on animation.

## Testing Strategy

- Frontend unit/component tests:
  - `LandingComponent` sets the updated SEO title, description, Open Graph metadata, and canonical link.
  - Navigation renders anchors for the required sections.
  - Required sections render from the typed content model.
  - Productized offers include all six categories.
  - Presentation visuals expose accessible labels and presentation-only copy.
  - FAQ controls are keyboard-accessible and render expected answers.
  - Contact form renders updated project type options and still submits the existing payload shape.
  - Reveal directive makes content visible and handles reduced-motion or missing observer fallback.
- Backend tests:
  - Existing contact contract tests continue to pass.
  - If new project-type enum values are accepted, add unit/contract coverage for one new value and one invalid value.
- Manual/accessibility validation:
  - Keyboard-only pass through nav, CTAs, FAQ, visual controls if any, and contact form.
  - Reduced-motion browser setting confirms no motion-dependent content.
  - Mobile and desktop viewport checks confirm no horizontal overflow and no overlapping text.
  - Lighthouse desktop Performance and Accessibility remain >= 90.
- Commands:
  - Frontend: `npm run lint`, `npm run format:check`, `npm test`, `npm run build` from `frontend/`.
  - Backend, only if touched: run the existing backend lint/format/test scripts or `ruff check .`, `ruff format --check .`, and `pytest` from `backend/`.

## Risks And Mitigations

- **Risk**: Premium visuals inflate template/SCSS complexity. **Mitigation**: Split only high-complexity sections into standalone components and keep shared content in typed data files.
- **Risk**: Mockups could be mistaken for real running products. **Mitigation**: Add explicit presentation/demo labels in visual copy and acceptance tests for those labels.
- **Risk**: Animation hurts accessibility or performance. **Mitigation**: Use CSS/IntersectionObserver only, support reduced motion, avoid heavy dependencies, and validate Lighthouse/accessibility.
- **Risk**: Contact project type updates drift between frontend and backend. **Mitigation**: Update frontend union type, backend enum, contract artifact, and tests together.
- **Risk**: Productized copy becomes hardcoded across templates. **Mitigation**: Keep repeated business content in typed content models and render through section components.
- **Risk**: Large hero/media assets slow first impression. **Mitigation**: Prefer CSS/SVG/HTML visuals and optimize any bitmap assets before adding them.

## Complexity Tracking

No constitution violations. The plan intentionally avoids database, CMS, authentication, billing, payment, live AI integrations, live voice/WhatsApp integrations, real cost tracking, and admin backend behavior.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
