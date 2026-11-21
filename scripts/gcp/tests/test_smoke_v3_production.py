"""Unit tests for read-only production V3 smoke checks."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SCRIPTS_DIR))

import smoke_v3_production as smoke  # noqa: E402

SITE = "https://protolume.pl"
API = "https://aisoftware-studio-api-175725977490.europe-central2.run.app"
SHA = "9f1a7bb"


def fixtures(path: str) -> smoke.Response:
    if path.endswith("/health"):
        return smoke.Response(200, {}, '{"status":"ok","buildSha":"another-build"}')
    if path.endswith("/ready"):
        return smoke.Response(200, {}, '{"status":"ready"}')
    if path.endswith("/api/contact/brief"):
        return smoke.Response(403, {}, "")
    if path.endswith("/__protolume_v3_not_found__"):
        return smoke.Response(404, {}, "")
    if path.endswith("/robots.txt"):
        return smoke.Response(200, {}, "User-agent: *\nAllow: /\n")
    if path.endswith("/sitemap.xml"):
        return smoke.Response(200, {}, "<loc>https://protolume.pl/</loc>")
    if path.endswith("/polityka-prywatnosci/"):
        return smoke.Response(200, {}, "Administrator danych")
    if path == SITE + "/":
        return smoke.Response(
            200,
            {"content-type": "text/html; charset=utf-8"},
            '<meta name="robots" content="index, follow">'
            '<link rel="canonical" href="https://protolume.pl/">'
            f'<meta name="protolume-build-sha" content="{SHA}">'
            'data-endpoint="/api/contact/brief"'
            'id="obszary" id="wspolpraca" id="rozwiazania" id="kontakt"',
        )
    return smoke.Response(200, {}, "static asset")


class V3ProductionSmokeTest(unittest.TestCase):
    def test_all_checks_pass_for_indexable_site_and_working_api(self) -> None:
        self.assertEqual(smoke.validate_response(SITE, API, SHA, fixtures), [])

    def test_no_contact_post_is_performed(self) -> None:
        seen = []

        def recording_fetch(url: str) -> smoke.Response:
            seen.append(url)
            return fixtures(url)

        self.assertEqual(smoke.validate_response(SITE, API, SHA, recording_fetch), [])
        self.assertEqual(
            [url for url in seen if "/api/contact/brief" in url],
            [SITE + "/api/contact/brief"],
        )

    def test_rejects_wrong_project_domain_and_image_marker(self) -> None:
        self.assertTrue(
            smoke.validate_response("https://example.org", API, SHA, fixtures)
        )
        self.assertTrue(smoke.validate_response(SITE, API, "preview", fixtures))
        self.assertTrue(
            smoke.validate_response(SITE, "https://unrelated.invalid", SHA, fixtures)
        )

    def test_detects_noindex_on_production(self) -> None:
        def bad_home(url: str) -> smoke.Response:
            result = fixtures(url)
            if url == SITE + "/":
                result.headers["x-robots-tag"] = "noindex, nofollow"
            return result

        self.assertTrue(
            any(
                "blocks indexing" in error
                for error in smoke.validate_response(SITE, API, SHA, bad_home)
            )
        )

    def test_detects_missing_shas_and_disabled_form(self) -> None:
        def bad_home(url: str) -> smoke.Response:
            result = fixtures(url)
            if url == SITE + "/":
                result.body = result.body.replace(SHA, "unknown").replace(
                    'data-endpoint="/api/contact/brief"', 'data-endpoint=""'
                )
            return result

        errors = smoke.validate_response(SITE, API, SHA, bad_home)
        self.assertTrue(any("build-sha" in e for e in errors))
        self.assertTrue(any("data-endpoint" in e for e in errors))

    def test_detects_api_downtime(self) -> None:
        def bad_api(url: str) -> smoke.Response:
            if url.endswith("/ready"):
                return smoke.Response(503, {}, '{"status":"not_ready"}')
            return fixtures(url)

        self.assertTrue(
            any(
                "Backend /ready" in e
                for e in smoke.validate_response(SITE, API, SHA, bad_api)
            )
        )


if __name__ == "__main__":
    unittest.main()
