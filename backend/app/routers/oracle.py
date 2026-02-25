"""Oracle chat endpoints — session-scoped chat with context-aware LLM responses."""

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlmodel import Session, col, func, select

from app.database import get_session
from app.models import ChatMessage, PlayerProfile, Skill
from app.services.mock_ai import weekly_summary
from app.services.oracle_service import generate_oracle_reply

router = APIRouter(prefix="/oracle", tags=["oracle"])


class ChatRequest(BaseModel):
    message: str


def _get_oracle_session_id(request: Request) -> str:
    session_id = request.session.get("oracle_session_id")
    if isinstance(session_id, str) and session_id.strip():
        return session_id

    session_id = uuid4().hex
    request.session["oracle_session_id"] = session_id
    return session_id


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


def _get_recent_history(session: Session, session_id: str, limit: int = 10) -> list[dict]:
    messages = session.exec(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(col(ChatMessage.id).desc())
        .limit(limit)
    ).all()
    recent = list(reversed(messages))
    return [
        {"role": m.role, "text": m.text, "created_at": m.created_at}
        for m in recent
    ]


@router.post("/chat")
async def chat(
    req: ChatRequest,
    request: Request,
    session: Session = Depends(get_session),
):
    """Process chat message with LLM-backed Oracle and persist both sides."""
    now = datetime.now(timezone.utc).isoformat()
    session_id = _get_oracle_session_id(request)
    user_message = req.message.strip()
    recent_history = _get_recent_history(session, session_id=session_id, limit=10)

    # Persist user message
    user_msg = ChatMessage(
        session_id=session_id,
        role="user",
        text=user_message,
        context_topic="",
        created_at=now,
    )
    session.add(user_msg)

    # Get context from DB for richer responses
    profile = _get_profile_dict(session)
    skills = _get_skills_list(session)

    # Generate Oracle response with graceful fallback inside service.
    result = await generate_oracle_reply(
        user_message=user_message,
        profile=profile,
        skills=skills,
        recent_history=recent_history,
    )

    # Persist Oracle response
    oracle_msg = ChatMessage(
        session_id=session_id,
        role="oracle",
        text=result.text,
        context_topic=result.topic,
        created_at=now,
    )
    session.add(oracle_msg)
    session.commit()

    return {"role": "oracle", "text": result.text, "topic": result.topic, "gamification": None}


@router.get("/history")
async def get_history(
    request: Request,
    limit: int = 50,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    """Return paginated chat history for current browser session."""
    session_id = _get_oracle_session_id(request)
    total = session.exec(
        select(func.count(ChatMessage.id)).where(ChatMessage.session_id == session_id)
    ).one()

    messages = session.exec(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
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
async def get_stats(request: Request, session: Session = Depends(get_session)):
    """Oracle stats for current browser session."""
    session_id = _get_oracle_session_id(request)
    # Unique topics explored
    topics = session.exec(
        select(ChatMessage.context_topic)
        .where(ChatMessage.session_id == session_id)
        .where(ChatMessage.role == "oracle")
        .where(ChatMessage.context_topic != "")
    ).all()
    unique_topics = len(set(topics))

    # Wisdom from profile
    profile = session.exec(select(PlayerProfile)).first()
    wisdom_score = profile.wisdom if profile else 70

    return {
        "wisdom_score": wisdom_score,
        "topics_explored": unique_topics,
    }


@router.get("/weekly-summary")
async def get_weekly(request: Request, session: Session = Depends(get_session)):
    """Structured weekly summary with Oracle insights."""
    session_id = _get_oracle_session_id(request)
    profile = _get_profile_dict(session)
    summary = weekly_summary(profile=profile)

    total = session.exec(
        select(func.count(ChatMessage.id)).where(ChatMessage.session_id == session_id)
    ).one()
    summary["total_messages"] = total
    return summary
