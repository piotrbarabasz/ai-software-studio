# Quickstart: Marketing Website MVP

This guide defines how to run and validate the MVP once implementation tasks
create the Angular frontend and FastAPI backend.

## Prerequisites

- Node.js and npm compatible with the generated Angular project
- Python 3.11+
- Local terminal sessions for frontend and backend

## Expected Repository Layout

```text
frontend/
backend/
infra/
docs/
specs/001-marketing-site-mvp/
```

## Backend Setup

1. Create and activate a Python virtual environment in `backend/`.
2. Install backend dependencies from `pyproject.toml`.
3. Configure environment variables for local development:

```text
APP_ENV=development
CORS_ALLOWED_ORIGINS=http://localhost:4200
CONTACT_DELIVERY_MODE=email
CONTACT_RECIPIENT_EMAIL=owner@example.com
CONTACT_FROM_EMAIL=noreply@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=example-user
SMTP_PASSWORD=example-password
SMTP_USE_TLS=true
CONTACT_RATE_LIMIT_PER_MINUTE=5
```

Secrets must be supplied through local environment files ignored by git or the
shell environment, never committed.

4. Run the backend development server:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

5. Validate health:

```bash
curl http://127.0.0.1:8000/health
```

Expected result: JSON with `status` set to `ok`. This confirms backend
application reachability only; it does not verify SMTP or email provider
readiness in the MVP.

## Frontend Setup

1. Install dependencies in `frontend/`.
2. Configure the local API URL through Angular environment configuration:

```text
API_URL=http://127.0.0.1:8000
```

3. Run the Angular development server:

```bash
npm start
```

Expected result: the site is available at `http://localhost:4200`.

## Validation Scenarios

### Landing Page

- Open the site on desktop and mobile viewport widths.
- Confirm the page is a single landing page with hero, services, process,
  technology, examples, about, and contact sections.
- Confirm the hero contains the AISoftware Studio brand, Polish value
  proposition, and contact CTA.
- Confirm navigation or CTA links move to the expected anchor sections.

### Contact Form

- Submit a valid inquiry with name, email, project type, budget range, message,
  and consent checked.
- Confirm the frontend shows a Polish success message only after backend
  acceptance.
- Submit without consent and confirm submission is blocked.
- Submit with an invalid email and confirm Polish validation feedback.
- Submit a message shorter than 20 characters and longer than 4000 characters
  and confirm backend validation rejects it.
- Stop or misconfigure email delivery and confirm the API returns a controlled
  failure instead of pretending success.
- Confirm failed email delivery is logged by the backend without logging the
  sensitive message body.

### API Contract

- Confirm FastAPI exposes OpenAPI documentation locally.
- Confirm `contracts/openapi.yaml` matches implemented `GET /health` and
  `POST /api/contact` behavior.
- Confirm CORS allows `http://localhost:4200` in development and rejects
  unapproved origins outside configured development origins.

### Accessibility

- Confirm the MVP targets WCAG 2.2 AA for primary user flows.
- Navigate all primary links, CTAs, and form fields using keyboard only.
- Confirm focus is visible and does not become trapped.
- Confirm form fields have accessible labels and errors are associated with
  their controls.
- Confirm color contrast, semantic HTML, form labels, and validation messages
  satisfy the WCAG 2.2 AA target for MVP scope.
- Confirm heading order is logical and page language is Polish.

### Performance

- Confirm the production build reaches Lighthouse Performance score >= 90 on
  desktop.
- Confirm the production build reaches Lighthouse Accessibility score >= 90 on
  desktop.
- Confirm initial JS/CSS/assets avoid unnecessary large dependencies.
- Confirm local backend processing for `POST /api/contact` normally completes
  under 1 second excluding external email provider latency.

### SEO

- Confirm the page has a meaningful Polish title and description.
- Confirm heading structure identifies the brand and main service category.
- Confirm link previews can identify the brand and service offer.
- Confirm public content is not hidden behind inaccessible interactions.

## Test Commands

Backend:

Backend scripts in `backend/scripts/` must expose lint, format, and test
commands. The validation gate should run:

```bash
ruff check .
ruff format --check .
pytest
```

Frontend:

```bash
npm run lint
npm run format
npm test
npm run build
```

## Deployment Direction

Full GCP deployment is not part of this MVP feature. The implementation must
still keep:

- `frontend/` buildable independently as static assets or a future container
- `backend/` runnable independently and Cloud Run-ready
- environment variables documented for each app
- CORS origins configurable per environment
- no secrets committed to the repository
