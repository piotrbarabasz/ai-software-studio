# Research: Multi-Page Product Studio Architecture

## Decision 1: Route structure should be explicit, not anchor-only

- **Decision**: Use Angular routes for the homepage, products hub, product detail pages, demo page, studio page, and contact page.
- **Rationale**: The feature needs shareable deep links, browser history support, refresh-safe pages, and clear SEO metadata per page.
- **Alternatives considered**: Anchor-only sections, single-page local state, or a redirect-only products route.

## Decision 2: `/produkty` should be a real exploration page

- **Decision**: Show a useful product overview with a default selected product instead of redirecting away.
- **Rationale**: The route needs to act as the catalogue hub and support route-backed selection, keyboard navigation, and mobile exploration.
- **Alternatives considered**: Redirecting to the default product route, which would reduce catalogue discoverability.

## Decision 3: Product CTAs may pass context through the contact route only if it is clean

- **Decision**: Allow optional product context to reach `/kontakt` through route data or query parameters if the contact form can preselect the existing field without backend changes.
- **Rationale**: The current contact form already has business-friendly project options, so preselection can reduce friction without changing the submission contract.
- **Alternatives considered**: Adding a new endpoint or storage layer, which is unnecessary and out of scope.

## Decision 4: Reuse the current product visuals where possible

- **Decision**: Reuse the existing visual components and presentation patterns from the landing page when they still fit the new pages.
- **Rationale**: This keeps the brand recognizable and reduces unnecessary design drift.
- **Alternatives considered**: Rebuilding all visuals from scratch or introducing new libraries.

## Decision 5: Keep the backend unchanged unless contact compatibility truly requires it

- **Decision**: Preserve the existing FastAPI contact contract and backend behavior.
- **Rationale**: The feature is fundamentally a frontend information-architecture change.
- **Alternatives considered**: Adding a backend endpoint for navigation context, which would violate the simplicity boundary.
