"""Database configuration and session management."""

import os
from pathlib import Path

from sqlalchemy import text
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
    _ensure_chatmessage_session_schema()


def _ensure_chatmessage_session_schema() -> None:
    """Add ChatMessage.session_id column/index for existing SQLite databases."""
    with engine.begin() as connection:
        rows = connection.execute(text("PRAGMA table_info(chatmessage)")).fetchall()
        existing_columns = {str(row[1]) for row in rows}
        if "session_id" not in existing_columns:
            connection.execute(
                text("ALTER TABLE chatmessage ADD COLUMN session_id TEXT NOT NULL DEFAULT ''")
            )
        connection.execute(
            text(
                "CREATE INDEX IF NOT EXISTS ix_chatmessage_session_id "
                "ON chatmessage (session_id)"
            )
        )


def get_session():
    with Session(engine) as session:
        yield session
