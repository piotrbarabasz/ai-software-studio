# GCP Runbook

Use this runbook after the first production deployment of AISoftware Studio.

## Release Checklist

- Confirm deployment contract preflight and its CLI tests passed.
- Confirm backend Ruff, format, pytest, image build and real-container `/health` smoke passed.
- Confirm frontend `npm ci`, lint, format, tests, legal checks and production image build passed.
- Confirm `npm run validate:site:production` passed with the final HTTPS public origin and API URL.
- Confirm `npm run validate:legal:production` and `npm run validate:artifact:production` passed with the same verified public privacy JSON.
- Confirm no real secrets were committed and secret inputs remain reference names.
- Confirm Cloud Run min instances remain `0`.
- Confirm CORS and the public site URL are both exactly `https://protolume.pl`.
- Confirm the production trigger used `infra/gcp/cloudbuild.deploy.yaml`.
- Confirm the PR validation trigger used `infra/gcp/cloudbuild.pr-checks.yaml` and did not deploy.

## Smoke Tests

1. Open the frontend on the final public origin.
2. Request `GET /health` on the backend Cloud Run URL.
3. Confirm browser requests from the frontend origin are allowed by CORS.
4. Confirm an unapproved origin is rejected by CORS.
5. Submit a safe contact request through the deployed frontend/backend path.
6. Open `/polityka-prywatnosci`, compare it with the approved JSON, and verify that no local-test value, `WPISZ`, `example` or `LEGAL_REQUIRED` marker is visible.
7. Verify canonical, `og:url`, JSON-LD, `/robots.txt` and `/sitemap.xml` use only the final public origin.

## Rollback

- Roll back by deploying the previous known-good Cloud Run revision or previous image tag.
- Prefer reverting to the last successful Artifact Registry image.
- Confirm the backend health endpoint and frontend URL after rollback.
- Disable the offending trigger before investigating repeated bad deployments.

## Cloud Run Logs

- Check backend logs for startup failures, CORS issues, secret binding failures, and contact delivery failures.
- Check frontend logs for Nginx startup issues or missing assets.
- Do not expect sensitive payloads to appear in logs.

## Trigger Troubleshooting

- Open the Cloud Build logs and confirm the trigger fired on the intended branch.
- Confirm the production branch is `master`.
- Confirm the temporary test branch `002-gcp-deployment` is disabled or deleted after testing.
- Confirm the PR validation trigger points to `infra/gcp/cloudbuild.pr-checks.yaml` and does not deploy.
- If a trigger misfires repeatedly, disable it in Cloud Console before changing the build config.

## Common Failures

- Missing `SMTP_PASSWORD` secret binding
- Trigger drift in `_PUBLIC_SITE_URL`, `_APP_ENV`, `_PUBLIC_SITE_INDEXING`, secret names, or `_IMAGE_TAG`
- Wrong public frontend origin in `CORS_ALLOWED_ORIGINS` or `PUBLIC_SITE_URL`
- Missing Cloud Build or Artifact Registry permissions
- Missing required GCP APIs
- Incorrect API URL in the frontend build
- Legal JSON secret granted only to the Cloud Run runtime account instead of the Cloud Build service account
- Updated legal secret version without a new frontend image build and Cloud Run revision

## Secret Rotation

- Add a new Secret Manager version for `SMTP_PASSWORD`.
- Redeploy the backend so the new secret version is consumed.
- Do not place the rotated secret in source control or documentation.

## CORS Troubleshooting

- Verify the backend `CORS_ALLOWED_ORIGINS` is exactly `https://protolume.pl`; a technical `run.app` URL is never a production CORS origin.
- Confirm the backend does not use wildcard origins in production.
- Redeploy the backend after any frontend URL change.

## Contact Form Troubleshooting

- Confirm the backend health endpoint is reachable.
- Confirm the backend deployment has valid SMTP environment variables and secret binding.
- Confirm the frontend API URL points to the deployed backend.
- Confirm no regression changed the existing contact API contract.

## Cloud Run URL Verification

After any deployment, verify the final public origin and the backend URL configured for that release.
Use the backend URL for health checks and the final public origin for browser validation. See [public-origin-deployment.md](public-origin-deployment.md) for custom-domain and certificate checks.

## Local Recovery Checks

If the deployment seems broken, re-run the local validation script and the container smoke tests before changing production settings:

```powershell
.\scripts\gcp\preflight.ps1 `
  -PublicLegalConfigPath "C:\bezpieczna-lokalizacja\public-legal.json" `
  -ApiUrl $env:BACKEND_URL `
  -PublicSiteUrl "https://protolume.pl" `
  -EnableIndexing $false
```

Build and smoke the actual backend image from the repository root:

```powershell
docker build -f backend/Dockerfile -t aisoftware-studio-api:local .
$env:DEPLOY_APP_ENV = 'production'
$env:DEPLOY_CORS_ALLOWED_ORIGINS = 'https://protolume.pl'
$env:DEPLOY_CONTACT_DELIVERY_MODE = 'email'
$env:DEPLOY_CONTACT_RECIPIENT_EMAIL = 'kontakt@protolume.pl'
$env:DEPLOY_CONTACT_FROM_EMAIL = 'formularz@protolume.pl'
$env:DEPLOY_SMTP_HOST = 'smtp.protolume.pl'
$env:DEPLOY_SMTP_PORT = '587'
$env:DEPLOY_SMTP_USERNAME = 'formularz@protolume.pl'
$env:DEPLOY_SMTP_USE_TLS = 'true'
$env:DEPLOY_CONTACT_RATE_LIMIT_PER_MINUTE = '30'
bash scripts/gcp/smoke-backend-image.sh aisoftware-studio-api:local
```

To reproduce the former startup failure, run the image with `APP_ENV=production` and `CORS_ALLOWED_ORIGINS` set to the old frontend `run.app` origin. The process must exit quickly with a `CORS_ALLOWED_ORIGINS` validation error. The smoke command above must instead reach `/health` with HTTP 200.
