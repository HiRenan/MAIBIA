"""Oracle tool-calling runtime for Responses API function tools."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any

_ROOT_DIR = Path(__file__).resolve().parents[3]
_TOOLS_DIR = _ROOT_DIR / "tools"


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@lru_cache(maxsize=1)
def _oracle_tool_contracts() -> dict[str, dict[str, Any]]:
    names = [
        "oracle.get_player_profile",
        "oracle.get_player_skills",
        "oracle.get_oracle_history",
    ]
    contracts: dict[str, dict[str, Any]] = {}
    for name in names:
        path = _TOOLS_DIR / f"{name}.json"
        contracts[name] = json.loads(path.read_text(encoding="utf-8"))
    return contracts


def _tool_meta(name: str) -> dict[str, Any]:
    return {"tool": name, "flow": "oracle", "timestamp": _iso_now()}


def _tool_success(name: str, data: dict[str, Any]) -> dict[str, Any]:
    return {"ok": True, "data": data, "meta": _tool_meta(name)}


def _tool_error(
    name: str,
    *,
    code: str,
    message: str,
    retryable: bool = False,
    details: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "ok": False,
        "error": {
            "code": code,
            "message": message,
            "retryable": retryable,
            "details": details or {},
        },
        "meta": _tool_meta(name),
    }


class OracleToolRuntime:
    """Executes Oracle function tools against trusted runtime context."""

    def __init__(self, *, profile: dict | None, skills: list[dict], history: list[dict]) -> None:
        self.profile = profile
        self.skills = skills or []
        self.history = history or []
        self.contracts = _oracle_tool_contracts()
        self.runtime_to_contract: dict[str, str] = {}
        self.contract_to_runtime: dict[str, str] = {}
        for contract_name in self.contracts:
            tool_cfg = self.contracts[contract_name].get("tool", {})
            runtime_name = str(tool_cfg.get("runtime_name") or contract_name.replace(".", "_"))
            self.runtime_to_contract[runtime_name] = contract_name
            self.contract_to_runtime[contract_name] = runtime_name

    def tools_for_openai(self) -> list[dict[str, Any]]:
        """Return OpenAI tool definitions sourced from JSON contracts."""
        tools: list[dict[str, Any]] = []
        for contract_name in self.contracts:
            tool_cfg = self.contracts[contract_name].get("tool", {})
            runtime_name = self.contract_to_runtime[contract_name]
            tools.append(
                {
                    "type": "function",
                    "name": runtime_name,
                    "description": str(tool_cfg.get("description", "")),
                    "parameters": tool_cfg.get("parameters", {"type": "object", "properties": {}, "additionalProperties": False}),
                    "strict": bool(tool_cfg.get("strict", True)),
                }
            )
        return tools

    def execute(self, *, name: str, arguments_json: str | None) -> dict[str, Any]:
        """Execute one function tool call from model output."""
        contract_name = self.runtime_to_contract.get(name, name)
        if contract_name not in self.contracts:
            return _tool_error(contract_name, code="VALIDATION_ERROR", message="unknown_tool", details={"tool": name})

        parsed_args = self._parse_arguments(name=contract_name, arguments_json=arguments_json)
        if parsed_args.get("__invalid__"):
            return _tool_error(
                contract_name,
                code="VALIDATION_ERROR",
                message="invalid_tool_arguments",
                details={"arguments": parsed_args.get("raw", "")},
            )

        try:
            if contract_name == "oracle.get_player_profile":
                return self._get_player_profile(name=contract_name, args=parsed_args)
            if contract_name == "oracle.get_player_skills":
                return self._get_player_skills(name=contract_name, args=parsed_args)
            if contract_name == "oracle.get_oracle_history":
                return self._get_oracle_history(name=contract_name, args=parsed_args)
            return _tool_error(contract_name, code="VALIDATION_ERROR", message="unknown_tool")
        except Exception as exc:  # noqa: BLE001
            return _tool_error(
                contract_name,
                code="INTERNAL_ERROR",
                message="tool_execution_failed",
                retryable=False,
                details={"error_type": exc.__class__.__name__},
            )

    @staticmethod
    def _parse_arguments(*, name: str, arguments_json: str | None) -> dict[str, Any]:
        if arguments_json is None or not str(arguments_json).strip():
            raw = "{}"
        else:
            raw = str(arguments_json)
        try:
            parsed = json.loads(raw)
            if not isinstance(parsed, dict):
                return {"__invalid__": True, "raw": raw}
            return parsed
        except json.JSONDecodeError:
            return {"__invalid__": True, "raw": raw, "tool": name}

    @staticmethod
    def _require_no_extra(args: dict[str, Any], *, allowed: set[str]) -> bool:
        return set(args.keys()).issubset(allowed)

    def _get_player_profile(self, *, name: str, args: dict[str, Any]) -> dict[str, Any]:
        if not self._require_no_extra(args, allowed=set()):
            return _tool_error(name, code="VALIDATION_ERROR", message="unexpected_arguments")
        if not self.profile:
            return _tool_error(name, code="NOT_FOUND", message="profile_not_found")
        return _tool_success(name, dict(self.profile))

    def _get_player_skills(self, *, name: str, args: dict[str, Any]) -> dict[str, Any]:
        if not self._require_no_extra(args, allowed={"only_unlocked"}):
            return _tool_error(name, code="VALIDATION_ERROR", message="unexpected_arguments")
        if "only_unlocked" not in args:
            return _tool_error(name, code="VALIDATION_ERROR", message="missing_required_argument:only_unlocked")
        only_unlocked = args.get("only_unlocked")
        if only_unlocked not in {True, False, None}:
            return _tool_error(name, code="VALIDATION_ERROR", message="invalid_argument_type:only_unlocked")

        values = self.skills
        if only_unlocked:
            values = [item for item in values if bool(item.get("unlocked"))]
        return _tool_success(name, {"skills": values})

    def _get_oracle_history(self, *, name: str, args: dict[str, Any]) -> dict[str, Any]:
        if not self._require_no_extra(args, allowed={"limit", "offset"}):
            return _tool_error(name, code="VALIDATION_ERROR", message="unexpected_arguments")
        if "limit" not in args or "offset" not in args:
            return _tool_error(name, code="VALIDATION_ERROR", message="missing_required_arguments")

        try:
            limit = int(args.get("limit"))
            offset = int(args.get("offset"))
        except (TypeError, ValueError):
            return _tool_error(name, code="VALIDATION_ERROR", message="invalid_argument_type")

        if limit < 1 or limit > 200:
            return _tool_error(name, code="VALIDATION_ERROR", message="limit_out_of_range")
        if offset < 0:
            return _tool_error(name, code="VALIDATION_ERROR", message="offset_out_of_range")

        total = len(self.history)
        window = self.history[offset : offset + limit]
        messages: list[dict[str, Any]] = []
        for idx, message in enumerate(window, start=offset + 1):
            messages.append(
                {
                    "id": idx,
                    "role": str(message.get("role", "user")),
                    "text": str(message.get("text", "")),
                    "created_at": str(message.get("created_at", "")),
                }
            )
        return _tool_success(
            name,
            {
                "messages": messages,
                "total": total,
                "has_more": offset + limit < total,
            },
        )
