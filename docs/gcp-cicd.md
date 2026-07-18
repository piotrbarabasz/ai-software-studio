# GCP CI/CD

The remote default branch was verified with `git ls-remote --symref origin HEAD` and is `master`. The production path is the `deploy-prod` Cloud Build trigger on push to `master`, using `infra/gcp/cloudbuild.deploy.yaml`. The versioned source of non-secret production invariants is `infra/gcp/production-contract.json`.

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

Repository defaults own project, deployment region, Artifact Registry, service and image names, backend URL, public origin, CORS, indexing, public sales/privacy addresses, Secret Manager reference names, rate limit, delivery mode, environment and minimum instance count. A trigger may temporarily override those values during migration, but every override must exactly match `production-contract.json` or preflight and the read-only audit fail.

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

## Pull-request trigger

- Name: `pr-checks`
- Event: pull request
- Base branch regex: `^master$`
- Config: `infra/gcp/cloudbuild.pr-checks.yaml`
- Trigger substitutions: none
- Secrets: none

The PR config performs backend and frontend checks plus a development preview build. Its repository-owned `_PUBLIC_SITE_INDEXING=false` preflight fails if indexing is overridden. It contains no Docker push, Cloud Run deploy, or production legal-secret access, so a pull request cannot deploy.

## Read-only drift audit

The historical `create-triggers` filename is retained for compatibility. Both wrappers only audit and never create, update or delete a trigger:

```powershell
.\scripts\gcp\create-triggers.ps1 `
  -ProjectId ai-software-studio-501918 `
  -TriggerLocation global `
  -TriggerId 901333cb-1c13-4929-90e5-6df070eb647e
```

```bash
bash scripts/gcp/create-triggers.sh \
  --project-id ai-software-studio-501918 \
  --trigger-location global \
  --trigger-id 901333cb-1c13-4929-90e5-6df070eb647e
```

Use `--trigger-name deploy-prod` (or `-TriggerName deploy-prod`) instead of the ID to require one exact name match. The audit distinguishes not found, permission denied, authentication failure, zero exact name matches and multiple exact name matches. It does not print secret-reference values in drift diagnostics.

Audit the PR trigger with the same read-only wrappers:

```powershell
.\scripts\gcp\create-triggers.ps1 `
  -ProjectId ai-software-studio-501918 `
  -TriggerLocation global `
  -TriggerKind pull-request `
  -TriggerName pr-checks
```

```bash
bash scripts/gcp/create-triggers.sh \
  --project-id ai-software-studio-501918 \
  --trigger-location global \
  --trigger-kind pull-request \
  --trigger-name pr-checks
```

## Manual migration of the active trigger

Perform this migration manually in Cloud Console. Do not automate it from this repository.

1. Open project `ai-software-studio-501918`, trigger location `global`.
2. Select ID `901333cb-1c13-4929-90e5-6df070eb647e`, name `deploy-prod`.
3. Keep branch `^master$` and config `infra/gcp/cloudbuild.deploy.yaml`.
4. Set `_PUBLIC_SITE_URL=https://protolume.pl` with no trailing slash.
5. Set `_PUBLIC_SITE_INDEXING=false`.
6. Set `_PUBLIC_SALES_EMAIL=kontakt@protolume.pl` and `_PUBLIC_PRIVACY_EMAIL=kontakt@protolume.pl` if migration overrides are still present.
7. Set `_PUBLIC_LEGAL_CONFIG_SECRET=aisoftware-studio-public-legal-config`.
8. Set `_APP_ENV=production`.
9. Set `_CONTACT_DELIVERY_MODE=email`.
10. Set `_MIN_INSTANCES=0`.
11. Remove `_FRONTEND_URL`.
12. Remove `_IMAGE_TAG`; the YAML now uses built-in `$SHORT_SHA` directly.
13. Supply the real `_CONTACT_RECIPIENT_EMAIL`, `_CONTACT_FROM_EMAIL`, `_SMTP_HOST`, `_SMTP_PORT`, `_SMTP_USERNAME` and `_SMTP_USE_TLS` values.
14. Save the trigger manually and rerun the read-only audit.

Then update or create the PR validation trigger manually:

1. Use name `pr-checks` and location `global`.
2. Select the GitHub pull-request event, not push.
3. Set the base branch regex to exactly `^master$`.
4. Set the config path to exactly `infra/gcp/cloudbuild.pr-checks.yaml`.
5. Remove every trigger substitution and every Secret Manager binding.
6. Keep the trigger enabled, save it, and run the pull-request audit shown above.

Do not point either trigger at `cloudbuild.backend.yaml` or `cloudbuild.frontend.yaml`. Those are non-deploying component-image diagnostics. Ensure no second push trigger still deploys an individual service or uses a `main` regex.

The listed repository-owned overrides are safe during migration only at their exact contract values. After the migrated trigger is verified, they may all be removed from the trigger to reach the minimal substitution set above; the YAML defaults remain authoritative.

## Manual submissions

The component configs `cloudbuild.backend.yaml` and `cloudbuild.frontend.yaml` retain custom `_IMAGE_TAG` because they are manual image-only pipelines. Their default `required-commit-sha` is valid Docker syntax but deliberately fails preflight. Pass an actual 7-64 character lowercase hexadecimal commit ID. They can publish one diagnostic image but cannot deploy a service.

For a manual production release, use the guarded PowerShell or Bash wrapper. Both reject a dirty tree, derive the image tag from the current commit and submit the combined config:

```powershell
.\scripts\gcp\deploy-production.ps1 `
  -ProjectId ai-software-studio-501918 `
  -ContactRecipientEmail $env:CONTACT_RECIPIENT_EMAIL `
  -ContactFromEmail $env:CONTACT_FROM_EMAIL `
  -SmtpHost $env:SMTP_HOST `
  -SmtpPort $env:SMTP_PORT `
  -SmtpUsername $env:SMTP_USERNAME `
  -SmtpUseTls $env:SMTP_USE_TLS
```

```bash
bash scripts/gcp/deploy-production.sh \
  --project-id ai-software-studio-501918 \
  --contact-recipient-email "$CONTACT_RECIPIENT_EMAIL" \
  --contact-from-email "$CONTACT_FROM_EMAIL" \
  --smtp-host "$SMTP_HOST" \
  --smtp-port "$SMTP_PORT" \
  --smtp-username "$SMTP_USERNAME" \
  --smtp-use-tls "$SMTP_USE_TLS"
```

Set those six environment variables to the real non-secret production values before submission. Do not pass SMTP password or legal JSON to either wrapper, and do not add a custom `_IMAGE_TAG` fallback.

## Pipeline gates

The combined pipeline order is:

1. Validate the resolved production contract, including exact `https://protolume.pl`, CORS, noindex and placeholder rejection; validate the public legal JSON from its Secret Manager reference without printing its value.
2. Run deployment-contract tests and backend install, Ruff, format check and pytest.
3. Run frontend `npm ci`, format check, lint, tests and a production build with the validated legal artifact.
4. Build both SHA-tagged Docker images. Neither build begins before all test suites pass.
5. Smoke the backend image locally through `/health` and `/ready`, audit existing Cloud Run public IAM, then push both images explicitly.
6. Deploy the backend only after both pushes succeed.
7. Deploy the frontend only after the backend deploy succeeds.
8. Run `scripts/gcp/smoke_deployment.py` with GET and CORS OPTIONS only. It checks API health/readiness, the home page and all public routes, a real 404, robots, sitemap, canonical URLs, `noindex, follow`, and CORS from `https://protolume.pl`. It never sends the contact form.

The production YAML has no top-level post-step `images` push, so a publish cannot be deferred until after deployment. Routine deployment does not mutate IAM.

No deployment, trigger update, IAM mutation, secret change, commit or push is performed by the repository audit.
