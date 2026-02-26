"""Standard API response envelope helpers for LLM flows."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import Request
from fastapi.responses import JSONResponse

ERROR_CODES = {
    "VALIDATION_ERROR",
    "NOT_FOUND",
    "UNAVAILABLE",
    "UPSTREAM_TIMEOUT",
    "UPSTREAM_ERROR",
    "DB_ERROR",
    "RATE_LIMITED",
    "INTERNAL_ERROR",
}


def iso_now() -> str:
    """Return timezone-aware ISO timestamp in UTC."""
    return datetime.now(timezone.utc).isoformat()


def request_id_from_request(request: Request | None) -> str:
    """Get middleware request id, or create one when unavailable."""
    if request is not None:
        value = getattr(getattr(request, "state", None), "request_id", "")
        if isinstance(value, str) and value.strip():
            return value.strip()
        header_id = request.headers.get("X-Request-ID", "").strip()
        if header_id:
            return header_id
    return str(uuid4())


def build_meta(
    *,
    flow: str,
    request_id: str,
    source: str | None = None,
    reason: str | None = None,
    extra: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Create standard metadata for envelope payloads."""
    meta: dict[str, Any] = {
        "request_id": request_id,
        "flow": flow,
        "timestamp": iso_now(),
    }
    if source:
        meta["source"] = source
    if reason:
        meta["reason"] = reason
    if extra:
        meta.update(extra)
    return meta


def success(
    *,
    flow: str,
    request_id: str,
    data: Any,
    source: str | None = None,
    reason: str | None = None,
    meta_extra: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build a success envelope payload."""
    return {
        "ok": True,
        "data": data,
        "meta": build_meta(
            flow=flow,
            request_id=request_id,
            source=source,
            reason=reason,
            extra=meta_extra,
        ),
    }


def failure_payload(
    *,
    flow: str,
    request_id: str,
    code: str,
    message: str,
    retryable: bool,
    details: dict[str, Any] | None = None,
    meta_extra: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build an error envelope payload."""
    normalized_code = code if code in ERROR_CODES else "INTERNAL_ERROR"
    return {
        "ok": False,
        "error": {
            "code": normalized_code,
            "message": message,
            "retryable": retryable,
            "details": details or {},
        },
        "meta": build_meta(flow=flow, request_id=request_id, extra=meta_extra),
    }


def failure_response(
    *,
    flow: str,
    request_id: str,
    code: str,
    message: str,
    retryable: bool,
    status_code: int,
    details: dict[str, Any] | None = None,
    meta_extra: dict[str, Any] | None = None,
) -> JSONResponse:
    """Build JSONResponse with error envelope and status code."""
    payload = failure_payload(
        flow=flow,
        request_id=request_id,
        code=code,
        message=message,
        retryable=retryable,
        details=details,
        meta_extra=meta_extra,
    )
    return JSONResponse(status_code=status_code, content=payload)
