# GCP CI/CD

The production path is the `deploy-prod` Cloud Build trigger on the repository's actual default branch, `master`, using `infra/gcp/cloudbuild.deploy.yaml`. The versioned source of non-secret production invariants is `infra/gcp/production-contract.json`; YAML defaults are intentionally invalid so a trigger with missing substitutions stops at the first preflight step.

## Required trigger configuration

- Event: push
- Branch regex: `^master$`
- Config: `infra/gcp/cloudbuild.deploy.yaml`
- Image tag: `_IMAGE_TAG=$SHORT_SHA` (the literal built-in reference, resolved by Cloud Build)

These substitutions must match contract v1 exactly:

```text
_PROJECT_ID=ai-software-studio-501918
_REGION=europe-central2
_ARTIFACT_REPO=aisoftware-studio
_BACKEND_SERVICE=aisoftware-studio-api
_FRONTEND_SERVICE=aisoftware-studio-web
_BACKEND_IMAGE_NAME=aisoftware-studio-api
_FRONTEND_IMAGE_NAME=aisoftware-studio-web
_PUBLIC_SITE_URL=https://protolume.pl
_PUBLIC_SITE_INDEXING=false
_PUBLIC_LEGAL_CONFIG_SECRET=aisoftware-studio-public-legal-config
_SMTP_PASSWORD_SECRET=aisoftware-studio-smtp-password
_CONTACT_DELIVERY_MODE=email
_APP_ENV=production
_MIN_INSTANCES=0
_IMAGE_TAG=$SHORT_SHA
```

The trigger must additionally contain real operational values for `_BACKEND_URL`, `_CONTACT_RECIPIENT_EMAIL`, `_CONTACT_FROM_EMAIL`, `_SMTP_HOST`, `_SMTP_PORT`, `_SMTP_USERNAME`, `_SMTP_USE_TLS`, and `_CONTACT_RATE_LIMIT_PER_MINUTE`. They must satisfy the preflight diagnostics: HTTPS backend URL; non-example e-mails and SMTP hostname; port `1..65535`; boolean `true`/`false`; rate limit `1..120`. Do not store `SMTP_PASSWORD` itself in substitutions.

## Read-only drift audit

Run either command; the historical `create-triggers` name is retained for compatibility, but it no longer creates or changes anything:

```powershell
.\scripts\gcp\create-triggers.ps1 -ProjectId ai-software-studio-501918
```

```bash
./scripts/gcp/create-triggers.sh --project-id ai-software-studio-501918
```

The audit calls the documented `gcloud builds triggers describe` command, compares the branch, filename, fixed substitutions and formats of operational values, and omits actual secret-reference values from errors. There is deliberately no automated `--apply` path because the repository may be connected through different Cloud Build provider generations.

To repair drift, edit `deploy-prod` in Cloud Console, set the branch/config/substitutions listed above, save, then rerun the audit. This session must not perform that operation.

## Pipeline gates and order

The combined pipeline performs:

1. resolved-value deployment contract preflight;
2. contract tests, backend Ruff/format/pytest, and frontend `npm ci`/lint/format/tests;
3. backend and frontend production Docker builds, including legal-config validation;
4. the backend image's real `CMD` plus HTTP `/health` smoke test;
5. read-only verification that both existing services grant `roles/run.invoker` to `allUsers`;
6. both image pushes;
7. backend deploy, then frontend deploy.

Both images and the legal frontend artifact therefore finish before the first service is deployed. A failed deploy retains the original `gcloud` status and attempts to print the newest Ready=False revision plus application logs.

## IAM bootstrap versus routine deployment

Routine deployment does not mutate IAM. Existing services must already grant `roles/run.invoker` to `allUsers`; otherwise the pipeline stops with the exact bootstrap command. This separates application startup failures from IAM warnings.

For a new installation, `cloudbuild.backend.yaml` and `cloudbuild.frontend.yaml` are explicit manual bootstrap/component pipelines. They run component preflight and tests, require a commit-derived image tag, and retain `--allow-unauthenticated` so the initial services are not accidentally private. After bootstrap, use only the combined routine trigger and its IAM audit.

## Secrets and permissions

- `_SMTP_PASSWORD_SECRET` and `_PUBLIC_LEGAL_CONFIG_SECRET` are names only.
- The backend runtime identity needs Secret Manager access to the SMTP password.
- The Cloud Build identity needs Secret Manager access to the public legal JSON because it is validated and prerendered during the frontend build.
- Cloud Build also needs Artifact Registry write, Cloud Run deploy, service-account use, IAM-policy read, revision read, and log-entry read permissions. Routine deployment does not need to set service IAM policy.

No deployment, trigger update, IAM mutation, secret change, commit, or push is performed by these repository checks.
