"""Gamification engine — XP progression, level-up, achievements, stat recalculation."""

from datetime import datetime, timezone

from sqlmodel import Session, func, select

from app.models import (
    Achievement,
    ActivityLog,
    BlogPost,
    ChatMessage,
    CVAnalysis,
    PlayerProfile,
    Skill,
)


def award_xp(session: Session, action: str, description: str, xp_amount: int) -> dict:
    """Award XP, handle level-ups, log activity, check achievements, recalc stats.

    Returns a gamification event dict for the frontend toast system.
    """
    profile = session.exec(select(PlayerProfile)).first()
    if not profile:
        return _empty_event(xp_amount)

    # Apply XP
    profile.xp += xp_amount
    leveled_up = False
    old_level = profile.level

    # Level-up loop
    while profile.xp >= profile.xp_next_level:
        profile.xp -= profile.xp_next_level
        profile.level += 1
        profile.xp_next_level = profile.level * 1000
        leveled_up = True

    # Log activity
    now = datetime.now(timezone.utc).isoformat()
    session.add(ActivityLog(
        action=action, xp_gained=xp_amount, description=description, created_at=now,
    ))

    # Check achievements
    new_achievements = check_achievements(session)

    # Recalculate stats
    recalculate_stats(session)

    session.add(profile)
    session.commit()
    session.refresh(profile)

    return {
        "xp_gained": xp_amount,
        "new_xp": profile.xp,
        "new_level": profile.level,
        "xp_next_level": profile.xp_next_level,
        "leveled_up": leveled_up,
        "old_level": old_level,
        "new_achievements": new_achievements,
    }


def check_achievements(session: Session) -> list[dict]:
    """Check all lockable achievements and unlock those whose conditions are met."""
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    newly_unlocked: list[dict] = []

    # Define conditions: (achievement_name, check_function)
    conditions: list[tuple[str, callable]] = [
        ("Oracle Initiate", lambda s: _count(s, ChatMessage, ChatMessage.role == "user") >= 1),
        ("Oracle Sage", lambda s: _count(s, ChatMessage, ChatMessage.role == "user") >= 20),
        ("Scroll Keeper", lambda s: _count(s, BlogPost) >= 3),
        ("CV Master", lambda s: _count(s, CVAnalysis) >= 1),
    ]

    for name, check_fn in conditions:
        ach = session.exec(
            select(Achievement).where(Achievement.name == name)
        ).first()
        if not ach or ach.unlocked:
            continue
        if check_fn(session):
            ach.unlocked = True
            ach.unlock_date = now
            session.add(ach)
            newly_unlocked.append({
                "name": ach.name,
                "description": ach.description,
                "icon": ach.icon,
                "color": ach.color,
            })

    return newly_unlocked


def recalculate_stats(session: Session) -> None:
    """Recalculate STR/INT/DEX/WIS from actual data. Stats only go up, never down."""
    profile = session.exec(select(PlayerProfile)).first()
    if not profile:
        return

    # Gather data
    blog_count = _count(session, BlogPost)
    achievement_count = _count(session, Achievement, Achievement.unlocked == True)  # noqa: E712
    total_skill_levels = session.exec(
        select(func.sum(Skill.level)).where(Skill.unlocked == True)  # noqa: E712
    ).one() or 0
    distinct_actions = session.exec(
        select(func.count(func.distinct(ActivityLog.action)))
    ).one() or 0
    cv_count = _count(session, CVAnalysis)
    oracle_msgs = _count(session, ChatMessage, ChatMessage.role == "user")
    oracle_level = min(1 + oracle_msgs // 5, 20)

    # Calculate (only increase, never decrease)
    profile.strength = min(max(profile.strength, 50 + blog_count * 3 + achievement_count * 2), 100)
    profile.intelligence = min(max(profile.intelligence, 50 + total_skill_levels * 2), 100)
    profile.dexterity = min(max(profile.dexterity, 50 + distinct_actions * 5 + cv_count * 3), 100)
    profile.wisdom = min(max(profile.wisdom, 50 + oracle_msgs + oracle_level * 2), 100)

    session.add(profile)


def _count(session: Session, model, *filters) -> int:
    """Count rows in a table with optional filters."""
    stmt = select(func.count(model.id))
    for f in filters:
        stmt = stmt.where(f)
    return session.exec(stmt).one() or 0


def _empty_event(xp_amount: int) -> dict:
    """Return a no-op event when profile is missing."""
    return {
        "xp_gained": xp_amount,
        "new_xp": 0,
        "new_level": 1,
        "xp_next_level": 1000,
        "leveled_up": False,
        "old_level": 1,
        "new_achievements": [],
    }
