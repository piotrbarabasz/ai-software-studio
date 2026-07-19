from fastapi import status
from fastapi.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send

CONTACT_REQUEST_MAX_BYTES = 16 * 1024


class ContactRequestSizeLimitMiddleware:
    """Reject oversized contact bodies before validation or delivery."""

    def __init__(self, app: ASGIApp, max_bytes: int = CONTACT_REQUEST_MAX_BYTES) -> None:
        if max_bytes < 1:
            raise ValueError("max_bytes must be positive")
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or not self._is_contact_submission(scope):
            await self.app(scope, receive, send)
            return

        content_length = self._content_length(scope)
        if content_length is not None and content_length > self.max_bytes:
            await self._reject(scope, receive, send)
            return

        messages: list[Message] = []
        received_bytes = 0
        while True:
            message = await receive()
            messages.append(message)
            if message["type"] == "http.disconnect":
                break
            if message["type"] != "http.request":
                continue
            received_bytes += len(message.get("body", b""))
            if received_bytes > self.max_bytes:
                await self._reject(scope, receive, send)
                return
            if not message.get("more_body", False):
                break

        await self.app(scope, self._replay(messages), send)

    @staticmethod
    def _is_contact_submission(scope: Scope) -> bool:
        return scope.get("method") == "POST" and scope.get("path") == "/api/contact"

    @staticmethod
    def _content_length(scope: Scope) -> int | None:
        for name, value in scope.get("headers", []):
            if name.lower() == b"content-length":
                try:
                    return max(0, int(value))
                except ValueError:
                    return None
        return None

    @staticmethod
    def _replay(messages: list[Message]) -> Receive:
        message_index = 0

        async def receive() -> Message:
            nonlocal message_index
            if message_index < len(messages):
                message = messages[message_index]
                message_index += 1
                return message
            return {"type": "http.request", "body": b"", "more_body": False}

        return receive

    @staticmethod
    async def _reject(scope: Scope, receive: Receive, send: Send) -> None:
        response = JSONResponse(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            content={
                "code": "request_too_large",
                "message": "Żądanie formularza jest zbyt duże.",
            },
        )
        await response(scope, receive, send)
