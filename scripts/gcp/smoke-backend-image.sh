#!/bin/sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: smoke-backend-image.sh IMAGE" >&2
  exit 2
fi

image=$1
container="backend-smoke-${BUILD_ID:-local}-$$"

cleanup() {
  docker rm -f "$container" >/dev/null 2>&1 || true
}
trap cleanup EXIT HUP INT TERM

docker run --detach --name "$container" \
  --env PORT=8080 \
  --env APP_ENV="$DEPLOY_APP_ENV" \
  --env CORS_ALLOWED_ORIGINS="$DEPLOY_CORS_ALLOWED_ORIGINS" \
  --env CONTACT_DELIVERY_MODE="$DEPLOY_CONTACT_DELIVERY_MODE" \
  --env CONTACT_RECIPIENT_EMAIL="$DEPLOY_CONTACT_RECIPIENT_EMAIL" \
  --env CONTACT_FROM_EMAIL="$DEPLOY_CONTACT_FROM_EMAIL" \
  --env SMTP_HOST="$DEPLOY_SMTP_HOST" \
  --env SMTP_PORT="$DEPLOY_SMTP_PORT" \
  --env SMTP_USERNAME="$DEPLOY_SMTP_USERNAME" \
  --env SMTP_PASSWORD=cloud-build-smoke-test-only \
  --env SMTP_USE_TLS="$DEPLOY_SMTP_USE_TLS" \
  --env CONTACT_RATE_LIMIT_PER_MINUTE="$DEPLOY_CONTACT_RATE_LIMIT_PER_MINUTE" \
  "$image" >/dev/null

attempt=1
while [ "$attempt" -le 30 ]; do
  if [ "$(docker inspect --format '{{.State.Running}}' "$container" 2>/dev/null || true)" != "true" ]; then
    echo "Backend image process exited before /health became ready. Container logs:" >&2
    docker logs "$container" >&2 || true
    exit 1
  fi

  if docker exec "$container" python -c \
    'import urllib.request; response = urllib.request.urlopen("http://127.0.0.1:8080/health", timeout=2); raise SystemExit(0 if response.status == 200 else 1)' \
    >/dev/null 2>&1; then
    echo "Backend image smoke test passed: CMD is running and /health returned HTTP 200."
    exit 0
  fi

  attempt=$((attempt + 1))
  sleep 1
done

echo "Backend image did not return HTTP 200 from /health within 30 seconds. Container logs:" >&2
docker logs "$container" >&2 || true
exit 1
