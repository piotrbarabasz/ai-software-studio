from fastapi.testclient import TestClient


def test_cors_allows_protolume_origin(client: TestClient) -> None:
    response = client.options(
        "/api/contact",
        headers={
            "Origin": "https://protolume.pl",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://protolume.pl"


def test_cors_omits_unapproved_origin(client: TestClient) -> None:
    response = client.options(
        "/api/contact",
        headers={
            "Origin": "https://unapproved.example.com",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers


def test_cors_rejects_redirect_only_origins(client: TestClient) -> None:
    for origin in (
        "https://www.protolume.pl",
        "https://protolume.com",
        "https://www.protolume.com",
    ):
        response = client.options(
            "/api/contact",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
            },
        )

        assert response.status_code == 400
        assert "access-control-allow-origin" not in response.headers
