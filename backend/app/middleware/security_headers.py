from starlette.datastructures import MutableHeaders
from starlette.types import ASGIApp, Message, Receive, Scope, Send

PRODUCTION_API_SECURITY_HEADERS = {
    "Cache-Control": "no-store",
    "Content-Security-Policy": (
        "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
    ),
    "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
    "Referrer-Policy": "no-referrer",
    "Strict-Transport-Security": "max-age=31536000",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
}


class SecurityHeadersMiddleware:
    """Apply API-safe response headers after production documentation is disabled."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_with_security_headers(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = MutableHeaders(scope=message)
                for name, value in PRODUCTION_API_SECURITY_HEADERS.items():
                    headers[name] = value
            await send(message)

        await self.app(scope, receive, send_with_security_headers)
