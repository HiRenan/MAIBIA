from fastapi import APIRouter

router = APIRouter(prefix="/oracle", tags=["oracle"])


@router.get("/")
async def get_oracle_status():
    return {"status": "coming_soon", "module": "oracle"}
