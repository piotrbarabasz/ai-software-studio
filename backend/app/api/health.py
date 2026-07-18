import logging
from typing import Literal

from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logger = logging.getLogger("aisoftware_studio.health")

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    service: Literal["marketing-api"] = "marketing-api"


class ReadinessResponse(BaseModel):
    status: Literal["ready", "not_ready"]
    service: Literal["marketing-api"] = "marketing-api"


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    logger.info(
        "health.checked",
        extra={"event": "health_checked", "service": "marketing-api", "status": "ok"},
    )
    return HealthResponse()


@router.get(
    "/ready",
    response_model=ReadinessResponse,
    responses={503: {"model": ReadinessResponse}},
)
def get_readiness(request: Request) -> ReadinessResponse | JSONResponse:
    is_ready = request.app.state.settings.contact_delivery_ready
    readiness_status = "ready" if is_ready else "not_ready"
    logger.info(
        "readiness.checked",
        extra={
            "event": "readiness_checked",
            "service": "marketing-api",
            "status": readiness_status,
        },
    )
    response = ReadinessResponse(status=readiness_status)
    if is_ready:
        return response
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content=response.model_dump(),
    )
