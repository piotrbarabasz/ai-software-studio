# Quickstart: Premium Marketing Website Upgrade

This guide defines how to validate the premium AI products landing page upgrade after implementation tasks are completed.

## Prerequisites

- Existing project dependencies installed for `frontend/`
- Existing backend environment available if contact contract changes are made
- Browser with mobile viewport emulation and reduced-motion setting available

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

Expected local site: `http://localhost:4200`

## Backend Setup

Backend setup is required only for contact end-to-end validation or if productized contact project type values are added to the backend enum.

```bash
cd backend
pytest
```

Run the existing FastAPI development server according to `backend/README.md` when validating real contact submissions locally.

## Validation Scenarios

### Page Structure

- Confirm the page upgrades the existing AISoftware Studio landing page rather than launching a separate app.
- Confirm the required sections are present: premium hero, "Demo AI w 7 dni", productized AI offers, RAG chatbot showcase, voice agents showcase, WhatsApp agent management showcase, email automation showcase, Websites + SEO, agent management panel preview, 7-day demo sprint process, technology/trust, pricing or starting packages, FAQ, and contact CTA using the existing contact flow.

### 30-Second Comprehension

- Open the first screen on desktop and mobile.
- Confirm a visitor can identify that AISoftware Studio offers practical AI demos for companies, the sprint is framed as 7 days, the 7 days start after scope confirmation and required client materials, and contact is the primary next step.

### Productized Offers

- Confirm all six product categories are visible and understandable: RAG chatbot with external knowledge source and cost monitoring, Websites + SEO, Voice agents, WhatsApp-based agent management, Email automation, and Management panel for chatbots and voice agents.
- Confirm each offer includes a business outcome, use case, demo artifact, and CTA or contact prompt.

### Presentation-Only Visuals

- Confirm the RAG workflow visual shows knowledge sources and cost monitoring as a mock/demo concept.
- Confirm the voice waveform visual does not imply a live voice backend.
- Confirm the WhatsApp conversation/control visual does not imply live WhatsApp API integration.
- Confirm the email pipeline visual is a conceptual automation preview.
- Confirm the agent management panel preview is clearly frontend/presentation only and not a real admin backend.

### Contact Flow

- Confirm CTAs from hero, offers, showcases, process, pricing, FAQ, and final CTA reach the contact flow.
- Confirm the contact form still submits the existing payload shape.
- If new project type values are implemented, submit one productized value and confirm backend acceptance.
- Confirm invalid form input still shows clear Polish validation feedback.

### Accessibility

- Navigate the full page with keyboard only.
- Confirm skip link, navigation, CTA links, FAQ controls, and contact fields are reachable with visible focus states.
- Confirm heading order is logical and sections use semantic landmarks/labels.
- Confirm visual previews have accessible names/descriptions.
- Confirm color contrast remains suitable for WCAG 2.2 AA target.

### Reduced Motion

- Enable reduced motion in the browser or operating system.
- Reload the page.
- Confirm section content is visible without motion-dependent reveal.
- Confirm waveform/pipeline/pulse effects are disabled or minimized.

### Responsive Layout

- Check common widths around 390px, 768px, 1024px, and 1440px.
- Confirm there is no horizontal scrolling.
- Confirm hero text, cards, package copy, FAQ, and contact form text do not overlap or overflow controls.

### Premium Design Acceptance

- Confirm typography scale is consistent across desktop, tablet, and mobile.
- Confirm contrast is readable in all premium sections.
- Confirm hover states are visible but not distracting.
- Confirm animated sections do not overlap content.
- Confirm section transitions are consistent across the page.
- Confirm mobile screenshots or manual viewport checks are completed.
- Confirm reduced-motion mode still presents all content clearly.

### SEO

- Confirm the page title and description describe practical AI demos, productized AI services, and AISoftware Studio.
- Confirm Open Graph title/description are updated.
- Confirm primary content is crawlable and not hidden behind required interaction.

### Lighthouse Validation

- Run Lighthouse or an equivalent local validation against the production build and confirm desktop Performance score >= 90.
- Run Lighthouse or an equivalent local validation against the production build and confirm desktop Accessibility score >= 90.
- If Lighthouse cannot be run automatically in the current environment, document the limitation in the implementation notes and run these manual local commands:

```bash
cd frontend
npm run build
npm run start
npx lighthouse http://127.0.0.1:4200 --preset=desktop --only-categories=performance,accessibility
```

Expected result: desktop Performance >= 90 and desktop Accessibility >= 90.

## Test Commands

Frontend:

```bash
cd frontend
npm run lint
npm run format:check
npm test
npm run build
```

Backend, if contact enum/contract changes are made:

```bash
cd backend
ruff check .
ruff format --check .
pytest
```

## Expected Outcome

- The upgraded landing page communicates the 7-day AI demo offer and six productized services within 30 seconds.
- Mock product visuals are polished, accessible, lightweight, and clearly presentation-only.
- Existing contact flow remains compatible and tested.
- No heavy animation dependency or excluded backend capability is introduced.

## Phase 8 Validation Notes - 2026-07-08

Automated checks completed:

- `npm run lint` from `frontend/`
- `npm run format:check` from `frontend/`
- `npm test` from `frontend/`
- `npm run build` from `frontend/`
- `backend/.venv/Scripts/python.exe -m pytest` from `backend/`
- `backend/.venv/Scripts/python.exe -m ruff check .` from `backend/`
- `backend/.venv/Scripts/python.exe -m ruff format --check .` from `backend/`

Responsive viewport validation completed with headless Chrome screenshots:

- `tmp/screenshots/phase8-390-fixed4.png`
- `tmp/screenshots/phase8-768-final.png`
- `tmp/screenshots/phase8-1024-final2.png`
- `tmp/screenshots/phase8-1440-final2.png`

Manual/static validation results:

- Required landing sections are present in the Angular landing composition or standalone section components.
- Keyboard-relevant structures are present: skip link, semantic navigation anchors, CTA links, FAQ `button` controls with `aria-expanded`, and existing contact form fields.
- Reduced-motion support is present through `prefers-reduced-motion` CSS and `RevealOnScrollDirective` fallback tests.
- Contact compatibility is covered by frontend payload tests, backend enum acceptance/rejection tests, frontend/backend drift validation, and generated OpenAPI enum validation.
- No GSAP, Three.js, Lottie, WebGL, CMS, auth, database, billing, CRM, admin backend, payment, WhatsApp SDK, voice SDK, or production AI/RAG runtime dependency was added.

Premium design acceptance checklist:

- [x] Typography scale is consistent across desktop, tablet, and mobile in the validated first-screen and demo sections.
- [x] Contrast is readable in premium sections after the hero diagonal/proof-card contrast fix.
- [x] Hover states are visible but not required for reading or interaction.
- [x] Animated reveal sections do not overlap content after waiting for Angular and IntersectionObserver to settle.
- [x] Section transitions are consistent across the validated page flow.
- [x] Mobile and desktop viewport screenshots/manual checks are completed at 390px, 768px, 1024px, and 1440px.
- [x] Reduced-motion mode still presents all content clearly through CSS fallback and directive behavior.

Lighthouse validation limitation:

Lighthouse is not installed in the local frontend dependencies and `npx --no-install lighthouse --version` failed because no cached Lighthouse package is available in this restricted environment. No Lighthouse scores were produced in this run.

Run these exact commands locally to complete desktop Performance and Accessibility validation:

```bash
cd frontend
npm run build
npm run start
npx lighthouse http://127.0.0.1:4200 --preset=desktop --only-categories=performance,accessibility
```

Required result remains: desktop Performance >= 90 and desktop Accessibility >= 90.
