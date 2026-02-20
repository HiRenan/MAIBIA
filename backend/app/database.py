"""Database configuration and session management."""

import os
from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine

DB_DIR = Path(os.getenv("DB_PATH", str(Path(__file__).resolve().parent.parent.parent / "data")))
DB_DIR.mkdir(parents=True, exist_ok=True)
sqlite_file = DB_DIR / "devquest.db"
sqlite_url = f"sqlite:///{sqlite_file}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


def create_db_and_tables():
    from app.models import Achievement, ActivityLog, BlogPost, ChatMessage, CVAnalysis, PlayerProfile, Skill  # noqa: F401

    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
