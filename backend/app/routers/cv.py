"""CV upload and analysis endpoints with SQLite persistence."""

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, UploadFile, File
from sqlmodel import Session, select

from app.database import get_session
from app.models import CVAnalysis
from app.services.mock_ai import analyze_cv

router = APIRouter(prefix="/cv", tags=["cv"])


def _format_analysis(record: CVAnalysis) -> dict:
    """Deserialize JSON fields from a CVAnalysis row."""
    return {
        "id": record.id,
        "filename": record.filename,
        "size": record.file_size,
        "score": record.score,
        "sections": json.loads(record.sections) if record.sections else [],
        "strengths": json.loads(record.strengths) if record.strengths else [],
        "weaknesses": json.loads(record.weaknesses) if record.weaknesses else [],
        "tips": json.loads(record.tips) if record.tips else [],
        "created_at": record.created_at,
    }


@router.post("/upload")
async def upload_cv(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    """Accept file upload, run mock analysis, persist to DB."""
    contents = await file.read()
    filename = file.filename or "unknown.pdf"
    file_size = len(contents)

    result = analyze_cv(filename, file_size)

    record = CVAnalysis(
        filename=filename,
        file_size=file_size,
        score=result["score"],
        strengths=json.dumps(result["strengths"]),
        weaknesses=json.dumps(result["weaknesses"]),
        tips=json.dumps(result["tips"]),
        sections=json.dumps(result["sections"]),
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    session.add(record)
    session.commit()
    session.refresh(record)

    return _format_analysis(record)


@router.get("/analysis")
async def get_analysis(session: Session = Depends(get_session)):
    """Return the most recent CV analysis."""
    statement = select(CVAnalysis).order_by(CVAnalysis.id.desc()).limit(1)  # type: ignore[union-attr]
    record = session.exec(statement).first()
    if record is None:
        return {"status": "no_analysis", "message": "Upload a CV first"}
    return _format_analysis(record)


@router.get("/analyses")
async def get_analyses(session: Session = Depends(get_session)):
    """Return all CV analyses, newest first."""
    statement = select(CVAnalysis).order_by(CVAnalysis.id.desc())  # type: ignore[union-attr]
    records = session.exec(statement).all()
    return {"analyses": [_format_analysis(r) for r in records]}
