import logging
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

logger = logging.getLogger("aisoftware_studio.health")

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    service: Literal["marketing-api"] = "marketing-api"


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    logger.info(
        "health.checked",
        extra={"event": "health_checked", "service": "marketing-api", "status": "ok"},
    )
    return HealthResponse()
