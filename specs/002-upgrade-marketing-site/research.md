# Research: Demo AI w 7 dni Landing Page Upgrade

## Decision: Keep the implementation frontend-first and preserve the backend

**Rationale**: The spec centers on landing-page positioning, business copy, navigation, and presentation-only visuals. The current FastAPI contact backend already supports the needed project types, so the safest and fastest path is to keep backend behavior unchanged unless a future copy decision creates a real contract mismatch.

**Alternatives considered**:

- Add new backend endpoints for demo visuals or AI previews: rejected because the feature is explicitly presentation-only.
- Expand backend storage or CMS support: rejected because the landing page content can remain centralized in typed frontend content files.

## Decision: Reuse the existing landing-page section architecture

**Rationale**: The repository already breaks the page into hero, demo promise, offer, showcase, pricing, FAQ, and contact sections. Reusing those sections minimizes risk and keeps the work easy to test, while still allowing the navigation and copy structure to be simplified.

**Alternatives considered**:

- Rewrite the page as one large template: rejected because it would make the new copy harder to maintain.
- Create many new sections for every small text band: rejected because it would add unnecessary complexity.

## Decision: Centralize the new copy in `frontend/src/app/core/content/`

**Rationale**: The feature is mostly content and narrative work. A typed content model keeps the copy testable, makes Polish language changes easier to review, and avoids spreading business text across templates.

**Alternatives considered**:

- Hardcode copy directly in templates: rejected because it reduces maintainability and makes copy review harder.
- Move content to a CMS: rejected because the spec does not justify persistent infrastructure.

## Decision: Keep visuals lightweight and presentation-only

**Rationale**: The new positioning needs polished product storytelling, but the page must not imply real integrations or production systems. Static HTML, CSS, SVG, and simple component markup are enough to show the idea without adding runtime-heavy dependencies.

**Alternatives considered**:

- Add animation or chart libraries: rejected because they are unnecessary for the required storytelling.
- Build real demo integrations: rejected because the spec explicitly forbids fake production capabilities.

## Decision: Use existing contact enums and avoid backend edits unless necessary

**Rationale**: The current contact form types already include the productized project types named in the new offer. That means contact-copy updates can stay frontend-only, and the FastAPI backend can remain untouched.

**Alternatives considered**:

- Introduce a new contact schema for the marketing page: rejected because it would duplicate a working flow.
- Rename contact values on both frontend and backend: only needed if the project later chooses to change the current enum values.

## Decision: Validate with targeted Angular tests plus the existing build/test scripts

**Rationale**: This feature changes content, navigation, and accessibility behavior more than raw business logic. Angular unit and component tests are the right tool for verifying section presence, anchor count, reduced-motion handling, and SEO metadata, while the standard build/test scripts confirm the page still ships cleanly.

**Alternatives considered**:

- Rely only on manual QA: rejected because the content and accessibility requirements are too important for that.
- Add end-to-end browser automation immediately: not required for the current scope because the existing component tests already cover the critical landing-page behavior.