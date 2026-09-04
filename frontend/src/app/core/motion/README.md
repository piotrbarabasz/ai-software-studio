# Motion architecture

Motion is progressive enhancement. Pages and workflow diagrams must remain complete and readable
before the animation runtime loads, when JavaScript is unavailable, and when a visitor requests
reduced motion.

- `MotionPreferencesService` is the single source for reduced-motion and viewport preferences. The
  shared responsive boundary treats widths through `920px` as mobile and widths from `921px` as
  desktop.
- `MotionRuntimeService` is the browser-only boundary for GSAP. It loads GSAP and ScrollTrigger
  dynamically, registers ScrollTrigger once, caches initialization, and resolves to `null` if motion
  is unavailable. Application roots and the server render path must not import GSAP eagerly.
- Angular owns UI and business state. GSAP only presents state that Angular has already selected.
- Each animated section owns its timeline. Scope selectors and teardown with `gsap.context()` (or an
  equivalent local cleanup) so navigation and component destruction leave no listeners, triggers,
  or animations behind.
- Do not run permanent animation outside the viewport. Use section-local visibility or
  ScrollTrigger lifecycle controls, and keep the final static state meaningful.
- Reduced-motion mode removes continuous animation and spatial transitions. Never make motion the
  only way to understand status, order, or relationships.
