import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from app.database import create_db_and_tables, engine
from app.routers import blog, cv, gamification, github, oracle
from app.seed import seed_initial_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    with Session(engine) as session:
        seed_initial_data(session)
    yield


app = FastAPI(title="DevQuest API", version="0.1.0", lifespan=lifespan)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(github.router, prefix="/api")
app.include_router(cv.router, prefix="/api")
app.include_router(oracle.router, prefix="/api")
app.include_router(gamification.router, prefix="/api")
app.include_router(blog.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "alive", "quest": "DevQuest", "version": "0.1.0"}
