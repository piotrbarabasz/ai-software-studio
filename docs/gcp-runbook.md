# GCP Runbook

Use this runbook after the first production deployment of AISoftware Studio.

## Release Checklist

- Confirm the backend build passed.
- Confirm the frontend build passed.
- Confirm no real secrets or project IDs were committed.
- Confirm Cloud Build configs use placeholders and substitutions.
- Confirm Cloud Run min instances remain `0`.
- Confirm the deployed backend URL is available for CORS.

## Smoke Tests

1. Open the frontend Cloud Run URL.
2. Request `GET /health` on the backend Cloud Run URL.
3. Confirm browser requests from the frontend origin are allowed by CORS.
4. Confirm an unapproved origin is rejected by CORS.
5. Submit a safe contact request through the deployed frontend/backend path.

## Rollback

- Roll back by deploying the previous known-good Cloud Run revision or previous image tag.
- Prefer reverting to the last successful Artifact Registry image.
- Confirm the backend health endpoint and frontend URL after rollback.

## Cloud Run Logs

- Check backend logs for startup failures, CORS issues, secret binding failures, and contact delivery failures.
- Check frontend logs for Nginx startup issues or missing assets.
- Do not expect sensitive payloads to appear in logs.

## Common Failures

- Missing `SMTP_PASSWORD` secret binding
- Wrong frontend URL in `CORS_ALLOWED_ORIGINS`
- Missing Cloud Build or Artifact Registry permissions
- Missing required GCP APIs
- Incorrect API URL in the frontend build

## Secret Rotation

- Add a new Secret Manager version for `SMTP_PASSWORD`.
- Redeploy the backend so the new secret version is consumed.
- Do not place the rotated secret in source control or documentation.

## CORS Troubleshooting

- Verify the backend `CORS_ALLOWED_ORIGINS` value matches the exact deployed frontend origin.
- Confirm the backend does not use wildcard origins in production.
- Redeploy the backend after any frontend URL change.

## Contact Form Troubleshooting

- Confirm the backend health endpoint is reachable.
- Confirm the backend deployment has valid SMTP environment variables and secret binding.
- Confirm the frontend API URL points to the deployed backend.
- Confirm no regression changed the existing contact API contract.

## Local Recovery Checks

If the deployment seems broken, re-run the local validation script and the container smoke tests before changing production settings:

```powershell
.\scripts\gcp\preflight.ps1
```
