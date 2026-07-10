# Feature Specification: Multi-Page Product Studio Architecture

**Feature Branch**: `005-multipage-product-architecture`

**Created**: 2026-07-10

**Status**: Draft

**Input**: User description: "Transform AISoftware Studio from one long, conventional landing page into a structured, premium, multi-page product studio website."

## Business Context *(mandatory)*

**Primary Business Outcome**: lead generation and clearer service explanation

**Target Visitor**: Polish-speaking founder, owner, operations lead, sales lead, marketing lead, or decision maker comparing AI product options

**Conversion or Trust Signal**: a qualified contact request after route-based exploration of products, demo scope, studio positioning, and contact options

**Localization Scope**: Polish-first public content with route/content structure ready for English later without redesign

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate the studio clearly (Priority: P1)

A first-time visitor can understand the site structure from the header, move through the main routes, and share or reopen any page directly.

**Why this priority**: Route-based navigation is the foundation of the new information architecture and everything else depends on it.

**Independent Test**: Open the site, use the header and mobile navigation to move between pages, refresh a direct URL, and confirm the same page remains available with correct active state and keyboard access.

**Acceptance Scenarios**:

1. **Given** a visitor opens the site, **When** they use the top navigation, **Then** they can reach Produkty, Demo w 7 dni, Studio, Kontakt, and the primary CTA without relying on hover only.
2. **Given** a visitor opens a direct page URL, **When** the page refreshes or browser history is used, **Then** the route stays usable and the active navigation state remains clear.
3. **Given** a keyboard-only visitor opens the menu or product navigation, **When** they tab through controls, **Then** focus styles remain visible and every primary destination is reachable.

---

### User Story 2 - Understand the studio from the homepage (Priority: P1)

A visitor who lands on the homepage immediately understands the offer, sees a compact product overview, and knows the next step.

**Why this priority**: The homepage must sell the studio and route visitors to the right place without repeating the full service catalogue.

**Independent Test**: Scan the homepage and confirm it contains a concise hero, compact product overview, short demo explanation, one featured product visual, a studio teaser, and a final contact CTA.

**Acceptance Scenarios**:

1. **Given** a visitor lands on `/`, **When** they scan the page, **Then** they see the business promise first and can understand it without reading every product in detail.
2. **Given** a visitor wants to explore offerings, **When** they review the compact product overview, **Then** they are guided to the product route rather than a long single-page explanation.
3. **Given** a visitor is ready to contact the studio, **When** they reach the final CTA, **Then** they are routed to the existing contact flow.

---

### User Story 3 - Explore products through routes (Priority: P2)

A visitor can browse the product catalogue on `/produkty`, select a product from a route-backed selector, and open direct product URLs for each offer.

**Why this priority**: Product discoverability is the main upgrade from the old landing page and needs a shared route-driven exploration experience.

**Independent Test**: Open `/produkty`, change the selected product, refresh, navigate with back/forward, and open a shared product URL to confirm the same product remains selected.

**Acceptance Scenarios**:

1. **Given** a visitor opens `/produkty`, **When** they review the selector on desktop, **Then** they see a vertical product rail with one large product panel beside it.
2. **Given** a visitor uses a phone, **When** they open `/produkty`, **Then** the selector remains compact, horizontally usable, and free from clipped labels or page overflow.
3. **Given** a visitor chooses a product, **When** the selected item changes, **Then** the URL updates and the active item exposes an appropriate accessible state.
4. **Given** a visitor opens a direct product URL, **When** the page refreshes, **Then** the correct product view still loads.

---

### User Story 4 - Read each product page as a decision aid (Priority: P2)

A visitor can open a dedicated product page and understand what it does, who it is for, what a seven-day demo might include, what is outside scope, and how to continue the conversation.

**Why this priority**: Individual product pages are the main deep-linking and SEO surfaces for the new architecture.

**Independent Test**: Open any product URL and confirm the page contains the product name, short value proposition, problem solved, suitable customer, example applications, demo scope, out-of-scope notes, a visual representation, and a CTA.

**Acceptance Scenarios**:

1. **Given** a visitor opens a product page, **When** they read the content, **Then** they understand the product without needing the homepage for context.
2. **Given** a visitor compares products, **When** they scan the example applications and demo boundaries, **Then** they can tell which option matches their use case.
3. **Given** a visitor wants to move forward, **When** they click the CTA from the product page, **Then** they can continue to contact without friction.

---

### User Story 5 - Understand the demo and studio pages (Priority: P3)

A visitor can read `/demo-w-7-dni` and `/studio` to understand the seven-day demo boundary, the working model, the process, the engineering approach, and the trust boundary.

**Why this priority**: The old landing page bundled too many explanations together, and these pages now need to carry the long-form trust content.

**Independent Test**: Open the demo and studio pages and verify that each page contains the required subjects without repeating the same scope disclaimers everywhere.

**Acceptance Scenarios**:

1. **Given** a visitor opens `/demo-w-7-dni`, **When** they read it, **Then** they see the seven-day sprint, demo-versus-production boundary, package framing, FAQ, and expected demo result in one place.
2. **Given** a visitor opens `/studio`, **When** they read it, **Then** they see the studio description, principles, process, technologies, engineering approach, trust, and scope boundaries.
3. **Given** a visitor wants a compact answer, **When** they scan either page, **Then** they do not need to cross-check the homepage for the same long-form explanation.

---

### User Story 6 - Contact without losing compatibility (Priority: P3)

A visitor can reach the existing contact form from the route-based site, and product CTAs can pass context cleanly when that is feasible.

**Why this priority**: Contact remains the conversion path, and the new architecture must not break the current submission flow.

**Independent Test**: Open `/kontakt`, submit a valid inquiry, and confirm existing validation, consent, and delivery behavior still work.

**Acceptance Scenarios**:

1. **Given** a visitor opens `/kontakt`, **When** they use the form, **Then** the current API integration still behaves as before.
2. **Given** a visitor arrives from a product CTA, **When** context is passed, **Then** the form can preselect or preserve product context only if it is cleanly supported.
3. **Given** a visitor submits invalid data, **When** validation fails, **Then** the existing accessibility and error handling remain intact.

### Edge Cases

- The visitor opens the site on a narrow mobile viewport and the header, product selector, and page content remain readable without horizontal scrolling.
- The visitor prefers reduced motion and still receives the same information and navigation path.
- The visitor opens a deep link to any product or content page after a refresh and the page loads correctly.
- The visitor uses only a keyboard or screen reader and can operate navigation, selector controls, and CTAs.
- The visitor mistakes a product mockup or visual for a live production system and the copy makes the presentation-only boundary clear.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide the following public routes: `/`, `/produkty`, `/produkty/asystent-wiedzy-rag`, `/produkty/automatyzacja-email`, `/produkty/voice-agent`, `/produkty/whatsapp-ai`, `/produkty/panel-agentow`, `/produkty/strony-seo`, `/demo-w-7-dni`, `/studio`, and `/kontakt`.
- **FR-002**: System MUST keep `/produkty` as a useful product exploration page rather than a dead landing stub; if a default product is shown, it MUST remain part of the route-based selector and not replace the catalog view.
- **FR-003**: System MUST keep the homepage focused on a concise hero, compact product overview, short demo explanation, one featured product or visual, a studio teaser, and a final contact CTA.
- **FR-004**: System MUST present a route-backed product selector that updates the URL, supports browser refresh and history, remains keyboard accessible, and exposes an appropriate active state.
- **FR-005**: System MUST provide one dedicated page for each product direction and each page MUST include product name, value proposition, problem solved, suitable customer or use case, 3-4 example applications, seven-day demo contents, out-of-scope boundaries, a visual representation, and a CTA.
- **FR-006**: System MUST move the long-form demo-versus-production explanation, seven-day sprint details, package framing, and FAQ content to `/demo-w-7-dni` without repeating the same disclaimer across multiple pages.
- **FR-007**: System MUST move the studio description, working principles, process, technologies, engineering approach, trust, and scope boundary content to `/studio`.
- **FR-008**: System MUST preserve the existing contact form behavior on `/kontakt`, including validation, consent behavior, and existing API compatibility.
- **FR-009**: System MUST allow product CTAs to link into the contact route and MAY pass product context only when it can be done without adding a new backend endpoint or breaking the existing payload shape.
- **FR-010**: System MUST replace anchor-only navigation with route-based navigation, including active route states, keyboard support, and accessible mobile navigation.
- **FR-011**: System MUST preserve the existing warm off-white, dark green, orange-accent visual identity while improving hierarchy, spacing, and readability.
- **FR-012**: System MUST keep the site Polish-first, avoid fake clients or fake metrics, and remain structured so English content can be added later without redesign.
- **FR-013**: System MUST keep motion as progressive enhancement only, and reduced-motion users MUST still receive the same content and navigation.
- **FR-014**: System MUST provide SEO-friendly titles, descriptions, and page structure for all public routes.
- **FR-015**: System MUST not introduce a CMS, authentication system, database, or new backend capability solely to support the new routing structure.

### Constitution Constraints *(mandatory)*

- **Complexity Justification**: None. This is a frontend information-architecture and content-structure feature.
- **API Contract Impact**: None expected beyond preserving the existing contact API contract; no new backend endpoint is required.
- **Security Impact**: Public input remains limited to the existing contact form; any passed product context must not leak secrets or create new storage requirements.
- **Deployment Impact**: Frontend pages and navigation remain independently deployable; backend deployment should remain unchanged unless contact compatibility unexpectedly requires it.
- **Accessibility & Performance Impact**: The new site must stay responsive, keyboard accessible, readable with sufficient contrast, usable with reduced motion, and fast enough that the primary offer is understandable quickly.

### Key Entities *(include if feature involves data)*

- **Route Page**: A public page address and its associated SEO metadata, content blocks, and CTA destinations.
- **Product**: One of the six product directions with a dedicated route, short value proposition, applications, demo scope, and CTA path.
- **Navigation Item**: A top-level or product-level destination used in the header and mobile navigation.
- **Contact Context**: Optional product context that can be carried into the contact route without changing the backend contract.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of test visitors can identify the four top-level destinations and the primary CTA after scanning the header once.
- **SC-002**: At least 90% of test visitors can explain the studio offer from the homepage within 10 seconds.
- **SC-003**: At least 90% of test visitors can open a product URL, refresh it, and still understand which product they are viewing.
- **SC-004**: At least 90% of test visitors can describe the difference between the homepage and the dedicated product, demo, and studio pages after a short scan.
- **SC-005**: 100% of public routes listed in FR-001 are directly reachable and present meaningful metadata and headings.
- **SC-006**: 100% of primary navigation links, product selector items, and CTAs are keyboard reachable and show visible focus.
- **SC-007**: The site remains usable on narrow mobile widths without horizontal scrolling in the header, product selector, or main content.
- **SC-008**: Reduced-motion visitors can still access the full message and conversion path without relying on animation.
- **SC-009**: The existing contact form continues to accept valid inquiries through `/kontakt`.
- **SC-010**: Search and link previews can identify the brand, the product studio positioning, and the route-specific page intent from page titles and descriptions.

## Assumptions

- The existing contact flow stays the lead conversion path and does not need a new backend endpoint.
- `/produkty` should present a useful overview and selection surface rather than redirecting away from the catalogue experience.
- Existing product illustrations and presentation visuals can be reused where they fit the new information architecture.
- The new pages remain Polish-first and do not require English localization before release.
- The current deployment model remains frontend plus backend as separate applications.
