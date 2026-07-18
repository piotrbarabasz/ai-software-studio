# GCP CI/CD

The production path is the `deploy-prod` Cloud Build trigger on `master`, using `infra/gcp/cloudbuild.deploy.yaml`. The versioned source of non-secret production invariants is `infra/gcp/production-contract.json`.

Cloud Run and Artifact Registry deploy in `europe-central2`. The existing Cloud Build trigger is located in `global`. These are independent settings: never use the deployment region as the trigger location.

## Production trigger

- Project: `ai-software-studio-501918`
- Location: `global`
- ID: `901333cb-1c13-4929-90e5-6df070eb647e`
- Name: `deploy-prod`
- Event: push
- Branch regex: `^master$`
- Config: `infra/gcp/cloudbuild.deploy.yaml`

The routine pipeline uses Cloud Build's built-in `$SHORT_SHA` directly. The trigger must not define `_IMAGE_TAG`.

Repository defaults own project, deployment region, Artifact Registry, service and image names, backend URL, public origin, CORS, indexing, Secret Manager reference names, rate limit, delivery mode, environment and minimum instance count. A trigger may temporarily override those values during migration, but every override must exactly match `production-contract.json` or preflight and the read-only audit fail.

## Minimal trigger substitutions

Only these environment-specific, non-secret values are required in the target trigger:

```text
_CONTACT_RECIPIENT_EMAIL
_CONTACT_FROM_EMAIL
_SMTP_HOST
_SMTP_PORT
_SMTP_USERNAME
_SMTP_USE_TLS
```

Use the real production configuration. Do not store `SMTP_PASSWORD` itself in substitutions; the repository-owned `_SMTP_PASSWORD_SECRET` default is only a Secret Manager reference name.

## Read-only drift audit

The historical `create-triggers` filename is retained for compatibility. Both wrappers only audit and never create, update or delete a trigger:

```powershell
.\scripts\gcp\create-triggers.ps1 `
  -ProjectId ai-software-studio-501918 `
  -TriggerLocation global `
  -TriggerId 901333cb-1c13-4929-90e5-6df070eb647e
```

```bash
./scripts/gcp/create-triggers.sh \
  --project-id ai-software-studio-501918 \
  --trigger-location global \
  --trigger-id 901333cb-1c13-4929-90e5-6df070eb647e
```

Use `--trigger-name deploy-prod` (or `-TriggerName deploy-prod`) instead of the ID to require one exact name match. The audit distinguishes not found, permission denied, authentication failure, zero exact name matches and multiple exact name matches. It does not print secret-reference values in drift diagnostics.

## Manual migration of the active trigger

Perform this migration manually in Cloud Console. Do not automate it from this repository.

1. Open project `ai-software-studio-501918`, trigger location `global`.
2. Select ID `901333cb-1c13-4929-90e5-6df070eb647e`, name `deploy-prod`.
3. Keep branch `^master$` and config `infra/gcp/cloudbuild.deploy.yaml`.
4. Set `_PUBLIC_SITE_URL=https://protolume.pl` with no trailing slash.
5. Set `_PUBLIC_SITE_INDEXING=false`.
6. Set `_PUBLIC_LEGAL_CONFIG_SECRET=aisoftware-studio-public-legal-config`.
7. Set `_APP_ENV=production`.
8. Set `_CONTACT_DELIVERY_MODE=email`.
9. Set `_MIN_INSTANCES=0`.
10. Remove `_FRONTEND_URL`.
11. Remove `_IMAGE_TAG`; the YAML now uses built-in `$SHORT_SHA` directly.
12. Supply the real `_CONTACT_RECIPIENT_EMAIL`, `_CONTACT_FROM_EMAIL`, `_SMTP_HOST`, `_SMTP_PORT`, `_SMTP_USERNAME` and `_SMTP_USE_TLS` values.
13. Save the trigger manually and rerun the read-only audit.

The listed repository-owned overrides are safe during migration only at their exact contract values. After the migrated trigger is verified, they may all be removed from the trigger to reach the minimal substitution set above; the YAML defaults remain authoritative.

## Manual submissions

The component configs `cloudbuild.backend.yaml` and `cloudbuild.frontend.yaml` retain custom `_IMAGE_TAG` because they are manual pipelines. Their default `required-commit-sha` is valid Docker syntax but deliberately fails deployment preflight. Pass an actual 7-64 character lowercase hexadecimal commit ID.

If `cloudbuild.deploy.yaml` is submitted manually, Cloud Build has no trigger commit context. Resolve a commit locally and pass the built-in substitution explicitly, for example in PowerShell:

```powershell
$shortSha = git rev-parse --short=12 HEAD
$substitutions = @(
  "SHORT_SHA=$shortSha"
  "_CONTACT_RECIPIENT_EMAIL=$env:CONTACT_RECIPIENT_EMAIL"
  "_CONTACT_FROM_EMAIL=$env:CONTACT_FROM_EMAIL"
  "_SMTP_HOST=$env:SMTP_HOST"
  "_SMTP_PORT=$env:SMTP_PORT"
  "_SMTP_USERNAME=$env:SMTP_USERNAME"
  "_SMTP_USE_TLS=$env:SMTP_USE_TLS"
) -join ','
gcloud builds submit --config=infra/gcp/cloudbuild.deploy.yaml --substitutions=$substitutions .
```

Set those six environment variables to the real production values before submission. Do not add a custom `_IMAGE_TAG` fallback.

## Pipeline gates

Before the first deploy, the combined pipeline runs contract validation and tests, backend and frontend checks, builds both images, validates the frontend legal artifact, smokes the backend image through `/health`, audits existing public Cloud Run IAM, and pushes both images. It then deploys backend followed by frontend. Routine deployment does not mutate IAM.

No deployment, trigger update, IAM mutation, secret change, commit or push is performed by the repository audit.
