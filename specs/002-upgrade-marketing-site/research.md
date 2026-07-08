# Research: Premium Marketing Website Upgrade

## Decision: Keep the upgrade frontend-first with contact compatibility only

**Rationale**: The feature is a marketing and presentation upgrade. The existing FastAPI backend already provides contact intake, validation, rate-limit-ready behavior, and email delivery. New AI service previews can be represented as static frontend content and visuals without backend behavior.

**Alternatives considered**:

- Add demo endpoints for RAG, voice, WhatsApp, or cost tracking: rejected because the spec explicitly excludes real runtime integrations.
- Add CMS or database-backed content: rejected because static typed content is enough for a productized landing page and avoids constitution complexity.

## Decision: Split content into typed feature content models

**Rationale**: `frontend/src/app/core/content/pl.ts` currently combines SEO, navigation, services, process, technologies, examples, about, contact copy, and select options in one large file. The upgrade adds productized offers, showcases, packages, FAQ, visual labels, and sprint steps, so typed content interfaces and smaller content files will keep repeated business content out of hardcoded HTML.

**Alternatives considered**:

- Keep all copy in one file: rejected because the file will become difficult to review and test.
- Hardcode section copy in component templates: rejected because it weakens future localization and repeats business content.

## Decision: Use standalone Angular section and visual components selectively

**Rationale**: The current landing component is already a monolithic page. The upgrade has many distinct sections and five product visuals. Standalone section components align with the existing Angular standalone style while keeping each section independently testable.

**Alternatives considered**:

- One large template: rejected for maintainability once product visuals and FAQ are added.
- Over-splitting every small text band: rejected because static simple sections can stay in the page shell if they remain readable.

## Decision: Use CSS/SVG/HTML visuals, not heavy visual dependencies

**Rationale**: The desired visuals are product storytelling previews: RAG workflow, waveform, WhatsApp control conversation, email pipeline, and agent panel. These can be built with semantic HTML, inline SVG, CSS grid, and simple animations. The spec prefers lightweight Angular-friendly animation and forbids real integrations.

**Alternatives considered**:

- Three.js/WebGL/canvas: rejected because 3D/rendering is unnecessary and would increase validation and performance risk.
- Lottie/GSAP: rejected because static CSS/SVG animation covers the required storytelling without extra dependencies.

## Decision: Implement scroll reveal with IntersectionObserver and CSS classes

**Rationale**: IntersectionObserver is available in modern browsers, small, and fits progressive reveal. A directive can mark sections as visible when they enter the viewport while allowing CSS to disable transitions for reduced motion.

**Alternatives considered**:

- Angular animation package: not needed for simple reveal effects.
- Scroll event listeners: rejected because they are more error-prone and easier to make expensive.
- No animation: acceptable fallback, but the visual direction asks for polished reveal and transitions.

## Decision: Use native HTML where it improves accessibility

**Rationale**: Native anchors, buttons, lists, landmarks, and `details/summary` for FAQ reduce JavaScript and preserve keyboard behavior. Visual previews should carry accessible labels/descriptions and avoid fake active inputs unless clearly disabled or presentation-only.

**Alternatives considered**:

- Custom FAQ disclosure widgets everywhere: rejected unless design needs exceed native behavior.
- Clickable mock controls without function: rejected because they can confuse users and assistive technology.

## Decision: Update contact project type enums only if new form options are sent

**Rationale**: The existing contact payload is stable and should remain stable. However, if the visible project type select includes productized service values, the frontend union type, backend Pydantic enum, OpenAPI contract, and tests must accept those values.

**Alternatives considered**:

- Map new labels to existing broad enum values: acceptable if implementation wants zero backend changes, but it loses lead qualification detail.
- Add a new contact endpoint or field: rejected because compatibility and scope favor the existing flow.
