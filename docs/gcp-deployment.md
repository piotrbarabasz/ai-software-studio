# GCP Deployment Guide

This guide covers first-time production deployment of the existing AISoftware Studio MVP to Google Cloud Platform.

## Scope

- Frontend: `aisoftware-studio-web` as a production static container on Cloud Run
- Backend: `aisoftware-studio-api` as a FastAPI Cloud Run service
- Registry: Artifact Registry for container images
- CI/CD: Cloud Build YAML files plus GitHub-connected Cloud Build triggers documented in `docs/gcp-cicd.md`
- Secrets: Secret Manager for `SMTP_PASSWORD`

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

Create the SMTP password secret. Do not commit the password to the repository.

Example:

```powershell
Write-Output 'paste-real-password-locally-only' | gcloud secrets create aisoftware-studio-smtp-password `
  --data-file=- `
  --replication-policy=automatic
```

If the secret already exists, add a new version rather than replacing the value in source control.

## Backend Deployment

Use `scripts/gcp/deploy-backend.ps1` or `infra/gcp/cloudbuild.backend.yaml`.

Required runtime values:

- `APP_ENV=production`
- `CORS_ALLOWED_ORIGINS=https://<PUBLIC_SITE_ORIGIN>`
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

Use `scripts/gcp/deploy-frontend.ps1` or `infra/gcp/cloudbuild.frontend.yaml`.

Pass the deployed backend URL as `API_URL` and the verified public frontend origin as `PUBLIC_SITE_ORIGIN`. The Docker build rejects a placeholder, `localhost`, an example domain, or an HTTP origin in production.

Before the frontend production build, complete and validate `frontend/src/app/core/legal/public-legal.config.ts` according to [`privacy-configuration.md`](privacy-configuration.md). The configuration is public but must contain verified administrator, contact, retention, recipient, SMTP-provider, legal-basis, rights, and update-date information. The production build intentionally fails while its explicit placeholders remain.

The production container serves prerendered Angular routes through Nginx on port `8080`. It also serves generated `robots.txt` and `sitemap.xml`; their URLs are derived from `PUBLIC_SITE_ORIGIN` during the build.

## CORS Update Order

1. Establish the final frontend origin (or use the technical Cloud Run URL only for a test deployment).
2. Deploy the backend with that exact origin in `CORS_ALLOWED_ORIGINS`.
3. Build and deploy the frontend with the same origin in `PUBLIC_SITE_ORIGIN`.

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
.\scripts\gcp\preflight.ps1
```

Then confirm the backend and frontend container smoke tests described in `docs/gcp-runbook.md`.

## Manual Image Tags

Manual `gcloud builds submit` runs do not rely on `SHORT_SHA`.
The manual Cloud Build files default `_IMAGE_TAG` to `manual-local`, so they remain usable even when no trigger metadata is present.
If you want a reproducible manual tag, pass `_IMAGE_TAG` explicitly when invoking the build.
