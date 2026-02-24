import os
import logging
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlmodel import Session

from app.database import create_db_and_tables, engine
from app.routers import blog, cv, gamification, github, oracle
from app.seed import ensure_achievements, seed_initial_data


def _configure_logging() -> None:
    level_name = os.getenv("LOG_LEVEL", "INFO").strip().upper()
    level = getattr(logging, level_name, logging.INFO)
    root_logger = logging.getLogger()
    if not root_logger.handlers:
        logging.basicConfig(
            level=level,
            format="%(asctime)s %(levelname)s %(name)s %(message)s",
        )
    else:
        root_logger.setLevel(level)


_configure_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    with Session(engine) as session:
        seed_initial_data(session)
        ensure_achievements(session)
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


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    incoming_request_id = request.headers.get("X-Request-ID", "").strip()
    request_id = incoming_request_id or str(uuid.uuid4())
    request.state.request_id = request_id

    started = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:  # noqa: BLE001
        duration_ms = int((time.perf_counter() - started) * 1000)
        logger.warning(
            "http_request_failed method=%s path=%s duration_ms=%s request_id=%s",
            request.method,
            request.url.path,
            duration_ms,
            request_id,
        )
        raise

    response.headers["X-Request-ID"] = request_id
    duration_ms = int((time.perf_counter() - started) * 1000)
    logger.info(
        "http_request method=%s path=%s status_code=%s duration_ms=%s request_id=%s",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
        request_id,
    )
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    request_id = (
        getattr(request.state, "request_id", "")
        or request.headers.get("X-Request-ID", "").strip()
        or str(uuid.uuid4())
    )
    logger.exception(
        "unhandled_exception method=%s path=%s request_id=%s error_type=%s",
        request.method,
        request.url.path,
        request_id,
        exc.__class__.__name__,
    )
    return JSONResponse(
        status_code=500,
        headers={"X-Request-ID": request_id},
        content={
            "error": "internal_error",
            "message": "Unexpected server error",
            "request_id": request_id,
        },
    )


app.include_router(github.router, prefix="/api")
app.include_router(cv.router, prefix="/api")
app.include_router(oracle.router, prefix="/api")
app.include_router(gamification.router, prefix="/api")
app.include_router(blog.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "alive", "quest": "DevQuest", "version": "0.1.0"}
