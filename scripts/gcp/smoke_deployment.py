#!/usr/bin/env python3
"""Run read-only checks against the deployed Protolume API and public site."""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from html.parser import HTMLParser
from typing import Callable, Mapping
from urllib.parse import urlsplit

PUBLIC_ROUTES = (
    "/",
    "/demo-ai",
    "/development",
    "/studio",
    "/rd",
    "/kontakt",
    "/polityka-prywatnosci",
)
NOT_FOUND_PATH = "/__protolume_read_only_smoke_missing__"
MAX_RESPONSE_BYTES = 2_000_000


@dataclass(frozen=True)
class Response:
    status: int
    headers: Mapping[str, str]
    body: bytes


class SeoMetadataParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.canonical: str | None = None
        self.robots: str | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = {name.lower(): value or "" for name, value in attrs}
        if (
            tag.lower() == "link"
            and "canonical" in attributes.get("rel", "").lower().split()
        ):
            self.canonical = attributes.get("href")
        if tag.lower() == "meta" and attributes.get("name", "").lower() == "robots":
            self.robots = attributes.get("content")


RequestFunction = Callable[[urllib.request.Request, float], Response]


def _origin(value: str, field: str) -> str:
    parsed = urlsplit(value)
    if (
        parsed.scheme != "https"
        or not parsed.hostname
        or parsed.username is not None
        or parsed.password is not None
        or parsed.path not in {"", "/"}
        or parsed.query
        or parsed.fragment
    ):
        raise ValueError(
            f"{field} must be an HTTPS origin without path, query, or fragment"
        )
    return value.rstrip("/")


def _request(request: urllib.request.Request, timeout_seconds: float) -> Response:
    try:
        response = urllib.request.urlopen(request, timeout=timeout_seconds)
    except urllib.error.HTTPError as exc:
        response = exc

    try:
        body = response.read(MAX_RESPONSE_BYTES + 1)
        headers = {name.lower(): value for name, value in response.headers.items()}
        return Response(status=response.status, headers=headers, body=body)
    finally:
        response.close()


def _get(origin: str, path: str, request: RequestFunction, timeout: float) -> Response:
    return request(
        urllib.request.Request(
            f"{origin}{path if path != '/' else '/'}",
            headers={"User-Agent": "protolume-deployment-smoke/1.0"},
            method="GET",
        ),
        timeout,
    )


def _check_api(
    backend_origin: str,
    site_origin: str,
    request: RequestFunction,
    timeout: float,
) -> list[str]:
    errors: list[str] = []
    for path, expected_state in (("/health", "ok"), ("/ready", "ready")):
        try:
            response = _get(backend_origin, path, request, timeout)
        except Exception:
            errors.append(f"API {path}: request failed")
            continue
        if response.status != 200:
            errors.append(f"API {path}: expected HTTP 200, received {response.status}")
            continue
        try:
            payload = json.loads(response.body)
        except (UnicodeDecodeError, json.JSONDecodeError):
            errors.append(f"API {path}: response is not valid JSON")
            continue
        if not isinstance(payload, dict) or payload.get("status") != expected_state:
            errors.append(f"API {path}: readiness state is not {expected_state!r}")

    preflight = urllib.request.Request(
        f"{backend_origin}/api/contact",
        headers={
            "Access-Control-Request-Headers": "Content-Type",
            "Access-Control-Request-Method": "POST",
            "Origin": site_origin,
            "User-Agent": "protolume-deployment-smoke/1.0",
        },
        method="OPTIONS",
    )
    try:
        response = request(preflight, timeout)
    except Exception:
        errors.append("API CORS OPTIONS: request failed")
        return errors
    if response.status not in {200, 204}:
        errors.append(
            f"API CORS OPTIONS: expected HTTP 200/204, received {response.status}"
        )
    if response.headers.get("access-control-allow-origin") != site_origin:
        errors.append("API CORS OPTIONS: allowed origin does not match the public site")
    allowed_methods = {
        method.strip().upper()
        for method in response.headers.get("access-control-allow-methods", "").split(
            ","
        )
    }
    if "POST" not in allowed_methods:
        errors.append("API CORS OPTIONS: POST is not listed as an allowed method")
    return errors


def _check_public_routes(
    site_origin: str,
    request: RequestFunction,
    timeout: float,
    expect_noindex: bool,
) -> list[str]:
    errors: list[str] = []
    for path in PUBLIC_ROUTES:
        try:
            response = _get(site_origin, path, request, timeout)
        except Exception:
            errors.append(f"public route {path}: request failed")
            continue
        if response.status != 200:
            errors.append(
                f"public route {path}: expected HTTP 200, received {response.status}"
            )
            continue
        if len(response.body) > MAX_RESPONSE_BYTES:
            errors.append(
                f"public route {path}: response exceeds the smoke-test size limit"
            )
            continue
        parser = SeoMetadataParser()
        try:
            parser.feed(response.body.decode("utf-8"))
        except (UnicodeDecodeError, ValueError):
            errors.append(f"public route {path}: response is not valid UTF-8 HTML")
            continue
        expected_canonical = site_origin if path == "/" else f"{site_origin}{path}"
        if parser.canonical != expected_canonical:
            errors.append(
                f"public route {path}: canonical URL does not match the public origin"
            )
        if expect_noindex:
            if (parser.robots or "").strip().lower() != "noindex, follow":
                errors.append(
                    f"public route {path}: HTML robots metadata is not noindex, follow"
                )
            if (
                response.headers.get("x-robots-tag", "").strip().lower()
                != "noindex, follow"
            ):
                errors.append(
                    f"public route {path}: X-Robots-Tag is not noindex, follow"
                )
    return errors


def _check_not_found(
    site_origin: str,
    request: RequestFunction,
    timeout: float,
) -> list[str]:
    try:
        response = _get(site_origin, NOT_FOUND_PATH, request, timeout)
    except Exception:
        return ["public 404: request failed"]
    errors: list[str] = []
    if response.status != 404:
        errors.append(f"public 404: expected HTTP 404, received {response.status}")
    if response.headers.get("x-robots-tag", "").strip().lower() != "noindex, follow":
        errors.append("public 404: X-Robots-Tag is not noindex, follow")
    return errors


def _check_discovery_files(
    site_origin: str,
    request: RequestFunction,
    timeout: float,
) -> list[str]:
    errors: list[str] = []
    responses: dict[str, Response] = {}
    for path in ("/robots.txt", "/sitemap.xml"):
        try:
            responses[path] = _get(site_origin, path, request, timeout)
        except Exception:
            errors.append(f"public {path}: request failed")
            continue
        if responses[path].status != 200:
            errors.append(
                f"public {path}: expected HTTP 200, received {responses[path].status}"
            )

    robots_response = responses.get("/robots.txt")
    if robots_response and robots_response.status == 200:
        try:
            robots = robots_response.body.decode("utf-8")
        except UnicodeDecodeError:
            errors.append("public /robots.txt: response is not valid UTF-8")
        else:
            if f"Sitemap: {site_origin}/sitemap.xml" not in robots:
                errors.append(
                    "public /robots.txt: sitemap URL does not match the public origin"
                )

    sitemap_response = responses.get("/sitemap.xml")
    if sitemap_response and sitemap_response.status == 200:
        try:
            root = ET.fromstring(sitemap_response.body)
        except ET.ParseError:
            errors.append("public /sitemap.xml: response is not valid XML")
        else:
            locations = [
                (element.text or "").strip()
                for element in root.findall(
                    "{http://www.sitemaps.org/schemas/sitemap/0.9}url/{http://www.sitemaps.org/schemas/sitemap/0.9}loc"
                )
            ]
            expected = [
                site_origin if path == "/" else f"{site_origin}{path}"
                for path in PUBLIC_ROUTES
            ]
            if locations != expected:
                errors.append(
                    "public /sitemap.xml: routes or public origin do not match"
                )
    return errors


def run_checks(
    backend_url: str,
    site_url: str,
    *,
    expect_noindex: bool,
    timeout_seconds: float,
    request: RequestFunction = _request,
) -> list[str]:
    backend_origin = _origin(backend_url, "backend URL")
    site_origin = _origin(site_url, "site URL")
    return [
        *_check_api(backend_origin, site_origin, request, timeout_seconds),
        *_check_public_routes(
            site_origin,
            request,
            timeout_seconds,
            expect_noindex,
        ),
        *_check_not_found(site_origin, request, timeout_seconds),
        *_check_discovery_files(site_origin, request, timeout_seconds),
    ]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--backend-url", required=True)
    parser.add_argument("--site-url", required=True)
    parser.add_argument("--expect-noindex", action="store_true")
    parser.add_argument("--attempts", type=int, default=1)
    parser.add_argument("--retry-delay-seconds", type=float, default=0)
    parser.add_argument("--timeout-seconds", type=float, default=10)
    args = parser.parse_args()
    if args.attempts < 1:
        parser.error("--attempts must be at least 1")
    if args.retry_delay_seconds < 0 or args.timeout_seconds <= 0:
        parser.error("retry delay must be non-negative and timeout must be positive")
    return args


def main() -> int:
    args = parse_args()
    try:
        for attempt in range(1, args.attempts + 1):
            errors = run_checks(
                args.backend_url,
                args.site_url,
                expect_noindex=args.expect_noindex,
                timeout_seconds=args.timeout_seconds,
            )
            if not errors:
                print(
                    "Read-only deployment smoke passed: API health/readiness, public routes, "
                    "404, robots, sitemap, canonical, noindex and CORS OPTIONS are correct."
                )
                return 0
            if attempt < args.attempts:
                time.sleep(args.retry_delay_seconds)
    except ValueError as exc:
        print(f"Deployment smoke configuration error: {exc}", file=sys.stderr)
        return 2

    print("Read-only deployment smoke failed:", file=sys.stderr)
    for error in errors:
        print(f"- {error}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
