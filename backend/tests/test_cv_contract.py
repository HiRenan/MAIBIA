from __future__ import annotations

from app.services.cv_service import CVAnalysisStructured, CVSection, CVServiceResult


def _assert_cv_envelope(payload: dict):
    assert payload["ok"] is True
    assert payload["meta"]["flow"] == "cv"
    assert "request_id" in payload["meta"]


def test_cv_upload_validation_error(client):
    files = {"file": ("resume.txt", b"invalid", "text/plain")}
    response = client.post("/api/cv/upload", files=files)
    assert response.status_code == 400
    payload = response.json()
    assert payload["ok"] is False
    assert payload["error"]["code"] == "VALIDATION_ERROR"
    assert payload["meta"]["flow"] == "cv"


def test_cv_upload_success_envelope(client, monkeypatch):
    async def fake_analyze_uploaded_cv(filename: str, file_size: int, contents: bytes):
        return CVServiceResult(
            analysis=CVAnalysisStructured(
                score=82,
                sections=[CVSection(name="Formatting", score=80, feedback="Clear and ATS-friendly.")],
                strengths=["Strong backend focus"],
                weaknesses=["Needs more quantified results"],
                tips=["Add impact metrics to top bullets"],
            ),
            source="llm",
            reason=None,
        )

    monkeypatch.setattr("app.routers.cv.analyze_uploaded_cv", fake_analyze_uploaded_cv)

    files = {"file": ("resume.pdf", b"%PDF-1.4 sample", "application/pdf")}
    response = client.post("/api/cv/upload", files=files)
    assert response.status_code == 200
    payload = response.json()
    _assert_cv_envelope(payload)
    assert payload["data"]["score"] == 82
    assert isinstance(payload["data"]["sections"], list)


def test_cv_get_latest_analysis_envelope(client):
    response = client.get("/api/cv/analysis")
    assert response.status_code == 200
    payload = response.json()
    _assert_cv_envelope(payload)
    assert isinstance(payload["data"], dict)
