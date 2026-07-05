from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse

from app.schemas.contact import (
    ContactInquiry,
    ContactInquiryAccepted,
    ErrorResponse,
    ValidationErrorResponse,
)
from app.services.contact_delivery import DeliveryError
from app.services.contact_intake import ContactIntakeService, RateLimitExceeded

router = APIRouter(tags=["contact"])


@router.post(
    "/api/contact",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=ContactInquiryAccepted,
    responses={
        422: {"model": ValidationErrorResponse},
        429: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
)
def submit_contact(
    inquiry: ContactInquiry, request: Request
) -> ContactInquiryAccepted | JSONResponse:
    service: ContactIntakeService = request.app.state.contact_intake
    client_key = request.client.host if request.client else "unknown"

    try:
        service.submit(inquiry, client_key)
    except RateLimitExceeded:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content=ErrorResponse(
                code="rate_limited",
                message="Zbyt wiele prób wysłania formularza. Spróbuj ponownie za chwilę.",
            ).model_dump(),
        )
    except DeliveryError:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=ErrorResponse(
                code="delivery_failed",
                message=(
                    "Nie udało się teraz dostarczyć wiadomości. "
                    "Spróbuj ponownie później lub skontaktuj się bezpośrednio."
                ),
            ).model_dump(),
        )

    return ContactInquiryAccepted()
