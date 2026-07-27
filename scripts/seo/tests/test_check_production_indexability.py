from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).resolve().parents[1] / "check_production_indexability.py"
SPEC = importlib.util.spec_from_file_location("check_production_indexability", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)


class CheckProductionIndexabilityTests(unittest.TestCase):
    def test_parser_accepts_index_follow(self) -> None:
        metadata = MODULE.parse_html_metadata(
            """
            <html>
              <head>
                <title>Protolume</title>
                <meta name="robots" content="index, follow">
                <link rel="canonical" href="https://protolume.pl">
              </head>
              <body><h1>Protolume</h1></body>
            </html>
            """
        )
        self.assertEqual(metadata.robots, "index, follow")
        self.assertEqual(metadata.canonical, "https://protolume.pl")
        self.assertEqual(metadata.title_count, 1)
        self.assertEqual(metadata.h1_count, 1)

    def test_parser_accepts_noindex(self) -> None:
        metadata = MODULE.parse_html_metadata(
            """
            <html>
              <head>
                <title>404</title>
                <meta name="robots" content="noindex, follow">
                <link rel="canonical" href="https://protolume.pl/404">
              </head>
              <body><h1>404</h1></body>
            </html>
            """
        )
        self.assertEqual(metadata.robots, "noindex, follow")

    def test_canonical_validation_rejects_wrong_host(self) -> None:
        html = """
        <html>
          <head>
            <title>Protolume</title>
            <meta name="robots" content="index, follow">
            <link rel="canonical" href="https://example.invalid">
          </head>
          <body><h1>Protolume</h1></body>
        </html>
        """
        errors, _ = MODULE._validate_page(
            "https://protolume.pl",
            "/",
            lambda request, timeout: MODULE.Response(
                status=200,
                final_url="https://protolume.pl/",
                headers={"content-type": "text/html; charset=utf-8"},
                body=html.encode("utf-8"),
            ),
            1,
            None,
        )
        self.assertIn("canonical URL does not match the public origin", " ".join(errors))

    def test_origin_validation_rejects_wrong_host(self) -> None:
        with self.assertRaisesRegex(ValueError, "exactly https://protolume.pl"):
            MODULE._normalized_origin("https://example.com", "site URL")

    def test_sitemap_validation_reports_missing_url(self) -> None:
        xml = """<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url><loc>https://protolume.pl</loc></url>
          <url><loc>https://protolume.pl/demo-ai</loc></url>
        </urlset>
        """
        errors = MODULE._validate_sitemap(
            "https://protolume.pl",
            lambda request, timeout: MODULE.Response(
                status=200,
                final_url="https://protolume.pl/sitemap.xml",
                headers={"content-type": "application/xml"},
                body=xml.encode("utf-8"),
            ),
            1,
            ("/", "/demo-ai", "/kontakt"),
        )
        self.assertTrue(
            any("missing required URL https://protolume.pl/kontakt" in error for error in errors)
        )


if __name__ == "__main__":
    unittest.main()
