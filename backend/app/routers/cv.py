"""CV upload and analysis endpoints with SQLite persistence."""

import io
import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select

from app.database import get_session
from app.models import CVAnalysis
from app.services.cv_export_service import (
    CVExportError,
    CVExportNotFoundError,
    generate_rpg_cv_pdf,
)
from app.services.cv_service import analyze_uploaded_cv
from app.services.gamification_engine import award_xp

router = APIRouter(prefix="/cv", tags=["cv"])

MAX_UPLOAD_BYTES = 5 * 1024 * 1024
ALLOWED_CV_EXTENSIONS = {".pdf", ".doc", ".docx"}


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
    """Accept file upload, run structured analysis, persist to DB."""
    filename = file.filename or "unknown.pdf"
    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_CV_EXTENSIONS:
        raise HTTPException(status_code=400, detail="unsupported_file_type")

    contents = await file.read()
    file_size = len(contents)
    if file_size <= 0:
        raise HTTPException(status_code=400, detail="empty_file")
    if file_size > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="file_too_large")

    service_result = await analyze_uploaded_cv(filename=filename, file_size=file_size, contents=contents)
    result = service_result.analysis.model_dump()

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

    # Award XP for CV analysis
    gamification = award_xp(session, "cv_upload", f"Analyzed CV: {filename}", 100)

    result_data = _format_analysis(record)
    result_data["gamification"] = gamification
    return result_data


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


@router.get("/download-rpg")
async def download_rpg_cv(session: Session = Depends(get_session)):
    """Generate and download RPG CV as a PDF document."""
    try:
        pdf_bytes, filename = generate_rpg_cv_pdf(session)
    except CVExportNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except CVExportError as exc:
        raise HTTPException(status_code=500, detail="cv_export_failed") from exc

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
