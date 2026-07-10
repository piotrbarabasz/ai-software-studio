# Tasks: Multi-Page Product Studio Architecture

**Input**: Design documents from `/specs/005-multipage-product-architecture/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: Include frontend tests for route behavior, content completeness, navigation, accessibility, SEO metadata, responsive behavior, reduced-motion fallback, and contact compatibility.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently while keeping the existing site functional after each phase.

## Phase 1: Setup (Shared Content Foundation)

**Purpose**: Prepare the typed content layer and shared route/page data before changing the shell or pages.

- [X] T001 [P] Create the shared site content model and route/page data in `frontend/src/app/core/content/site-content.types.ts`, `frontend/src/app/core/content/site.pl.ts`, `frontend/src/app/core/content/pl.ts`, and `frontend/src/app/core/content/contact-options.pl.ts`. Acceptance: the content layer exposes route metadata, navigation items, product catalog fields, homepage content, demo/studio content, and contact context without leftover landing-page-only structures.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Route-based shell, navigation, and metadata infrastructure that must exist before page work begins.

**CRITICAL**: No user story work should start until this phase is complete.

- [ ] T002 [P] Replace anchor-only navigation with a route-based app shell in `frontend/src/app/app.routes.ts`, `frontend/src/app/app.component.ts`, and new shared shell files under `frontend/src/app/features/shell/` or `frontend/src/app/layout/`, including active-route state, mobile navigation, and route titles/canonical handling. Acceptance: the site uses Angular routes for top-level navigation, direct URLs work after refresh, and keyboard access remains visible and usable.

**Checkpoint**: Route shell ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Navigate the studio clearly and land on a concise homepage (Priority: P1)

**Goal**: A first-time visitor can understand the site structure from the header and get a short, premium homepage that points to the next step.

**Independent Test**: Open the site, use the header and mobile navigation to move between pages, and scan the homepage to confirm it is concise, route-aware, and conversion-oriented.

- [ ] T003 [US1] Rebuild the homepage in `frontend/src/app/features/home/` or the current landing-page feature files under `frontend/src/app/features/landing/` so it contains the concise hero, compact product overview, short demo explanation, one featured product or visual, a studio teaser, and the final contact CTA. Acceptance: the homepage is materially shorter than the old single-page layout and clearly routes visitors to products, demo, studio, or contact.

**Checkpoint**: User Story 1 should be independently testable and the site should still route correctly.

---

## Phase 4: User Story 2 - Explore products through routes (Priority: P2)

**Goal**: A visitor can use `/produkty` as a premium product exploration hub and open each product via a direct route.

**Independent Test**: Open `/produkty`, change the selected product, refresh, navigate with back/forward, and open a shared product URL to confirm the same product remains selected.

- [ ] T004 [US2] Build the route-backed product hub and six product detail pages in `frontend/src/app/features/products/`, reusing existing visual components from `frontend/src/app/features/landing/visuals/` where appropriate. Acceptance: the desktop view shows a vertical selector with one large panel, the mobile view stays compact without clipped labels or page overflow, and each product route exposes the required product details and CTA.

**Checkpoint**: User Story 2 should be independently testable and all product URLs should be shareable.

---

## Phase 5: User Story 3 - Read the demo and studio pages (Priority: P3)

**Goal**: A visitor can read `/demo-w-7-dni` and `/studio` to understand the seven-day demo boundary, the working model, the process, and the studio’s engineering approach.

**Independent Test**: Open the demo and studio pages and verify that each page contains its required long-form subjects without repeating the same scope disclaimers across the whole site.

- [ ] T005 [US3] Create or adapt the `/demo-w-7-dni` and `/studio` pages in `frontend/src/app/features/demo/` and `frontend/src/app/features/studio/`, moving the long-form demo-versus-production explanation, seven-day sprint, package framing, FAQ, studio description, working principles, process, technologies, engineering approach, trust, and scope boundaries into their dedicated routes. Acceptance: the long-form explanation is consolidated on the dedicated pages instead of being repeated on the homepage.

**Checkpoint**: User Story 3 should be independently testable and the homepage should no longer carry the long-form explanation burden.

---

## Phase 6: User Story 4 - Contact without losing compatibility (Priority: P3)

**Goal**: A visitor can continue to contact the studio through the existing form on `/kontakt`, and product CTAs can pass context only if it stays clean and compatible.

**Independent Test**: Open `/kontakt`, submit a valid inquiry, and confirm the existing validation, consent, and delivery behavior still works.

- [ ] T006 [US4] Preserve the existing contact form behavior in `frontend/src/app/features/contact/contact-form.component.ts`, `frontend/src/app/features/contact/contact-form.component.html`, `frontend/src/app/features/contact/contact-form.component.spec.ts`, and any route/query handling needed to accept optional product context from product CTAs without changing the backend contract. Acceptance: the contact page still submits through the current API flow and the optional product context does not require a new backend endpoint.

**Checkpoint**: User Story 4 should be independently testable and the existing contact flow should remain intact.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, SEO, responsive tuning, test coverage, and release validation across the new multi-page site.

- [ ] T007 [P] Add or update tests for route navigation, product selector behavior, direct-link refresh, metadata, accessibility, reduced motion, and contact compatibility in `frontend/src/app/**/*.spec.ts`, and update `specs/005-multipage-product-architecture/quickstart.md` with the final validation notes. Acceptance: tests cover the main route journeys and fail if navigation, metadata, accessibility, or contact behavior regresses.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks all user stories.
- **User Story 1**: Depends on Phase 2.
- **User Story 2**: Depends on Phase 2.
- **User Story 3**: Depends on Phase 2.
- **User Story 4**: Depends on Phase 2.
- **Polish**: Depends on the user stories selected for release.

### User Story Dependencies

- **US1**: No dependency on other user stories after the shell exists.
- **US2**: Uses the shared content model and shell but should be independently testable.
- **US3**: Uses the shared content model and shell but should be independently testable.
- **US4**: Uses the shared contact flow but should remain independently testable.

### Parallel Opportunities

- `T001` and `T002` can be split across different files and worked on in parallel once the feature direction is set.
- `T007` can run after implementation work is complete and does not change the user-facing architecture.

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate the concise homepage and route shell.
5. Continue with product exploration and long-form pages.

### Incremental Delivery

1. Shell and content model.
2. Homepage and navigation.
3. Products hub and detail routes.
4. Demo and studio pages.
5. Contact compatibility and final validation.

## Notes

- Keep all work in the frontend unless the contact contract unexpectedly needs a very small compatibility adjustment.
- Do not mark unrelated tasks complete together.
- Keep the route-based product selector backed by Angular routes, not local-only component state.
