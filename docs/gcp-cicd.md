# GCP CI/CD

This guide covers GitHub-to-GCP continuous deployment for AISoftware Studio using Cloud Build and Cloud Run.

## What This Uses

- Production branch: `main`
- Temporary trigger test branch: `002-gcp-deployment`
- Trigger model: Cloud Build triggers connected to GitHub
- Production pipeline: `infra/gcp/cloudbuild.deploy.yaml`
- PR validation: `infra/gcp/cloudbuild.pr-checks.yaml`
- Manual deployment compatibility: `infra/gcp/cloudbuild.backend.yaml` and `infra/gcp/cloudbuild.frontend.yaml`

GitHub Actions are not part of this feature.

## One-Time GitHub Connection

Before you create any trigger, connect the GitHub repository to Cloud Build in the Google Cloud Console.

Recommended path:

1. Open Google Cloud Console.
2. Go to Cloud Build, then Triggers.
3. Select the project `ai-software-studio-501918`.
4. Click Connect Repository.
5. Choose GitHub and complete the authorization flow.
6. Select the repository that contains this codebase.
7. Choose region `europe-central2`.

Use the console for this step because the GitHub authorization is interactive.

Optional helper scripts can be used only after the repository is already connected.

## Production Trigger

Create a Cloud Build trigger with:

- Name: `deploy-prod`
- Event: push
- Branch regex: `^main$`
- Config file: `infra/gcp/cloudbuild.deploy.yaml`

Required substitutions for the trigger:

- `_PROJECT_ID=ai-software-studio-501918`
- `_REGION=europe-central2`
- `_ARTIFACT_REPO=aisoftware-studio`
- `_BACKEND_SERVICE=aisoftware-studio-api`
- `_FRONTEND_SERVICE=aisoftware-studio-web`
- `_BACKEND_IMAGE_NAME=aisoftware-studio-api`
- `_FRONTEND_IMAGE_NAME=aisoftware-studio-web`
- `_BACKEND_URL=https://<BACKEND_CLOUD_RUN_URL>`
- `_FRONTEND_URL=https://<PUBLIC_SITE_ORIGIN>`
- `_SMTP_PASSWORD_SECRET=aisoftware-studio-smtp-password`
- `_CONTACT_RATE_LIMIT_PER_MINUTE=30`
- `_CONTACT_RECIPIENT_EMAIL=<placeholder>`
- `_CONTACT_FROM_EMAIL=<placeholder>`
- `_SMTP_HOST=<placeholder>`
- `_SMTP_PORT=<placeholder>`
- `_SMTP_USERNAME=<placeholder>`
- `_SMTP_USE_TLS=<placeholder>`
- `_CONTACT_DELIVERY_MODE=email`
- `_APP_ENV=production`
- `_MIN_INSTANCES=0`
- `_IMAGE_TAG=$SHORT_SHA`

The production trigger must deploy the backend first and the frontend second. `_FRONTEND_URL` is the single production frontend origin: it is passed to the frontend Docker build as `PUBLIC_SITE_ORIGIN` and to the backend as `CORS_ALLOWED_ORIGINS`.

Before enabling that trigger, complete the public privacy configuration described in [`privacy-configuration.md`](privacy-configuration.md). The frontend container runs `npm run build`, which rejects explicit legal-data placeholders. PR validation uses the development build while the repository intentionally contains those placeholders.

For the manual domain mapping, certificate, technical URL policy and canonical verification, follow [public-origin-deployment.md](public-origin-deployment.md).

## Temporary Test Trigger

Use a temporary push trigger to test the Cloud Build connection before enabling production.

- Name: `deploy-test-002-gcp-deployment`
- Branch regex: `^002-gcp-deployment$`
- Config file: `infra/gcp/cloudbuild.deploy.yaml`

Disable or delete this trigger after the connection test succeeds.

## PR Validation Trigger

Create a pull request trigger with:

- Name: `pr-checks-main`
- Base branch regex: `^main$`
- Config file: `infra/gcp/cloudbuild.pr-checks.yaml`
- Deployment: none

This trigger runs validation only. It must not deploy to Cloud Run.

## Manual Deployments

The manual Cloud Build configs remain valid:

- `infra/gcp/cloudbuild.backend.yaml`
- `infra/gcp/cloudbuild.frontend.yaml`

They default `_IMAGE_TAG` to `manual-local`, so `gcloud builds submit` does not fail when `SHORT_SHA` is unavailable.
If you want a reproducible manual tag, pass one explicitly through `_IMAGE_TAG`.

## Required IAM

Cloud Build service account:

- Cloud Run Admin
- Artifact Registry Writer
- Service Account User

Runtime Cloud Run service account:

- Secret Manager Secret Accessor on `aisoftware-studio-smtp-password`

## Verification

1. Push a commit to `main` and confirm the `deploy-prod` trigger starts.
2. Open the Cloud Build logs and verify backend build, backend deploy, frontend build, frontend deploy, in that order.
3. Confirm both Cloud Run services are reachable at their URLs.
4. Confirm the backend uses the frontend origin in `CORS_ALLOWED_ORIGINS`.

## Rollback

Rollback uses the last known-good Cloud Run revision or image tag.

1. Open the service in Cloud Run.
2. Deploy the previous revision or image tag.
3. Re-check the backend health endpoint and the frontend URL.

## Disable Or Delete Triggers

If a trigger should stop running, disable it in Cloud Console or delete it from the Triggers page.

Temporary test triggers should be removed after validation.

## Notes

- Keep secret values out of source control.
- Keep `SMTP_PASSWORD` in Secret Manager only.
- Do not add Terraform, GitHub Actions, databases, auth, CMS, admin panels, payment, queues, or persistent storage.
