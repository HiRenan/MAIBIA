"""Oracle chat endpoints — DB-persisted chat with context-aware mock AI."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, col, func, select

from app.database import get_session
from app.models import ChatMessage, PlayerProfile, Skill
from app.services.mock_ai import oracle_chat, weekly_summary

router = APIRouter(prefix="/oracle", tags=["oracle"])


class ChatRequest(BaseModel):
    message: str


def _get_profile_dict(session: Session) -> dict | None:
    profile = session.exec(select(PlayerProfile)).first()
    if not profile:
        return None
    return {
        "name": profile.name,
        "title": profile.title,
        "level": profile.level,
        "xp": profile.xp,
        "xp_next_level": profile.xp_next_level,
        "strength": profile.strength,
        "intelligence": profile.intelligence,
        "dexterity": profile.dexterity,
        "wisdom": profile.wisdom,
    }


def _get_skills_list(session: Session) -> list[dict]:
    skills = session.exec(select(Skill)).all()
    return [
        {"name": s.name, "level": s.level, "max_level": s.max_level, "unlocked": s.unlocked}
        for s in skills
    ]


@router.post("/chat")
async def chat(req: ChatRequest, session: Session = Depends(get_session)):
    """Process chat message with context-aware Oracle and persist both sides."""
    now = datetime.now(timezone.utc).isoformat()

    # Persist user message
    user_msg = ChatMessage(role="user", text=req.message, context_topic="", created_at=now)
    session.add(user_msg)

    # Get context from DB for richer responses
    profile = _get_profile_dict(session)
    skills = _get_skills_list(session)

    # Generate Oracle response
    result = oracle_chat(req.message, profile=profile, skills=skills)

    # Persist Oracle response
    oracle_msg = ChatMessage(
        role="oracle", text=result["text"], context_topic=result["topic"], created_at=now,
    )
    session.add(oracle_msg)
    session.commit()

    return {"role": "oracle", "text": result["text"], "topic": result["topic"]}


@router.get("/history")
async def get_history(
    limit: int = 50, offset: int = 0, session: Session = Depends(get_session),
):
    """Return paginated chat history in chronological order."""
    total = session.exec(select(func.count(ChatMessage.id))).one()

    messages = session.exec(
        select(ChatMessage)
        .order_by(col(ChatMessage.id).asc())
        .offset(offset)
        .limit(limit)
    ).all()

    return {
        "messages": [
            {"id": m.id, "role": m.role, "text": m.text, "created_at": m.created_at}
            for m in messages
        ],
        "total": total,
        "has_more": offset + limit < total,
    }


@router.get("/stats")
async def get_stats(session: Session = Depends(get_session)):
    """Oracle stats for the stats bar."""
    user_count = session.exec(
        select(func.count(ChatMessage.id)).where(ChatMessage.role == "user")
    ).one()

    # Unique topics explored
    topics = session.exec(
        select(ChatMessage.context_topic)
        .where(ChatMessage.role == "oracle")
        .where(ChatMessage.context_topic != "")
    ).all()
    unique_topics = len(set(topics))

    # Wisdom from profile
    profile = session.exec(select(PlayerProfile)).first()
    wisdom_score = profile.wisdom if profile else 70

    # Oracle level: 1 + messages/5, capped at 20
    oracle_level = min(1 + user_count // 5, 20)

    return {
        "messages_sent": user_count,
        "wisdom_score": wisdom_score,
        "topics_explored": unique_topics,
        "oracle_level": oracle_level,
    }


@router.get("/weekly-summary")
async def get_weekly(session: Session = Depends(get_session)):
    """Structured weekly summary with Oracle insights."""
    profile = _get_profile_dict(session)
    summary = weekly_summary(profile=profile)

    total = session.exec(select(func.count(ChatMessage.id))).one()
    summary["total_messages"] = total
    return summary
