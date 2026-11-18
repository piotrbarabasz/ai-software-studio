from __future__ import annotations

import importlib.util
import json
import sys
import unittest
import urllib.request
from pathlib import Path
from urllib.parse import urlsplit


REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
SCRIPT_PATH = REPOSITORY_ROOT / "scripts" / "gcp" / "seo_live_check.py"


def load_script():
    spec = importlib.util.spec_from_file_location("seo_live_check", SCRIPT_PATH)
    if spec is None or spec.loader is None:
        raise AssertionError("cannot import seo_live_check.py")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


seo = load_script()

EXPECTED_BUILD_SHA = "abc1234"
PUBLIC_ROUTES = tuple(
    line.strip()
    for line in (REPOSITORY_ROOT / "frontend" / "src" / "prerender-routes.txt")
    .read_text(encoding="utf-8")
    .splitlines()
    if line.strip() and line.strip() != "/404"
)


def json_ld_home(origin: str, *, extra: dict[str, object] | None = None) -> str:
    graph: list[dict[str, object]] = [
        {
            "@id": f"{origin}#organization",
            "@type": "Organization",
            "name": "Protolume",
            "url": origin,
        },
        {
            "@id": f"{origin}#website",
            "@type": "WebSite",
            "name": "Protolume",
            "url": origin,
        },
    ]
    if extra:
        graph[0].update(extra)
    return json.dumps({"@context": "https://schema.org", "@graph": graph}, separators=(",", ":"))


def json_ld_solutions(origin: str, *, count: int = 5, url_override: str | None = None) -> str:
    item_list = []
    for index in range(count):
        item_list.append(
            {
                "@type": "ListItem",
                "position": index + 1,
                "name": f"Rozwiązanie {index + 1}",
                "item": {
                    "@type": "Service",
                    "name": f"Rozwiązanie {index + 1}",
                    "url": url_override or f"{origin}/rozwiazania#solution-{index + 1}",
                },
            }
        )
    return json.dumps(
        {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@id": f"{origin}/rozwiazania#solutions",
                    "@type": "ItemList",
                    "itemListElement": item_list,
                }
            ],
        },
        separators=(",", ":"),
    )


class FakeSeoDeployment:
    def __init__(
        self,
        *,
        homepage_sha: str = EXPECTED_BUILD_SHA,
        mutator=None,
    ) -> None:
        self.homepage_sha = homepage_sha
        self.mutator = mutator
        self.requests: list[urllib.request.Request] = []

    def page_title(self, path: str) -> str:
        titles = {
            "/": "Start | Protolume",
            "/demo-ai": "Demo AI | Protolume",
            "/przyklad-demo": "Przykład demo | Protolume",
            "/rozwiazania": "Rozwiązania AI | Protolume",
            "/rozwiazania/chatbot-ai-dla-firm": "Chatbot AI dla firm | Protolume",
            "/rozwiazania/voice-ai-dla-firm": "Voice AI dla firm | Protolume",
            "/rozwiazania/automatyzacja-procesow": "Automatyzacja procesów | Protolume",
            "/rozwiazania/integracje-whatsapp-crm": "Integracje WhatsApp i CRM | Protolume",
            "/rozwiazania/systemy-agentowe": "Systemy agentowe | Protolume",
            "/development": "Wdrożenia | Protolume",
            "/studio": "O Protolume | Protolume",
            "/rd": "R&D | Protolume",
            "/kontakt": "Kontakt | Protolume",
            "/polityka-prywatnosci": "Polityka prywatności | Protolume",
        }
        return titles[path]

    def page_description(self, path: str) -> str:
        descriptions = {
            "/": "Startowa strona Protolume.",
            "/demo-ai": "Demo AI Protolume.",
            "/przyklad-demo": "Przykładowy rezultat Protolume.",
            "/rozwiazania": "Opis rozwiązań Protolume.",
            "/rozwiazania/chatbot-ai-dla-firm": "Chatbot AI dla firm Protolume.",
            "/rozwiazania/voice-ai-dla-firm": "Voice AI dla firm Protolume.",
            "/rozwiazania/automatyzacja-procesow": "Automatyzacja procesów Protolume.",
            "/rozwiazania/integracje-whatsapp-crm": "Integracje WhatsApp i CRM Protolume.",
            "/rozwiazania/systemy-agentowe": "Systemy agentowe Protolume.",
            "/development": "Wdrożenia Protolume.",
            "/studio": "O Protolume i współpracy.",
            "/rd": "Badania i eksperymenty Protolume.",
            "/kontakt": "Kontakt z Protolume.",
            "/polityka-prywatnosci": "Polityka prywatności Protolume.",
        }
        return descriptions[path]

    def build_html(self, origin: str, path: str) -> str:
        canonical = origin if path == "/" else f"{origin}{path}"
        title = self.page_title(path)
        description = self.page_description(path)
        social_image = f"{origin}/assets/protolume-social-preview.png"
        json_ld = ""
        if path == "/":
            json_ld = f'<script type="application/ld+json">{json_ld_home(origin)}</script>'
        if path == "/rozwiazania":
            json_ld = f'<script type="application/ld+json">{json_ld_solutions(origin)}</script>'
        build_sha = f'<meta name="protolume-build-sha" content="{self.homepage_sha}">' if path == "/" else ""
        return (
            "<html><head>"
            f"<title>{title}</title>"
            f'<meta name="description" content="{description}">'
            f'<link rel="canonical" href="{canonical}">'
            '<meta name="robots" content="index, follow">'
            f'<meta property="og:title" content="{title}">'
            f'<meta property="og:description" content="{description}">'
            f'<meta property="og:url" content="{canonical}">'
            f'<meta property="og:image" content="{social_image}">'
            '<meta property="og:image:type" content="image/png">'
            '<meta name="twitter:card" content="summary_large_image">'
            f'<meta name="twitter:title" content="{title}">'
            f'<meta name="twitter:description" content="{description}">'
            f'<meta name="twitter:image" content="{social_image}">'
            f"{build_sha}"
            f"{json_ld}"
            "</head><body><main><h1>Treść</h1></main></body></html>"
        )

    def __call__(self, request: urllib.request.Request, timeout: float):
        self.requests.append(request)
        parsed = urlsplit(request.full_url)
        origin = f"{parsed.scheme}://{parsed.netloc}"
        path = parsed.path or "/"
        headers: dict[str, str] = {}
        status = 200
        body = b""

        if parsed.netloc != "protolume.pl":
            status, body = 404, b"missing"
        elif path in PUBLIC_ROUTES:
            body = self.build_html(origin, path).encode("utf-8")
        elif path == seo.SOCIAL_PREVIEW_PATH:
            headers = {"content-type": seo.SOCIAL_PREVIEW_TYPE}
            body = b"\x89PNG\r\n\x1a\n"
        elif path == "/robots.txt":
            body = (
                "User-agent: *\nAllow: /\n\n"
                f"Sitemap: {origin}/sitemap.xml\n"
            ).encode("utf-8")
        elif path == "/sitemap.xml":
            locations = "".join(
                f"<url><loc>{origin}{'' if route == '/' else route}</loc></url>"
                for route in PUBLIC_ROUTES
            )
            body = (
                '<?xml version="1.0" encoding="UTF-8"?>'
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
                f"{locations}</urlset>"
            ).encode("utf-8")
        elif path == "/__protolume_read_only_smoke_missing__":
            status, body = 404, b"missing"
            headers = {"x-robots-tag": "noindex, follow"}
        else:
            status, body = 404, b"missing"

        response = seo.Response(status=status, headers=headers, body=body)
        if self.mutator is not None:
            response = self.mutator(parsed.path or "/", response)
        return response


class LiveSeoCheckTest(unittest.TestCase):
    def test_social_preview_contract_matches_public_brand_config(self) -> None:
        brand = json.loads(
            (
                REPOSITORY_ROOT
                / "frontend"
                / "config"
                / "public-brand.json"
            ).read_text(encoding="utf-8")
        )

        self.assertEqual(
            seo.SOCIAL_PREVIEW_PATH,
            brand["assets"]["socialPreviewPath"],
        )
        self.assertEqual(
            seo.SOCIAL_PREVIEW_TYPE,
            brand["assets"]["socialPreviewType"],
        )

    def test_public_routes_match_the_versioned_prerender_manifest(self) -> None:
        routes = tuple(
            route
            for route in (REPOSITORY_ROOT / "frontend" / "src" / "prerender-routes.txt")
            .read_text(encoding="utf-8")
            .splitlines()
            if route and route != "/404"
        )

        self.assertEqual(routes, PUBLIC_ROUTES)

    def test_valid_live_seo_check_passes_for_the_expected_release(self) -> None:
        deployment = FakeSeoDeployment()

        errors = seo.run_checks(
            "https://protolume.pl",
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertEqual(errors, [])

    def test_live_checker_rejects_a_missing_social_preview(self) -> None:
        deployment = FakeSeoDeployment(
            mutator=lambda path, response: seo.Response(
                404,
                response.headers,
                b"missing",
            )
            if path == seo.SOCIAL_PREVIEW_PATH
            else response
        )

        errors = seo.run_checks(
            "https://protolume.pl",
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertIn(
            "public social preview: expected HTTP 200, received 404",
            errors,
        )

    def test_live_checker_rejects_a_social_preview_with_the_wrong_content_type(self) -> None:
        deployment = FakeSeoDeployment(
            mutator=lambda path, response: seo.Response(
                response.status,
                {"content-type": "text/html"},
                response.body,
            )
            if path == seo.SOCIAL_PREVIEW_PATH
            else response
        )

        errors = seo.run_checks(
            "https://protolume.pl",
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertIn(
            "public social preview: content type must be image/png",
            errors,
        )

    def test_live_checker_rejects_a_social_preview_without_a_png_signature(self) -> None:
        deployment = FakeSeoDeployment(
            mutator=lambda path, response: seo.Response(
                response.status,
                response.headers,
                b"not a PNG",
            )
            if path == seo.SOCIAL_PREVIEW_PATH
            else response
        )

        errors = seo.run_checks(
            "https://protolume.pl",
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertIn("public social preview: response is not a PNG image", errors)

    def test_live_checker_rejects_noindex_headers(self) -> None:
        deployment = FakeSeoDeployment(
            mutator=lambda path, response: seo.Response(
                response.status,
                {**response.headers, **({"x-robots-tag": "noindex, follow"} if path == "/" else {})},
                response.body,
            )
        )

        errors = seo.run_checks(
            "https://protolume.pl",
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertTrue(any("X-Robots-Tag" in error for error in errors))

    def test_live_checker_rejects_an_other_canonical(self) -> None:
        deployment = FakeSeoDeployment(
            mutator=lambda path, response: seo.Response(
                response.status,
                response.headers,
                response.body.replace(
                    b'<link rel="canonical" href="https://protolume.pl/rozwiazania">',
                    b'<link rel="canonical" href="https://example.invalid/rozwiazania">',
                )
                if path == "/rozwiazania"
                else response.body,
            )
        )

        errors = seo.run_checks(
            "https://protolume.pl",
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertIn(
            "public route /rozwiazania: canonical URL does not match the public origin",
            errors,
        )

    def test_live_checker_rejects_missing_h1(self) -> None:
        deployment = FakeSeoDeployment(
            mutator=lambda path, response: seo.Response(
                response.status,
                response.headers,
                response.body.replace(b"<h1>Treść</h1>", b"")
                if path == "/studio"
                else response.body,
            )
        )

        errors = seo.run_checks(
            "https://protolume.pl",
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertIn(
            "public route /studio: expected exactly one h1, received 0",
            errors,
        )

    def test_live_checker_rejects_duplicate_h1(self) -> None:
        deployment = FakeSeoDeployment(
            mutator=lambda path, response: seo.Response(
                response.status,
                response.headers,
                response.body.replace(
                    b"</main>",
                    b"<h1>Drugi naglowek</h1></main>",
                )
                if path == "/studio"
                else response.body,
            )
        )

        errors = seo.run_checks(
            "https://protolume.pl",
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertIn(
            "public route /studio: expected exactly one h1, received 2",
            errors,
        )

    def test_live_checker_rejects_duplicate_meta_descriptions(self) -> None:
        deployment = FakeSeoDeployment(
            mutator=lambda path, response: seo.Response(
                response.status,
                response.headers,
                response.body.replace(
                    b"Demo AI Protolume.",
                    b"Startowa strona Protolume.",
                )
                if path == "/demo-ai"
                else response.body,
            )
        )

        errors = seo.run_checks(
            "https://protolume.pl",
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertIn("public routes: meta descriptions must be unique", errors)

    def test_live_checker_rejects_mismatched_open_graph_and_twitter_metadata(self) -> None:
        deployment = FakeSeoDeployment(
            mutator=lambda path, response: seo.Response(
                response.status,
                response.headers,
                response.body.replace(
                    b'<meta property="og:url" content="https://protolume.pl/studio">',
                    b'<meta property="og:url" content="https://wrong.example/studio">',
                )
                if path == "/studio"
                else response.body,
            )
        )

        errors = seo.run_checks(
            "https://protolume.pl",
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertIn(
            "public route /studio: Open Graph URL does not match the canonical URL",
            errors,
        )

    def test_live_checker_rejects_duplicate_titles(self) -> None:
        deployment = FakeSeoDeployment(
            mutator=lambda path, response: seo.Response(
                response.status,
                response.headers,
                response.body.replace(
                    b"<title>Demo AI | Protolume</title>",
                    b"<title>Start | Protolume</title>",
                )
                if path == "/demo-ai"
                else response.body,
            )
        )

        errors = seo.run_checks(
            "https://protolume.pl",
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertIn("public routes: titles must be unique", errors)

    def test_live_checker_rejects_a_stale_build_sha(self) -> None:
        deployment = FakeSeoDeployment(homepage_sha="def5678")

        errors = seo.run_checks(
            "https://protolume.pl",
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertIn(
            "public route /: protolume-build-sha meta tag does not match the expected build SHA",
            errors,
        )

    def test_live_checker_rejects_run_app_urls_in_json_ld_and_sitemap(self) -> None:
        deployment = FakeSeoDeployment(
            mutator=lambda path, response: seo.Response(
                response.status,
                response.headers,
                response.body.replace(
                    b"https://protolume.pl/rozwiazania#solution-1",
                    b"https://old-service.run.app/rozwiazania#solution-1",
                )
                if path == "/rozwiazania"
                else response.body,
            )
        )

        errors = seo.run_checks(
            "https://protolume.pl",
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertTrue(any("run.app" in error for error in errors))

    def test_live_checker_rejects_an_item_list_without_five_positions(self) -> None:
        deployment = FakeSeoDeployment(
            mutator=lambda path, response: seo.Response(
                response.status,
                response.headers,
                response.body.replace(
                    json_ld_solutions("https://protolume.pl").encode("utf-8"),
                    json_ld_solutions("https://protolume.pl", count=4).encode("utf-8"),
                )
                if path == "/rozwiazania"
                else response.body,
            )
        )

        errors = seo.run_checks(
            "https://protolume.pl",
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertIn(
            "public route /rozwiazania: ItemList must contain exactly five positions",
            errors,
        )

    def test_live_checker_rejects_forbidden_json_ld_metrics(self) -> None:
        deployment = FakeSeoDeployment(
            mutator=lambda path, response: seo.Response(
                response.status,
                response.headers,
                response.body.replace(
                    b'"@type":"Organization"',
                    b'"@type":"Organization","aggregateRating":{"@type":"AggregateRating","ratingValue":"5","price":"100","numberOfClients":12}',
                )
                if path == "/"
                else response.body,
            )
        )

        errors = seo.run_checks(
            "https://protolume.pl",
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertTrue(
            any("JSON-LD must not expose" in error for error in errors),
        )


if __name__ == "__main__":
    unittest.main()
