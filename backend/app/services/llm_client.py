"""LLM provider client wrapper for Oracle generation."""

from __future__ import annotations

import logging
import os
import time

import openai
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)


class LLMClientError(Exception):
    """Base exception for all LLM client errors."""


class LLMConfigurationError(LLMClientError):
    """Raised when required config is missing or invalid."""


class LLMAuthenticationError(LLMClientError):
    """Raised when API key/authentication is invalid."""


class LLMTransientError(LLMClientError):
    """Raised for retryable provider/network failures."""


class LLMUpstreamError(LLMClientError):
    """Raised for non-retryable upstream API errors."""


class LLMResponseFormatError(LLMClientError):
    """Raised when provider response is empty or malformed."""


def _env_float(name: str, default: float) -> float:
    raw = os.getenv(name, "")
    if not raw.strip():
        return default
    try:
        return float(raw)
    except ValueError:
        logger.warning("invalid_float_env name=%s value=%s using_default=%s", name, raw, default)
        return default


def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name, "")
    if not raw.strip():
        return default
    try:
        return int(raw)
    except ValueError:
        logger.warning("invalid_int_env name=%s value=%s using_default=%s", name, raw, default)
        return default


class LLMClient:
    """Thin OpenAI client focused on Oracle text generation."""

    def __init__(self) -> None:
        self.api_key = os.getenv("OPENAI_API_KEY", "").strip()
        self.model_oracle = os.getenv("OPENAI_MODEL_ORACLE", "gpt-4o-mini").strip() or "gpt-4o-mini"
        self.timeout_seconds = _env_float("OPENAI_TIMEOUT_SECONDS", 20.0)
        self.max_retries = _env_int("OPENAI_MAX_RETRIES", 2)
        self.temperature_oracle = _env_float("OPENAI_TEMPERATURE_ORACLE", 0.7)
        self.top_p_oracle = _env_float("OPENAI_TOP_P_ORACLE", 1.0)
        self.max_tokens_oracle = _env_int("OPENAI_MAX_TOKENS_ORACLE", 600)

        self._client = (
            AsyncOpenAI(
                api_key=self.api_key,
                timeout=self.timeout_seconds,
                max_retries=self.max_retries,
            )
            if self.api_key
            else None
        )

    async def generate_oracle_text(self, *, instructions: str, input_text: str) -> str:
        """Generate Oracle response text from configured model."""
        if not self._client:
            raise LLMConfigurationError("OPENAI_API_KEY is missing")

        started = time.perf_counter()
        try:
            response = await self._client.responses.create(
                model=self.model_oracle,
                instructions=instructions,
                input=input_text,
                temperature=self.temperature_oracle,
                top_p=self.top_p_oracle,
                max_output_tokens=self.max_tokens_oracle,
            )
        except openai.AuthenticationError as exc:
            raise LLMAuthenticationError("LLM authentication failed") from exc
        except openai.RateLimitError as exc:
            raise LLMTransientError("LLM rate-limited") from exc
        except (openai.APITimeoutError, openai.APIConnectionError) as exc:
            raise LLMTransientError("LLM connection/timeout error") from exc
        except openai.APIStatusError as exc:
            if exc.status_code in {429, 500, 502, 503, 504}:
                raise LLMTransientError(f"LLM transient status {exc.status_code}") from exc
            raise LLMUpstreamError(f"LLM upstream status {exc.status_code}") from exc
        except openai.BadRequestError as exc:
            raise LLMUpstreamError("LLM bad request") from exc
        except Exception as exc:  # noqa: BLE001
            raise LLMClientError("Unexpected LLM client error") from exc

        latency_ms = int((time.perf_counter() - started) * 1000)
        request_id = getattr(response, "_request_id", None)
        logger.info(
            "oracle_llm_success model=%s latency_ms=%s request_id=%s",
            self.model_oracle,
            latency_ms,
            request_id,
        )

        output_text = (getattr(response, "output_text", "") or "").strip()
        if not output_text:
            raise LLMResponseFormatError("Empty LLM output text")
        return output_text
