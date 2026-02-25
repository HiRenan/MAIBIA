from __future__ import annotations

from app.services.llm_tools_oracle import OracleToolRuntime


def test_oracle_tools_runtime_contract_and_execution():
    runtime = OracleToolRuntime(
        profile={
            "name": "Renan",
            "title": "Dev",
            "level": 7,
            "xp": 1200,
            "xp_next_level": 1600,
            "strength": 80,
            "intelligence": 82,
            "dexterity": 70,
            "wisdom": 78,
        },
        skills=[{"name": "Python", "level": 4, "max_level": 5, "unlocked": True}],
        history=[{"role": "user", "text": "oi", "created_at": "2026-01-01T00:00:00+00:00"}],
    )

    tools = runtime.tools_for_openai()
    assert len(tools) == 3
    assert all("." not in tool["name"] for tool in tools)

    profile_result = runtime.execute(name="oracle_get_player_profile", arguments_json="{}")
    assert profile_result["ok"] is True
    assert profile_result["data"]["name"] == "Renan"

    history_result = runtime.execute(name="oracle_get_oracle_history", arguments_json='{"limit":1,"offset":0}')
    assert history_result["ok"] is True
    assert history_result["data"]["total"] == 1

    invalid_result = runtime.execute(name="oracle_get_player_skills", arguments_json="{}")
    assert invalid_result["ok"] is False
    assert invalid_result["error"]["code"] == "VALIDATION_ERROR"
