# Quickstart: Service Model UX Repositioning

This guide validates the planned feature after implementation. It does not require new backend infrastructure.

## Prerequisites

- Node and npm compatible with the existing Angular 17 frontend.
- Existing repository dependencies installed.
- Chrome/Chromium available for headless Angular tests.

## Automated Validation

From the repository root:

```powershell
cd frontend
npm run lint
npm test -- --watch=false
npm run build
```

Expected result:

- lint passes
- tests pass in headless browser
- production build passes existing bundle and component style budgets

If a later task changes the backend contract despite the default plan:

```powershell
cd backend
python -m pytest
python -m ruff check .
```

Expected result:

- backend tests pass
- contact OpenAPI/schema behavior remains explicit

## Manual Route Validation

Start the frontend locally:

```powershell
cd frontend
npm start
```

Open the local dev URL and validate these routes:

- `/`
- `/produkty`
- `/produkty/asystent-wiedzy-rag`
- `/produkty/strony-seo`
- `/produkty/voice-agent`
- `/produkty/whatsapp-ai`
- `/produkty/automatyzacja-email`
- `/produkty/panel-agentow`
- `/demo-w-7-dni`
- `/studio`
- `/kontakt`

Expected result:

- each route loads after direct entry and refresh
- no `/lab` route exists
- each page has one visible H1
- titles/descriptions/canonical metadata reflect the current route
- browser back/forward works on product routes and navigation links

## Homepage Validation

On `/`, confirm:

- first view communicates both quick validation and full development
- hero has no more than two primary paths
- Validate path explains demo/PoC and seven-day boundary
- Build path explains full development without seven-day limit
- homepage shows only a short solution category overview
- journey appears as Idea -> Demo/PoC -> MVP -> Production -> Further development
- Studio trust teaser links to `/studio`
- R&D teaser is short and does not claim client deployments or results
- final CTA supports quick validation and full development

## Products Validation

On `/produkty` and direct product routes, confirm:

- products are grouped by business problem
- existing slugs still open directly
- product selector/category controls are keyboard reachable
- active selection follows the route
- browser back/forward updates selected product
- each product shows problem, audience, value, examples, demo scope, demo limits, production scope, development path, and CTA
- websites/SEO are framed as support for validation, sales, or market entry

## Demo Page Validation

On `/demo-w-7-dni`, confirm:

- demo and PoC are explained
- seven-day scope is bounded to a limited agreed scenario
- page states what is excluded
- page distinguishes demo, PoC, MVP, and production
- required client input, sprint result, next-stage decision, and transition to full development are clear

## Studio Page Validation

On `/studio`, confirm:

- page identifies who stands behind the studio and why it exists
- cooperation model and project process are clear
- prototype and production are transparently separated
- quality, testing, documentation, security, provider choice, and AI cost control are addressed
- R&D areas and transfer into client projects are explained without fictional proof

## Contact Context Validation

Follow CTAs from:

- homepage Validate path
- homepage Build path
- product detail page
- demo page
- Studio page

Expected result:

- `/kontakt` opens
- relevant contact intent is selected when represented by an allowed `projectType`
- invalid query string such as `/kontakt?projectType=unknown` returns to the default unselected state
- submitted payload shape remains unchanged

## Accessibility and Responsive Validation

Check at:

- 320-360 px
- 390-430 px
- tablet width
- laptop width
- wide desktop

Expected result:

- no horizontal scroll
- no clipped buttons or overlapping text
- main CTAs remain readable and reachable
- product/category selector remains touch-friendly
- focus order is logical
- visible focus is present
- mobile menu opens and closes by keyboard and Escape
- reduced-motion mode leaves all content visible and understandable

## Content Integrity Validation

Review public copy for:

- no fictional clients
- no fictional deployments
- no fictional testimonials
- no unverified metrics
- no unauthorized logos
- no R&D experiments presented as customer results
- no implication that a complete production MVP always takes seven days
