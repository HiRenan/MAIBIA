"""LLM provider client wrapper for Oracle generation."""

from __future__ import annotations

import asyncio
import json
import logging
import os
import random
import time
from typing import TYPE_CHECKING, Any

import openai
from openai import AsyncOpenAI

if TYPE_CHECKING:
    from app.services.llm_tools_oracle import OracleToolRuntime

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


class LLMRequestLimitError(LLMClientError):
    """Raised when request payload exceeds configured limits."""


class LLMRetryExhaustedError(LLMTransientError):
    """Raised when transient failures exceed retry budget."""


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
        self.oracle_app_retries = max(0, _env_int("OPENAI_ORACLE_APP_RETRIES", 2))
        self.oracle_backoff_base_ms = max(
            50, _env_int("OPENAI_ORACLE_BACKOFF_BASE_MS", 250)
        )
        self.oracle_backoff_max_ms = max(
            self.oracle_backoff_base_ms,
            _env_int("OPENAI_ORACLE_BACKOFF_MAX_MS", 2000),
        )
        self.oracle_backoff_jitter_ms = max(
            0, _env_int("OPENAI_ORACLE_BACKOFF_JITTER_MS", 120)
        )
        self.max_instructions_chars = max(
            1000, _env_int("LLM_MAX_INSTRUCTIONS_CHARS", 12000)
        )
        self.max_input_chars = max(1000, _env_int("LLM_MAX_INPUT_CHARS", 24000))
        self.max_total_chars = max(1000, _env_int("LLM_MAX_TOTAL_CHARS", 32000))
        self.oracle_tool_round_limit = max(1, _env_int("OPENAI_ORACLE_TOOL_ROUND_LIMIT", 3))

        self._client = (
            AsyncOpenAI(
                api_key=self.api_key,
                timeout=self.timeout_seconds,
                max_retries=self.max_retries,
            )
            if self.api_key
            else None
        )

    def _validate_request_limits(self, *, instructions: str, input_text: str) -> None:
        instructions_len = len(instructions or "")
        input_len = len(input_text or "")
        total_len = instructions_len + input_len
        if instructions_len > self.max_instructions_chars:
            raise LLMRequestLimitError(
                f"LLM instructions too large ({instructions_len} > {self.max_instructions_chars})"
            )
        if input_len > self.max_input_chars:
            raise LLMRequestLimitError(
                f"LLM input too large ({input_len} > {self.max_input_chars})"
            )
        if total_len > self.max_total_chars:
            raise LLMRequestLimitError(
                f"LLM payload too large ({total_len} > {self.max_total_chars})"
            )

    @staticmethod
    def _is_retryable_status(status_code: int) -> bool:
        return status_code in {408, 409, 429} or status_code >= 500

    def _compute_backoff_ms(self, attempt: int) -> int:
        base = min(
            self.oracle_backoff_base_ms * (2 ** max(attempt - 1, 0)),
            self.oracle_backoff_max_ms,
        )
        jitter = (
            random.randint(0, self.oracle_backoff_jitter_ms)
            if self.oracle_backoff_jitter_ms
            else 0
        )
        return base + jitter

    @staticmethod
    def _elapsed_ms(started: float) -> int:
        return int((time.perf_counter() - started) * 1000)

    async def _sleep_for_retry(
        self,
        *,
        attempt: int,
        max_attempts: int,
        error_type: str,
        status_code: int | None,
        provider_request_id: str | None,
    ) -> None:
        backoff_ms = self._compute_backoff_ms(attempt)
        logger.warning(
            "oracle_llm_retry attempt=%s max_attempts=%s backoff_ms=%s error_type=%s status_code=%s provider_request_id=%s",
            attempt,
            max_attempts,
            backoff_ms,
            error_type,
            status_code,
            provider_request_id,
        )
        await asyncio.sleep(backoff_ms / 1000)

    def _log_failure(
        self,
        *,
        attempt: int,
        max_attempts: int,
        started: float,
        error_type: str,
        status_code: int | None,
        provider_request_id: str | None,
    ) -> None:
        logger.warning(
            "oracle_llm_failure attempt=%s max_attempts=%s elapsed_ms=%s error_type=%s status_code=%s provider_request_id=%s",
            attempt,
            max_attempts,
            self._elapsed_ms(started),
            error_type,
            status_code,
            provider_request_id,
        )

    @staticmethod
    def _extract_function_calls(response: Any) -> list[Any]:
        output_items = getattr(response, "output", None) or []
        return [item for item in output_items if getattr(item, "type", "") == "function_call"]

    async def _continue_with_tool_outputs(
        self,
        *,
        provider_client: AsyncOpenAI,
        response: Any,
        instructions: str,
        tool_runtime: OracleToolRuntime,
    ) -> Any:
        rounds = 0
        current = response
        while rounds < self.oracle_tool_round_limit:
            function_calls = self._extract_function_calls(current)
            if not function_calls:
                return current

            rounds += 1
            tool_outputs: list[dict[str, str]] = []
            for function_call in function_calls:
                name = str(getattr(function_call, "name", "") or "")
                call_id = str(getattr(function_call, "call_id", "") or "")
                arguments = str(getattr(function_call, "arguments", "") or "")
                if not name or not call_id:
                    continue
                result = tool_runtime.execute(name=name, arguments_json=arguments)
                tool_outputs.append(
                    {
                        "type": "function_call_output",
                        "call_id": call_id,
                        "output": json.dumps(result, ensure_ascii=True),
                    }
                )

            if not tool_outputs:
                break

            previous_response_id = getattr(current, "id", None)
            if not previous_response_id:
                raise LLMResponseFormatError("Missing previous_response_id for tool continuation")

            current = await provider_client.responses.create(
                model=self.model_oracle,
                instructions=instructions,
                previous_response_id=previous_response_id,
                input=tool_outputs,
                temperature=self.temperature_oracle,
                top_p=self.top_p_oracle,
                max_output_tokens=self.max_tokens_oracle,
            )
            logger.info(
                "oracle_llm_tools_round round=%s tool_calls=%s request_id=%s",
                rounds,
                len(tool_outputs),
                getattr(current, "_request_id", None),
            )

        raise LLMResponseFormatError("Tool-calling rounds exhausted before final text output")

    async def generate_oracle_text(
        self,
        *,
        instructions: str,
        input_text: str,
        tool_runtime: OracleToolRuntime | None = None,
    ) -> str:
        """Generate Oracle response text from configured model."""
        if not self._client:
            raise LLMConfigurationError("OPENAI_API_KEY is missing")
        self._validate_request_limits(instructions=instructions, input_text=input_text)

        started = time.perf_counter()
        max_attempts = 1 + self.oracle_app_retries
        provider_client = self._client.with_options(max_retries=0)

        for attempt in range(1, max_attempts + 1):
            try:
                create_kwargs: dict[str, Any] = {
                    "model": self.model_oracle,
                    "instructions": instructions,
                    "input": input_text,
                    "temperature": self.temperature_oracle,
                    "top_p": self.top_p_oracle,
                    "max_output_tokens": self.max_tokens_oracle,
                }
                if tool_runtime is not None:
                    create_kwargs["tools"] = tool_runtime.tools_for_openai()
                    create_kwargs["tool_choice"] = "auto"
                    create_kwargs["parallel_tool_calls"] = False

                response = await provider_client.responses.create(
                    **create_kwargs,
                )
                if tool_runtime is not None:
                    response = await self._continue_with_tool_outputs(
                        provider_client=provider_client,
                        response=response,
                        instructions=instructions,
                        tool_runtime=tool_runtime,
                    )
                request_id = getattr(response, "_request_id", None)
                logger.info(
                    "oracle_llm_success model=%s latency_ms=%s request_id=%s",
                    self.model_oracle,
                    self._elapsed_ms(started),
                    request_id,
                )
                output_text = (getattr(response, "output_text", "") or "").strip()
                if not output_text:
                    raise LLMResponseFormatError("Empty LLM output text")
                return output_text
            except openai.AuthenticationError as exc:
                raise LLMAuthenticationError("LLM authentication failed") from exc
            except openai.BadRequestError as exc:
                raise LLMUpstreamError("LLM bad request") from exc
            except openai.RateLimitError as exc:
                provider_request_id = getattr(exc, "request_id", None)
                if attempt < max_attempts:
                    await self._sleep_for_retry(
                        attempt=attempt,
                        max_attempts=max_attempts,
                        error_type=exc.__class__.__name__,
                        status_code=429,
                        provider_request_id=provider_request_id,
                    )
                    continue
                self._log_failure(
                    attempt=attempt,
                    max_attempts=max_attempts,
                    started=started,
                    error_type=exc.__class__.__name__,
                    status_code=429,
                    provider_request_id=provider_request_id,
                )
                raise LLMRetryExhaustedError("LLM rate limit retries exhausted") from exc
            except (openai.APITimeoutError, openai.APIConnectionError) as exc:
                if attempt < max_attempts:
                    await self._sleep_for_retry(
                        attempt=attempt,
                        max_attempts=max_attempts,
                        error_type=exc.__class__.__name__,
                        status_code=None,
                        provider_request_id=None,
                    )
                    continue
                self._log_failure(
                    attempt=attempt,
                    max_attempts=max_attempts,
                    started=started,
                    error_type=exc.__class__.__name__,
                    status_code=None,
                    provider_request_id=None,
                )
                raise LLMRetryExhaustedError("LLM transient connection retries exhausted") from exc
            except openai.APIStatusError as exc:
                provider_request_id = getattr(exc, "request_id", None)
                if self._is_retryable_status(exc.status_code):
                    if attempt < max_attempts:
                        await self._sleep_for_retry(
                            attempt=attempt,
                            max_attempts=max_attempts,
                            error_type=exc.__class__.__name__,
                            status_code=exc.status_code,
                            provider_request_id=provider_request_id,
                        )
                        continue
                    self._log_failure(
                        attempt=attempt,
                        max_attempts=max_attempts,
                        started=started,
                        error_type=exc.__class__.__name__,
                        status_code=exc.status_code,
                        provider_request_id=provider_request_id,
                    )
                    raise LLMRetryExhaustedError(
                        f"LLM transient status retries exhausted ({exc.status_code})"
                    ) from exc
                raise LLMUpstreamError(f"LLM upstream status {exc.status_code}") from exc
            except LLMResponseFormatError:
                raise
            except Exception as exc:  # noqa: BLE001
                raise LLMClientError("Unexpected LLM client error") from exc

        raise LLMRetryExhaustedError("LLM retries exhausted unexpectedly")
