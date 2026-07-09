# Implementation Plan: GCP Deployment for AISoftware Studio MVP

**Branch**: `003-gcp-deployment` | **Date**: 2026-07-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-gcp-deployment/spec.md`

## Summary

Add production-ready Google Cloud deployment for the existing AISoftware Studio MVP without changing the marketing-site business scope. The implementation will add independent Cloud Run deployment paths for the FastAPI backend service `aisoftware-studio-api` and Angular frontend service `aisoftware-studio-web`, using Artifact Registry for container images, Cloud Build YAML files for repeatable build/deploy, Secret Manager for `SMTP_PASSWORD`, Cloud Run environment variables for non-sensitive production configuration, PowerShell helper scripts for preflight and deployment, and operator documentation for first deployment, smoke tests, rollback, and troubleshooting.

The plan intentionally avoids Terraform/Pulumi, GitHub Actions, databases, authentication, CMS, admin panels, payments, queues, persistent lead storage, real secrets, service account JSON keys, wildcard production CORS, and production use of development servers.

## Technical Context

**Language/Version**: TypeScript with Angular 17 for the frontend; Python 3.11+ FastAPI backend from the existing `backend/pyproject.toml`; Docker container definitions for production packaging; PowerShell for local helper scripts.

**Primary Dependencies**: Existing Angular/npm stack, existing FastAPI/Pydantic/Uvicorn/Ruff/pytest stack, Nginx runtime image for static frontend serving, Google Cloud Build, Artifact Registry, Cloud Run, Secret Manager, and `gcloud` CLI for documented operator commands. No Terraform/Pulumi, GitHub Actions, database drivers, auth packages, CMS packages, queue clients, or payment SDKs are planned.

**Storage**: No application data storage. Artifact Registry stores container images and Secret Manager stores sensitive runtime values such as `SMTP_PASSWORD`; neither introduces lead persistence or business data storage.

**Testing**: Backend: `ruff check`, `ruff format --check`, `pytest`, backend Docker build/local `/health` smoke test. Frontend: `npm run lint`, `npm run format:check`, `npm test`, `npm run build`, frontend Docker build/local SPA fallback smoke test. Deployment: Cloud Run smoke tests for frontend URL, backend `/health`, CORS, and contact API behavior.

**Target Platform**: Google Cloud Run for both production services, default region `europe-central2` with script/documentation override, Artifact Registry for images, Cloud Build YAML files for manual deployment and later CI/CD reuse.

**Project Type**: Marketing website with separate Angular frontend and FastAPI backend, plus deployment infrastructure, scripts, and documentation.

**Performance Goals**: Production containers must avoid development servers; frontend static assets should use safe cache headers; Cloud Run services default to min instances `0` for MVP cost control; deployed frontend and backend must pass documented smoke tests before release acceptance.

**Constraints**: Production only for this feature; local development unchanged; no real secrets, real GCP project IDs, SMTP credentials, service account keys, tokens, wildcard production CORS, Terraform/Pulumi, GitHub Actions, database, authentication, CMS, admin panel, payment, queue, or persistent lead storage.

**Scale/Scope**: One backend Cloud Run service (`aisoftware-studio-api`), one frontend Cloud Run service (`aisoftware-studio-web`), one Artifact Registry repository for Docker images, one Secret Manager secret for `SMTP_PASSWORD`, three Cloud Build YAML files, GCP helper scripts, and deployment/runbook documentation.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Business value**: PASS. The feature supports lead generation and trust building by making the public site and contact API reliably available to visitors.
- **MVP simplicity**: PASS. The plan adds only deployment artifacts needed for the current production requirement and explicitly excludes databases, auth, CMS, queues, payments, admin panels, and persistent lead storage.
- **Architecture separation**: PASS. Frontend and backend remain independent source trees with separate Dockerfiles, Cloud Build deployment files, runtime configuration, and smoke checks.
- **API contract**: PASS. No new public API endpoint is introduced. Existing `/health` and `/api/contact` behavior remain the public backend contract and are used for deployment smoke tests.
- **UX and localization**: PASS. Public Polish-first frontend behavior is unchanged; production hosting must preserve existing accessibility/performance release criteria.
- **Security**: PASS. Secrets remain out of source control, `SMTP_PASSWORD` uses Secret Manager, non-sensitive values use Cloud Run environment variables, production CORS is restricted, and logs must stay non-sensitive.
- **Developer readiness**: PASS. The plan names expected files, scripts, validation commands, deployment docs, and runbook checks.

**Post-design re-check**: PASS. Phase 1 artifacts preserve independent frontend/backend deployment, no new business data persistence, no wildcard CORS, explicit secret handling, documented validation, and production-only Cloud Run configuration while leaving local development unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/003-gcp-deployment/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- deployment-interfaces.md
|   `-- cloudbuild-substitutions.md
`-- checklists/
    `-- requirements.md
```

### Source Code (repository root)

```text
backend/
|-- Dockerfile
|-- .dockerignore
|-- pyproject.toml
|-- app/
`-- tests/

frontend/
|-- Dockerfile
|-- .dockerignore
|-- nginx.conf
|-- package.json
|-- src/
|   `-- environments/
|       |-- environment.ts
|       `-- environment.prod.ts
`-- tests via Angular/Karma conventions

infra/
`-- gcp/
    |-- README.md
    |-- env.example
    |-- cloudbuild.backend.yaml
    |-- cloudbuild.frontend.yaml
    `-- cloudbuild.pr-checks.yaml

scripts/
`-- gcp/
    |-- preflight.ps1
    |-- deploy-backend.ps1
    `-- deploy-frontend.ps1

docs/
|-- gcp-deployment.md
`-- gcp-runbook.md

README.md
```

**Structure Decision**: Keep the existing separated `frontend/` and `backend/` applications. Add deployment files alongside the application they package, shared GCP build/deploy configuration under `infra/gcp/`, operator scripts under `scripts/gcp/`, and user-facing deployment/runbook docs under `docs/`.

## Files To Add

- `backend/Dockerfile`: Production Python image for FastAPI/Uvicorn, package installed from `pyproject.toml`, non-root user where practical, `PORT`-based startup.
- `backend/.dockerignore`: Exclude virtual environments, caches, test artifacts, local env files, and secrets from backend image context.
- `frontend/Dockerfile`: Node build stage with `npm ci` and production build, Nginx runtime stage on port `8080`, build-time API URL support.
- `frontend/.dockerignore`: Exclude `node_modules`, Angular cache, dist artifacts, local env files, and secrets from frontend image context.
- `frontend/nginx.conf`: Static serving config with Cloud Run port `8080`, SPA fallback to `index.html`, and safe cache headers.
- `infra/gcp/cloudbuild.backend.yaml`: Build, push, and deploy `aisoftware-studio-api` to Cloud Run with substitutions and Secret Manager binding.
- `infra/gcp/cloudbuild.frontend.yaml`: Build frontend with API URL build arg, push image, and deploy `aisoftware-studio-web`.
- `infra/gcp/cloudbuild.pr-checks.yaml`: Run backend and frontend quality gates without deployment.
- `infra/gcp/env.example`: Safe placeholder list for production parameters and non-sensitive env vars.
- `infra/gcp/README.md`: Concise infrastructure overview and file map.
- `scripts/gcp/preflight.ps1`: Local quality gate wrapper for backend/frontend validations.
- `scripts/gcp/deploy-backend.ps1`: Parameterized Cloud Build submit wrapper for backend.
- `scripts/gcp/deploy-frontend.ps1`: Parameterized Cloud Build submit wrapper for frontend.
- `docs/gcp-deployment.md`: First-time GCP setup and deployment guide.
- `docs/gcp-runbook.md`: Release checklist, smoke tests, rollback, logs, common failures, secret rotation, CORS/contact troubleshooting.

## Files To Update

- `README.md`: Add deployment section linking to GCP deployment guide, runbook, and local preflight command.
- `infra/README.md`: Replace placeholder-only messaging with pointer to `infra/gcp/` while preserving no-Terraform/no-real-secrets boundaries.
- `frontend/src/environments/environment.prod.ts`: Update only if required so production API URL can be supplied safely at image build/deployment time without a real hard-coded production URL.
- Frontend tests: Add/update only if API URL configuration behavior changes.
- Backend configuration/tests: Add/update only if production env var parsing or `PORT`/CORS behavior needs code support beyond current settings.

## Backend Deployment Design

- Package service: existing FastAPI app at `backend/app/main.py`, started as `uvicorn app.main:app --host 0.0.0.0 --port ${PORT}` or equivalent shell-safe command.
- Container base: slim Python image compatible with the backend's supported Python version.
- Image contents: copy `pyproject.toml` and required `app/` files; do not copy `.env`, virtual environments, caches, or local test artifacts.
- Runtime identity: run as a non-root user where practical.
- Cloud Run service: `aisoftware-studio-api`.
- Region: default `europe-central2`; all scripts/docs accept override.
- Min instances: `0` by default.
- Non-sensitive Cloud Run env vars: `APP_ENV`, `CORS_ALLOWED_ORIGINS`, `CONTACT_DELIVERY_MODE`, `CONTACT_RECIPIENT_EMAIL`, `CONTACT_FROM_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_USE_TLS`, `CONTACT_RATE_LIMIT_PER_MINUTE`.
- Sensitive config: `SMTP_PASSWORD` from Secret Manager, never plain text in YAML, scripts, docs, or image layers.
- Public endpoints used for validation: `GET /health`, `POST /api/contact`, generated FastAPI OpenAPI schema for existing API contract.

## Frontend Deployment Design

- Package service: existing Angular 17 application under `frontend/`.
- Build stage: Node image, `npm ci`, then `npm run build`.
- Runtime stage: Nginx serving built Angular browser assets on port `8080`.
- Cloud Run service: `aisoftware-studio-web`.
- Region: default `europe-central2`; all scripts/docs accept override.
- Min instances: `0` by default.
- Routing: Nginx SPA fallback serves `index.html` for direct Angular routes.
- API URL: production Angular build uses a configurable backend API URL passed as a build arg or deployment-time generated environment file. The implementation must not hard-code a real production URL.
- Static caching: long-lived cache headers for hashed assets where safe; no-cache or short cache for `index.html` and runtime config if used.
- Production constraint: do not run `ng serve` in the production container.

## Cloud Build Design

- `cloudbuild.backend.yaml` builds backend image, pushes to Artifact Registry, deploys `aisoftware-studio-api`, sets non-sensitive env vars, binds `SMTP_PASSWORD` from Secret Manager, and keeps min instances at `0`.
- `cloudbuild.frontend.yaml` builds frontend image with API URL build argument, pushes to Artifact Registry, deploys `aisoftware-studio-web`, and keeps min instances at `0`.
- `cloudbuild.pr-checks.yaml` runs backend `ruff check`, `ruff format --check`, `pytest`, frontend `npm run lint`, `npm run format:check`, `npm test`, and `npm run build` without deploying.
- Substitutions cover `_PROJECT_ID`, region, Artifact Registry repository, image names, service names, API URL, frontend URL, secret names, and production env vars.
- Cloud Build configs must not include real project IDs, secrets, tokens, service account key paths, or wildcard production CORS values.
- GitHub Actions are out of scope; Cloud Build trigger setup is documented only.

## PowerShell Script Design

- `preflight.ps1` runs local checks, fails fast, reports failed command names, and prints next steps.
- `deploy-backend.ps1` wraps `gcloud builds submit --config infra/gcp/cloudbuild.backend.yaml` with parameters for `ProjectId`, `Region`, `ArtifactRepo`, `ServiceName`, `FrontendUrl`, and secret/env var names.
- `deploy-frontend.ps1` wraps `gcloud builds submit --config infra/gcp/cloudbuild.frontend.yaml` with parameters for `ProjectId`, `Region`, `ArtifactRepo`, `ServiceName`, and `ApiUrl`.
- Scripts must default `Region` to `europe-central2` and service names to `aisoftware-studio-api` / `aisoftware-studio-web`.
- Scripts must validate required parameters, avoid printing secret values, and provide actionable errors for missing `gcloud`, missing auth/project, missing Artifact Registry repository, or missing Secret Manager secret.

## Documentation Design

- `docs/gcp-deployment.md` covers prerequisites, required GCP APIs, `gcloud` auth setup, Artifact Registry creation, Secret Manager secret creation, backend deployment, frontend deployment, CORS update order, Cloud Build trigger setup, custom domain notes as a later manual step, and cost notes including min instances `0`.
- `docs/gcp-runbook.md` covers release checklist, smoke tests, rollback, Cloud Run logs, common failures, secret rotation, CORS troubleshooting, and contact form troubleshooting.
- `infra/gcp/README.md` provides a shorter file map and usage overview for operators already familiar with the full docs.
- `README.md` points to the GCP deployment guide and states that local development remains unchanged.

## Testing Strategy

- Backend quality gates: from `backend/`, run `ruff check .`, `ruff format --check .`, and `pytest`.
- Frontend quality gates: from `frontend/`, run `npm run lint`, `npm run format:check`, `npm test`, and `npm run build`.
- Backend local Docker smoke: build backend image, run with placeholder-safe env vars and local port mapping, assert `GET /health` returns success.
- Frontend local Docker smoke: build frontend image with placeholder/local API URL, run with local port mapping, assert root route and a direct SPA route return the Angular app.
- Cloud Run smoke: verify frontend URL returns page content, backend `/health` returns success, CORS accepts the deployed frontend origin and rejects non-approved origins, and a safe contact API check behaves as documented.
- Security review: scan committed deployment files for real GCP project IDs, SMTP credentials, tokens, service account JSON keys, and wildcard production CORS.

## Complexity Tracking

No constitution violations. Cloud Run, Cloud Build, Artifact Registry, and Secret Manager are necessary to satisfy the production deployment requirement and Constitution Principle VIII. The plan avoids heavier infrastructure automation and all excluded product complexity.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
