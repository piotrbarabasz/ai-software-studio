#!/bin/sh
set -eu

if [ "$#" -ne 2 ]; then
  echo "Usage: smoke-frontend-image.sh IMAGE EXPECTED_BUILD_SHA" >&2
  exit 2
fi

image=$1
expected_build_sha=$2
container="frontend-smoke-${BUILD_ID:-local}-$$"

cleanup() {
  docker rm -f "$container" >/dev/null 2>&1 || true
}
trap cleanup EXIT HUP INT TERM

docker run --detach --name "$container" "$image" >/dev/null

fetch() {
  docker run --rm --network "container:$container" curlimages/curl:8.10.1 \
    --silent --show-error --max-time 5 --include "$1"
}

attempt=1
while [ "$attempt" -le 30 ]; do
  if [ "$(docker inspect --format '{{.State.Running}}' "$container" 2>/dev/null || true)" != "true" ]; then
    echo "Frontend image process exited before the homepage became ready. Container logs:" >&2
    docker logs "$container" >&2 || true
    exit 1
  fi

  if response="$(fetch "http://127.0.0.1:8080/" 2>/dev/null)"; then
    normalized_response=$(printf '%s' "$response" | tr -d '\r')
    headers=$(printf '%s\n' "$normalized_response" | sed -n '1,/^$/p')
    body=$(printf '%s\n' "$normalized_response" | sed '1,/^$/d')

    printf '%s\n' "$headers" | grep -q '^HTTP/.* 200'
    printf '%s\n' "$body" | grep -q "<meta name=\"protolume-build-sha\" content=\"$expected_build_sha\""
    if printf '%s\n' "$headers" | grep -qi '^X-Robots-Tag: .*noindex'; then
      echo "Homepage unexpectedly contains a noindex robots header." >&2
      exit 1
    fi

    break
  fi

  attempt=$((attempt + 1))
  sleep 1
done

if [ "$attempt" -gt 30 ]; then
  echo "Frontend image did not return HTTP 200 from / within 30 seconds. Container logs:" >&2
  docker logs "$container" >&2 || true
  exit 1
fi

not_found_response="$(fetch "http://127.0.0.1:8080/__frontend_image_smoke_missing__")"
normalized_not_found_response=$(printf '%s' "$not_found_response" | tr -d '\r')
not_found_headers=$(printf '%s\n' "$normalized_not_found_response" | sed -n '1,/^$/p')

printf '%s\n' "$not_found_headers" | grep -q '^HTTP/.* 404'
printf '%s\n' "$not_found_headers" | grep -q '^X-Robots-Tag: noindex, follow$'

echo "Frontend image smoke test passed: homepage returned HTTP 200 with the expected build SHA and the missing route returned HTTP 404 with X-Robots-Tag: noindex, follow."
