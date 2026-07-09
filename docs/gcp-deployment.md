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
- A deployed frontend URL and backend URL for CORS configuration

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
- `CORS_ALLOWED_ORIGINS=https://<FRONTEND_CLOUD_RUN_URL>`
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

Pass the deployed backend URL as the frontend API URL build value.

The production container must serve the Angular app through Nginx on port `8080` and support SPA fallback to `index.html`.

## CORS Update Order

1. Deploy the backend with the frontend URL if known.
2. Deploy the frontend and capture its Cloud Run URL.
3. If needed, update and redeploy the backend so `CORS_ALLOWED_ORIGINS` contains the exact frontend origin.

Production CORS must not use wildcard origins.

## Cloud Build Triggers

See `docs/gcp-cicd.md` for the GitHub-connected production trigger, PR validation trigger, and temporary test trigger.
The production pipeline uses `infra/gcp/cloudbuild.deploy.yaml`.

## Custom Domain Notes

Custom domain mapping is a later manual step.
Do not automate it in this feature.

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
