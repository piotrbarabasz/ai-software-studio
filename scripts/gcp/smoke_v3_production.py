#!/usr/bin/env python3
"""Read-only checks for production Protolume V3 cutover; no contact POSTs."""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from urllib.parse import urlsplit


@dataclass
class Response:
    status: int
    headers: dict[str, str]
    body: str


def fetch(url: str) -> Response:
    request = urllib.request.Request(
        url, headers={"User-Agent": "protolume-v3-production-smoke/1.0"}
    )
    try:
        response = urllib.request.urlopen(request, timeout=12)
    except urllib.error.HTTPError as exc:
        response = exc
    with response:
        data = response.read(250_001)
        if len(data) > 250_000:
            raise ValueError("Response exceeded the expected static page limit")
        return Response(
            status=response.status,
            headers={key.lower(): value for key, value in response.headers.items()},
            body=data.decode("utf-8"),
        )


def validate_response(
    site_url: str,
    api_url: str,
    expected_sha: str,
    get=fetch,
) -> list[str]:
    problems: list[str] = []
    if (
        site_url != "https://protolume.pl"
        or urlsplit(api_url).scheme != "https"
        or urlsplit(api_url).hostname
        != "aisoftware-studio-api-175725977490.europe-central2.run.app"
        or urlsplit(api_url).path not in ("", "/")
        or not re.fullmatch(r"[0-9a-f]{7,40}", expected_sha)
    ):
        return ["Invalid production site, API target or commit SHA"]

    checks = {
        "/": 200,
        "/polityka-prywatnosci/": 200,
        "/robots.txt": 200,
        "/sitemap.xml": 200,
        "/styles.css": 200,
        "/form.js": 200,
        "/assets/icons.svg": 200,
        "/__protolume_v3_not_found__": 404,
        "/api/contact/brief": 403,  # GET must never submit a message.
    }
    responses: dict[str, Response] = {}
    for path, expected_status in checks.items():
        try:
            result = get(site_url + path)
            responses[path] = result
            if result.status != expected_status:
                problems.append(
                    f"{path}: expected HTTP {expected_status}, got {result.status}"
                )
        except (OSError, ValueError, UnicodeDecodeError) as exc:
            problems.append(f"{path}: read-only request failed ({type(exc).__name__})")

    if "/" in responses:
        homepage = responses["/"]
        if not homepage.headers.get("content-type", "").startswith("text/html"):
            problems.append("Homepage is not HTML")
        if "noindex" in homepage.headers.get("x-robots-tag", "").lower():
            problems.append("Homepage X-Robots-Tag blocks indexing")
        for token in (
            '<meta name="robots" content="index, follow">',
            '<link rel="canonical" href="https://protolume.pl/">',
            f'<meta name="protolume-build-sha" content="{expected_sha}">',
            'data-endpoint="/api/contact/brief"',
            'id="obszary"',
            'id="wspolpraca"',
            'id="rozwiazania"',
            'id="kontakt"',
        ):
            if token not in homepage.body:
                problems.append(f"Homepage is missing required marker: {token}")

    if "/polityka-prywatnosci/" in responses:
        privacy = responses["/polityka-prywatnosci/"].body
        if "Administrator danych" not in privacy or "Wersja robocza" in privacy:
            problems.append("Privacy policy is missing or still a draft")

    if "/robots.txt" in responses:
        robots = responses["/robots.txt"].body
        if "Allow: /" not in robots or "Disallow: /" in robots:
            problems.append("Production robots.txt blocks crawlers")

    if "/sitemap.xml" in responses:
        if "https://protolume.pl/" not in responses["/sitemap.xml"].body:
            problems.append("Sitemap does not contain the public origin")

    for path in ("/health", "/ready"):
        try:
            result = get(api_url + path)
            data = json.loads(result.body)
            required = "ok" if path == "/health" else "ready"
            if result.status != 200 or data.get("status") != required:
                problems.append(f"Backend {path} is not {required}")
        except (OSError, ValueError, UnicodeDecodeError, KeyError):
            problems.append(f"Backend {path} failed")
    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site-url", required=True)
    parser.add_argument("--api-url", required=True)
    parser.add_argument("--expected-build-sha", required=True)
    parser.add_argument("--attempts", type=int, default=12)
    parser.add_argument("--retry-delay-seconds", type=float, default=5)
    args = parser.parse_args()

    if not 1 <= args.attempts <= 20 or not 0 <= args.retry_delay_seconds <= 30:
        parser.error("Unsafe retry settings")
    for attempt in range(args.attempts):
        errors = validate_response(
            args.site_url, args.api_url, args.expected_build_sha
        )
        if not errors:
            print(
                f"PASS: indexable Protolume V3 at {args.site_url}; "
                "contact proxy safe; API healthy; build SHA matches."
            )
            return 0
        if attempt + 1 < args.attempts:
            time.sleep(args.retry_delay_seconds)
    for error in errors:
        print(f"FAIL: {error}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
