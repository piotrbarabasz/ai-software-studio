# Research: GCP Deployment for AISoftware Studio MVP

## Decision: Use Cloud Run for both frontend and backend

**Rationale**: The feature explicitly requires Google Cloud Run for the FastAPI backend and Angular frontend. Cloud Run supports independent services, containerized deployment, public HTTPS endpoints, environment variables, Secret Manager integration, and min instances `0` for low fixed cost.

**Alternatives considered**: Cloud Storage/Firebase Hosting for frontend, Compute Engine, GKE. These were rejected for this feature because the requirement standardizes on Cloud Run for both services and the MVP does not need a separate hosting platform or cluster.

## Decision: Use `europe-central2` as the default region with override

**Rationale**: The feature requires `europe-central2` by default. Scripts and docs will accept a `Region` parameter/substitution so the same deployment files can be reused elsewhere.

**Alternatives considered**: Hard-coded region only, global-region abstraction. Hard-coding blocks reuse; abstraction beyond a parameter adds unnecessary complexity.

## Decision: Use Artifact Registry for Docker images

**Rationale**: Artifact Registry is the current GCP container artifact service and integrates directly with Cloud Build and Cloud Run deployment commands.

**Alternatives considered**: Container Registry, external registries. Container Registry is legacy for new work; external registries add credentials and operational steps that are not needed.

## Decision: Use Cloud Build YAML files, not GitHub Actions

**Rationale**: The feature requires Cloud Build YAML files for repeatable build/deploy and explicitly excludes GitHub Actions. YAML configs support manual `gcloud builds submit` now and Cloud Build triggers later.

**Alternatives considered**: Manual Docker/gcloud command-only deployment, GitHub Actions. Command-only deployment is less repeatable; GitHub Actions is out of scope.

## Decision: Use Secret Manager for `SMTP_PASSWORD`

**Rationale**: The constitution requires secrets outside the repo, and the feature requires Secret Manager for `SMTP_PASSWORD` or any sensitive value. Cloud Run can bind secrets as runtime environment values without committing them.

**Alternatives considered**: Plain Cloud Run environment variable, `.env` file, service account JSON key. Plain env values and `.env` files increase leakage risk; service account keys are explicitly excluded.

## Decision: Keep non-sensitive configuration in Cloud Run environment variables

**Rationale**: Values such as `APP_ENV`, `CORS_ALLOWED_ORIGINS`, `CONTACT_DELIVERY_MODE`, email addresses, SMTP host/port/username, TLS flag, and rate limit are deployment configuration but not secret values. Cloud Run environment variables make these explicit per service.

**Alternatives considered**: Config files baked into images, secrets for all values. Baked config reduces portability; using secrets for all non-sensitive values adds unnecessary operational burden.

## Decision: Backend production container runs Uvicorn on `$PORT`

**Rationale**: Cloud Run injects `PORT`; the backend must listen on that value. Running Uvicorn directly against `app.main:app` is sufficient for this MVP and matches the existing FastAPI app.

**Alternatives considered**: Gunicorn with Uvicorn workers, development reload server. Gunicorn may be useful later under higher load but is unnecessary for the MVP; reload servers are not production-appropriate.

## Decision: Frontend production container uses Nginx on port `8080`

**Rationale**: Nginx is a simple static runtime for Angular build output, supports SPA fallback, supports safe cache headers, and can listen on Cloud Run's expected port. It avoids running Angular's development server in production.

**Alternatives considered**: `ng serve`, Node/Express static server. `ng serve` is explicitly excluded for production; Node/Express adds runtime code not needed for static assets.

## Decision: Configure frontend API URL at build time or deployment-time generated runtime config

**Rationale**: The existing Angular app reads `environment.apiUrl`; the feature requires configurable production API URL and no real hard-coded production URL. A Docker build arg that writes a safe production value during image build is straightforward. If implementation finds runtime config cleaner, it must keep `index.html`/config caching safe and tests updated.

**Alternatives considered**: Hard-code Cloud Run backend URL, require source edits per deployment. Both violate the requirement to avoid real URLs in source and support repeatable deployment.

## Decision: Production CORS must list the deployed frontend URL

**Rationale**: The backend must allow the deployed frontend and must not use wildcard origins in production. Documentation needs to explain deployment ordering because the frontend URL may not be known until after first deploy.

**Alternatives considered**: Wildcard CORS, browser proxying through frontend service. Wildcard production CORS violates security requirements; proxying adds coupling and complexity.

## Decision: Keep custom domain mapping manual and documented

**Rationale**: The feature asks for custom domain mapping as a later manual step, not automation. This keeps first deployment focused on Cloud Run service URLs.

**Alternatives considered**: Automated domain mapping, load balancer/CDN. These are out of scope and increase setup complexity.

## Decision: Default Cloud Run min instances to `0`

**Rationale**: The MVP should avoid fixed cost. Min instances `0` aligns with low-traffic marketing-site economics while accepting potential cold starts.

**Alternatives considered**: Min instances `1`. This reduces cold starts but creates fixed cost and was explicitly rejected by the cost posture.
