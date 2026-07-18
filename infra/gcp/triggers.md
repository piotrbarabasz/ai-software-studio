# Cloud Build trigger contract

`deploy-prod` is a push trigger for `^master$` and `infra/gcp/cloudbuild.deploy.yaml`. Its fixed substitutions are the `invariants` in `production-contract.json`, mapped to names prefixed with `_`, except that backend CORS is deliberately derived from `_PUBLIC_SITE_URL`. `_IMAGE_TAG` must be the literal `$SHORT_SHA`.

The required operational substitutions are `_BACKEND_URL`, `_CONTACT_RECIPIENT_EMAIL`, `_CONTACT_FROM_EMAIL`, `_SMTP_HOST`, `_SMTP_PORT`, `_SMTP_USERNAME`, `_SMTP_USE_TLS`, and `_CONTACT_RATE_LIMIT_PER_MINUTE`. They must be actual non-example production configuration, not templates or secret values.

Audit the active trigger without changing GCP:

```powershell
.\scripts\gcp\create-triggers.ps1 -ProjectId ai-software-studio-501918
```

On drift, update the trigger in Cloud Console to the exact values documented in `docs/gcp-cicd.md`, then rerun the audit. The repository intentionally provides no cross-provider automatic update operation.

The PR trigger targets base branch `^master$`, uses `infra/gcp/cloudbuild.pr-checks.yaml`, and never deploys. Remove obsolete temporary deployment triggers after verifying the production trigger.
