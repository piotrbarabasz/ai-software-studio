from datetime import UTC, datetime
from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class ProjectType(StrEnum):
    custom_web_app = "custom_web_app"
    ai_automation = "ai_automation"
    backend_api = "backend_api"
    business_process_automation = "business_process_automation"
    external_integration = "external_integration"
    dashboard_internal_tool = "dashboard_internal_tool"
    mvp_prototype = "mvp_prototype"
    other = "other"


class BudgetRange(StrEnum):
    under_10k_pln = "under_10k_pln"
    between_10k_25k_pln = "10k_25k_pln"
    between_25k_50k_pln = "25k_50k_pln"
    between_50k_100k_pln = "50k_100k_pln"
    over_100k_pln = "over_100k_pln"
    not_sure = "not_sure"


class ContactInquiry(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr = Field(max_length=254)
    company: str | None = Field(default=None, max_length=160)
    project_type: ProjectType = Field(alias="projectType")
    budget_range: BudgetRange = Field(alias="budgetRange")
    message: str = Field(min_length=20, max_length=4000)
    consent: bool
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(UTC), exclude=True)

    model_config = ConfigDict(populate_by_name=True, extra="forbid", str_strip_whitespace=True)

    @field_validator("company", mode="before")
    @classmethod
    def empty_company_to_none(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip():
            return None
        return value

    @field_validator("consent")
    @classmethod
    def consent_must_be_true(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("Consent is required.")
        return value


class ContactInquiryAccepted(BaseModel):
    status: Literal["accepted"] = "accepted"
    message: str = "Dziękujemy. Wiadomość została przyjęta."


class ErrorResponse(BaseModel):
    code: str
    message: str


class ValidationErrorItem(BaseModel):
    loc: list[str | int]
    msg: str
    type: str


class ValidationErrorResponse(BaseModel):
    detail: list[ValidationErrorItem]
