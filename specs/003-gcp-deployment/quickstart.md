# Quickstart: GCP Deployment Plan Validation

This guide validates the planned deployment feature once tasks are implemented. It is intentionally operator-focused and uses placeholders only.

## Prerequisites

- Docker available locally.
- Google Cloud CLI installed and authenticated for the target project.
- Access to a GCP project where Cloud Run, Cloud Build, Artifact Registry, Secret Manager, and IAM APIs can be enabled.
- Existing repository dependencies installed as needed for local checks.
- No real secrets committed to the repository.

## 1. Run Local Preflight

```powershell
.\scripts\gcp\preflight.ps1
```

Expected result: backend Ruff/pytest checks and frontend lint/format/test/build checks pass. If a check fails, the script prints the failing gate and next step.

Equivalent manual checks:

```powershell
cd backend
ruff check .
ruff format --check .
pytest
```

```powershell
cd frontend
npm run lint
npm run format:check
npm test
npm run build
```

## 2. Build And Smoke Backend Container Locally

```powershell
docker build -t aisoftware-studio-api:local .\backend
docker run --rm -p 8081:8080 `
  -e PORT=8080 `
  -e APP_ENV=production `
  -e CORS_ALLOWED_ORIGINS=http://localhost:8082 `
  -e CONTACT_DELIVERY_MODE=email `
  -e CONTACT_RECIPIENT_EMAIL=owner@example.com `
  -e CONTACT_FROM_EMAIL=noreply@example.com `
  -e SMTP_HOST=smtp.example.com `
  -e SMTP_PORT=587 `
  -e SMTP_USERNAME=smtp-user@example.com `
  -e SMTP_PASSWORD=placeholder-not-real `
  -e SMTP_USE_TLS=true `
  -e CONTACT_RATE_LIMIT_PER_MINUTE=5 `
  aisoftware-studio-api:local
```

In another shell:

```powershell
Invoke-RestMethod http://127.0.0.1:8081/health
```

Expected result: health endpoint returns the existing success response.

## 3. Build And Smoke Frontend Container Locally

```powershell
docker build -t aisoftware-studio-web:local `
  --build-arg API_URL=http://127.0.0.1:8081 `
  .\frontend
docker run --rm -p 8082:8080 aisoftware-studio-web:local
```

In another shell:

```powershell
Invoke-WebRequest http://127.0.0.1:8082/
Invoke-WebRequest http://127.0.0.1:8082/any/direct/angular/route
```

Expected result: both requests return the Angular app; direct routes use SPA fallback.

## 4. Prepare GCP Project

Follow `docs/gcp-deployment.md` to:

- Authenticate `gcloud`.
- Enable required GCP APIs.
- Create the Artifact Registry Docker repository.
- Create the `SMTP_PASSWORD` Secret Manager secret.
- Confirm Cloud Build has permission to push images, deploy Cloud Run, and access the secret.

## 5. Deploy Backend

```powershell
.\scripts\gcp\deploy-backend.ps1 `
  -ProjectId "<PROJECT_ID>" `
  -Region "europe-central2" `
  -ArtifactRepo "<ARTIFACT_REPO>" `
  -ServiceName "aisoftware-studio-api" `
  -FrontendUrl "https://<FRONTEND_CLOUD_RUN_URL>" `
  -SmtpPasswordSecret "<SMTP_PASSWORD_SECRET_NAME>"
```

Expected result: Cloud Build builds and deploys the backend Cloud Run service with min instances `0`.

## 6. Deploy Frontend

```powershell
.\scripts\gcp\deploy-frontend.ps1 `
  -ProjectId "<PROJECT_ID>" `
  -Region "europe-central2" `
  -ArtifactRepo "<ARTIFACT_REPO>" `
  -ServiceName "aisoftware-studio-web" `
  -ApiUrl "https://<BACKEND_CLOUD_RUN_URL>"
```

Expected result: Cloud Build builds and deploys the frontend Cloud Run service with min instances `0`.

## 7. Update Backend CORS If Needed

If the frontend URL was unknown during backend deployment, redeploy or update the backend with:

- `CORS_ALLOWED_ORIGINS=https://<FRONTEND_CLOUD_RUN_URL>`
- No wildcard origin in production.

Expected result: browser requests from the frontend service are allowed and unapproved origins are not trusted.

## 8. Run Cloud Run Smoke Tests

Follow `docs/gcp-runbook.md` to verify:

- Frontend URL loads.
- Backend `/health` returns success.
- CORS accepts the deployed frontend origin.
- CORS rejects an unapproved origin.
- Contact API behavior matches the existing contract with safe test data.

## 9. Verify Security Boundaries

Before merge/release:

- Search committed deployment files for real GCP project IDs, SMTP credentials, tokens, service account keys, and private URLs.
- Confirm no `.env` files or service account JSON keys are included in Docker contexts.
- Confirm `SMTP_PASSWORD` is documented as Secret Manager-backed.
- Confirm Cloud Run min instances default to `0`.
- Confirm no Terraform, Pulumi, GitHub Actions, database, authentication, CMS, admin panel, payment, queue, or persistent lead storage was added.
