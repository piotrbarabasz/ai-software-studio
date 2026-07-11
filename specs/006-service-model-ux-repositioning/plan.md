# Implementation Plan: Service Model UX Repositioning

**Branch**: `006-service-model-ux-repositioning` | **Date**: 2026-07-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-service-model-ux-repositioning/spec.md`

## Summary

Reposition the existing AISoftware Studio multi-page site so visitors clearly understand two commercial paths, Validate and Build, with R&D as a credibility layer rather than a third equal package. The implementation should evolve the current Angular 17 route-backed, typed-content architecture created by the previous multipage feature. It should update content models, page composition, route metadata, product grouping, contact intent mapping, accessibility, responsiveness, and tests while preserving the existing backend contact contract, product URLs, shell, routing model, design tokens, and frontend/backend separation.

## Technical Context

**Language/Version**: TypeScript 5.4 with Angular 17 standalone components for the frontend; Python 3.12+ FastAPI backend remains unchanged.

**Primary Dependencies**: Existing Angular packages, Angular Router, Angular Reactive Forms, RxJS, existing FastAPI/Pydantic/OpenAPI backend. No new runtime dependency, UI library, CMS, or state management library is planned.

**Storage**: None. No database, CMS, queue, browser persistence, account system, or new server-side storage.

**Testing**: Angular content/model tests, component tests, router behavior tests, contact form tests, and build/lint validation. Backend tests should not need changes unless a regression is discovered, because the contact payload contract is preserved.

**Target Platform**: Existing independently deployable frontend and backend on Google Cloud-compatible targets.

**Project Type**: Marketing/service explanation website with separate Angular frontend and FastAPI backend.

**Performance Goals**: Keep the production Angular initial bundle within the existing 500 KB warning and 1 MB error budget; keep any component stylesheet below the existing 8 KB warning and 16 KB error budget; avoid heavy animations and new dependencies; preserve stable section dimensions to limit layout shift across 320 px through wide desktop viewports.

**Constraints**: Polish-first user-facing copy, English-ready typed content structure, existing public routes and product slugs, one H1 per route, unique title/meta description/canonical per route, WCAG 2.2 AA within feature scope, keyboard-operable navigation and CTAs, no fictional clients/results/logos, no `/lab` route, no backend endpoint or payload change unless later proven unavoidable.

**Scale/Scope**: Focused public-site repositioning. The feature changes content structure and frontend UX; it does not re-platform, add infrastructure, or create a product backend.

## Existing Codebase Findings

- `frontend/src/app/app.routes.ts` already maps `siteContent.routes` into Angular routes and stores `description`, `canonicalPath`, `routeKind`, `productId`, and `defaultProductId` in route data. This should remain the routing source of truth.
- `frontend/src/app/core/content/site-content.types.ts` and `frontend/src/app/core/content/site.pl.ts` already centralize route metadata, products, homepage content, demo content, studio content, and contact content. This is the main extension point.
- `frontend/src/app/features/shell/site-shell.component.ts` already updates document title, meta description, Open Graph tags, and canonical link from route data. It also closes the mobile menu on navigation and Escape.
- `frontend/src/app/features/home/` already renders a short homepage with hero, two work tracks, solution groups, journey steps, Studio teaser, R&D teaser, and final CTAs. It needs refinement, stronger data typing, better composition, and tests aligned with the final positioning.
- `frontend/src/app/features/products/` already uses one route-backed component for `/produkty` and product detail routes. It derives selected product from the router and supports browser navigation. It needs business-problem categories, richer product detail fields, and contact context mapping that does not confuse product IDs with top-level intent.
- `frontend/src/app/features/demo/` reuses existing landing sections and `siteContent.demo`. It should keep reusable components where appropriate but add clearer demo/PoC/MVP/production distinctions and remove or reframe any pricing/package language that overemphasizes "demo in 7 days" as the whole offer.
- `frontend/src/app/features/studio/` reuses existing landing trust/process/technology sections and `siteContent.studio`. It should become the main trust page with transparent operating model, quality principles, R&D directions, and prototype/production separation.
- `frontend/src/app/features/contact/contact-form.component.ts` already validates query param `projectType` against `projectTypeOptions` before setting the form value. This allowlist pattern should be kept. Invalid URL values already fall back to the empty default state.
- `frontend/src/app/core/content/contact-options.pl.ts` and `frontend/src/app/services/contact-api.types.ts` define the current backend-compatible `projectType` values. Context preservation must stay inside this existing field and must not add arbitrary URL data to the backend payload.
- `frontend/src/styles.scss` defines the warm light base, dark green, orange accent, focus token, section shell, global focus styling, and `prefers-reduced-motion` fallback. Page SCSS should reuse these tokens and avoid duplicated magic values.
- Existing tests cover content model integrity, homepage sections, products route selection, contact query-param preselection, shell navigation/metadata behavior, demo page rendering, studio page rendering, and contact API payload shape. These tests should be extended rather than replaced.
- Potential cleanup: the older `frontend/src/app/features/landing/` sections and visuals remain useful reusable building blocks, but some sections may become misleading if copied directly into Demo or Studio without new content framing. Removal should only happen after a usage audit during implementation.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Business value**: PASS. The spec targets clearer service explanation, trust building, and qualified lead generation with measurable visitor understanding and contact-path outcomes.
- **MVP simplicity**: PASS. No CMS, auth, database, queue, storage, new backend, or infrastructure is planned.
- **Architecture separation**: PASS. Frontend remains Angular, backend remains FastAPI, and the backend contract is preserved.
- **API contract**: PASS. No endpoint or payload change is planned. Existing contact API and OpenAPI coverage remain authoritative.
- **UX and localization**: PASS. The plan is Polish-first, responsive, accessible, and route/metadata aware.
- **Security**: PASS. Contact context uses an allowlisted query parameter and does not trust arbitrary URL data or expand backend payloads.
- **Developer readiness**: PASS. Existing scripts and repository structure are preserved; quickstart defines validation commands and manual checks.

## Project Structure

### Documentation (this feature)

```text
specs/006-service-model-ux-repositioning/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- ui-contact-context.md
`-- checklists/
    `-- requirements.md
```

`tasks.md` is intentionally not created by this planning step.

### Source Code (repository root)

```text
frontend/
|-- package.json
|-- angular.json
`-- src/
    |-- styles.scss
    `-- app/
        |-- app.routes.ts
        |-- core/
        |   `-- content/
        |       |-- contact-options.pl.ts
        |       |-- pl.ts
        |       |-- site-content.types.ts
        |       |-- site-content.spec.ts
        |       `-- site.pl.ts
        |-- features/
        |   |-- shell/
        |   |-- home/
        |   |-- products/
        |   |-- demo/
        |   |-- studio/
        |   |-- contact/
        |   `-- landing/
        |-- services/
        |   |-- contact-api.types.ts
        |   |-- contact-api.service.ts
        |   `-- contact-api.service.spec.ts
        `-- shared/
            `-- reveal/

backend/
|-- app/
|   |-- api/contact.py
|   |-- schemas/contact.py
|   `-- services/contact_intake.py
`-- tests/
    |-- contract/
    |-- integration/
    `-- unit/
```

**Structure Decision**: Use the existing separated web application structure. Implementation is expected to be frontend-only unless a compatibility defect is discovered. Backend files are listed for contract awareness, not as expected edit targets.

## Phase 0: Research Decisions

See [research.md](./research.md). All planning unknowns are resolved with conservative choices:

- Extend typed content instead of introducing CMS or route-local data.
- Keep Angular Router as route state source.
- Preserve product URLs and backend contact payload.
- Use allowlisted `projectType` values for intent/context.
- Reuse existing style tokens and selected landing visuals/sections only when their content remains accurate.

## Phase 1: Design Decisions

### Content Model

Extend `site-content.types.ts` and `site.pl.ts` so content can express the service repositioning without scattering page copy through components.

Required content structures:

- `CollaborationModel`: Validate and Build only, with name, customer value, use cases, scope, result, limitations, timing/planning model, CTA label, target route, and safe contact intent.
- `ResearchDirection`: R&D area, problem, hypothesis or goal, potential business application, optional status, and a claim boundary that prevents accidental client-result framing.
- `SolutionCategory`: business-problem category with stable ID, title, lead, product IDs, examples, and optional homepage summary.
- Extended `ProductCatalogEntry`: add category ID, business problem, target audience, value, example use cases, demo scope, demo boundaries, production scope, further development path, contact intent, and existing visual kind.
- `ProjectJourneyStep`: idea, demo/PoC, MVP, production, further development, with optional R&D influence marker but no implication that R&D is a required purchased step.
- `ContactIntentOption`: user-facing contact intents mapped to the existing backend-compatible `ProjectType` values.

The current `ProductId` and `productRoutePaths` remain stable.

### Homepage

Keep one container component at `HomeComponent` and use small presentation components only where they reduce real complexity. The page should render from typed `siteContent.home` and avoid large local literals in the component class.

Planned page structure:

1. Hero: headline direction "Od pomyslu do produkcyjnej aplikacji AI" or final Polish equivalent, short explanation of validation then build, exactly two primary paths.
2. Collaboration tracks: a strong two-track layout for Validate and Build, visually distinct by composition and hierarchy, not two small identical cards.
3. Short solution categories: three business-problem categories with links to `/produkty`.
4. Project journey: Idea -> Demo/PoC -> MVP -> Production -> Further development, with R&D shown as influence/support where useful.
5. Studio trust teaser: owner/responsibility, cooperation model, demo/production split, quality, security, AI costs, technology decisions.
6. R&D teaser: a small set of research directions with explicit non-client-result framing.
7. Final CTA: two paths to `/kontakt` with safe query-param mapping for quick validation and full development.

Responsive behavior:

- 320-430 px: single-column sections, no horizontal rails that require precision scrolling, tap targets large enough for touch, no clipped CTA text.
- Tablet: two-track sections may stack or become two balanced columns when width allows.
- Laptop/wide desktop: use composition, spacing, background bands, and typography rather than repeating identical white cards.

Accessibility:

- One H1, semantic sections with headings, descriptive link text, visible focus, no required animation, and no information conveyed only by color.

### Products/Solutions Page

Keep `ProductsPageComponent` as the route-backed page for `/produkty` and existing product URLs.

Planned changes:

- Add business-problem category navigation or grouped overview before/around the product selector.
- Keep Angular Router as source of truth for selected product; do not introduce a local duplicated route state beyond derived display state.
- Keep direct links:
  - `/produkty/asystent-wiedzy-rag`
  - `/produkty/strony-seo`
  - `/produkty/voice-agent`
  - `/produkty/whatsapp-ai`
  - `/produkty/automatyzacja-email`
  - `/produkty/panel-agentow`
- Preserve browser back/forward by relying on router navigation rather than manual selector state.
- Each product detail must show problem, audience, value, examples, possible demo scope, demo limits, possible production scope, further development path, and CTA.
- Websites/SEO should be categorized as support for validation, sales, or market entry rather than a peer to agent systems.
- Product CTA should pass a safe existing `ProjectType` value. If the selected solution is more specific than the backend enum, map it to an existing allowed value rather than expanding the backend payload.

### Demo Page

Keep `DemoPageComponent`. Reuse existing landing section components only if their content does not create a package/pricing-first impression.

Planned content:

- What a demo is.
- What a PoC is.
- What may be produced in seven days.
- What the sprint excludes.
- Differences between demo, PoC, MVP, and production.
- Required client input.
- Sprint process and result.
- Decision criteria for the next step.
- How demo can transition into full development.

Avoid implying that a complete production MVP is always delivered in seven days.

### Studio Page

Keep `StudioPageComponent` as the trust page and expand it from typed `siteContent.studio`.

Planned sections:

- Motivation and who stands behind AISoftware Studio.
- Cooperation model and project process.
- Transparent prototype vs production split.
- Engineering principles, quality, testing, documentation.
- Security and provider choice.
- AI cost control.
- How automation and agents are used in delivery.
- R&D areas and transfer of R&D learning into client projects.

Do not add fictional clients, testimonials, metrics, case studies, or logos.

### Contact Page

Keep `ContactFormComponent` and the existing backend payload shape:

```ts
{
  name: string;
  email: string;
  company: string | null;
  projectType: ProjectType;
  budgetRange: BudgetRange;
  message: string;
  consent: true;
}
```

Use `projectType` query param only as a bounded preselection mechanism:

- Values must be checked against `projectTypeOptions`.
- Invalid values reset to the default empty state.
- No arbitrary URL text is copied into the form or backend payload.
- No new backend field is added for product context in this feature.
- If product-specific context is needed for the visitor, show it in page copy/CTA label or map it to the closest existing `ProjectType`.

The visible contact options should cover demo/quick validation, MVP, full development, AI automation/solution, and technology consultation using existing or explicitly added frontend/backend-compatible enum values only if backend schema already supports them. If backend schema does not support a desired new enum value, tasks must either map to existing values or explicitly create a backend contract task, but the default plan is no backend contract change.

## Component Plan

### New Components

- `frontend/src/app/features/home/collaboration-tracks.component.*` only if the two-track layout becomes too large for `home.component.html`.
- `frontend/src/app/features/home/project-journey.component.*` only if the process layout needs repeated responsive/a11y logic.
- `frontend/src/app/features/products/solution-category-nav.component.*` only if category navigation needs keyboard/focus behavior beyond simple links.
- `frontend/src/app/features/products/product-detail-sections.component.*` only if product detail markup becomes repeated or hard to test in the page component.

### Changed Components

- `HomeComponent`: refine hero, tracks, categories, journey, Studio teaser, R&D teaser, final CTA, and tests.
- `ProductsPageComponent`: add category grouping and richer product detail while preserving router-derived selected product.
- `DemoPageComponent`: reframe content around demo/PoC/MVP/production boundaries and transition to Build.
- `StudioPageComponent`: expand trust/R&D content and remove any agency-size implication.
- `ContactFormComponent`: refine intent labels and tests for allowlisted query-param behavior if contact options change.
- `SiteShellComponent`: update nav CTA label and route metadata tests if page titles/descriptions change.

### Preserved Components

- `SiteShellComponent` metadata/canonical and mobile nav behavior.
- `ContactApiService` and existing contact API payload behavior.
- Existing visual components under `frontend/src/app/features/landing/visuals/` where they support the new content.
- `RevealOnScrollDirective` with reduced-motion fallback.
- Existing shared global tokens in `frontend/src/styles.scss`.

### Possible Removal or Reframe After Usage Audit

- Landing sections reused by Demo/Studio if they force old package/pricing framing:
  - `pricing-section`
  - older demo promise/sprint copy if inconsistent
  - any section that presents "Demo AI in 7 days" as the whole company offer

Do not remove during planning; tasks should first verify usage and replacement coverage.

## Routing and SEO Plan

- Keep current routes and product slugs.
- Do not add `/lab`.
- Continue generating route definitions from `siteContent.routes`.
- Ensure every route has unique title and meta description aligned with the repositioned service model.
- Keep canonical path generation in `SiteShellComponent`.
- Preserve top-level navigation: Start, Produkty, Demo w 7 dni, Studio, Kontakt, unless tasks justify a label-only copy update.
- Maintain one H1 per rendered route.
- Keep `aria-current` for active navigation and product selector links.
- Add or update tests for direct product links, `/produkty` default selection, browser back/forward, route metadata, and canonical behavior.

## Accessibility Plan

Feature implementation must satisfy WCAG 2.2 AA within the affected surfaces:

- Semantic landmarks and sections.
- Existing skip link remains functional and points to the main content area.
- Logical heading hierarchy with one H1 per page.
- Keyboard reachability for navigation, mobile menu, product selector/category links, CTAs, and contact form controls.
- Visible focus using existing focus token.
- Accessible names for menu toggle, links, buttons, and form controls.
- `aria-current` only where it reflects current route/selection.
- Proper labels and error messages on contact fields.
- No essential information available only by color.
- `prefers-reduced-motion` leaves content visible.
- Color contrast preserved on green/orange/accent backgrounds.
- Avoid adding ARIA where semantic HTML is sufficient.

## Responsive and CSS Plan

- Test 320-360 px, 390-430 px, tablet, laptop, and wide desktop.
- Avoid horizontal scrolling, clipped CTA text, overlapping text, and layout shifts.
- Use existing custom properties:
  - `--color-bg`
  - `--color-surface`
  - `--color-ink`
  - `--color-muted`
  - `--color-line`
  - `--color-primary`
  - `--color-primary-strong`
  - `--color-accent`
  - `--color-accent-soft`
  - `--color-focus`
  - `--shadow-soft`
- Preserve the warm light base, dark green, and orange accent.
- Reduce repeated "white card + border + shadow + heading + list + CTA" patterns by using section bands, asymmetrical grids, typography scale, spacing, and process layouts.
- Avoid `!important`, deep SCSS nesting, duplicated tokens, arbitrary `min-height`, and magic values without a local reason.

## Performance Plan

- Add no heavy dependencies.
- Keep Angular build budgets unchanged.
- Prefer CSS layout over layout-measuring scripts.
- Avoid unnecessary subscriptions; continue using router events only where route-derived state is needed.
- Keep visual components stable in size to prevent layout shift.
- Use existing reduced-motion behavior; avoid heavy automatic animation.
- Lazy loading is not required for this feature unless task-level analysis proves a meaningful route-level benefit.

## Test Plan

Automated frontend tests should cover:

- Hero headline/direction and exactly two primary homepage paths.
- Validate and Build model presence and distinction.
- Demo/PoC vs MVP vs production distinction.
- Homepage category overview and product catalog link.
- Project journey sequence.
- R&D teaser as credibility content, not client outcome claim.
- Final homepage CTAs and query-param mapping.
- Products grouped by business problem.
- Existing product slugs and direct links.
- Product detail fields: problem, audience, value, examples, demo scope, demo limits, production scope, next development path.
- Router-derived product selection, browser back/forward, and active selector state.
- Route metadata completeness and uniqueness.
- Contact query-param allowlist, invalid fallback, and unchanged payload shape.
- Contact option labels for the five main intents.
- Mobile menu keyboard open/close and active nav state.
- Reduced-motion fallback through content visibility where practical.
- No backend contract regression via existing contact API tests.

Manual validation should cover:

- `/`
- `/produkty`
- each direct product URL
- `/demo-w-7-dni`
- `/studio`
- `/kontakt`
- desktop navigation
- mobile menu
- keyboard-only use
- reduced motion
- 320-360 px, 390-430 px, tablet, laptop, wide desktop
- CTA context handoff into contact

## Validation Commands

```powershell
cd frontend
npm run lint
npm test -- --watch=false
npm run build
```

If implementation touches backend contract or enum support despite the default plan:

```powershell
cd backend
python -m pytest
python -m ruff check .
```

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Contact intent is confused with product ID | Visitors and leads lose context clarity | Define explicit intent mapping and keep product details visitor-facing without arbitrary backend payload expansion |
| Homepage becomes a long catalog again | Main decision path weakens | Keep detailed product descriptions on `/produkty`; homepage shows only category overview |
| R&D reads like unverified client proof | Trust damage and misleading claims | Model R&D with claim boundaries and status; content review for zero fake metrics/logos/results |
| Reused landing sections preserve old "demo-only" positioning | Strategic repositioning fails | Audit reused sections and reframe/remove old package-first copy during tasks |
| Product grouping breaks direct links | SEO and shared links regress | Keep `productRoutePaths`, route tests, and browser navigation tests |
| CSS card repetition weakens hierarchy | Page feels like a catalog of equal boxes | Use layout composition, spacing, bands, and typographic hierarchy |
| Mobile selector becomes hard to use | Product discovery suffers | Test touch widths and keyboard focus at required breakpoints |

## Complexity Tracking

No constitution violations are planned.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|

## Post-Design Constitution Check

- **Business value**: PASS. Design maps directly to service explanation, trust, and qualified contact paths.
- **MVP simplicity**: PASS. No new storage, CMS, auth, backend endpoint, UI library, or infrastructure.
- **Architecture separation**: PASS. Frontend-only by default; backend contract remains unchanged.
- **API contract**: PASS. Existing contact payload remains authoritative; query params are allowlisted and not trusted as payload extensions.
- **UX and localization**: PASS. Polish-first content model, responsive testing, keyboard access, reduced-motion behavior, route metadata, and future English readiness are covered.
- **Security**: PASS. No secrets or new public inputs; contact input validation remains in place.
- **Developer readiness**: PASS. Quickstart documents validation commands and manual checks.
