#!/bin/sh
set -eu

if [ "$#" -ne 2 ]; then
  echo "Usage: smoke-v3-production-image.sh IMAGE [FORM_ENDPOINT]" >&2
  exit 2
fi

image=$1
form_endpoint=$2
[ "$form_endpoint" = "/api/contact/brief" ] || { echo "BLOCKED: production contact must use existing FastAPI" >&2; exit 1; }
container="v3-production-smoke-${BUILD_ID:-local}-$$"
work_dir=$(mktemp -d)

cleanup() {
  docker rm -f "$container" >/dev/null 2>&1 || true
  rm -rf "$work_dir"
}
trap cleanup EXIT HUP INT TERM

# Image must be deployable as-is; do not override an existing Cloud Run service.
docker run --rm --entrypoint nginx "$image" -t
docker run --detach --name "$container" "$image" >/dev/null

fetch() {
  path="$1"
  name="$2"
  docker run --rm --network "container:$container" curlimages/curl:8.10.1 \
    --silent --show-error --max-time 10 --dump-header - --output /dev/null \
    "http://127.0.0.1:8080$path" | tr -d '\r' >"$work_dir/$name.headers"
  docker run --rm --network "container:$container" curlimages/curl:8.10.1 \
    --silent --show-error --max-time 10 --output - \
    "http://127.0.0.1:8080$path" >"$work_dir/$name.body"
}

status() {
  awk '/^HTTP\// { code=$2 } END { print code }' "$1"
}

attempt=1
while [ "$attempt" -le 30 ]; do
  if fetch "/" "home" 2>/dev/null && [ "$(status "$work_dir/home.headers")" = "200" ]; then
    break
  fi
  attempt=$((attempt + 1))
  sleep 1
done

if [ "$attempt" -gt 30 ]; then
  echo "Production image failed to serve /" >&2
  docker logs "$container" >&2 || true
  exit 1
fi

! grep -qi '^X-Robots-Tag: noindex' "$work_dir/home.headers"
grep -q 'name="robots" content="index, follow"' "$work_dir/home.body"
grep -Eq 'name="protolume-build-sha" content="[0-9a-f]{7,40}"' "$work_dir/home.body"
grep -Fq 'data-endpoint="/api/contact/brief"' "$work_dir/home.body"
! grep -q 'id="contact-submit" type="submit" disabled' "$work_dir/home.body"
grep -q 'Automatyzacje AI dla firm' "$work_dir/home.body"
grep -q 'id="obszary"' "$work_dir/home.body"
grep -q 'id="wspolpraca"' "$work_dir/home.body"
grep -q 'id="rozwiazania"' "$work_dir/home.body"
grep -q 'id="kontakt"' "$work_dir/home.body"
grep -q 'class="site-nav"' "$work_dir/home.body"
grep -q 'Napisz do nas' "$work_dir/home.body"
grep -q 'Co tworzymy?' "$work_dir/home.body"
grep -q '/assets/icons.svg#icon-' "$work_dir/home.body"

fetch "/assets/icons.svg" "lucide"
[ "$(status "$work_dir/lucide.headers")" = "200" ]
grep -q 'id="icon-message-square-text"' "$work_dir/lucide.body"
grep -q 'id="icon-arrow-up-right"' "$work_dir/lucide.body"

fetch "/assets/LUCIDE-LICENSE.txt" "license"
[ "$(status "$work_dir/license.headers")" = "200" ]
grep -q 'ISC License' "$work_dir/license.body"

fetch "/polityka-prywatnosci/" "privacy"
[ "$(status "$work_dir/privacy.headers")" = "200" ]
grep -q 'Administrator danych' "$work_dir/privacy.body"
grep -q 'name="robots" content="index, follow"' "$work_dir/privacy.body"
! grep -q 'Wersja robocza' "$work_dir/privacy.body"

# Read-only proof that the API proxy is not an open GET endpoint.
# Never POST an actual contact during an image smoke test.
if [ "$form_endpoint" = "/api/contact/brief" ]; then
  fetch "/api/contact/brief" "contact-get"
  [ "$(status "$work_dir/contact-get.headers")" = "403" ]
fi

fetch "/robots.txt" "robots"
[ "$(status "$work_dir/robots.headers")" = "200" ]
grep -q 'Allow: /' "$work_dir/robots.body"

fetch "/rozwiazania" "legacy"
[ "$(status "$work_dir/legacy.headers")" = "301" ]

fetch "/__v3_missing__" "missing"
[ "$(status "$work_dir/missing.headers")" = "404" ]
! grep -qi '^X-Robots-Tag: noindex' "$work_dir/missing.headers"

echo "V3 production container smoke passed: indexable HTML, verified contact, approved privacy, robots, 301 redirects, 404."
