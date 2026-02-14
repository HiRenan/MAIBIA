from fastapi import APIRouter

router = APIRouter(prefix="/github", tags=["github"])


@router.get("/")
async def get_github_status():
    return {"status": "coming_soon", "module": "github"}
