# Implementation Plan: Multi-Page Product Studio Architecture

**Branch**: `005-multipage-product-architecture` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-multipage-product-architecture/spec.md`

## Summary

Rework the Angular marketing site from one long landing page into a route-based product studio with a concise homepage, a premium product exploration hub, dedicated product detail routes, separate demo and studio pages, and a contact route that preserves the existing submission flow. The implementation should preserve the current visual identity, reuse existing product visuals and content where appropriate, and keep the FastAPI backend unchanged unless contact compatibility unexpectedly requires a very small adjustment.

The site must remain Polish-first, accessible, responsive, and SEO-friendly. The product hub should use route-backed selection instead of local-only state, deep links must survive refresh and browser history, and the contact route may accept product context only if it can be done cleanly without a new backend endpoint.

## Technical Context

**Language/Version**: TypeScript with Angular 17 on the frontend; Python 3.12+ with FastAPI on the backend

**Primary Dependencies**: Angular standalone components, Angular Router, typed content modules, reactive forms, Meta/Title, SCSS, existing product visuals, FastAPI/Pydantic/pytest for the unchanged backend surface

**Storage**: None. This remains a static marketing and lead-generation site with the existing contact form as the only public input path.

**Testing**: Angular unit/component tests for route behavior, content completeness, navigation, accessibility, SEO metadata, and contact compatibility; backend tests only if the contact contract is actually changed

**Target Platform**: Independently deployable Angular frontend and FastAPI backend on Google Cloud Platform-compatible targets

**Project Type**: Marketing website with separate Angular frontend and FastAPI backend

**Performance Goals**: Fast first render, no horizontal scrolling on common widths, clear route transitions, and immediate comprehension of the offer on mobile and desktop

**Constraints**: Polish-first content, no CMS/auth/database, no fake clients or metrics, no new backend endpoint solely for routing, accessible route-based navigation, and preserved visual identity

**Scale/Scope**: One marketing site with a small set of route pages, a shared content model, and reusable product visuals

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Business value**: PASS. The feature improves lead generation, trust building, and service explanation through clearer route-based product discovery.
- **MVP simplicity**: PASS. No CMS, auth, database, queue, or persistent storage is introduced.
- **Architecture separation**: PASS. Angular frontend and FastAPI backend remain separate and independently deployable.
- **API contract**: PASS. No new backend endpoint is expected; the existing contact API remains the contract boundary.
- **UX and localization**: PASS. The site remains Polish-first, responsive, accessible, and ready for later English content.
- **Security**: PASS. Public input stays in the current contact form; no new sensitive data handling is introduced.
- **Developer readiness**: PASS. The plan names the file areas, validation paths, and route architecture decision.

## Project Structure

### Documentation (this feature)

```text
specs/005-multipage-product-architecture/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
`-- tasks.md
```

### Source Code (repository root)

```text
frontend/
|-- src/app/
|   |-- app.component.ts
|   |-- app.config.ts
|   |-- app.routes.ts
|   |-- core/content/
|   |-- features/contact/
|   |-- features/landing/
|   |-- features/pages/
|   |-- features/products/
|   |-- features/studio/
|   |-- features/demo/
|   `-- shared/
|-- src/assets/
`-- src/styles.scss

backend/
`-- src/app/schemas/contact.py   # only if contact compatibility unexpectedly changes
```

**Structure Decision**: Keep the current separated frontend/backend layout. Reuse the existing Angular application, move site-wide navigation into a shared shell, add route-specific page components for the homepage, product hub, product detail pages, demo page, studio page, and contact page, and centralize route/page content in typed content modules. The `/produkty` route should display a useful exploration view with a default selected product, not redirect away from the catalog.

## Complexity Tracking

No constitution violations require justification for this feature.

## Implementation Phases

### Phase 0: Research and Content Model

Goal: define the route/page content model before changing the shell or individual pages.

Tasks:
- Shape the shared content model for route metadata, navigation, product catalog data, homepage sections, demo content, studio content, and contact context.
- Reuse existing Polish copy and visuals where practical, then move long-form sections into dedicated route content.
- Confirm the `/produkty` decision and the cleanest approach for optional contact-route context.

Deliverable:
- A typed content model and route map that can drive the whole site consistently.

### Phase 1: App Shell and Route Infrastructure

Goal: replace anchor-only navigation with route-based navigation and shared page chrome.

Tasks:
- Update the Angular router with explicit route groups for `/`, `/produkty`, product detail pages, `/demo-w-7-dni`, `/studio`, and `/kontakt`.
- Add a shared header/navigation shell with active states, mobile navigation, and accessible product navigation behavior.
- Preserve canonical/SEO metadata at the route level.

Deliverable:
- A route-aware shell that supports direct linking, refresh, and browser history.

### Phase 2: Homepage and Product Discovery

Goal: turn the homepage into a concise sales entry point and create the premium product exploration experience.

Tasks:
- Simplify the homepage to the approved section set: hero, compact product overview, short demo explanation, featured product or visual, studio teaser, and contact CTA.
- Build the products route with the desktop selector rail, mobile compact selector, shared product panel, and route-backed active state.
- Create the product detail pages for the six product directions and reuse existing visuals where appropriate.

Deliverable:
- A route-driven discovery flow that makes the catalogue understandable and shareable.

### Phase 3: Long-Form Trust Pages and Contact

Goal: move the long-form explanation content out of the homepage and keep the contact route compatible.

Tasks:
- Create or adapt the `/demo-w-7-dni` page to hold the seven-day sprint, demo-versus-production boundary, packages, FAQ, and expected result.
- Create or adapt the `/studio` page to hold the studio description, principles, process, technologies, engineering approach, trust, and scope boundaries.
- Preserve the contact form on `/kontakt` and, if clean, allow optional product context from product CTAs without changing the backend contract.

Deliverable:
- A concise homepage with supporting long-form pages and a preserved conversion path.

### Phase 4: Verification and Polish

Goal: prove the route-based site works across accessibility, responsive, and SEO expectations.

Tasks:
- Add or update Angular tests for route navigation, direct-link behavior, product selection, metadata, accessibility, and reduced-motion fallbacks.
- Verify the site at narrow mobile widths and common desktop widths.
- Run the frontend lint, format check, test, and build commands.

Deliverable:
- A validated multi-page marketing site ready for review.

## Files To Change

- `frontend/src/app/app.routes.ts`
- `frontend/src/app/app.component.ts`
- `frontend/src/app/core/content/*.ts`
- `frontend/src/app/core/content/*.spec.ts`
- `frontend/src/app/features/contact/contact-form.component.ts`
- `frontend/src/app/features/contact/contact-form.component.html`
- `frontend/src/app/features/contact/contact-form.component.spec.ts`
- `frontend/src/app/features/pages/**`
- `frontend/src/app/features/products/**`
- `frontend/src/app/features/demo/**`
- `frontend/src/app/features/studio/**`
- `frontend/src/app/shared/**`
- `frontend/src/styles.scss`
- `frontend/src/index.html`
- `frontend/src/environments/*` only if a route or metadata setting needs a documented constant
- `backend/src/app/schemas/contact.py` only if the existing contact contract truly needs adjustment

## Validation Commands

Frontend:

```bash
cd frontend
npm run lint
npm run format:check
npm test
npm run build
```

Backend only if the contact contract changes:

```bash
cd backend
pytest
```

## Notes

- Existing landing-page visuals and content are expected to be repurposed instead of redesigned from scratch.
- The homepage should not continue to explain every product and every delivery stage in full.
- The product hub must be backed by Angular routes rather than local-only component state.
- No new backend endpoint should be added just to support route context or navigation.
