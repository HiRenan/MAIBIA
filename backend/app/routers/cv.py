from fastapi import APIRouter

router = APIRouter(prefix="/cv", tags=["cv"])


@router.get("/")
async def get_cv_status():
    return {"status": "coming_soon", "module": "cv"}
