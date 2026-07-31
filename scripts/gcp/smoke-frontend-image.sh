#!/bin/sh
set -eu

if [ "$#" -ne 2 ]; then
  echo "Usage: smoke-frontend-image.sh IMAGE EXPECTED_BUILD_SHA" >&2
  exit 2
fi

image=$1
expected_build_sha=$2
container="frontend-smoke-${BUILD_ID:-local}-$$"
work_dir=$(mktemp -d)

cleanup() {
  docker rm -f "$container" >/dev/null 2>&1 || true
  rm -rf "$work_dir"
}
trap cleanup EXIT HUP INT TERM

docker run --detach --name "$container" "$image" >/dev/null

fetch_headers() {
  docker run --rm --network "container:$container" curlimages/curl:8.10.1 \
    --silent --show-error --max-time 5 --dump-header - --output /dev/null "$1" \
    | tr -d '\r'
}

fetch_body() {
  docker run --rm --network "container:$container" curlimages/curl:8.10.1 \
    --silent --show-error --max-time 5 --output - "$1"
}

status_code() {
  awk '/^HTTP\// { status = $2 } END { print status }' "$1"
}

base_content_type() {
  awk -F: '
    tolower($1) == "content-type" {
      sub(/^[^:]*:[[:space:]]*/, "")
      split(tolower($0), parts, ";")
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", parts[1])
      value = parts[1]
    }
    END { print value }
  ' "$1"
}

check_status() {
  resource=$1
  headers_file=$2
  expected=$3
  actual=$(status_code "$headers_file")
  if [ "$actual" != "$expected" ]; then
    echo "$resource: expected HTTP $expected, received ${actual:-missing}" >&2
    exit 1
  fi
}

check_content_type() {
  resource=$1
  headers_file=$2
  expected=$3
  actual=$(base_content_type "$headers_file")
  if [ "$actual" != "$expected" ]; then
    echo "$resource: expected Content-Type $expected, received ${actual:-missing}" >&2
    exit 1
  fi
}

request_resource() {
  resource=$1
  file_name=$2
  fetch_headers "http://127.0.0.1:8080$resource" >"$work_dir/$file_name.headers"
  fetch_body "http://127.0.0.1:8080$resource" >"$work_dir/$file_name.body"
}

attempt=1
while [ "$attempt" -le 30 ]; do
  if [ "$(docker inspect --format '{{.State.Running}}' "$container" 2>/dev/null || true)" != "true" ]; then
    echo "Frontend image process exited before the homepage became ready. Container logs:" >&2
    docker logs "$container" >&2 || true
    exit 1
  fi

  if fetch_headers "http://127.0.0.1:8080/" >"$work_dir/readiness.headers" 2>/dev/null; then
    if [ "$(status_code "$work_dir/readiness.headers")" = "200" ]; then
      break
    fi
  fi

  attempt=$((attempt + 1))
  sleep 1
done

if [ "$attempt" -gt 30 ]; then
  echo "Frontend image did not return HTTP 200 from / within 30 seconds. Container logs:" >&2
  docker logs "$container" >&2 || true
  exit 1
fi

request_resource "/" "homepage"
check_status "homepage" "$work_dir/homepage.headers" "200"
check_content_type "homepage" "$work_dir/homepage.headers" "text/html"
if ! grep -q "<meta name=\"protolume-build-sha\" content=\"$expected_build_sha\"" "$work_dir/homepage.body"; then
  echo "homepage: body does not contain the expected protolume-build-sha" >&2
  exit 1
fi
if grep -qi '^X-Robots-Tag: .*noindex' "$work_dir/homepage.headers"; then
  echo "homepage: unexpectedly contains a noindex robots header" >&2
  exit 1
fi

request_resource "/sitemap.xml" "sitemap"
check_status "sitemap.xml" "$work_dir/sitemap.headers" "200"
check_content_type "sitemap.xml" "$work_dir/sitemap.headers" "application/xml"
if [ ! -s "$work_dir/sitemap.body" ]; then
  echo "sitemap.xml: expected a non-empty body" >&2
  exit 1
fi
if ! grep -Eq '^[[:space:]]*(<\?xml|<urlset)' "$work_dir/sitemap.body"; then
  echo "sitemap.xml: body does not begin with an XML declaration or urlset" >&2
  exit 1
fi
if ! grep -Fq 'https://protolume.pl' "$work_dir/sitemap.body"; then
  echo "sitemap.xml: body does not contain https://protolume.pl" >&2
  exit 1
fi
if grep -Eqi '<(html|!doctype[[:space:]]+html)([[:space:]>])' "$work_dir/sitemap.body"; then
  echo "sitemap.xml: body unexpectedly contains HTML" >&2
  exit 1
fi

request_resource "/robots.txt" "robots"
check_status "robots.txt" "$work_dir/robots.headers" "200"
check_content_type "robots.txt" "$work_dir/robots.headers" "text/plain"
for expected_line in \
  'User-agent: *' \
  'Allow: /' \
  'Sitemap: https://protolume.pl/sitemap.xml'
do
  if ! grep -Fqx "$expected_line" "$work_dir/robots.body"; then
    echo "robots.txt: missing expected line: $expected_line" >&2
    exit 1
  fi
done

request_resource "/assets/protolume-social-preview.png" "social-preview"
check_status "social preview" "$work_dir/social-preview.headers" "200"
check_content_type "social preview" "$work_dir/social-preview.headers" "image/png"
if [ ! -s "$work_dir/social-preview.body" ]; then
  echo "social preview: expected a non-empty body" >&2
  exit 1
fi

fetch_headers "http://127.0.0.1:8080/__frontend_image_smoke_missing__" >"$work_dir/not-found.headers"
check_status "missing route" "$work_dir/not-found.headers" "404"
if ! grep -q '^X-Robots-Tag: noindex, follow$' "$work_dir/not-found.headers"; then
  echo "missing route: expected X-Robots-Tag: noindex, follow" >&2
  exit 1
fi

echo "Frontend image smoke test passed: homepage, sitemap.xml, robots.txt, social preview and the noindex 404 response match the production HTTP contract."
