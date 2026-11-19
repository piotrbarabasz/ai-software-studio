#!/bin/sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: smoke-v3-preview-image.sh IMAGE" >&2
  exit 2
fi

image=$1
container="v3-preview-smoke-${BUILD_ID:-local}-$$"
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
    --silent --show-error --max-time 10 -D "$work_dir/$name.headers" \
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
  echo "Preview image failed to serve /" >&2
  docker logs "$container" >&2 || true
  exit 1
fi

grep -qi '^X-Robots-Tag: noindex, nofollow' "$work_dir/home.headers"
grep -q 'name="robots" content="noindex, nofollow"' "$work_dir/home.body"
grep -q 'data-endpoint=""' "$work_dir/home.body"
grep -q 'Sprawdźmy, jak' "$work_dir/home.body"

fetch "/polityka-prywatnosci/" "privacy"
[ "$(status "$work_dir/privacy.headers")" = "200" ]
grep -q 'Wersja robocza' "$work_dir/privacy.body"

fetch "/robots.txt" "robots"
[ "$(status "$work_dir/robots.headers")" = "200" ]
grep -q 'Disallow: /' "$work_dir/robots.body"

fetch "/rozwiazania" "legacy"
[ "$(status "$work_dir/legacy.headers")" = "302" ]

fetch "/__v3_missing__" "missing"
[ "$(status "$work_dir/missing.headers")" = "404" ]
grep -qi '^X-Robots-Tag: noindex, nofollow' "$work_dir/missing.headers"

echo "V3 container smoke passed: HTTP 200, noindex headers, mailto fallback, privacy, robots, redirects, 404."
