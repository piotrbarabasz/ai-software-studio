import logging

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
