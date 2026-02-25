from __future__ import annotations

from app.services.repo_analysis_service import RepoAnalysisStructured, RepoMetrics, RepoServiceResult


def test_repo_analyze_success_envelope(client, monkeypatch):
    async def fake_analyze_repository(owner: str, repo: str):
        return RepoServiceResult(
            analysis=RepoAnalysisStructured(
                repo=f"{owner}/{repo}",
                score=88,
                strengths=["Readable architecture"],
                improvements=["Increase test coverage"],
                summary="Repository demonstrates strong fundamentals.",
                metrics=RepoMetrics(
                    code_quality=90,
                    documentation=84,
                    testing=70,
                    architecture=88,
                    security=82,
                ),
                category_tags=["well-structured"],
            ),
            source="llm",
            reason=None,
        )

    monkeypatch.setattr("app.routers.github.analyze_repository", fake_analyze_repository)

    response = client.post("/api/github/repos/test-owner/test-repo/analyze")
    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["meta"]["flow"] == "repo"
    assert payload["data"]["repo"] == "test-owner/test-repo"


def test_repo_profile_envelope(client):
    response = client.get("/api/github/profile")
    payload = response.json()
    assert "ok" in payload
    assert payload.get("meta", {}).get("flow") == "repo"
