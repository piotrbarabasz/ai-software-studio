# Backend

FastAPI contact intake API for the public Protolume marketing website.

## Setup

```bash
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.lock
.\.venv\Scripts\python.exe -m pip install --no-deps --no-build-isolation -e .
```

## Environment Variables

```text
APP_ENV=development
CORS_ALLOWED_ORIGINS=http://localhost:4200
CONTACT_DELIVERY_MODE=email
CONTACT_RECIPIENT_EMAIL=recipient@fixtures.protolume.pl
CONTACT_FROM_EMAIL=sender@fixtures.protolume.pl
SMTP_HOST=smtp.fixtures.protolume.pl
SMTP_PORT=587
SMTP_USERNAME=fixture-user
SMTP_PASSWORD=fixture-password
SMTP_USE_TLS=true
CONTACT_RATE_LIMIT_PER_MINUTE=5
```

Secrets must come from local environment files ignored by git, shell environment variables, or a future managed secret store. Do not commit real SMTP credentials.

## Run

```bash
.\.venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000
```

Health check:

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/ready
```

`GET /health` reports process reachability only. `GET /ready` confirms that every contact-delivery setting is present, without contacting SMTP or returning configuration values. Production startup fails closed on missing, placeholder, example, invalid-email, or invalid-mode settings.

## Scripts

```bash
.\scripts\lint.ps1
.\scripts\format.ps1
.\scripts\format.ps1 -Check
.\scripts\test.ps1
```

The scripts use `backend/.venv` when it exists and otherwise expect `ruff` or `pytest` on `PATH`.

## Dependency lock maintenance

`requirements.lock` contains the production dependency graph used by the Dockerfile. `requirements-dev.lock` contains the same graph plus test/lint tools. Regenerate both from `pyproject.toml` and `requirements-build.in`; do not hand-edit pins:

```powershell
py -3.12 -m pip install uv==0.11.26
cd backend
uv pip compile pyproject.toml requirements-build.in --universal --python-version 3.12 --output-file requirements.lock
uv pip compile pyproject.toml requirements-build.in --extra dev --universal --python-version 3.12 --output-file requirements-dev.lock
```

Keep uv's default index set to `https://pypi.org/simple` and clear machine-specific extra indexes while generating. Universal resolution is required: it retains the pinned Linux-only `uvloop` dependency with a platform marker while keeping local Windows installation valid.

Review the generated diff, reinstall from `requirements-dev.lock`, run all backend checks, rebuild the image from the repository root, and run the container smoke test before accepting an update.

## Contact Delivery

`POST /api/contact` validates the inquiry, rejects bodies larger than 16 KiB before schema parsing, applies a bounded in-memory rate limiter, and sends an SMTP notification using the configured `From`; `Reply-To` is the validated address supplied by the user. The MVP does not persist inquiries in a database.

Interactive Swagger, ReDoc and the HTTP OpenAPI document remain available in `development` and `test`. Production sets all three public routes to `404`; programmatic schema generation remains available to tests. Production API responses also receive `no-store`, a JSON-safe CSP, HSTS, `nosniff`, frame, referrer and permissions headers.

The limiter is deliberately best-effort and local to one process/Cloud Run instance. It keeps at most 10,000 hashed peer keys, expires inactive keys after five minutes, cleans periodically and evicts the oldest key at capacity. It is not a global cross-instance quota. The application does not trust caller-supplied `X-Forwarded-For`; behind Cloud Run or an additional Firebase/load-balancer proxy, multiple clients can therefore share a limiter bucket. Uvicorn access logging is disabled, and application outcome logs contain neither IP addresses nor form fields.

Failed email delivery returns a clear `503` response and logs a non-sensitive operational event without full message bodies, secrets, email addresses, contact payloads, or environment variables.
