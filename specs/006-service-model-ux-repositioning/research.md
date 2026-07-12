# Research: Service Model UX Repositioning

## Decision: Evolve the existing Angular route-backed architecture

**Rationale**: The current site already has Angular Router, route metadata, direct product URLs, shell metadata updates, and separate pages for home, products, demo, Studio, and contact. The feature goal is communication and hierarchy, not multipage architecture.

**Alternatives considered**:

- Rebuild routing or page architecture: rejected because feature 005 already provides the needed foundation and direct URLs must remain stable.
- Create a new `/lab` route: rejected by the spec; R&D belongs on Studio and as a homepage teaser.

## Decision: Extend typed content models instead of adding CMS or page-local literals

**Rationale**: `site-content.types.ts` and `site.pl.ts` already centralize route, page, product, and contact content. Extending these types keeps Polish-first content testable, makes later English content possible, and avoids hard-coded reusable strings in components.

**Alternatives considered**:

- CMS: rejected by scope and constitution.
- Large literals inside component classes/templates: rejected because they make content completeness and route consistency harder to test.

## Decision: Model Validate and Build as the two commercial collaboration tracks

**Rationale**: The spec requires quick validation and full development to be equally visible while avoiding the impression that R&D is a third sales package. A dedicated `CollaborationModel` type can enforce two tracks and require scope, limitations, result, timing, CTA, and contact intent.

**Alternatives considered**:

- Keep generic homepage cards: rejected because identical cards weaken the strategic distinction.
- Put R&D beside Validate and Build as an equal package: rejected because it misrepresents R&D.

## Decision: Model R&D as bounded credibility content

**Rationale**: R&D needs to show competence, technical depth, and innovation without implying finished client deployments or guaranteed outcomes. A typed `ResearchDirection` can include problem, goal/hypothesis, potential business use, optional status, and claim boundary.

**Alternatives considered**:

- Hide R&D from homepage: rejected because the spec allows a teaser and wants R&D to increase credibility.
- Present R&D as case studies: rejected unless verified evidence exists.

## Decision: Group products by business problem while preserving product slugs

**Rationale**: `productRoutePaths` is already the stable URL map. Categories can be introduced as metadata without changing product IDs or routes. This supports visitor discovery by problem and protects direct links.

**Alternatives considered**:

- Replace product pages with category-only pages: rejected because existing direct product addresses must remain openable.
- Mix channels, technologies, stages, and services in one selector: rejected because that is the hierarchy problem the feature addresses.

## Decision: Preserve the backend contact contract and use allowlisted query-param mapping

**Rationale**: The current contact form reads `projectType` from the URL and validates it against `projectTypeOptions` before setting the form control. This is the correct security pattern for preserving context without trusting URL input or changing payload shape.

**Alternatives considered**:

- Add `sourceProduct`, `sourceRoute`, or free-text context to the backend payload: rejected because the feature is out of scope for backend contract changes.
- Trust arbitrary query params: rejected for security and data quality reasons.

## Decision: Reuse shell metadata behavior and update route content

**Rationale**: `SiteShellComponent` already manages title, description, Open Graph fields, and canonical link from route data. Repositioning only needs content updates and coverage tests, not new SEO infrastructure.

**Alternatives considered**:

- Per-component metadata updates: rejected because it duplicates responsibility and risks drift.

## Decision: Use existing design tokens and reduce repeated card patterns

**Rationale**: `styles.scss` already defines warm light background, dark green, orange accent, focus styling, section shell, and reduced-motion behavior. The plan should preserve the visual system while improving hierarchy through composition, spacing, backgrounds, and typography.

**Alternatives considered**:

- New UI library: rejected by scope.
- Broad visual redesign with new tokens: rejected because the feature is strategic repositioning, not a new design system.

## Decision: Extend behavior-focused tests

**Rationale**: Existing tests already validate content model, routes, homepage, products, contact form, shell, demo, Studio, and API payload shape. Extending those tests gives targeted regression protection without testing private methods or incidental DOM structure.

**Alternatives considered**:

- Snapshot-style broad DOM assertions: rejected because they are brittle and not aligned with Spec Kit acceptance criteria.
- Manual-only validation: rejected because routing, content model, and contact context are regression-prone.
