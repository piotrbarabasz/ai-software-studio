# Local Development

## Scope Boundaries

The MVP is a single Polish landing page plus a FastAPI contact backend. It does not include a database, authentication, CMS, admin panel, payment flow, blog, queue, Cloud Build, Terraform, or production Google Cloud resources.

## Two-Terminal Workflow

Terminal 1:

```bash
cd backend
py -3.12 -m pip install -e ".[dev]"
$env:APP_ENV = "development"
$env:CORS_ALLOWED_ORIGINS = "http://localhost:4200"
$env:CONTACT_RECIPIENT_EMAIL = "owner@example.com"
$env:CONTACT_FROM_EMAIL = "noreply@example.com"
$env:SMTP_HOST = "smtp.example.com"
$env:SMTP_USERNAME = "example-user"
$env:SMTP_PASSWORD = "example-password"
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Terminal 2:

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:4200`.

## CORS

Development allows `http://localhost:4200` by default. Production deployments must set `CORS_ALLOWED_ORIGINS` to the exact approved frontend origins.

## API Contract

The planning contract is `specs/001-marketing-site-mvp/contracts/openapi.yaml`. FastAPI also exposes live OpenAPI documentation when the backend runs locally.

## Validation Results

Backend checks run on 2026-07-04:

```bash
cd backend
.\scripts\lint.ps1
.\scripts\format.ps1 -Check
.\scripts\test.ps1
```

Result: Ruff lint passed, Ruff format check passed, and pytest passed with 18 tests.

Frontend checks run on 2026-07-04:

```bash
cd frontend
npm run format
npm run lint
npm test
npm run build
```

Result: Prettier completed, ESLint passed, Angular tests passed with 17 specs, and the production build completed.

## Accessibility Review

The MVP is implemented toward WCAG 2.2 AA for the defined scope:

- Semantic landmarks are present: header, navigation, main content, sections, and footer.
- The page has a skip link targeting `#main-content`.
- The heading structure has one `h1` and section-level `h2` headings.
- Navigation links and CTAs are keyboard reachable.
- Global `:focus-visible` styles provide visible focus states.
- Contact fields have explicit labels.
- Validation messages are associated with controls through `aria-describedby`.
- Error and success form messages use alert/status roles.
- Form controls and primary UI colors were selected for strong contrast against their backgrounds.

## Security And Privacy Review

- No secrets are committed.
- Runtime configuration is environment-based.
- CORS defaults to `http://localhost:4200` for development and must be restricted to exact production origins later.
- Contact input is validated on the backend with Pydantic.
- The company field is optional; all other contact fields and consent are required.
- Contact delivery uses email notification and no database persistence.
- Contact validation, accepted, rate-limited, delivery-failed, and health-check events are logged only as non-sensitive operational outcomes.
- Logs must not include request bodies, secrets, user data, email addresses, full contact payloads, environment variables, or full message content.
- The contact intake service includes an in-memory rate-limit-ready boundary for MVP abuse protection and future replacement.

## API Contract Alignment Review

Implemented endpoints:

- `GET /health` returns `{ "status": "ok", "service": "marketing-api" }`.
- `POST /api/contact` accepts the fields from `ContactInquiryRequest`.
- Successful contact delivery returns `202` with `{ "status": "accepted", "message": "..." }`.
- Backend validation returns `422` with sanitized validation details.
- Rate-limit rejection returns `429` with a non-sensitive `code` and `message`.
- Email delivery failure returns `503` with a non-sensitive `code` and `message`.

This matches `specs/001-marketing-site-mvp/contracts/openapi.yaml`. `GET /health` is reachability-only and does not verify SMTP readiness.

## Lighthouse And Bundle Review

Lighthouse CLI is not bundled as a project dependency to avoid unnecessary initial dependency weight. Before release, run a desktop Lighthouse check against a production build served locally and require:

- Performance >= 90 on desktop
- Accessibility >= 90 on desktop

Suggested command:

```bash
npm run build
npx http-server dist/aisoftware-studio/browser -p 4200
npx lighthouse http://127.0.0.1:4200 --preset=desktop --only-categories=performance,accessibility
```

Current production build review from `npm run build`:

- Initial raw JS/CSS total: 319.71 kB
- Estimated transfer total: 85.20 kB
- No UI component library, CMS SDK, analytics SDK, database client, auth SDK, or large frontend utility dependency is included.
- The hero visual is a local optimized PNG asset under `src/assets/`.
