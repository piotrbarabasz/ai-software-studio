#!/usr/bin/env python3
"""Read-only production indexability checks for the Protolume site."""

from __future__ import annotations

import argparse
import re
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from typing import Callable, Mapping
from urllib.parse import urlsplit


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
PUBLIC_ROUTES_PATH = REPOSITORY_ROOT / "frontend" / "src" / "prerender-routes.txt"
PUBLIC_SITE_ORIGIN = "https://protolume.pl"
PUBLIC_SITE_HOST = "protolume.pl"
MAX_RESPONSE_BYTES = 2_000_000
BUILD_SHA_PATTERN = re.compile(r"^[0-9a-f]{7,64}$")
PLACEHOLDER_TOKENS = (
    "__PUBLIC_CONFIG_REQUIRED__",
    "localhost",
    "run.app",
    ".example",
)


@dataclass(frozen=True)
class Response:
    status: int
    final_url: str
    headers: Mapping[str, str]
    body: bytes


@dataclass(frozen=True)
class HtmlMetadata:
    title_count: int
    h1_count: int
    canonical: str | None
    robots: str | None
    build_sha: str | None
    hrefs: tuple[str, ...]


class _HtmlMetadataParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title_count = 0
        self.h1_count = 0
        self.canonical: str | None = None
        self.robots: str | None = None
        self.build_sha: str | None = None
        self.hrefs: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag_name = tag.lower()
        attributes = {name.lower(): value or "" for name, value in attrs}
        if tag_name == "title":
            self.title_count += 1
        if tag_name == "h1":
            self.h1_count += 1
        if tag_name == "meta":
            name = attributes.get("name", "").lower()
            if name == "robots":
                self.robots = attributes.get("content")
            elif name == "protolume-build-sha":
                self.build_sha = attributes.get("content")
        if tag_name == "link" and "canonical" in attributes.get("rel", "").lower().split():
            self.canonical = attributes.get("href")
        href = attributes.get("href")
        if href:
            self.hrefs.append(href)


def _read_public_routes() -> tuple[str, ...]:
    if not PUBLIC_ROUTES_PATH.exists():
        raise FileNotFoundError(f"Missing prerender route list: {PUBLIC_ROUTES_PATH}")
    routes = [
        line.strip()
        for line in PUBLIC_ROUTES_PATH.read_text(encoding="utf-8").splitlines()
        if line.strip() and line.strip() != "/404"
    ]
    return tuple(routes)


def _normalized_origin(value: str, field: str) -> str:
    parsed = urlsplit(value)
    if (
        parsed.scheme != "https"
        or parsed.hostname != PUBLIC_SITE_HOST
        or parsed.username is not None
        or parsed.password is not None
        or parsed.path not in {"", "/"}
        or parsed.query
        or parsed.fragment
    ):
        raise ValueError(
            f"{field} must be exactly https://{PUBLIC_SITE_HOST} without path, query, or fragment"
        )
    return PUBLIC_SITE_ORIGIN


def _site_url_for_route(origin: str, route: str) -> str:
    return origin if route == "/" else f"{origin}{route}"


def _build_sha(value: str | None) -> str | None:
    if value is None:
        return None
    candidate = value.strip()
    if not candidate or candidate in {"unknown", "local", "test"}:
        return None
    if not BUILD_SHA_PATTERN.fullmatch(candidate):
        return None
    return candidate


def _request(request: urllib.request.Request, timeout_seconds: float) -> Response:
    try:
        response = urllib.request.urlopen(request, timeout=timeout_seconds)
    except urllib.error.HTTPError as exc:
        response = exc

    try:
        body = response.read(MAX_RESPONSE_BYTES + 1)
        headers = {name.lower(): value for name, value in response.headers.items()}
        return Response(
            status=response.status,
            final_url=response.geturl(),
            headers=headers,
            body=body,
        )
    finally:
        response.close()


def _get(origin: str, path: str, request: Callable[[urllib.request.Request, float], Response], timeout_seconds: float) -> Response:
    return request(
        urllib.request.Request(
            f"{origin}{path if path != '/' else '/'}",
            headers={"User-Agent": "protolume-indexability-check/1.0"},
            method="GET",
        ),
        timeout_seconds,
    )


def parse_html_metadata(html: str) -> HtmlMetadata:
    parser = _HtmlMetadataParser()
    parser.feed(html)
    return HtmlMetadata(
        title_count=parser.title_count,
        h1_count=parser.h1_count,
        canonical=parser.canonical,
        robots=parser.robots,
        build_sha=parser.build_sha,
        hrefs=tuple(parser.hrefs),
    )


def parse_sitemap_locations(xml_text: str) -> tuple[str, ...]:
    root = ET.fromstring(xml_text)
    namespace = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    locations = [
        (element.text or "").strip()
        for element in root.findall(f"{namespace}url/{namespace}loc")
        if (element.text or "").strip()
    ]
    return tuple(locations)


def _validate_page(
    origin: str,
    route: str,
    request: Callable[[urllib.request.Request, float], Response],
    timeout_seconds: float,
    shared_build_sha: str | None,
) -> tuple[list[str], str | None]:
    try:
        response = _get(origin, route, request, timeout_seconds)
    except Exception:
        return [f"public route {route}: request failed"], None

    errors: list[str] = []
    expected_url = _site_url_for_route(origin, route)
    if response.final_url.rstrip("/") != expected_url.rstrip("/"):
        errors.append(f"public route {route}: request redirected to {response.final_url!r}")
    if response.status != 200:
        errors.append(f"public route {route}: expected HTTP 200, received {response.status}")
    content_type = response.headers.get("content-type", "").lower()
    if "text/html" not in content_type:
        errors.append(f"public route {route}: expected HTML content type, received {content_type!r}")

    try:
        html = response.body.decode("utf-8")
    except UnicodeDecodeError:
        return [f"public route {route}: response is not valid UTF-8 HTML"], None

    metadata = parse_html_metadata(html)
    canonical = expected_url
    if metadata.title_count != 1:
        errors.append(f"public route {route}: expected exactly one <title>, received {metadata.title_count}")
    if metadata.h1_count != 1:
        errors.append(f"public route {route}: expected exactly one <h1>, received {metadata.h1_count}")
    if metadata.canonical != canonical:
        errors.append(f"public route {route}: canonical URL does not match the public origin")

    robots = (metadata.robots or "").strip().lower()
    if robots != "index, follow":
        errors.append(f"public route {route}: HTML robots metadata is not index, follow")

    x_robots_tag = response.headers.get("x-robots-tag", "").strip().lower()
    if "noindex" in x_robots_tag:
        errors.append(f"public route {route}: X-Robots-Tag must not contain noindex")

    if any(token in html.lower() for token in PLACEHOLDER_TOKENS):
        errors.append(f"public route {route}: HTML contains a placeholder, localhost or run.app reference")

    build_sha = _build_sha(metadata.build_sha)
    if route == "/":
        if build_sha is None:
            errors.append("public route /: protolume-build-sha meta tag is missing or invalid")
        elif shared_build_sha and build_sha != shared_build_sha:
            errors.append("public route /: protolume-build-sha does not match the shared build SHA")
    elif build_sha and shared_build_sha and build_sha != shared_build_sha:
        errors.append(f"public route {route}: protolume-build-sha does not match the shared build SHA")

    return errors, build_sha or shared_build_sha


def _validate_robots(
    origin: str,
    request: Callable[[urllib.request.Request, float], Response],
    timeout_seconds: float,
) -> list[str]:
    try:
        response = _get(origin, "/robots.txt", request, timeout_seconds)
    except Exception:
        return ["public /robots.txt: request failed"]

    errors: list[str] = []
    if response.status != 200:
        errors.append(f"public /robots.txt: expected HTTP 200, received {response.status}")
    content_type = response.headers.get("content-type", "").lower()
    if "text/plain" not in content_type:
        errors.append(f"public /robots.txt: expected plain text content type, received {content_type!r}")
    try:
        robots = response.body.decode("utf-8")
    except UnicodeDecodeError:
        return ["public /robots.txt: response is not valid UTF-8"]

    if "Disallow: /" in robots:
        errors.append("public /robots.txt: must not disallow /")
    if "Allow: /" not in robots:
        errors.append("public /robots.txt: must allow crawling with Allow: /")
    sitemap_line = f"Sitemap: {origin}/sitemap.xml"
    if sitemap_line not in robots:
        errors.append("public /robots.txt: sitemap URL does not match the public origin")
    if any(token in robots.lower() for token in PLACEHOLDER_TOKENS):
        errors.append("public /robots.txt: contains a placeholder, localhost or run.app reference")
    return errors


def _validate_sitemap(
    origin: str,
    request: Callable[[urllib.request.Request, float], Response],
    timeout_seconds: float,
    required_routes: tuple[str, ...],
) -> list[str]:
    try:
        response = _get(origin, "/sitemap.xml", request, timeout_seconds)
    except Exception:
        return ["public /sitemap.xml: request failed"]

    errors: list[str] = []
    if response.status != 200:
        errors.append(f"public /sitemap.xml: expected HTTP 200, received {response.status}")
    content_type = response.headers.get("content-type", "").lower()
    if "xml" not in content_type:
        errors.append(f"public /sitemap.xml: expected XML content type, received {content_type!r}")
    try:
        locations = parse_sitemap_locations(response.body.decode("utf-8"))
    except UnicodeDecodeError:
        return ["public /sitemap.xml: response is not valid UTF-8"]
    except ET.ParseError:
        return ["public /sitemap.xml: response is not valid XML"]

    expected_locations = tuple(_site_url_for_route(origin, route) for route in required_routes)
    missing = [location for location in expected_locations if location not in locations]
    if missing:
        errors.extend(f"public /sitemap.xml: missing required URL {location}" for location in missing)

    unexpected = [
        location
        for location in locations
        if urlsplit(location).scheme != "https" or urlsplit(location).hostname != PUBLIC_SITE_HOST
    ]
    if unexpected:
        errors.extend(
            f"public /sitemap.xml: URL {location!r} must stay on {PUBLIC_SITE_ORIGIN}"
            for location in unexpected
        )

    if any(token in response.body.decode("utf-8", errors="ignore").lower() for token in PLACEHOLDER_TOKENS):
        errors.append("public /sitemap.xml: contains a placeholder, localhost or run.app reference")

    return errors


def run_checks(
    site_url: str,
    *,
    timeout_seconds: float,
    request: Callable[[urllib.request.Request, float], Response] = _request,
) -> list[str]:
    errors: list[str] = []
    try:
        origin = _normalized_origin(site_url, "site URL")
    except ValueError as exc:
        return [str(exc)]

    required_routes = _read_public_routes()
    shared_build_sha: str | None = None
    seen_routes: set[str] = set()

    for route in required_routes:
        route_errors, route_build_sha = _validate_page(
            origin,
            route,
            request,
            timeout_seconds,
            shared_build_sha,
        )
        errors.extend(route_errors)
        if route_build_sha and shared_build_sha is None:
            shared_build_sha = route_build_sha
        seen_routes.add(route)

    if shared_build_sha is None:
        errors.append("public routes: no valid build SHA was discovered")

    errors.extend(_validate_robots(origin, request, timeout_seconds))
    errors.extend(_validate_sitemap(origin, request, timeout_seconds, seen_routes))
    return errors


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site-url", default=PUBLIC_SITE_ORIGIN)
    parser.add_argument("--timeout-seconds", type=float, default=10)
    args = parser.parse_args()
    if args.timeout_seconds <= 0:
        parser.error("--timeout-seconds must be positive")
    return args


def main() -> int:
    args = parse_args()
    errors = run_checks(args.site_url, timeout_seconds=args.timeout_seconds)
    if not errors:
        print(
            "Indexability check passed: production pages are canonical, indexable, and the sitemap/robots contract is consistent."
        )
        return 0

    print("Indexability check failed:", file=sys.stderr)
    for error in errors:
        print(f"- {error}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
