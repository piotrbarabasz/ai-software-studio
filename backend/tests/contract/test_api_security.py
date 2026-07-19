from pathlib import Path

from app.core.config import Settings
from app.main import create_app
from app.middleware.request_size import CONTACT_REQUEST_MAX_BYTES
from fastapi.testclient import TestClient

BACKEND_ROOT = Path(__file__).resolve().parents[2]


def test_development_keeps_interactive_documentation(settings: Settings) -> None:
    with TestClient(create_app(settings)) as client:
        assert client.get("/docs").status_code == 200
        assert client.get("/redoc").status_code == 200
        assert client.get("/openapi.json").status_code == 200


def test_production_disables_public_documentation(production_settings: Settings) -> None:
    with TestClient(create_app(production_settings)) as client:
        assert client.get("/docs").status_code == 404
        assert client.get("/redoc").status_code == 404
        assert client.get("/openapi.json").status_code == 404


def test_production_api_has_restrictive_security_headers(production_settings: Settings) -> None:
    with TestClient(create_app(production_settings)) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-store"
    assert response.headers["content-security-policy"] == (
        "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
    )
    assert response.headers["permissions-policy"] == (
        "camera=(), geolocation=(), microphone=(), payment=(), usb=()"
    )
    assert response.headers["referrer-policy"] == "no-referrer"
    assert response.headers["strict-transport-security"] == "max-age=31536000"
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"


def test_oversized_contact_request_is_rejected_with_cors_headers(
    production_settings: Settings,
) -> None:
    oversized_body = b"{" + b" " * CONTACT_REQUEST_MAX_BYTES + b"}"

    with TestClient(create_app(production_settings)) as client:
        response = client.post(
            "/api/contact",
            content=oversized_body,
            headers={
                "Content-Type": "application/json",
                "Origin": "https://protolume.pl",
            },
        )

    assert response.status_code == 413
    assert response.json()["code"] == "request_too_large"
    assert response.headers["access-control-allow-origin"] == "https://protolume.pl"
    assert response.headers["content-security-policy"].startswith("default-src 'none'")


def test_container_disables_ip_access_logs_and_untrusted_proxy_headers() -> None:
    dockerfile = (BACKEND_ROOT / "Dockerfile").read_text(encoding="utf-8")

    assert "--no-access-log" in dockerfile
    assert "--no-server-header" in dockerfile
    assert "--no-proxy-headers" in dockerfile
