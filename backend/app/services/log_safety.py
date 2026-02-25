"""Logging safety utilities with optional sensitive-data redaction."""

from __future__ import annotations

import logging
import os
import re
from typing import Pattern

_PATTERNS: list[tuple[Pattern[str], str]] = [
    (re.compile(r"\bsk-[A-Za-z0-9_-]{12,}\b"), "sk-***REDACTED***"),
    (
        re.compile(r"\b(authorization\s*:\s*bearer)\s+[A-Za-z0-9._\-+/=]+\b", re.IGNORECASE),
        r"\1 ***REDACTED***",
    ),
    (
        re.compile(r"\b(api[_ -]?key|token|client[_ -]?secret|password)\s*[:=]\s*[^\s,;]+", re.IGNORECASE),
        r"\1=***REDACTED***",
    ),
    (re.compile(r"<cv_text>[\s\S]{0,12000}</cv_text>", re.IGNORECASE), "<cv_text>***REDACTED***</cv_text>"),
    (
        re.compile(r"<system_prompt>[\s\S]{0,12000}</system_prompt>", re.IGNORECASE),
        "<system_prompt>***REDACTED***</system_prompt>",
    ),
]


def is_redaction_enabled() -> bool:
    raw = os.getenv("LOG_REDACTION_ENABLED", "true").strip().lower()
    return raw in {"1", "true", "yes", "on"}


def redact_text(value: str) -> str:
    """Redact known-sensitive content from arbitrary text."""
    sanitized = value
    for pattern, replacement in _PATTERNS:
        sanitized = pattern.sub(replacement, sanitized)
    return sanitized


class RedactionFilter(logging.Filter):
    """Redact sensitive content in finalized log messages."""

    def __init__(self, enabled: bool) -> None:
        super().__init__()
        self.enabled = enabled

    def filter(self, record: logging.LogRecord) -> bool:
        if not self.enabled:
            return True
        try:
            message = record.getMessage()
            redacted = redact_text(message)
            if redacted != message:
                record.msg = redacted
                record.args = ()
        except Exception:
            # Never block logs due to redaction issues.
            pass
        return True


def install_redaction_filter() -> None:
    """Attach a single redaction filter to all current root handlers."""
    root_logger = logging.getLogger()
    enabled = is_redaction_enabled()
    for handler in root_logger.handlers:
        already_installed = any(isinstance(flt, RedactionFilter) for flt in handler.filters)
        if not already_installed:
            handler.addFilter(RedactionFilter(enabled=enabled))
