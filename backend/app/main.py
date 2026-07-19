import logging
from collections.abc import Sequence

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.brand import public_brand
from app.core.config import Settings, get_settings
from app.core.cors import configure_cors
from app.middleware.request_size import ContactRequestSizeLimitMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.services.contact_delivery import EmailContactDelivery
from app.services.contact_intake import ContactIntakeService, InMemoryRateLimiter

logger = logging.getLogger("aisoftware_studio.api")


def _sanitize_validation_errors(errors: Sequence[dict[str, object]]) -> list[dict[str, object]]:
    allowed_keys = {"loc", "msg", "type"}
    return [{key: value for key, value in error.items() if key in allowed_keys} for error in errors]


def create_app(settings: Settings | None = None) -> FastAPI:
    app_settings = settings or get_settings()
    documentation_enabled = app_settings.app_env != "production"
    app = FastAPI(
        title=f"{public_brand['name']} Marketing API",
        version="0.1.0",
        description=(
            f"Contact intake API for {public_brand['name']}: {public_brand['descriptor']}."
        ),
        docs_url="/docs" if documentation_enabled else None,
        redoc_url="/redoc" if documentation_enabled else None,
        openapi_url="/openapi.json" if documentation_enabled else None,
    )
    app.add_middleware(ContactRequestSizeLimitMiddleware)
    if app_settings.app_env == "production":
        app.add_middleware(SecurityHeadersMiddleware)
    configure_cors(app, app_settings)

    app.state.settings = app_settings
    app.state.contact_intake = ContactIntakeService(
        delivery=EmailContactDelivery(app_settings),
        rate_limiter=InMemoryRateLimiter(),
        settings=app_settings,
    )

    app.include_router(api_router)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        if request.url.path == "/api/contact":
            logger.info(
                "contact.validation_rejected",
                extra={"event": "contact_validation_rejected", "path": request.url.path},
            )
        return JSONResponse(
            status_code=422, content={"detail": _sanitize_validation_errors(exc.errors())}
        )

    return app


app = create_app()
