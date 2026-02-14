from fastapi import APIRouter

router = APIRouter(prefix="/gamification", tags=["gamification"])


@router.get("/")
async def get_gamification_status():
    return {"status": "coming_soon", "module": "gamification"}
