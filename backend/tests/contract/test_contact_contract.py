import re
import time
from pathlib import Path

from app.core.config import Settings
from app.main import create_app
from app.schemas.contact import ContactInquiry, ProjectType
from app.services.contact_delivery import DeliveryError
from app.services.contact_intake import ContactIntakeService, InMemoryRateLimiter
from fastapi.testclient import TestClient


class FailingDelivery:
    def send(self, inquiry: ContactInquiry) -> None:
        raise DeliveryError("failed")


ROOT_DIR = Path(__file__).resolve().parents[3]
EXPECTED_PROJECT_TYPES = {
    "rag_chatbot_demo",
    "website_seo",
    "voice_agent_demo",
    "whatsapp_agent_management",
    "email_automation",
    "agent_management_panel",
    "custom_web_app",
    "ai_automation",
    "backend_api",
    "business_process_automation",
    "external_integration",
    "dashboard_internal_tool",
    "mvp_prototype",
    "other",
}


def _frontend_contact_option_values() -> set[str]:
    source = (ROOT_DIR / "frontend/src/app/core/content/contact-options.pl.ts").read_text(
        encoding="utf-8"
    )
    project_type_source = source.split("export const budgetRangeOptions", maxsplit=1)[0]
    return set(re.findall(r"value: '([^']+)'", project_type_source))


def _frontend_project_type_union_values() -> set[str]:
    source = (ROOT_DIR / "frontend/src/app/services/contact-api.types.ts").read_text(
        encoding="utf-8"
    )
    union_source = source.split("export type BudgetRange =", maxsplit=1)[0]
    return set(re.findall(r"\| '([^']+)'", union_source))


def test_contact_accepts_valid_payload(
    client: TestClient,
    valid_contact_payload: dict[str, object],
) -> None:
    response = client.post("/api/contact", json=valid_contact_payload)

    assert response.status_code == 202
    assert response.json()["status"] == "accepted"


def test_contact_accepts_productized_project_type(
    client: TestClient,
    valid_contact_payload: dict[str, object],
) -> None:
    payload = {**valid_contact_payload, "projectType": "voice_agent_demo"}

    response = client.post("/api/contact", json=payload)

    assert response.status_code == 202
    assert response.json()["status"] == "accepted"


def test_contact_rejects_invalid_payload(
    client: TestClient,
    valid_contact_payload: dict[str, object],
) -> None:
    payload = {**valid_contact_payload, "email": "not-an-email", "consent": False}

    response = client.post("/api/contact", json=payload)

    assert response.status_code == 422
    assert "detail" in response.json()
    assert "not-an-email" not in response.text


def test_contact_rejects_unknown_project_type(
    client: TestClient,
    valid_contact_payload: dict[str, object],
) -> None:
    payload = {**valid_contact_payload, "projectType": "live_whatsapp_runtime"}

    response = client.post("/api/contact", json=payload)

    assert response.status_code == 422
    assert "live_whatsapp_runtime" not in response.text


def test_project_type_values_do_not_drift_between_frontend_and_backend() -> None:
    backend_values = {project_type.value for project_type in ProjectType}

    assert backend_values == EXPECTED_PROJECT_TYPES
    assert _frontend_contact_option_values() == backend_values
    assert _frontend_project_type_union_values() == backend_values


def test_contact_openapi_exposes_project_type_enum(settings: Settings) -> None:
    app = create_app(settings)
    schema = app.openapi()

    enum_values = set(schema["components"]["schemas"]["ProjectType"]["enum"])
    contact_schema_name = "ContactInquiry"
    project_type_ref = schema["components"]["schemas"][contact_schema_name]["properties"][
        "projectType"
    ]["$ref"]

    assert project_type_ref == "#/components/schemas/ProjectType"
    assert enum_values == EXPECTED_PROJECT_TYPES


def test_contact_returns_rate_limit_response(
    settings: Settings,
    valid_contact_payload: dict[str, object],
) -> None:
    app = create_app(settings)
    settings.contact_rate_limit_per_minute = 1
    rate_limiter = InMemoryRateLimiter()
    rate_limiter.attempts["testclient"] = [time.monotonic()]
    app.state.contact_intake = ContactIntakeService(
        delivery=FailingDelivery(),
        rate_limiter=rate_limiter,
        settings=settings,
    )

    with TestClient(app) as client:
        response = client.post("/api/contact", json=valid_contact_payload)

    assert response.status_code == 429
    assert response.json()["code"] == "rate_limited"


def test_contact_returns_delivery_failure(
    settings: Settings,
    valid_contact_payload: dict[str, object],
) -> None:
    app = create_app(settings)
    app.state.contact_intake = ContactIntakeService(
        delivery=FailingDelivery(),
        rate_limiter=InMemoryRateLimiter(),
        settings=settings,
    )

    with TestClient(app) as client:
        response = client.post("/api/contact", json=valid_contact_payload)

    assert response.status_code == 503
    assert response.json()["code"] == "delivery_failed"
