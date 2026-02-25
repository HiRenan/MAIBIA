from __future__ import annotations

import os


def _assert_error_envelope(payload: dict):
    assert payload["ok"] is False
    assert "error" in payload
    assert "meta" in payload
    assert "request_id" in payload["meta"]
    assert payload["meta"]["flow"] == "oracle"


def _assert_success_envelope(payload: dict):
    assert payload["ok"] is True
    assert "data" in payload
    assert "meta" in payload
    assert payload["meta"]["flow"] == "oracle"


def test_oracle_chat_validation_error(client):
    response = client.post("/api/oracle/chat", json={"message": "   "})
    assert response.status_code == 400
    payload = response.json()
    _assert_error_envelope(payload)
    assert payload["error"]["code"] == "VALIDATION_ERROR"


def test_oracle_history_validation_error(client):
    response = client.get("/api/oracle/history?limit=0&offset=-1")
    assert response.status_code == 400
    payload = response.json()
    _assert_error_envelope(payload)
    assert payload["error"]["code"] == "VALIDATION_ERROR"


def test_oracle_chat_success_envelope_with_tool_runtime(client, monkeypatch):
    from app.services import oracle_service

    os.environ["OPENAI_API_KEY"] = "test-key"
    seen = {"has_tool_runtime": False}

    async def fake_generate_oracle_text(self, *, instructions, input_text, tool_runtime=None):
        seen["has_tool_runtime"] = tool_runtime is not None and bool(tool_runtime.tools_for_openai())
        return "Plano objetivo para evoluir backend.\n- Entregue uma rota nova com teste\n- Suba com docker local"

    monkeypatch.setattr(oracle_service.LLMClient, "generate_oracle_text", fake_generate_oracle_text)

    response = client.post("/api/oracle/chat", json={"message": "Me ajuda com backend"})
    assert response.status_code == 200
    payload = response.json()
    _assert_success_envelope(payload)
    assert payload["data"]["role"] == "oracle"
    assert isinstance(payload["data"]["text"], str)
    assert payload["meta"]["source"] in {"llm", "fallback_mock", "security_refusal"}
    assert seen["has_tool_runtime"] is True
