import pytest
from app.schemas.contact import ContactInquiry
from pydantic import ValidationError


def test_contact_schema_trims_optional_company(valid_contact_payload: dict[str, object]) -> None:
    payload = {**valid_contact_payload, "company": "   "}

    inquiry = ContactInquiry.model_validate(payload)

    assert inquiry.company is None
    assert inquiry.project_type.value == "ai_automation"
    assert inquiry.budget_range.value == "25k_50k_pln"


def test_contact_schema_accepts_empty_honeypot(valid_contact_payload: dict[str, object]) -> None:
    inquiry = ContactInquiry.model_validate({**valid_contact_payload, "website": ""})

    assert inquiry.website == ""


def test_contact_schema_accepts_productized_project_type(
    valid_contact_payload: dict[str, object],
) -> None:
    payload = {**valid_contact_payload, "projectType": "rag_chatbot_demo"}

    inquiry = ContactInquiry.model_validate(payload)

    assert inquiry.project_type.value == "rag_chatbot_demo"


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("name", "A"),
        ("message", "Za krótko"),
        ("projectType", "unknown"),
        ("budgetRange", "unknown"),
        ("consent", False),
    ],
)
def test_contact_schema_rejects_invalid_values(
    valid_contact_payload: dict[str, object],
    field: str,
    value: object,
) -> None:
    payload = {**valid_contact_payload, field: value}

    with pytest.raises(ValidationError):
        ContactInquiry.model_validate(payload)


def test_contact_schema_rejects_extra_fields(valid_contact_payload: dict[str, object]) -> None:
    payload = {**valid_contact_payload, "database": "not allowed"}

    with pytest.raises(ValidationError):
        ContactInquiry.model_validate(payload)
