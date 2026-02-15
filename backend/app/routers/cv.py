"""CV upload and mock analysis endpoint."""

from fastapi import APIRouter, UploadFile, File

from app.services.mock_ai import analyze_cv

router = APIRouter(prefix="/cv", tags=["cv"])

# In-memory storage for last analysis (resets on server restart)
_last_analysis: dict | None = None


@router.post("/upload")
async def upload_cv(file: UploadFile = File(...)):
    """Accept file upload, return mock analysis."""
    global _last_analysis
    contents = await file.read()

    cv_analysis = analyze_cv(["experience", "education", "skills"])

    _last_analysis = {
        "filename": file.filename,
        "size": len(contents),
        "score": 85,
        "overall": cv_analysis,
        "sections": [
            {"name": "Formatting", "score": 90, "feedback": "Clean layout with consistent spacing. ATS-friendly format."},
            {"name": "Keywords", "score": 78, "feedback": "Good technical keywords. Add more industry-specific terms."},
            {"name": "Experience", "score": 88, "feedback": "Strong action verbs and quantified achievements."},
            {"name": "Skills", "score": 82, "feedback": "Comprehensive skill list. Consider grouping by proficiency."},
        ],
    }
    return _last_analysis


@router.get("/analysis")
async def get_analysis():
    """Return the last analysis result."""
    if _last_analysis is None:
        return {"status": "no_analysis", "message": "Upload a CV first"}
    return _last_analysis
