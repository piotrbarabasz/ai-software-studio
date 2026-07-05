from fastapi.testclient import TestClient


def test_cors_allows_local_frontend_origin(client: TestClient) -> None:
    response = client.options(
        "/api/contact",
        headers={
            "Origin": "http://localhost:4200",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:4200"


def test_cors_omits_unapproved_origin(client: TestClient) -> None:
    response = client.options(
        "/api/contact",
        headers={
            "Origin": "https://unapproved.example.com",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert "access-control-allow-origin" not in response.headers
