import asyncio

from app.middleware.request_size import ContactRequestSizeLimitMiddleware
from starlette.types import Message


def test_request_size_limit_counts_streamed_body_without_content_length() -> None:
    downstream_called = False
    sent: list[Message] = []
    incoming: list[Message] = [
        {"type": "http.request", "body": b"12345678", "more_body": True},
        {"type": "http.request", "body": b"90abcdef", "more_body": False},
    ]

    async def downstream(scope: object, receive: object, send: object) -> None:
        nonlocal downstream_called
        downstream_called = True

    async def receive() -> Message:
        return incoming.pop(0)

    async def send(message: Message) -> None:
        sent.append(message)

    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": "POST",
        "scheme": "https",
        "path": "/api/contact",
        "raw_path": b"/api/contact",
        "query_string": b"",
        "headers": [(b"content-type", b"application/json")],
        "client": ("127.0.0.1", 1234),
        "server": ("api", 443),
    }
    middleware = ContactRequestSizeLimitMiddleware(downstream, max_bytes=12)

    asyncio.run(middleware(scope, receive, send))  # type: ignore[arg-type]

    assert downstream_called is False
    assert sent[0]["type"] == "http.response.start"
    assert sent[0]["status"] == 413


def test_request_size_limit_replays_an_allowed_stream() -> None:
    replayed_body = bytearray()
    sent: list[Message] = []
    incoming: list[Message] = [
        {"type": "http.request", "body": b"small", "more_body": True},
        {"type": "http.request", "body": b" body", "more_body": False},
    ]

    async def downstream(scope: object, receive: object, send: object) -> None:
        while True:
            message = await receive()  # type: ignore[operator]
            replayed_body.extend(message.get("body", b""))
            if not message.get("more_body", False):
                break

    async def receive() -> Message:
        return incoming.pop(0)

    async def send(message: Message) -> None:
        sent.append(message)

    scope = {
        "type": "http",
        "method": "POST",
        "path": "/api/contact",
        "headers": [],
    }
    middleware = ContactRequestSizeLimitMiddleware(downstream, max_bytes=16)

    asyncio.run(middleware(scope, receive, send))  # type: ignore[arg-type]

    assert bytes(replayed_body) == b"small body"
