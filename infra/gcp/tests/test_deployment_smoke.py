from __future__ import annotations

import contextlib
import io
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

EXPECTED_BUILD_SHA = "abc1234"
HOME_USE_CASES = (
    ("Asystent wiedzy", "asystent-wiedzy"),
    ("Obsługa wiadomości i dokumentów", "automatyzacja-wiadomosci-i-dokumentow"),
    ("Panel procesu", "panel-operacyjny"),
    ("System agentowy do realizacji zadań", "system-agentowy"),
    ("Integracje kanałów i komunikatorów", "integracje-kanalow"),
)


PRIMARY_NAVIGATION = (
    ("/rozwiazania", "Rozwiązania"),
    ("/demo-ai", "Demo w 7 dni"),
    ("/development", "Wdrożenia"),
    ("/studio", "O Protolume"),
    ("/kontakt", "Kontakt"),
)

FOOTER_LINKS = (
    ("/demo-ai", "Demo w 7 dni"),
    ("/przyklad-demo", "Przykładowy raport"),
    ("/development", "Wdrożenia"),
    ("/studio", "O Protolume"),
)


def render_site_shell(
    path: str,
    body: str,
    *,
    build_sha: str = EXPECTED_BUILD_SHA,
    robots_tag: str = "noindex, follow",
    include_legacy_copy: bool = False,
) -> str:
    canonical = "https://protolume.pl" if path == "/" else f"https://protolume.pl{path}"
    nav = "".join(
        f'<a href="{href}">{label}</a>' for href, label in PRIMARY_NAVIGATION
    )
    footer_links = "".join(
        f'<a href="{href}">{label}</a>' for href, label in FOOTER_LINKS
    )
    legacy_copy = ""
    if include_legacy_copy:
        legacy_copy = (
            '<p>Development</p>'
            '<a href="https://github.com/piotrbarabasz/ai-software-studio">'
            'Zobacz kod demonstracji'
            '</a>'
            '<a href="https://github.com/piotrbarabasz/ai-software-studio/releases">'
            'Zobacz kod aplikacji i wdro?enia'
            '</a>'
        )
    return (
        '<html><head><link rel="canonical" href="'
        + canonical
        + '"><meta name="robots" content="'
        + robots_tag
        + '"><meta name="protolume-build-sha" content="'
        + build_sha
        + '"></head><body>'
        + '<nav id="primary-navigation">'
        + nav
        + '</nav>'
        + body
        + legacy_copy
        + '<footer class="site-footer">'
        + '<p>Studio wdro?e? AI</p>'
        + footer_links
        + '</footer>'
        + '</body></html>'
    )


def homepage_html(
    build_sha: str = EXPECTED_BUILD_SHA,
    *,
    include_legacy_copy: bool = False,
    robots_tag: str = "noindex, follow",
) -> str:
    use_case_cards = "".join(
        (
            f'<article class="use-case-card">'
            f'<h3>{title}</h3>'
            f'<p>{title} wspiera konkretny proces.</p>'
            f'<a href="/rozwiazania#{slug}">Poznaj rozwi?zanie</a>'
            '</article>'
        )
        for title, slug in HOME_USE_CASES
    )
    body = (
        '<h1>Sprawdź w 7 dni, czy AI usprawni konkretny proces</h1>'
        '<p>Budujemy działające demo jednego przepływu, nie pełną transformację całej firmy.</p>'
        '<section class="hero-proofs">'
        '<p>Rozwiązania</p><p>Wdrożenia</p><p>O Protolume</p><p>Przykładowy raport</p>'
        '<a href="/przyklad-demo">Zobacz przykładowy raport</a>'
        '</section>'
        '<a href="/kontakt?projectType=mvp_prototype">Opisz proces do sprawdzenia</a>'
        '<section class="use-cases">'
        + use_case_cards
        + '</section>'
    )
    return render_site_shell(
        "/",
        body,
        build_sha=build_sha,
        robots_tag=robots_tag,
        include_legacy_copy=include_legacy_copy,
    )


def route_html(
    path: str,
    *,
    build_sha: str = EXPECTED_BUILD_SHA,
    robots_tag: str = "noindex, follow",
) -> str:
    if path == "/demo-ai":
        body = (
            '<h1>Demo i sprawdzenie wykonalno?ci</h1>'
            '<section class="interactive-demo">demo</section>'
            '<a href="/kontakt">Kontakt</a>'
            '<a href="/przyklad-demo">Zobacz przyk?adowy raport</a>'
        )
    elif path == "/przyklad-demo":
        body = (
            '<h1>Raport po 7 dniach: obsługa zapytań produktowych przez e-mail</h1>'
            '<p>To fikcyjny scenariusz demonstracyjny.</p>'
            '<p>Warunkowe GO do kolejnego etapu</p>'
            '<h2>Przykładowe kryteria do uzgodnienia z klientem</h2>'
            '<h2>Rejestr ryzyk</h2>'
            '<a href="/kontakt?projectType=business_process_automation">Przejrzyj przykładowy raport</a>'
            '<a href="/kontakt">Kontakt</a>'
            '<a href="/demo-ai">Zobacz demo</a>'
        )
    elif path == "/rozwiazania":
        body = (
            '<h1>Rozwi?zania</h1>'
            '<p>Asystent wiedzy i automatyzacja procesu.</p>'
            '<a href="#asystent-wiedzy">Asystent</a>'
            '<a href="#automatyzacja-wiadomosci-i-dokumentow">Automatyzacja</a>'
            '<a href="#panel-operacyjny">Panel</a>'
            '<a href="#system-agentowy">Agenci</a>'
            '<a href="#integracje-kanalow">Kana?y</a>'
            '<a href="/kontakt?projectType=rag_chatbot_demo">Kontakt</a>'
            '<a href="/kontakt?projectType=business_process_automation">Kontakt</a>'
            '<a href="/kontakt?projectType=custom_web_app">Kontakt</a>'
            '<a href="/kontakt?projectType=backend_api">Kontakt</a>'
        )
    elif path == "/rozwiazania/chatbot-ai-dla-firm":
        body = (
            '<h1>Chatbot AI dla firm</h1>'
            '<p>Pomoc w odpowiedziach na powtarzalne pytania i przekierowaniu spraw.</p>'
            '<a href="/kontakt">Kontakt</a>'
        )
    elif path == "/rozwiazania/voice-ai-dla-firm":
        body = (
            '<h1>Voice AI dla firm</h1>'
            '<p>Kwalifikacja po??cze? i przekazanie do cz?owieka, gdy jest to potrzebne.</p>'
            '<a href="/kontakt">Kontakt</a>'
        )
    elif path == "/rozwiazania/automatyzacja-procesow":
        body = (
            '<h1>Automatyzacja proces?w</h1>'
            '<p>Mniej r?cznego przepisywania i mniej pomini?tych krok?w.</p>'
            '<a href="/kontakt">Kontakt</a>'
        )
    elif path == "/rozwiazania/integracje-whatsapp-crm":
        body = (
            '<h1>Integracje WhatsApp i CRM</h1>'
            '<p>Porz?dkowanie wiadomo?ci i zapisywanie wyniku w systemie.</p>'
            '<a href="/kontakt">Kontakt</a>'
        )
    elif path == "/rozwiazania/systemy-agentowe":
        body = (
            '<h1>Systemy agentowe</h1>'
            '<p>Koordynacja wielu krok?w z jasnym momentem kontroli cz?owieka.</p>'
            '<a href="/kontakt">Kontakt</a>'
        )
    elif path == "/development":
        body = (
            '<h1>Wdro?enia</h1>'
            '<p>Najpierw potwierdzamy u?ytkownik?w, dane i rezultat pierwszego etapu.</p>'
        )
    elif path == "/studio":
        body = (
            '<h1>O Protolume</h1>'
            '<p>Jedna odpowiedzialna osoba od analizy do realizacji.</p>'
        )
    elif path == "/rd":
        body = (
            '<h1>R&D</h1>'
            '<p>Eksperymenty prowadzone z jasno okre?lon? granic?.</p>'
        )
    elif path == "/kontakt":
        body = (
            '<h1>Kontakt</h1>'
            '<form>'
            '<input name="name">'
            '<input name="email">'
            '<select name="projectType"></select>'
            '<textarea name="message"></textarea>'
            '<input name="consent">'
            '</form>'
        )
    elif path == "/polityka-prywatnosci":
        body = '<h1>Polityka prywatno?ci</h1><a href="mailto:privacy@protolume.pl">kontakt</a>'
    else:
        raise AssertionError(f"unsupported route {path!r}")
    return render_site_shell(path, body, build_sha=build_sha, robots_tag=robots_tag)


class FakeDeployment:
    def __init__(
        self,
        *,
        homepage: str | None = None,
        backend_sha: str = EXPECTED_BUILD_SHA,
        robots_tag: str = "noindex, follow",
    ) -> None:
        self.requests: list[urllib.request.Request] = []
        self.homepage = homepage or homepage_html(backend_sha, robots_tag=robots_tag)
        self.backend_sha = backend_sha
        self.robots_tag = robots_tag

    def __call__(self, request: urllib.request.Request, timeout: float):
        self.requests.append(request)
        parsed = urlsplit(request.full_url)
        path = parsed.path
        headers: dict[str, str] = {}
        status = 200

        if parsed.netloc == "api.run.app":
            if path == "/health":
                body = json.dumps({"status": "ok", "buildSha": self.backend_sha}).encode()
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
            if path == "/":
                body = self.homepage.encode()
            else:
                body = route_html(
                    path,
                    build_sha=self.backend_sha,
                    robots_tag=self.robots_tag,
                ).encode()
            headers = {"x-robots-tag": self.robots_tag}
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


def mutate_public_route(
    deployment: FakeDeployment,
    target_path: str,
    mutator,
):
    def wrapped(request: urllib.request.Request, timeout: float):
        response = deployment(request, timeout)
        if urlsplit(request.full_url).path == target_path and response.status == 200:
            return smoke.Response(
                response.status,
                dict(response.headers),
                mutator(response.body),
            )
        return response

    return wrapped


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
            expected_build_sha=EXPECTED_BUILD_SHA,
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

    def test_complete_smoke_checks_every_public_route_in_indexable_mode(self) -> None:
        deployment = FakeDeployment(robots_tag="index, follow")

        errors = smoke.run_checks(
            "https://api.run.app",
            "https://protolume.pl",
            expect_noindex=False,
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertEqual(errors, [])

    def test_missing_primary_navigation_link_is_reported(self) -> None:
        deployment = FakeDeployment(robots_tag="index, follow")

        errors = smoke.run_checks(
            "https://api.run.app",
            "https://protolume.pl",
            expect_noindex=False,
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=mutate_public_route(
                deployment,
                "/studio",
                lambda body: body.decode("utf-8")
                .replace('<a href="/kontakt">Kontakt</a>', "", 1)
                .encode("utf-8"),
            ),
        )

        self.assertIn(
            "public route /studio: primary navigation links or labels do not match the shared shell",
            errors,
        )

    def test_old_english_development_link_is_reported(self) -> None:
        deployment = FakeDeployment(robots_tag="index, follow")

        errors = smoke.run_checks(
            "https://api.run.app",
            "https://protolume.pl",
            expect_noindex=False,
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=mutate_public_route(
                deployment,
                "/development",
                lambda body: body.decode("utf-8")
                .replace('>Wdrożenia<', '>Development<', 1)
                .encode("utf-8"),
            ),
        )

        self.assertIn(
            "public route /development: primary navigation links or labels do not match the shared shell",
            errors,
        )

    def test_github_link_on_non_homepage_is_reported(self) -> None:
        deployment = FakeDeployment(robots_tag="index, follow")

        errors = smoke.run_checks(
            "https://api.run.app",
            "https://protolume.pl",
            expect_noindex=False,
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=mutate_public_route(
                deployment,
                "/demo-ai",
                lambda body: body.decode("utf-8")
                .replace(
                    "</footer>",
                    '<a href="https://github.com/piotrbarabasz/ai-software-studio">GitHub</a></footer>',
                    1,
                )
                .encode("utf-8"),
            ),
        )

        self.assertIn(
            "public route /demo-ai: public links must not point to github.com",
            errors,
        )

    def test_different_build_sha_on_one_route_is_reported(self) -> None:
        deployment = FakeDeployment(robots_tag="index, follow")

        errors = smoke.run_checks(
            "https://api.run.app",
            "https://protolume.pl",
            expect_noindex=False,
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=mutate_public_route(
                deployment,
                "/studio",
                lambda body: body.replace(EXPECTED_BUILD_SHA.encode(), b"def5678", 1),
            ),
        )

        self.assertTrue(
            any(
                error.endswith("does not match the expected build SHA")
                or error.endswith("does not match the shared build SHA")
                for error in errors
            )
        )

    def test_missing_footer_is_reported(self) -> None:
        deployment = FakeDeployment(robots_tag="index, follow")

        errors = smoke.run_checks(
            "https://api.run.app",
            "https://protolume.pl",
            expect_noindex=False,
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=mutate_public_route(
                deployment,
                "/rd",
                lambda body: body.decode("utf-8")
                .replace('<footer class="site-footer">', '<div class="site-footer">')
                .replace("</footer>", "</div>")
                .encode("utf-8"),
            ),
        )

        self.assertIn("public route /rd: expected a shared footer, received none", errors)

    def test_missing_report_link_is_reported(self) -> None:
        deployment = FakeDeployment(robots_tag="index, follow")

        errors = smoke.run_checks(
            "https://api.run.app",
            "https://protolume.pl",
            expect_noindex=False,
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=mutate_public_route(
                deployment,
                "/",
                lambda body: body.decode("utf-8").replace(
                    "/przyklad-demo", "/przyklad-demo-usuniete"
                ).encode("utf-8"),
            ),
        )

        self.assertIn(
            "public route /: expected link to /przyklad-demo, received none",
            errors,
        )

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

    def test_404_stays_noindex_in_indexable_mode(self) -> None:
        deployment = FakeDeployment(robots_tag="index, follow")

        def indexed_404(request: urllib.request.Request, timeout: float):
            response = deployment(request, timeout)
            if urlsplit(request.full_url).path == smoke.NOT_FOUND_PATH:
                return smoke.Response(
                    response.status,
                    {"x-robots-tag": "index, follow"},
                    response.body,
                )
            return response

        errors = smoke.run_checks(
            "https://api.run.app",
            "https://protolume.pl",
            expect_noindex=False,
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=indexed_404,
        )

        self.assertIn(
            "public 404: X-Robots-Tag is not noindex, follow",
            errors,
        )

    def test_missing_h1_is_reported(self) -> None:
        deployment = FakeDeployment()

        def without_h1(request, timeout):
            response = deployment(request, timeout)
            if urlsplit(request.full_url).path == "/":
                start = response.body.find(b"<h1>")
                end = response.body.find(b"</h1>", start)
                body = response.body[:start] + response.body[end + len(b"</h1>") :]
                return smoke.Response(response.status, response.headers, body)
            return response

        errors = smoke.run_checks("https://api.run.app", "https://protolume.pl", expect_noindex=True, timeout_seconds=2, request=without_h1)
        self.assertIn("public route /: expected an h1 element, received none", errors)

    def test_missing_form_is_reported(self) -> None:
        deployment = FakeDeployment()

        def without_form(request, timeout):
            response = deployment(request, timeout)
            if urlsplit(request.full_url).path == "/kontakt":
                return smoke.Response(response.status, response.headers, response.body.replace(b"<form>", b"<div>").replace(b"</form>", b"</div>"))
            return response

        errors = smoke.run_checks("https://api.run.app", "https://protolume.pl", expect_noindex=True, timeout_seconds=2, request=without_form)
        self.assertIn("public route /kontakt: expected a form, received none", errors)

    def test_mismatched_build_sha_is_reported(self) -> None:
        deployment = FakeDeployment()

        def different_sha(request, timeout):
            response = deployment(request, timeout)
            if urlsplit(request.full_url).path == "/":
                return smoke.Response(response.status, response.headers, response.body.replace(b"abc1234", b"def5678"))
            return response

        errors = smoke.run_checks("https://api.run.app", "https://protolume.pl", expect_noindex=True, timeout_seconds=2, request=different_sha)
        self.assertTrue(any("does not match" in error for error in errors))

    def test_invalid_noindex_is_reported(self) -> None:
        deployment = FakeDeployment()

        def indexed(request, timeout):
            response = deployment(request, timeout)
            if urlsplit(request.full_url).path == "/":
                return smoke.Response(response.status, {"x-robots-tag": "index, follow"}, response.body.replace(b"noindex, follow", b"index, follow"))
            return response

        errors = smoke.run_checks("https://api.run.app", "https://protolume.pl", expect_noindex=True, timeout_seconds=2, request=indexed)
        self.assertTrue(any("public route /: HTML robots metadata" in error for error in errors))

    def test_expected_build_sha_accepts_the_current_release(self) -> None:
        deployment = FakeDeployment()

        errors = smoke.run_checks(
            "https://api.run.app",
            "https://protolume.pl",
            expect_noindex=True,
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertEqual(errors, [])

    def test_expected_build_sha_rejects_a_mismatched_frontend_sha(self) -> None:
        deployment = FakeDeployment()

        def wrong_frontend(request: urllib.request.Request, timeout: float):
            response = deployment(request, timeout)
            if urlsplit(request.full_url).path == "/":
                return smoke.Response(
                    response.status,
                    response.headers,
                    response.body.replace(EXPECTED_BUILD_SHA.encode(), b"def5678"),
                )
            return response

        errors = smoke.run_checks(
            "https://api.run.app",
            "https://protolume.pl",
            expect_noindex=True,
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=wrong_frontend,
        )

        self.assertIn(
            "public route /: protolume-build-sha meta tag does not match the expected build SHA",
            errors,
        )

    def test_expected_build_sha_rejects_a_mismatched_backend_sha(self) -> None:
        deployment = FakeDeployment(backend_sha="def5678")

        errors = smoke.run_checks(
            "https://api.run.app",
            "https://protolume.pl",
            expect_noindex=True,
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertIn(
            "API /health: buildSha does not match the expected build SHA",
            errors,
        )

    def test_expected_build_sha_rejects_an_old_release_with_a_matching_sha(self) -> None:
        deployment = FakeDeployment(
            homepage=homepage_html("def5678"),
            backend_sha="def5678",
        )

        errors = smoke.run_checks(
            "https://api.run.app",
            "https://protolume.pl",
            expect_noindex=True,
            expected_build_sha=EXPECTED_BUILD_SHA,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertTrue(
            any(
                "does not match the expected build SHA" in error
                for error in errors
            )
        )

    def test_expected_build_sha_is_optional_outside_cloud_build(self) -> None:
        deployment = FakeDeployment()

        errors = smoke.run_checks(
            "https://api.run.app",
            "https://protolume.pl",
            expect_noindex=True,
            timeout_seconds=2,
            request=deployment,
        )

        self.assertEqual(errors, [])

    def test_invalid_expected_build_sha_is_rejected_by_argparse(self) -> None:
        argv = [
            "smoke_deployment.py",
            "--backend-url=https://api.run.app",
            "--site-url=https://protolume.pl",
            "--expected-build-sha=unknown",
        ]
        with self.assertRaises(SystemExit) as excinfo:
            with contextlib.redirect_stderr(io.StringIO()):
                with unittest.mock.patch.object(sys, "argv", argv):
                    smoke.parse_args()
        self.assertEqual(excinfo.exception.code, 2)

    def test_html_parser_normalizes_visible_text_and_ignores_script_and_style(self) -> None:
        parser = smoke.SeoMetadataParser()
        parser.feed(
            "<html><head><style>.x{color:red}</style><script>ignored()</script></head><body><h1>  Hello\nworld </h1><p> Foo <span>bar</span> </p></body></html>"
        )

        self.assertEqual(parser.visible_text, "Hello world Foo bar")

    def test_indexing_true_allows_an_absent_x_robots_header(self) -> None:
        deployment = FakeDeployment()

        def indexed_without_header(request, timeout):
            response = deployment(request, timeout)
            if urlsplit(request.full_url).netloc == "protolume.pl" and response.status == 200:
                headers = dict(response.headers)
                headers.pop("x-robots-tag", None)
                body = response.body.replace(b"noindex, follow", b"index, follow")
                return smoke.Response(response.status, headers, body)
            return response

        errors = smoke.run_checks(
            "https://api.run.app",
            "https://protolume.pl",
            expect_noindex=False,
            timeout_seconds=2,
            request=indexed_without_header,
        )
        self.assertEqual(errors, [])

    def test_retry_succeeds_after_transient_failure(self) -> None:
        attempts = 0
        sleeps: list[float] = []

        def check():
            nonlocal attempts
            attempts += 1
            return ["transient"] if attempts == 1 else []

        self.assertEqual(smoke.run_with_retries(check, 2, 0.25, sleeps.append), [])
        self.assertEqual(attempts, 2)
        self.assertEqual(sleeps, [0.25])

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
