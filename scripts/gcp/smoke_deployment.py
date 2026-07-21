#!/usr/bin/env python3
"""Run read-only checks against the deployed Protolume API and public site."""

from __future__ import annotations

import argparse
import json
import re
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
    "/przyklad-demo",
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
        self.build_sha: str | None = None
        self.headings: list[tuple[str, str]] = []
        self.hrefs: list[str] = []
        self.form_names: set[str] = set()
        self.has_form = False
        self.has_primary_navigation = False
        self.has_interactive_demo = False
        self._text_stack: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = {name.lower(): value or "" for name, value in attrs}
        if (
            tag.lower() == "link"
            and "canonical" in attributes.get("rel", "").lower().split()
        ):
            self.canonical = attributes.get("href")
        if tag.lower() == "meta" and attributes.get("name", "").lower() == "robots":
            self.robots = attributes.get("content")
        if tag.lower() == "meta" and attributes.get("name", "").lower() == "protolume-build-sha":
            self.build_sha = attributes.get("content")
        if "href" in attributes:
            self.hrefs.append(attributes["href"])
        if tag.lower() == "form":
            self.has_form = True
        if tag.lower() == "nav":
            self.has_primary_navigation = self.has_primary_navigation or "primary-navigation" in attributes.get("id", "")
        classes = set(attributes.get("class", "").split())
        if "interactive-demo" in classes:
            self.has_interactive_demo = True
        if tag.lower() in {"h1", "h2", "h3"}:
            self._text_stack.append("")
        name = attributes.get("name")
        if name:
            self.form_names.add(name)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() in {"h1", "h2", "h3"} and self._text_stack:
            self.headings.append((tag.lower(), re.sub(r"\s+", " ", self._text_stack.pop()).strip()))

    def handle_data(self, data: str) -> None:
        if self._text_stack:
            self._text_stack[-1] += data


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
) -> tuple[list[str], str | None]:
    errors: list[str] = []
    build_sha: str | None = None
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
        if path == "/health":
            candidate = payload.get("buildSha") if isinstance(payload, dict) else None
            if not isinstance(candidate, str) or not candidate.strip() or candidate in {"unknown", "local", "test"} or "__" in candidate:
                errors.append("API /health: buildSha must be a non-placeholder deployed SHA")
            else:
                build_sha = candidate

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
        return errors, build_sha
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
    return errors, build_sha


def _check_public_routes(
    site_origin: str,
    request: RequestFunction,
    timeout: float,
    expect_noindex: bool,
) -> tuple[list[str], str | None]:
    errors: list[str] = []
    frontend_build_sha: str | None = None
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
        else:
            if (parser.robots or "").strip().lower() != "index, follow":
                errors.append(f"public route {path}: HTML robots metadata is not index, follow")
            if response.headers.get("x-robots-tag", "").strip().lower() != "index, follow":
                errors.append(f"public route {path}: X-Robots-Tag is not index, follow")
        if path == "/":
            frontend_build_sha = parser.build_sha
            if not isinstance(frontend_build_sha, str) or not frontend_build_sha.strip() or frontend_build_sha in {"unknown", "local", "test"} or "__" in frontend_build_sha:
                errors.append("public route /: protolume-build-sha meta tag must be a non-placeholder deployed SHA")
            h1 = " ".join(text for tag, text in parser.headings if tag == "h1")
            if not h1:
                errors.append("public route /: expected an h1 element, received none")
            for phrase in ("Sprawdź w 7 dni", "konkretny proces"):
                if phrase.lower() not in h1.lower():
                    errors.append(f"public route /: h1 must contain {phrase!r}")
            if not parser.has_primary_navigation:
                errors.append("public route /: expected primary navigation, received none")
            for href in ("/demo-ai", "/development", "/kontakt"):
                if not any(href == candidate.split("?", 1)[0].split("#", 1)[0] for candidate in parser.hrefs):
                    errors.append(f"public route /: expected link to {href}, received none")
            if not any("projectType=mvp_prototype" in href and href.startswith("/kontakt?") for href in parser.hrefs):
                errors.append("public route /: expected primary contact CTA with projectType=mvp_prototype")
        elif path == "/demo-ai":
            if not any(tag in {"h1", "h2"} for tag, _ in parser.headings):
                errors.append("public route /demo-ai: expected a heading, received none")
            if not parser.has_interactive_demo and "demo" not in response.body.decode("utf-8").lower():
                errors.append("public route /demo-ai: expected interactive demo marker or text")
            if not any(href.startswith("/kontakt") for href in parser.hrefs):
                errors.append("public route /demo-ai: expected contact handoff link, received none")
        elif path == "/przyklad-demo":
            heading_text = " ".join(text for tag, text in parser.headings if tag == "h1")
            if not heading_text:
                errors.append("public route /przyklad-demo: expected an h1 element, received none")
            page_text = response.body.decode("utf-8").lower()
            if "fikcyjny" not in page_text or "demonstracyjny" not in page_text:
                errors.append("public route /przyklad-demo: expected an explicitly fictional demonstration notice")
            if "poza zakresem" not in page_text:
                errors.append("public route /przyklad-demo: expected an out-of-scope section")
            if not any(href.startswith("/kontakt") for href in parser.hrefs):
                errors.append("public route /przyklad-demo: expected a contact CTA, received none")
            if not any(href.split("?", 1)[0].split("#", 1)[0] == "/demo-ai" for href in parser.hrefs):
                errors.append("public route /przyklad-demo: expected a link to /demo-ai, received none")
        elif path == "/kontakt":
            if not parser.has_form:
                errors.append("public route /kontakt: expected a form, received none")
            for name in ("name", "email", "projectType", "message", "consent"):
                if name not in parser.form_names:
                    errors.append(f"public route /kontakt: expected form field {name!r}, received none")
        elif path == "/polityka-prywatnosci":
            if not any(tag in {"h1", "h2"} for tag, _ in parser.headings):
                errors.append("public route /polityka-prywatnosci: expected a heading, received none")
            if not any(href.lower().startswith("mailto:") and href[7:].strip() for href in parser.hrefs):
                errors.append("public route /polityka-prywatnosci: expected configured privacy contact, received none")
    return errors, frontend_build_sha


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
    api_errors, backend_build_sha = _check_api(backend_origin, site_origin, request, timeout_seconds)
    public_errors, frontend_build_sha = _check_public_routes(
            site_origin,
            request,
            timeout_seconds,
            expect_noindex,
        )
    provenance_errors: list[str] = []
    if backend_build_sha and frontend_build_sha and backend_build_sha != frontend_build_sha:
        provenance_errors.append(
            f"release provenance: frontend SHA {frontend_build_sha!r} does not match /health SHA {backend_build_sha!r}"
        )
    return [
        *api_errors,
        *public_errors,
        *provenance_errors,
        *_check_not_found(site_origin, request, timeout_seconds),
        *_check_discovery_files(site_origin, request, timeout_seconds),
    ]


def run_with_retries(
    check: Callable[[], list[str]],
    attempts: int,
    retry_delay_seconds: float,
    sleep: Callable[[float], None] = time.sleep,
) -> list[str]:
    errors: list[str] = []
    for attempt in range(1, attempts + 1):
        errors = check()
        if not errors:
            return []
        if attempt < attempts:
            sleep(retry_delay_seconds)
    return errors


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
        errors = run_with_retries(
            lambda: run_checks(
                args.backend_url,
                args.site_url,
                expect_noindex=args.expect_noindex,
                timeout_seconds=args.timeout_seconds,
            ),
            args.attempts,
            args.retry_delay_seconds,
        )
        if not errors:
            print(
                "Read-only deployment smoke passed: API health/readiness, public routes, "
                "404, robots, sitemap, canonical, content, provenance and CORS OPTIONS are correct."
            )
            return 0
    except ValueError as exc:
        print(f"Deployment smoke configuration error: {exc}", file=sys.stderr)
        return 2

    print("Read-only deployment smoke failed:", file=sys.stderr)
    for error in errors:
        print(f"- {error}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
