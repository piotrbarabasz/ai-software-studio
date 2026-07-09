# Data Model: GCP Deployment for AISoftware Studio MVP

This feature does not add application business data or persistent lead storage. The model below describes deployment configuration entities and validation rules used by scripts, Cloud Build files, docs, and smoke tests.

## Deployment Target

Represents one independently deployable Cloud Run service.

**Fields**

- `name`: Cloud Run service name. Defaults: `aisoftware-studio-api` for backend, `aisoftware-studio-web` for frontend.
- `kind`: `backend` or `frontend`.
- `region`: GCP region. Default `europe-central2`; override allowed.
- `image`: Artifact Registry image reference.
- `public_url`: Cloud Run service URL after deployment.
- `min_instances`: Default `0`.
- `port`: Backend uses Cloud Run `PORT`; frontend Nginx listens on `8080`.
- `smoke_checks`: Required checks for the deployed service.

**Validation Rules**

- `name`, `region`, and `image` must be non-empty placeholders or user-provided values.
- No field may contain a real committed credential or service account key path.
- Frontend and backend targets must be deployable independently.

## Runtime Configuration

Represents environment-specific values supplied to Cloud Run or frontend build configuration.

**Fields**

- `APP_ENV`: `production` for this feature.
- `CORS_ALLOWED_ORIGINS`: Deployed frontend URL list for backend.
- `CONTACT_DELIVERY_MODE`: Existing contact delivery mode.
- `CONTACT_RECIPIENT_EMAIL`: Recipient email for contact inquiries.
- `CONTACT_FROM_EMAIL`: Sender email for contact delivery.
- `SMTP_HOST`: SMTP server hostname.
- `SMTP_PORT`: SMTP server port.
- `SMTP_USERNAME`: SMTP username when required.
- `SMTP_USE_TLS`: TLS toggle.
- `CONTACT_RATE_LIMIT_PER_MINUTE`: Existing contact rate-limit setting.
- `API_URL`: Backend API URL supplied to frontend build/runtime configuration.

**Validation Rules**

- `APP_ENV` is production-only for deployment docs/scripts in this feature.
- `CORS_ALLOWED_ORIGINS` must not be `*` in production.
- `API_URL` must be configurable and must not be a real hard-coded production URL in source control.
- Non-sensitive examples must use placeholders or safe sample values.

## Secret Reference

Represents a sensitive value supplied through Secret Manager.

**Fields**

- `name`: Secret Manager secret name, default placeholder such as `aisoftware-studio-smtp-password`.
- `version`: Secret version, usually `latest` in examples.
- `bound_env_var`: Runtime env var exposed to the backend, e.g. `SMTP_PASSWORD`.
- `service`: Cloud Run service that consumes the secret.

**Validation Rules**

- Secret values must never be committed.
- Scripts and docs may refer to secret names but must not print or store secret values.
- `SMTP_PASSWORD` must be bound from Secret Manager for production backend deployment.

## Artifact Registry Repository

Represents the image repository used by Cloud Build and Cloud Run.

**Fields**

- `project_id`: GCP project placeholder or operator-provided value.
- `region`: Default `europe-central2`.
- `repository`: Artifact Registry repository name placeholder/default.
- `backend_image`: Backend image name.
- `frontend_image`: Frontend image name.

**Validation Rules**

- Committed examples must not contain a real project ID.
- Image references must be derived from substitutions/parameters.

## Cloud Build Deployment Configuration

Represents a repeatable build/deploy workflow.

**Fields**

- `file`: `infra/gcp/cloudbuild.backend.yaml`, `infra/gcp/cloudbuild.frontend.yaml`, or `infra/gcp/cloudbuild.pr-checks.yaml`.
- `purpose`: Backend deploy, frontend deploy, or quality checks.
- `substitutions`: Required operator-provided values.
- `deploys`: Whether the workflow deploys to Cloud Run.
- `quality_gates`: Commands run before deploy or in PR checks.

**Validation Rules**

- Backend and frontend deploy files must be separate.
- PR checks file must not deploy.
- Substitutions must include project, region, Artifact Registry repo, service names, and URL/secret values where relevant.
- No workflow may include real secrets, tokens, service account JSON keys, or wildcard production CORS.

## Smoke Test

Represents a post-deployment verification action.

**Fields**

- `name`: Check name.
- `target`: Frontend or backend URL.
- `method`: HTTP method.
- `origin`: Optional CORS origin for browser-like checks.
- `payload`: Optional safe contact payload for API behavior.
- `expected_result`: Status code and behavior expectation.

**Validation Rules**

- Required checks: frontend URL, backend `/health`, CORS allowed origin, CORS rejected origin, and contact API behavior.
- Smoke tests must avoid real client personal data and must document whether test emails are delivered.

## Deployment Runbook

Represents the operational guide for release and troubleshooting.

**Fields**

- `release_checklist`
- `smoke_tests`
- `rollback_steps`
- `log_checks`
- `common_failures`
- `secret_rotation`
- `cors_troubleshooting`
- `contact_form_troubleshooting`

**Validation Rules**

- Runbook must be usable without hidden setup steps.
- Rollback must identify previous image/service revision strategy.
- Troubleshooting must cover Cloud Run logs, CORS, missing secrets, missing permissions, and contact delivery failures.
