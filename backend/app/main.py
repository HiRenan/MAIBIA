from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_db_and_tables
from app.routers import cv, gamification, github, oracle


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="DevQuest API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(github.router, prefix="/api")
app.include_router(cv.router, prefix="/api")
app.include_router(oracle.router, prefix="/api")
app.include_router(gamification.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "alive", "quest": "DevQuest", "version": "0.1.0"}
