import logging

from app.core.config import Settings
from app.main import create_app
from fastapi.testclient import TestClient


def test_health_returns_reachability_only_response(client: TestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "marketing-api"}


def test_health_logging_is_non_sensitive(client: TestClient, caplog) -> None:
    caplog.set_level(logging.INFO)

    client.get("/health")

    log_output = caplog.text.lower()
    assert "health.checked" in log_output
    assert "smtp" not in log_output
    assert "password" not in log_output
    assert "email" not in log_output
    assert "message" not in log_output
    assert "contact form" not in log_output
    assert "environment" not in log_output


def test_readiness_confirms_complete_contact_configuration_without_disclosure(
    client: TestClient,
) -> None:
    response = client.get("/ready")

    assert response.status_code == 200
    assert response.json() == {"status": "ready", "service": "marketing-api"}
    serialized = response.text.lower()
    for forbidden in ("smtp", "email", "password", "recipient", "sender", "@"):
        assert forbidden not in serialized


def test_readiness_is_separate_from_process_health_when_configuration_is_incomplete() -> None:
    app = create_app(Settings())

    with TestClient(app) as test_client:
        readiness = test_client.get("/ready")
        health = test_client.get("/health")

    assert readiness.status_code == 503
    assert readiness.json() == {"status": "not_ready", "service": "marketing-api"}
    assert health.status_code == 200
