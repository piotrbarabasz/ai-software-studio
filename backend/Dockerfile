FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PORT=8080

WORKDIR /app

RUN addgroup --system app && adduser --system --ingroup app app

COPY backend/pyproject.toml backend/requirements.lock ./
COPY backend/app ./app
COPY frontend/config/public-brand.json ./app/core/public-brand.json
COPY infra/gcp/production-contract.json ./app/core/production-contract.json

RUN pip install --requirement requirements.lock \
    && pip install --no-deps --no-build-isolation .

USER app

EXPOSE 8080

CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080} --no-access-log --no-server-header --no-proxy-headers"]
