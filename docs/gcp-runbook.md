# GCP Runbook

Use this runbook after the first production deployment of Protolume.

## Release Checklist

- Confirm deployment contract preflight and its CLI tests passed.
- Confirm backend install, Ruff, format, pytest, image build and real-container `/health` plus `/ready` smoke passed.
- Confirm frontend `npm ci`, format, lint, tests, legal checks, production build and image build passed.
- Confirm both SHA-tagged images were pushed before `backend-deploy` started.
- Confirm `npm run validate:site:production` passed with the final HTTPS public origin and API URL.
- Confirm `npm run validate:legal:production` and `npm run validate:artifact:production` passed with the same verified public privacy JSON.
- Confirm no real secrets were committed and secret inputs remain reference names.
- Confirm Cloud Run min instances remain `0`.
- Confirm CORS and the public site URL are both exactly `https://protolume.pl`.
- Confirm the production trigger used `infra/gcp/cloudbuild.deploy.yaml`.
- Confirm the `pr-checks` trigger used base regex `^master$`, had no substitutions or secrets, used `infra/gcp/cloudbuild.pr-checks.yaml`, remained noindex and did not deploy.

## Smoke Tests

The pipeline runs `scripts/gcp/smoke_deployment.py` after the frontend deploy. It makes only GET requests and one CORS OPTIONS request; it never sends a POST or submits the contact form.

It verifies:

1. Backend `GET /health` and `GET /ready` return their expected ready states.
2. The home page and every route in `frontend/src/prerender-routes.txt` except `/404` return HTTP 200.
3. An unknown route returns a real HTTP 404 with `X-Robots-Tag: noindex, follow`.
4. `robots.txt` and `sitemap.xml` use only `https://protolume.pl` and list all public routes.
5. Every public page has the exact Protolume canonical and `noindex, follow` in HTML and headers.
6. CORS preflight OPTIONS for `/api/contact` allows exactly the origin `https://protolume.pl` and POST. No contact payload is sent.

Review `/polityka-prywatnosci` separately against the approved public JSON. Do not turn deployment smoke into a real form submission.

## Rollback

Use the commit SHA from the previous successful combined build. Verify that both images exist before changing either service, then roll back backend followed by frontend:

```powershell
$previousSha = '<PREVIOUS_SUCCESSFUL_COMMIT_SHA>'
$registry = 'europe-central2-docker.pkg.dev/ai-software-studio-501918/aisoftware-studio'
$backendImage = "$registry/aisoftware-studio-api:${previousSha}"
$frontendImage = "$registry/aisoftware-studio-web:${previousSha}"

gcloud artifacts docker images describe $backendImage --project ai-software-studio-501918
gcloud artifacts docker images describe $frontendImage --project ai-software-studio-501918

gcloud run deploy aisoftware-studio-api `
  --project ai-software-studio-501918 `
  --region europe-central2 `
  --image $backendImage

gcloud run deploy aisoftware-studio-web `
  --project ai-software-studio-501918 `
  --region europe-central2 `
  --image $frontendImage

python scripts/gcp/smoke_deployment.py `
  --backend-url https://aisoftware-studio-api-175725977490.europe-central2.run.app `
  --site-url https://protolume.pl `
  --expect-noindex
```

Changing only `--image` preserves the service's existing environment and Secret Manager binding. If the bad trigger is firing repeatedly, disable it manually before rollback. A known-good existing Cloud Run revision may instead be restored with `gcloud run services update-traffic`; always restore and verify both services as one release pair.

## Cloud Run Logs

- Check backend logs for startup failures, CORS issues, secret binding failures, and contact delivery failures.
- Check frontend logs for Nginx startup issues or missing assets.
- Do not expect sensitive payloads to appear in logs.

## Trigger Troubleshooting

- Open the Cloud Build logs and confirm the trigger fired on the intended branch.
- Confirm `git ls-remote --symref origin HEAD` still reports `refs/heads/master` and both trigger regexes are exactly `^master$`.
- Confirm the temporary test branch `002-gcp-deployment` is disabled or deleted after testing.
- Confirm the `pr-checks` pull-request trigger points to `infra/gcp/cloudbuild.pr-checks.yaml`, has no substitutions, and does not deploy.
- If a trigger misfires repeatedly, disable it in Cloud Console before changing the build config.

## Common Failures

- Missing `SMTP_PASSWORD` secret binding
- Trigger drift that overrides repository-owned `_PUBLIC_SITE_URL`, `_APP_ENV`, `_PUBLIC_SITE_INDEXING` or secret reference names; a historical `_IMAGE_TAG` must be removed
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
$env:DEPLOY_CONTACT_RATE_LIMIT_PER_MINUTE = '30'
$requiredOperatorValues = @(
  'DEPLOY_CONTACT_RECIPIENT_EMAIL',
  'DEPLOY_CONTACT_FROM_EMAIL',
  'DEPLOY_SMTP_HOST',
  'DEPLOY_SMTP_PORT',
  'DEPLOY_SMTP_USERNAME',
  'DEPLOY_SMTP_USE_TLS'
)
foreach ($name in $requiredOperatorValues) {
  if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name))) {
    throw "Set the real production value for $name before the smoke test."
  }
}
bash scripts/gcp/smoke-backend-image.sh aisoftware-studio-api:local
```

To reproduce the former startup failure, run the image with `APP_ENV=production` and `CORS_ALLOWED_ORIGINS` set to the old frontend `run.app` origin. The process must exit quickly with a `CORS_ALLOWED_ORIGINS` validation error. The smoke command above must instead reach `/health` with HTTP 200.
