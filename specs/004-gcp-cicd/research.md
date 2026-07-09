# Research: GitHub-to-GCP CI/CD Automation

## Decision: Use Cloud Build triggers connected to GitHub, not GitHub Actions

**Rationale**: The feature explicitly requires Cloud Build triggers and excludes GitHub Actions. Cloud Build keeps the deployment path inside the existing GCP toolchain and matches the current manual Cloud Build configs.

**Alternatives considered**: GitHub Actions, manual-only `gcloud builds submit`, hybrid trigger orchestration. GitHub Actions is out of scope; manual-only deployment would not satisfy the automation requirement.

## Decision: Make `main` the production branch and keep `002-gcp-deployment` only for temporary trigger testing

**Rationale**: The clarified scope names `main` as the production branch and treats `002-gcp-deployment` as a temporary branch only for testing trigger behavior.

**Alternatives considered**: Using the existing deployment branch as production, or allowing both branches to deploy. Both would create ambiguity and weaken release safety.

## Decision: Use one combined production pipeline file for sequential backend-then-frontend deployment

**Rationale**: A single `infra/gcp/cloudbuild.deploy.yaml` file keeps the production release path explicit and guarantees ordering: backend first, then frontend.

**Alternatives considered**: Separate deploy triggers for backend and frontend, or a parallel pipeline. Separate triggers make ordering harder to reason about; parallel deploys would not respect the backend-first requirement.

## Decision: Keep `infra/gcp/cloudbuild.pr-checks.yaml` as the PR validation path

**Rationale**: The file already exists and is the natural place to keep the no-deploy validation workflow. This preserves the manual deployment configs and keeps PR checks isolated from deployment behavior.

**Alternatives considered**: Creating a new PR check file or combining checks into the deploy pipeline. Reusing the existing file avoids churn and keeps intent clear.

## Decision: Use substitutions for all project-specific values, including `_BACKEND_URL` and `_FRONTEND_URL`

**Rationale**: The feature requires values such as project ID, region, service names, URLs, rate limit, and secret name to be configurable without source edits. Using substitutions keeps the YAML reusable across environments.

**Alternatives considered**: Hard-coded URLs, environment-specific branches, or editing source files per deployment. Those approaches would violate the no-hardcoded-production-values requirement.

## Decision: Keep `SMTP_PASSWORD` in Secret Manager and use non-sensitive substitutions for the rest of the runtime config

**Rationale**: The backend already reads settings from environment variables, and Cloud Run supports secret bindings. This keeps sensitive values out of the repo while leaving operational values explicit.

**Alternatives considered**: Committing secrets, passing passwords through docs/scripts, or using `.env` files in deployment contexts. Those options would violate the security requirements.

## Decision: Make manual builds safe with an explicit fallback image tag

**Rationale**: Triggered builds can use `SHORT_SHA`, but manual builds need a non-empty tag even when that built-in value is unavailable. A user-controlled fallback tag or documented manual tag parameter keeps manual deployment usable.

**Alternatives considered**: Relying on `SHORT_SHA` everywhere, or allowing empty tags. Both can fail for manual builds and would weaken the deployment fallback.

## Decision: Prefer Google Cloud Console for one-time GitHub connection, then offer optional scripts

**Rationale**: Repository connection commonly requires interactive authorization. Documenting the console as the primary path avoids false promises of fully non-interactive setup, while scripts can still help once the connection exists.

**Alternatives considered**: Fully scripted GitHub connection, or no scripts at all. Full scripting is usually blocked by authorization requirements; no scripts would reduce operator convenience.

## Decision: Keep existing manual deployment scripts and docs valid

**Rationale**: The feature must improve operations without removing the fallback path. Existing deployment configs remain the way to do manual releases and recover from trigger issues.

**Alternatives considered**: Replacing manual deploy files entirely with the combined pipeline. That would remove a useful rollback and troubleshooting path.

## Decision: Use Cloud Run min instances `0` by default

**Rationale**: The MVP favors low fixed cost and accepts cold starts. The clarified scope explicitly requests `0` by default.

**Alternatives considered**: Setting min instances to `1` for lower latency. That adds fixed cost and conflicts with the approved deployment posture.
