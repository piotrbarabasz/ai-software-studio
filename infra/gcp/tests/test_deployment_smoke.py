from __future__ import annotations

import importlib.util
import json
import sys
import unittest
import urllib.request
from pathlib import Path
from urllib.parse import urlsplit

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
SCRIPT_PATH = REPOSITORY_ROOT / "scripts" / "gcp" / "smoke_deployment.py"


def load_script():
    spec = importlib.util.spec_from_file_location("smoke_deployment", SCRIPT_PATH)
    if spec is None or spec.loader is None:
        raise AssertionError("cannot import smoke_deployment.py")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


smoke = load_script()


class FakeDeployment:
    def __init__(self) -> None:
        self.requests: list[urllib.request.Request] = []

    def __call__(self, request: urllib.request.Request, timeout: float):
        self.requests.append(request)
        parsed = urlsplit(request.full_url)
        path = parsed.path
        headers: dict[str, str] = {}
        status = 200

        if parsed.netloc == "api.run.app":
            if path == "/health":
                body = json.dumps({"status": "ok", "service": "marketing-api"}).encode()
            elif path == "/ready":
                body = json.dumps(
                    {"status": "ready", "service": "marketing-api"}
                ).encode()
            elif path == "/api/contact" and request.get_method() == "OPTIONS":
                body = b"OK"
                headers = {
                    "access-control-allow-methods": "GET, POST, OPTIONS",
                    "access-control-allow-origin": "https://protolume.pl",
                }
            else:
                status, body = 404, b"missing"
            return smoke.Response(status=status, headers=headers, body=body)

        if path in smoke.PUBLIC_ROUTES:
            canonical = "https://protolume.pl" if path == "/" else request.full_url
            body = (
                '<html><head><link rel="canonical" href="'
                + canonical
                + '"><meta name="robots" content="noindex, follow"></head></html>'
            ).encode()
            headers = {"x-robots-tag": "noindex, follow"}
        elif path == smoke.NOT_FOUND_PATH:
            status, body = 404, b"not found"
            headers = {"x-robots-tag": "noindex, follow"}
        elif path == "/robots.txt":
            body = b"User-agent: *\nAllow: /\n\nSitemap: https://protolume.pl/sitemap.xml\n"
        elif path == "/sitemap.xml":
            locations = "".join(
                f"<url><loc>https://protolume.pl{'' if route == '/' else route}</loc></url>"
                for route in smoke.PUBLIC_ROUTES
            )
            body = (
                '<?xml version="1.0"?><urlset '
                'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
                f"{locations}</urlset>"
            ).encode()
        else:
            status, body = 404, b"missing"
        return smoke.Response(status=status, headers=headers, body=body)


class DeploymentSmokeTest(unittest.TestCase):
    def test_public_routes_match_the_versioned_prerender_manifest(self) -> None:
        routes = tuple(
            route
            for route in (REPOSITORY_ROOT / "frontend" / "src" / "prerender-routes.txt")
            .read_text(encoding="utf-8")
            .splitlines()
            if route and route != "/404"
        )

        self.assertEqual(smoke.PUBLIC_ROUTES, routes)

    def test_complete_smoke_uses_only_get_and_options_without_a_request_body(
        self,
    ) -> None:
        deployment = FakeDeployment()

        errors = smoke.run_checks(
            "https://api.run.app",
            "https://protolume.pl",
            expect_noindex=True,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertEqual(errors, [])
        methods = {request.get_method() for request in deployment.requests}
        self.assertEqual(methods, {"GET", "OPTIONS"})
        self.assertTrue(all(request.data is None for request in deployment.requests))
        contact_requests = [
            request
            for request in deployment.requests
            if urlsplit(request.full_url).path == "/api/contact"
        ]
        self.assertEqual(len(contact_requests), 1)
        self.assertEqual(contact_requests[0].get_method(), "OPTIONS")

    def test_noindex_mismatch_fails_without_exposing_response_content(self) -> None:
        deployment = FakeDeployment()

        def wrong_header(request: urllib.request.Request, timeout: float):
            response = deployment(request, timeout)
            if urlsplit(request.full_url).path == "/studio":
                return smoke.Response(
                    status=response.status,
                    headers={"x-robots-tag": "index, follow"},
                    body=response.body,
                )
            return response

        errors = smoke.run_checks(
            "https://api.run.app",
            "https://protolume.pl",
            expect_noindex=True,
            timeout_seconds=2,
            request=wrong_header,
        )

        self.assertIn(
            "public route /studio: X-Robots-Tag is not noindex, follow", errors
        )
        self.assertNotIn("<html>", "\n".join(errors))

    def test_urls_must_be_https_origins(self) -> None:
        for backend_url, site_url in (
            ("http://api.run.app", "https://protolume.pl"),
            ("https://api.run.app/path", "https://protolume.pl"),
            ("https://api.run.app", "https://protolume.pl/preview"),
        ):
            with self.subTest(backend_url=backend_url, site_url=site_url):
                with self.assertRaises(ValueError):
                    smoke.run_checks(
                        backend_url,
                        site_url,
                        expect_noindex=True,
                        timeout_seconds=2,
                    )


if __name__ == "__main__":
    unittest.main()
