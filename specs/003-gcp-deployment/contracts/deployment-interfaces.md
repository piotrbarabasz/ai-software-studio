# Contract: Deployment Interfaces

This feature preserves the existing public application API and adds deployment/operator interfaces. No new business API endpoint is introduced.

## Public Backend Endpoints Used By Deployment

### `GET /health`

**Purpose**: Confirm that the deployed backend service is reachable.

**Expected success**: HTTP 200 with the existing health response shape.

**Used by**: Backend local Docker smoke test, Cloud Run smoke test, runbook checks.

### `POST /api/contact`

**Purpose**: Existing contact intake endpoint used by the deployed frontend.

**Expected success**: Existing accepted-contact response for a valid contact inquiry.

**Expected failures**: Existing validation, rate-limit, and delivery-failure responses.

**Used by**: Frontend contact flow, contact API smoke test, CORS validation.

## Cloud Run Service Contract

### Backend service: `aisoftware-studio-api`

**Required runtime behavior**

- Starts without development reload mode.
- Listens on the `PORT` environment variable supplied by Cloud Run.
- Exposes `GET /health`.
- Exposes existing `POST /api/contact`.
- Restricts production CORS to `CORS_ALLOWED_ORIGINS`.
- Reads `SMTP_PASSWORD` from Secret Manager binding.
- Logs operational outcomes without secret values or contact payload details.
- Uses min instances `0` unless an operator explicitly changes it later.

**Required non-sensitive environment variables**

- `APP_ENV`
- `CORS_ALLOWED_ORIGINS`
- `CONTACT_DELIVERY_MODE`
- `CONTACT_RECIPIENT_EMAIL`
- `CONTACT_FROM_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_USE_TLS`
- `CONTACT_RATE_LIMIT_PER_MINUTE`

**Required secret bindings**

- `SMTP_PASSWORD`: Secret Manager reference, not a committed value.

### Frontend service: `aisoftware-studio-web`

**Required runtime behavior**

- Serves built Angular static assets from Nginx.
- Listens on port `8080`.
- Serves `index.html` for direct Angular routes.
- Uses safe cache headers for static assets.
- Does not run `ng serve`.
- Uses a configurable backend API URL supplied during image build or deployment-time runtime config generation.
- Uses min instances `0` unless an operator explicitly changes it later.

## Script Interface Contract

### `scripts/gcp/preflight.ps1`

**Purpose**: Run local quality gates before deployment.

**Required behavior**

- Runs backend `ruff check`, `ruff format --check`, and `pytest`.
- Runs frontend `npm run lint`, `npm run format:check`, `npm test`, and `npm run build`.
- Fails fast or clearly reports the failing gate.
- Prints next-step guidance without exposing secrets.

### `scripts/gcp/deploy-backend.ps1`

**Purpose**: Submit backend Cloud Build deployment.

**Required parameters**

- `ProjectId`
- `Region` defaulting to `europe-central2`
- `ArtifactRepo`
- `ServiceName` defaulting to `aisoftware-studio-api`
- `FrontendUrl` for `CORS_ALLOWED_ORIGINS`
- Secret name/substitution for `SMTP_PASSWORD`
- Required non-sensitive backend env var substitutions

**Required behavior**

- Calls Cloud Build with `infra/gcp/cloudbuild.backend.yaml`.
- Validates required parameters.
- Does not print secret values.
- Provides helpful messages for missing `gcloud`, auth, APIs, repository, or secret.

### `scripts/gcp/deploy-frontend.ps1`

**Purpose**: Submit frontend Cloud Build deployment.

**Required parameters**

- `ProjectId`
- `Region` defaulting to `europe-central2`
- `ArtifactRepo`
- `ServiceName` defaulting to `aisoftware-studio-web`
- `ApiUrl` for the deployed backend URL

**Required behavior**

- Calls Cloud Build with `infra/gcp/cloudbuild.frontend.yaml`.
- Validates required parameters.
- Does not hard-code a real production API URL.
- Provides helpful messages for missing `gcloud`, auth, APIs, or repository.

## Documentation Contract

### `docs/gcp-deployment.md`

Must include prerequisites, required GCP APIs, auth setup, Artifact Registry creation, Secret Manager secret creation, backend deployment, frontend deployment, CORS update order, Cloud Build trigger setup, custom domain notes as manual later step, and cost notes.

### `docs/gcp-runbook.md`

Must include release checklist, smoke tests, rollback, Cloud Run logs, common failures, secret rotation, CORS troubleshooting, and contact form troubleshooting.
