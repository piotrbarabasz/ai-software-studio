# Data Model: GitHub-to-GCP CI/CD Automation

This feature does not add business data storage. The model below describes deployment configuration objects and operational entities used by Cloud Build, trigger docs, scripts, and verification steps.

## Deployment Pipeline

Represents one ordered Cloud Build execution.

**Fields**

- `name`: Pipeline name, such as `deploy-prod` for production.
- `branch`: Branch filter or target branch, such as `master`.
- `mode`: `push`, `pull_request`, or `manual`.
- `config_file`: Cloud Build YAML file path.
- `steps`: Ordered release steps for backend then frontend.
- `substitutions`: All project, region, service, URL, secret-name, and runtime values.
- `enabled`: Whether the trigger is active.

**Validation Rules**

- Production pipeline must deploy backend before frontend.
- PR validation pipeline must not deploy.
- Manual mode must not depend on empty `SHORT_SHA`.

## Cloud Build Trigger

Represents a repository-connected automation rule.

**Fields**

- `name`: Trigger name, such as `deploy-prod`.
- `event`: `push` or `pull_request`.
- `branch_regex`: Regular expression for branch matching.
- `base_branch_regex`: Regular expression for PR base branch matching.
- `config_file`: Cloud Build YAML file to execute.
- `substitutions`: Trigger-level values supplied to the build.
- `connection_state`: Whether GitHub is connected to Cloud Build.
- `enabled`: Whether the trigger is active.

**Validation Rules**

- `deploy-prod` must use `^master$`.
- Temporary test trigger may use `^002-gcp-deployment$` but must be clearly temporary.
- PR validation must target `^master$` and must not deploy.

## Trigger Substitution

Represents a build-time or trigger-time value supplied without source edits.

**Fields**

- `_PROJECT_ID`
- `_REGION`
- `_ARTIFACT_REPO`
- `_BACKEND_SERVICE`
- `_FRONTEND_SERVICE`
- `_BACKEND_IMAGE_NAME`
- `_FRONTEND_IMAGE_NAME`
- `_BACKEND_URL`
- `_FRONTEND_URL`
- `_SMTP_PASSWORD_SECRET`
- `_CONTACT_RATE_LIMIT_PER_MINUTE`
- placeholder SMTP and contact email values
- image tag value used when `SHORT_SHA` is available or when manual fallback is needed

**Validation Rules**

- URL substitutions must not be hard-coded as permanent source values.
- Secret names may be stored as substitutions; secret values must not.
- Manual builds must receive a safe image tag when trigger metadata is absent.

## Runtime Configuration

Represents values applied to Cloud Run services or the frontend build.

**Fields**

- `APP_ENV`
- `CORS_ALLOWED_ORIGINS`
- `CONTACT_DELIVERY_MODE`
- `CONTACT_RECIPIENT_EMAIL`
- `CONTACT_FROM_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_USE_TLS`
- `CONTACT_RATE_LIMIT_PER_MINUTE`
- `SMTP_PASSWORD` through Secret Manager binding
- frontend `API_URL`

**Validation Rules**

- Production CORS must point to the deployed frontend origin.
- `SMTP_PASSWORD` must remain a Secret Manager binding.
- `API_URL` must remain configurable and not be hard-coded as a permanent production constant.

## Deployment Target

Represents a Cloud Run service managed by the pipeline.

**Fields**

- `service_name`
- `kind` (`backend` or `frontend`)
- `region`
- `image`
- `public_url`
- `min_instances`
- `allow_unauthenticated`

**Validation Rules**

- Backend and frontend targets must remain independently deployable.
- Production min instances default to `0`.

## Verification Step

Represents a release check after trigger or manual deployment.

**Fields**

- `check_name`
- `target_url`
- `expected_result`
- `trigger_source`
- `rollback_reference`

**Validation Rules**

- Production verification must include Cloud Build logs and Cloud Run URLs.
- Rollback steps must identify the previous good revision or image tag.
