#!/usr/bin/env python3
"""Read-only production SEO verification for the live Protolume site."""

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
from pathlib import Path
from typing import Callable, Iterable, Mapping
from urllib.parse import urlsplit


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
PUBLIC_ROUTES_PATH = REPOSITORY_ROOT / "frontend" / "src" / "prerender-routes.txt"
MAX_RESPONSE_BYTES = 2_000_000
BUILD_SHA_PATTERN = re.compile(r"^[0-9a-f]{7,64}$")
PLACEHOLDER_BUILD_SHAS = {"unknown", "local", "test"}
PUBLIC_SITE_HOST = "protolume.pl"
PUBLIC_SITE_ORIGIN = f"https://{PUBLIC_SITE_HOST}"
URL_PATTERN = re.compile(r"https?://[^\s\"'<>]+", re.IGNORECASE)
SOCIAL_PREVIEW_PATH = "/assets/protolume-social-preview.png"
SOCIAL_PREVIEW_TYPE = "image/png"
ALLOWED_JSON_LD_URLS = {"https://schema.org", "http://schema.org"}


@dataclass(frozen=True)
class Response:
    status: int
    headers: Mapping[str, str]
    body: bytes


class SeoPageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title: str | None = None
        self.description: str | None = None
        self.canonical: str | None = None
        self.robots: str | None = None
        self.build_sha: str | None = None
        self.title_count = 0
        self.h1_count = 0
        self.description_count = 0
        self.canonical_count = 0
        self.meta_counts: dict[str, int] = {}
        self.open_graph_title: str | None = None
        self.open_graph_description: str | None = None
        self.open_graph_url: str | None = None
        self.open_graph_image: str | None = None
        self.open_graph_image_type: str | None = None
        self.twitter_card: str | None = None
        self.twitter_title: str | None = None
        self.twitter_description: str | None = None
        self.twitter_image: str | None = None
        self.script_blocks: list[str] = []
        self.hrefs: list[str] = []
        self._capture_title = False
        self._capture_json_ld = False
        self._title_parts: list[str] = []
        self._json_ld_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag_name = tag.lower()
        attributes = {name.lower(): value or "" for name, value in attrs}

        if tag_name == "title":
            self.title_count += 1
            self._capture_title = True
        if tag_name == "h1":
            self.h1_count += 1
        if tag_name == "meta":
            name = attributes.get("name", "").lower()
            property_name = attributes.get("property", "").lower()
            content = attributes.get("content")
            if name or property_name:
                key = f"name:{name}" if name else f"property:{property_name}"
                self.meta_counts[key] = self.meta_counts.get(key, 0) + 1
            if name == "description":
                self.description_count += 1
                self.description = content
            elif name == "robots":
                self.robots = content
            elif name == "protolume-build-sha":
                self.build_sha = content
            elif name == "twitter:card":
                self.twitter_card = content
            elif name == "twitter:title":
                self.twitter_title = content
            elif name == "twitter:description":
                self.twitter_description = content
            elif name == "twitter:image":
                self.twitter_image = content
            if property_name == "og:title":
                self.open_graph_title = content
            elif property_name == "og:description":
                self.open_graph_description = content
            elif property_name == "og:url":
                self.open_graph_url = content
            elif property_name == "og:image":
                self.open_graph_image = content
            elif property_name == "og:image:type":
                self.open_graph_image_type = content
        if tag_name == "link" and "canonical" in attributes.get("rel", "").lower().split():
            self.canonical_count += 1
            self.canonical = attributes.get("href")
        if "href" in attributes:
            self.hrefs.append(attributes["href"])
        if tag_name == "script" and attributes.get("type", "").lower() == "application/ld+json":
            self._capture_json_ld = True
            self._json_ld_parts = []

    def handle_endtag(self, tag: str) -> None:
        tag_name = tag.lower()
        if tag_name == "title" and self._capture_title:
            self.title = re.sub(r"\s+", " ", "".join(self._title_parts)).strip() or None
            self._capture_title = False
            self._title_parts = []
        if tag_name == "script" and self._capture_json_ld:
            self.script_blocks.append("".join(self._json_ld_parts).strip())
            self._capture_json_ld = False
            self._json_ld_parts = []

    def handle_data(self, data: str) -> None:
        if self._capture_title:
            self._title_parts.append(data)
        if self._capture_json_ld:
            self._json_ld_parts.append(data)


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
        raise ValueError(f"{field} must be an HTTPS origin without path, query, or fragment")
    return value.rstrip("/")


def _build_sha(value: str) -> str:
    candidate = value.strip()
    if candidate in PLACEHOLDER_BUILD_SHAS or not BUILD_SHA_PATTERN.fullmatch(candidate):
        raise argparse.ArgumentTypeError(
            "--expected-build-sha must be 7-64 lowercase hexadecimal characters and not a placeholder"
        )
    return candidate


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


def _get(
    origin: str,
    path: str,
    request: Callable[[urllib.request.Request, float], Response],
    timeout: float,
) -> Response:
    return request(
        urllib.request.Request(
            f"{origin}{path if path != '/' else '/'}",
            headers={"User-Agent": "protolume-live-seo-check/1.0"},
            method="GET",
        ),
        timeout,
    )


def _public_routes() -> tuple[str, ...]:
    routes = (
        line.strip()
        for line in PUBLIC_ROUTES_PATH.read_text(encoding="utf-8").splitlines()
    )
    return tuple(route for route in routes if route and route != "/404")


def _parse_html(body: bytes) -> SeoPageParser:
    parser = SeoPageParser()
    parser.feed(body.decode("utf-8"))
    return parser


def _find_json_ld_documents(parser: SeoPageParser) -> list[object]:
    documents: list[object] = []
    for script in parser.script_blocks:
        if not script:
            continue
        parsed = json.loads(script)
        if isinstance(parsed, list):
            documents.extend(parsed)
        else:
            documents.append(parsed)
    return documents


def _iter_json_ld_nodes(value: object) -> Iterable[dict[str, object]]:
    if isinstance(value, dict):
        yield value
        for nested in value.values():
            yield from _iter_json_ld_nodes(nested)
    elif isinstance(value, list):
        for nested in value:
            yield from _iter_json_ld_nodes(nested)


def _iter_string_values(value: object) -> Iterable[str]:
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for nested in value.values():
            yield from _iter_string_values(nested)
    elif isinstance(value, list):
        for nested in value:
            yield from _iter_string_values(nested)


def _json_ld_url_errors(json_ld_documents: list[object], route: str) -> list[str]:
    errors: list[str] = []
    for document in json_ld_documents:
        for value in _iter_string_values(document):
            for match in URL_PATTERN.findall(value):
                if match.rstrip("/") in ALLOWED_JSON_LD_URLS:
                    continue
                parsed = urlsplit(match)
                if parsed.scheme != "https" or parsed.hostname != PUBLIC_SITE_HOST:
                    errors.append(
                        f"public route {route}: JSON-LD URL {match!r} must stay on {PUBLIC_SITE_ORIGIN}"
                    )
    return errors


def _json_ld_forbidden_key_errors(json_ld_documents: list[object], route: str) -> list[str]:
    forbidden_fragments = ("rating", "price", "numberofclients")
    errors: list[str] = []
    for document in json_ld_documents:
        for node in _iter_json_ld_nodes(document):
            for key in node:
                lowered = key.lower()
                if any(fragment in lowered for fragment in forbidden_fragments):
                    errors.append(
                        f"public route {route}: JSON-LD must not expose {key!r}"
                    )
    return errors


def _validate_page(
    origin: str,
    route: str,
    request: Callable[[urllib.request.Request, float], Response],
    timeout_seconds: float,
    expected_build_sha: str | None,
) -> tuple[list[str], str | None, str | None, str | None]:
    try:
        response = _get(origin, route, request, timeout_seconds)
    except Exception:
        return [f"public route {route}: request failed"], None, None, None

    if response.status != 200:
        return [f"public route {route}: expected HTTP 200, received {response.status}"], None, None, None

    if len(response.body) > MAX_RESPONSE_BYTES:
        return [f"public route {route}: response exceeds the live-check size limit"], None, None, None

    try:
        parser = _parse_html(response.body)
    except UnicodeDecodeError:
        return [f"public route {route}: response is not valid UTF-8 HTML"], None, None, None

    canonical = origin if route == "/" else f"{origin}{route}"
    expected_social_image = f"{origin}{SOCIAL_PREVIEW_PATH}"
    errors: list[str] = []
    if parser.title_count != 1 or not parser.title:
        errors.append(
            f"public route {route}: expected exactly one non-empty title, received {parser.title_count}"
        )
    if parser.h1_count != 1:
        errors.append(
            f"public route {route}: expected exactly one h1, received {parser.h1_count}"
        )
    if parser.description_count != 1 or not parser.description:
        errors.append(
            f"public route {route}: expected exactly one non-empty meta description, received {parser.description_count}"
        )
    if parser.canonical_count != 1:
        errors.append(
            f"public route {route}: expected exactly one canonical URL, received {parser.canonical_count}"
        )
    if parser.canonical != canonical:
        errors.append(f"public route {route}: canonical URL does not match the public origin")

    robots = (parser.robots or "").strip().lower()
    if robots != "index, follow":
        errors.append(f"public route {route}: HTML robots metadata is not index, follow")

    x_robots = response.headers.get("x-robots-tag", "").strip().lower()
    if "noindex" in x_robots:
        errors.append(f"public route {route}: X-Robots-Tag must not contain noindex")

    required_meta = (
        "property:og:title",
        "property:og:description",
        "property:og:url",
        "property:og:image",
        "property:og:image:type",
        "name:twitter:card",
        "name:twitter:title",
        "name:twitter:description",
        "name:twitter:image",
    )
    for key in required_meta:
        if parser.meta_counts.get(key, 0) != 1:
            errors.append(
                f"public route {route}: expected exactly one {key.replace(':', ' ')} tag"
            )
    if parser.open_graph_title != parser.title:
        errors.append(f"public route {route}: Open Graph title does not match the page title")
    if parser.open_graph_description != parser.description:
        errors.append(f"public route {route}: Open Graph description does not match the meta description")
    if parser.open_graph_url != canonical:
        errors.append(f"public route {route}: Open Graph URL does not match the canonical URL")
    if parser.open_graph_image != expected_social_image:
        errors.append(f"public route {route}: Open Graph image does not match the approved social preview")
    if parser.open_graph_image_type != SOCIAL_PREVIEW_TYPE:
        errors.append(f"public route {route}: Open Graph image type must be image/png")
    if parser.twitter_card != "summary_large_image":
        errors.append(f"public route {route}: Twitter card must be summary_large_image")
    if parser.twitter_title != parser.title:
        errors.append(f"public route {route}: Twitter title does not match the page title")
    if parser.twitter_description != parser.description:
        errors.append(f"public route {route}: Twitter description does not match the meta description")
    if parser.twitter_image != expected_social_image:
        errors.append(f"public route {route}: Twitter image does not match the approved social preview")

    build_sha: str | None = None
    if route == "/":
        build_sha = parser.build_sha
        if (
            not isinstance(build_sha, str)
            or not build_sha.strip()
            or build_sha in PLACEHOLDER_BUILD_SHAS
            or "__" in build_sha
        ):
            errors.append(
                "public route /: protolume-build-sha meta tag must be a non-placeholder deployed SHA"
            )
        elif expected_build_sha and build_sha != expected_build_sha:
            errors.append(
                "public route /: protolume-build-sha meta tag does not match the expected build SHA"
            )

    try:
        json_ld_documents = _find_json_ld_documents(parser)
    except json.JSONDecodeError:
        return [f"public route {route}: JSON-LD is not valid JSON"], parser.title, parser.description, build_sha
    errors.extend(_json_ld_url_errors(json_ld_documents, route))
    errors.extend(_json_ld_forbidden_key_errors(json_ld_documents, route))

    if route == "/":
        types = [
            node.get("@type")
            for document in json_ld_documents
            for node in _iter_json_ld_nodes(document)
        ]
        if "Organization" not in types:
            errors.append("public route /: Organization JSON-LD is missing")
        if "WebSite" not in types:
            errors.append("public route /: WebSite JSON-LD is missing")

    if route == "/rozwiazania":
        item_list = next(
            (
                node
                for document in json_ld_documents
                for node in _iter_json_ld_nodes(document)
                if node.get("@type") == "ItemList"
            ),
            None,
        )
        if not item_list:
            errors.append("public route /rozwiazania: ItemList JSON-LD is missing")
        else:
            items = item_list.get("itemListElement")
            if not isinstance(items, list) or len(items) != 5:
                errors.append(
                    "public route /rozwiazania: ItemList must contain exactly five positions"
                )
            else:
                positions = [item.get("position") for item in items if isinstance(item, dict)]
                if positions != [1, 2, 3, 4, 5]:
                    errors.append(
                        "public route /rozwiazania: ItemList positions must run from 1 to 5"
                    )
                services = [
                    item.get("item")
                    for item in items
                    if isinstance(item, dict) and isinstance(item.get("item"), dict)
                ]
                if len(services) != 5 or any(service.get("@type") != "Service" for service in services):
                    errors.append(
                        "public route /rozwiazania: ItemList must expose exactly five Service entries"
                    )

    return errors, parser.title, parser.description, build_sha



def _validate_social_preview(
    origin: str,
    request: Callable[[urllib.request.Request, float], Response],
    timeout_seconds: float,
) -> list[str]:
    try:
        response = _get(origin, SOCIAL_PREVIEW_PATH, request, timeout_seconds)
    except Exception:
        return ["public social preview: request failed"]

    errors: list[str] = []
    if response.status != 200:
        errors.append(
            f"public social preview: expected HTTP 200, received {response.status}"
        )
    if len(response.body) > MAX_RESPONSE_BYTES:
        errors.append("public social preview: response exceeds the live-check size limit")

    content_type = next(
        (
            value
            for key, value in response.headers.items()
            if key.lower() == "content-type"
        ),
        "",
    ).split(";", 1)[0].strip().lower()
    if content_type != SOCIAL_PREVIEW_TYPE:
        errors.append(
            f"public social preview: content type must be {SOCIAL_PREVIEW_TYPE}"
        )
    if not response.body.startswith(b"\x89PNG\r\n\x1a\n"):
        errors.append("public social preview: response is not a PNG image")
    return errors


def _validate_robots(
    origin: str,
    request: Callable[[urllib.request.Request, float], Response],
    timeout_seconds: float,
) -> list[str]:
    try:
        response = _get(origin, "/robots.txt", request, timeout_seconds)
    except Exception:
        return ["public /robots.txt: request failed"]

    if response.status != 200:
        return [f"public /robots.txt: expected HTTP 200, received {response.status}"]

    try:
        robots = response.body.decode("utf-8")
    except UnicodeDecodeError:
        return ["public /robots.txt: response is not valid UTF-8"]

    errors: list[str] = []
    if "Disallow: /" in robots:
        errors.append("public /robots.txt: production must allow crawling")
    if "Allow: /" not in robots:
        errors.append("public /robots.txt: production must include Allow: /")
    sitemap_line = f"Sitemap: {origin}/sitemap.xml"
    if sitemap_line not in robots:
        errors.append("public /robots.txt: sitemap URL does not match the public origin")
    if "run.app" in robots or "__PUBLIC_CONFIG_REQUIRED__" in robots:
        errors.append("public /robots.txt: contains a placeholder or legacy origin")
    return errors


def _validate_sitemap(
    origin: str,
    request: Callable[[urllib.request.Request, float], Response],
    timeout_seconds: float,
) -> list[str]:
    try:
        response = _get(origin, "/sitemap.xml", request, timeout_seconds)
    except Exception:
        return ["public /sitemap.xml: request failed"]

    if response.status != 200:
        return [f"public /sitemap.xml: expected HTTP 200, received {response.status}"]

    try:
        root = ET.fromstring(response.body)
    except ET.ParseError:
        return ["public /sitemap.xml: response is not valid XML"]

    errors: list[str] = []
    locations = [
        (element.text or "").strip()
        for element in root.findall(
            "{http://www.sitemaps.org/schemas/sitemap/0.9}url/{http://www.sitemaps.org/schemas/sitemap/0.9}loc"
        )
    ]
    expected_locations = [
        origin if route == "/" else f"{origin}{route}"
        for route in _public_routes()
    ]
    if locations != expected_locations:
        errors.append("public /sitemap.xml: routes or public origin do not match")

    for location in locations:
        parsed = urlsplit(location)
        if parsed.scheme != "https" or parsed.hostname != PUBLIC_SITE_HOST:
            errors.append(
                f"public /sitemap.xml: URL {location!r} must stay on {PUBLIC_SITE_ORIGIN}"
            )
        if "run.app" in location:
            errors.append("public /sitemap.xml: contains a legacy run.app URL")
    return errors


def run_checks(
    site_url: str,
    *,
    expected_build_sha: str,
    timeout_seconds: float,
    request: Callable[[urllib.request.Request, float], Response] = _request,
) -> list[str]:
    origin = _origin(site_url, "site URL")
    errors: list[str] = []
    titles: dict[str, str] = {}

    descriptions: dict[str, str] = {}
    for route in _public_routes():
        route_errors, title, description, _ = _validate_page(
            origin,
            route,
            request,
            timeout_seconds,
            expected_build_sha,
        )
        errors.extend(route_errors)
        if title:
            titles[route] = title
        if description:
            descriptions[route] = description

    if len(set(titles.values())) != len(titles):
        errors.append("public routes: titles must be unique")
    if len(set(descriptions.values())) != len(descriptions):
        errors.append("public routes: meta descriptions must be unique")

    errors.extend(_validate_robots(origin, request, timeout_seconds))
    errors.extend(_validate_sitemap(origin, request, timeout_seconds))
    errors.extend(_validate_social_preview(origin, request, timeout_seconds))
    return errors


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
    parser.add_argument("--site-url", default=PUBLIC_SITE_ORIGIN)
    parser.add_argument("--expected-build-sha", required=True, type=_build_sha)
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
                args.site_url,
                expected_build_sha=args.expected_build_sha,
                timeout_seconds=args.timeout_seconds,
            ),
            args.attempts,
            args.retry_delay_seconds,
        )
        if not errors:
            print(
                "Read-only live SEO check passed: public routes, unique titles/descriptions, H1, canonical, Open Graph/Twitter, JSON-LD, robots, sitemap, published PNG social preview and build provenance are correct."
            )
            return 0
    except ValueError as exc:
        print(f"Live SEO check configuration error: {exc}", file=sys.stderr)
        return 2

    print("Read-only live SEO check failed:", file=sys.stderr)
    for error in errors:
        print(f"- {error}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
