# GCP Deployment Guide

This guide covers first-time production deployment of the existing AISoftware Studio MVP to Google Cloud Platform.

## Scope

- Frontend: `aisoftware-studio-web` as a production static container on Cloud Run
- Backend: `aisoftware-studio-api` as a FastAPI Cloud Run service
- Registry: Artifact Registry for container images
- CI/CD: Cloud Build YAML files plus GitHub-connected Cloud Build triggers documented in `docs/gcp-cicd.md`
- Secrets: Secret Manager for runtime `SMTP_PASSWORD` and build-time public legal JSON

## Prerequisites

- `gcloud` installed and authenticated
- A clean GCP project with billing enabled
- Permissions to enable APIs, create Artifact Registry repositories, create Secret Manager secrets, and deploy Cloud Run services
- A verified public frontend origin and backend URL for CORS configuration

## Required APIs

Enable at minimum:

- Cloud Run
- Cloud Build
- Artifact Registry
- Secret Manager
- IAM Service Account Credentials if needed by your project setup

## Recommended Defaults

- Region: `europe-central2`
- Cloud Run min instances: `0`
- Frontend service name: `aisoftware-studio-web`
- Backend service name: `aisoftware-studio-api`

## Artifact Registry

Create one Docker repository for the deployment images.

Example:

```powershell
gcloud artifacts repositories create aisoftware-studio `
  --repository-format=docker `
  --location=europe-central2 `
  --description="AISoftware Studio deployment images"
```

## Secret Manager

Create the SMTP password secret and a separate JSON secret with verified public legal configuration. Do not commit either deployment input to the repository.

Example:

```powershell
Write-Output 'paste-real-password-locally-only' | gcloud secrets create aisoftware-studio-smtp-password `
  --data-file=- `
  --replication-policy=automatic
```

If the secret already exists, add a new version rather than replacing the value in source control.

The production frontend build reads the secret selected by `_PUBLIC_LEGAL_CONFIG_SECRET` (default: `aisoftware-studio-public-legal-config`). Its content must be the exact verified JSON described in [`privacy-configuration.md`](privacy-configuration.md). Grant access to the Cloud Build service account, not only to the Cloud Run runtime service account. A runtime secret binding cannot change prerendered HTML.

## Backend Deployment

Use `scripts/gcp/deploy-backend.ps1` or `infra/gcp/cloudbuild.backend.yaml`.

Required runtime values:

- `APP_ENV=production`
- `CORS_ALLOWED_ORIGINS=https://protolume.pl`
- `CONTACT_DELIVERY_MODE=email`
- `CONTACT_RECIPIENT_EMAIL`
- `CONTACT_FROM_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_USE_TLS`
- `CONTACT_RATE_LIMIT_PER_MINUTE`
- `SMTP_PASSWORD` from Secret Manager

The backend must listen on Cloud Run `PORT` and expose `GET /health` plus the existing contact API.

## Frontend Deployment

Use `scripts/gcp/deploy-frontend.ps1` or `infra/gcp/cloudbuild.frontend.yaml`. The script requires both `-ApiUrl` and `-PublicSiteUrl`; keep `-EnableIndexing $false` and pass `-PublicLegalConfigSecret` when the secret uses a non-default name.

Pass the deployed backend URL as `API_URL` and the verified public frontend origin as `PUBLIC_SITE_URL`. The Docker build rejects a placeholder, `localhost`, an example domain, or an HTTP origin in production. `PUBLIC_SITE_INDEXING` defaults to `false` for staging and preview.

Before the frontend production build, prepare the verified JSON described in [`privacy-configuration.md`](privacy-configuration.md). Do not edit a TypeScript fallback: no production fallback exists. Cloud Build passes JSON as a BuildKit secret and the Docker build fails on a missing field, empty value, placeholder, test data, invalid e-mail, missing prerendered route, or forbidden artifact content.

The production container serves prerendered Angular routes through Nginx on port `8080`. It also serves generated `robots.txt` and `sitemap.xml`; their URLs are derived from `PUBLIC_SITE_URL` during the build.

## CORS Update Order

1. Keep the production origin fixed at `https://protolume.pl`; technical Cloud Run URLs are not valid production CORS origins.
2. Build both images and pass the backend container smoke before deploying either service.
3. Deploy the backend with that exact origin in `CORS_ALLOWED_ORIGINS`, then deploy the frontend with the same `PUBLIC_SITE_URL`.

Production CORS must not use wildcard origins.

## Cloud Build Triggers

See `docs/gcp-cicd.md` for the GitHub-connected production trigger, PR validation trigger, and temporary test trigger.
The production pipeline uses `infra/gcp/cloudbuild.deploy.yaml`.

## Custom Domain, Canonical and SEO

Follow [public-origin-deployment.md](public-origin-deployment.md) before publishing a custom domain. It covers the manual DNS/domain mapping and certificate verification steps, the Cloud Build substitutions, technical Cloud Run URL policy, canonical checks and the CORS update.

## Cost Notes

- Keep Cloud Run min instances at `0` by default.
- This avoids fixed cost for the MVP.
- Cold starts are acceptable for the first production release.

## Validation Before Deployment

Run the local preflight script first:

```powershell
.\scripts\gcp\preflight.ps1 `
  -PublicLegalConfigPath "C:\bezpieczna-lokalizacja\public-legal.json" `
  -ApiUrl $env:BACKEND_URL `
  -PublicSiteUrl "https://protolume.pl" `
  -EnableIndexing $false
```

Then confirm the backend and frontend container smoke tests described in `docs/gcp-runbook.md`.

## Manual Image Tags

Manual component submissions must pass `_IMAGE_TAG` explicitly as a 7-64 character lowercase hexadecimal commit ID. `manual-local` is rejected before build.

The combined production config does not define `_IMAGE_TAG`: a trigger supplies built-in `$SHORT_SHA`. A manual `gcloud builds submit` of that config must pass `SHORT_SHA` explicitly through `--substitutions`, together with the required real SMTP/e-mail environment substitutions.
