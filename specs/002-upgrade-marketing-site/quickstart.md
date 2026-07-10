# Quickstart: Demo AI w 7 dni Landing Page Upgrade

This guide defines how to validate the upgraded landing page after implementation.

## Prerequisites

- Existing project dependencies installed for `frontend/`
- Browser with mobile viewport emulation available
- Reduced-motion setting available in the browser or operating system

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

Expected local site: `http://localhost:4200`

## Backend Setup

Backend setup is not expected for this feature because the current contact contract already supports the required project types. Only run backend checks if implementation work unexpectedly touches contact compatibility files.

## Validation Scenarios

### Page Structure

- Confirm the page upgrades the existing AISoftware Studio landing page rather than creating a separate app.
- Confirm the required sections are present: hero, simplified navigation, main offers, one demo-vs-production explanation, one concrete demo example, pricing/package value copy, a shorter FAQ, and a clear contact CTA.

### 10-Second Comprehension

- Open the first screen on desktop and mobile.
- Confirm a visitor can tell that AISoftware Studio offers a clickable AI demo in 7 days before full production investment.

### Offer Grouping

- Confirm the three main offer families are visible and understandable: RAG chatbot/asystent wiedzy, communication automation, and AI demo/landing/panel for validation.
- Confirm the copy does not feel like a generic list of unrelated services.

### Demo vs Production Boundary

- Confirm one consolidated section explains what belongs to the demo phase and what belongs to the production phase.
- Confirm repeated negative disclaimers are not scattered throughout the page.

### Example and Packages

- Confirm there is one concrete 7-day demo example.
- Confirm package or pricing copy explains value and risk reduction rather than sounding like a throwaway mockup.

### Contact Flow

- Confirm CTAs from the hero and later sections reach the existing contact flow.
- Confirm contact labels are understandable without technical knowledge.
- Confirm the contact form still submits the existing payload shape.

### Accessibility

- Navigate the full page with keyboard only.
- Confirm navigation, CTAs, FAQ controls, and contact fields are reachable with visible focus states.
- Confirm visual previews have accessible names or labels.
- Confirm the heading order is logical and the page uses semantic landmarks.

### Reduced Motion

- Enable reduced motion in the browser or operating system.
- Reload the page.
- Confirm the content is visible without motion-dependent comprehension.

### Responsive Layout

- Check common widths around 390px, 768px, 1024px, and 1440px.
- Confirm there is no horizontal scrolling.
- Confirm hero text, cards, package copy, FAQ, and contact form text do not overlap or overflow.

### Manual Browser Walkthrough

- Perform one full walkthrough on desktop, one on tablet, and one on mobile.
- Confirm the page still makes the offer obvious in the first screen, the CTAs are visible, and the supporting sections read cleanly.

### Keyboard and Reduced Motion Walkthrough

- Navigate the page using keyboard only.
- Confirm visible focus states, CTA reachability, and FAQ disclosure behavior.
- Enable reduced motion and confirm the page remains fully understandable without animation-dependent content.
- Confirm a cold visitor can understand the offer within 10 seconds on the first screen.

### QA Notes

- Record the manual walkthrough result in this file or in the project QA notes if a separate convention is used.

### SEO

- Confirm the page title and description describe the new AI demo positioning.
- Confirm primary content is crawlable and not hidden behind interaction.

## Test Commands

Frontend:

```bash
cd frontend
npm run lint
npm run format:check
npm test
npm run build
```

Backend, only if contact compatibility files change:

```bash
cd backend
ruff check .
ruff format --check .
pytest
```

## Release Readiness / QA Outcome

### Automated Validation

- `frontend`: `npm run lint` - passed
- `frontend`: `npm test` - passed
- `frontend`: `npm run build` - passed

### Manual Verification Status

- Desktop layout: manual verification required before merge
- Tablet layout: manual verification required before merge
- Mobile layout: manual verification required before merge
- Keyboard navigation: manual verification required before merge
- Reduced-motion behavior: manual verification required before merge
- CTA visibility: manual verification required before merge
- 10-second comprehension check: manual verification required before merge

### QA Notes

- Manual browser walkthrough was not executed in this environment.
- The branch still needs a real desktop/tablet/mobile review before merge.
- Backend checks were not required because contact enums and payload shape stayed compatible.

## Expected Outcome

- The upgraded landing page communicates the 7-day AI demo offer and the three business offer groups quickly.
- Mock visuals remain lightweight and clearly presentation-only.
- Existing contact flow remains compatible.
- No unnecessary backend capability is added.
