"""Gamification endpoints — profile, skills, achievements."""

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.database import get_session
from app.models import Achievement, PlayerProfile, Skill
from app.services.mock_ai import weekly_summary

router = APIRouter(prefix="/gamification", tags=["gamification"])


@router.get("/profile")
async def get_profile(session: Session = Depends(get_session)):
    """Get player profile with RPG stats."""
    profile = session.exec(select(PlayerProfile)).first()
    if not profile:
        return {"error": "No profile found"}
    return {
        "name": profile.name,
        "title": profile.title,
        "dev_class": profile.dev_class,
        "level": profile.level,
        "xp": profile.xp,
        "xp_next_level": profile.xp_next_level,
        "avatar_initials": profile.avatar_initials,
        "stats": {
            "STR": {"value": profile.strength, "label": "Problem Solving"},
            "INT": {"value": profile.intelligence, "label": "Technical Knowledge"},
            "DEX": {"value": profile.dexterity, "label": "Adaptability"},
            "WIS": {"value": profile.wisdom, "label": "Soft Skills"},
        },
    }


@router.get("/achievements")
async def get_achievements(session: Session = Depends(get_session)):
    """Get all achievements with unlock status."""
    achievements = session.exec(select(Achievement)).all()
    return {
        "achievements": [
            {
                "name": a.name,
                "description": a.description,
                "icon": a.icon,
                "category": a.category,
                "color": a.color,
                "unlocked": a.unlocked,
                "unlock_date": a.unlock_date,
            }
            for a in achievements
        ]
    }


@router.get("/skills")
async def get_skills(session: Session = Depends(get_session)):
    """Get all skills grouped by category (matches frontend BRANCHES format)."""
    skills = session.exec(select(Skill)).all()
    branches: dict[str, dict] = {}
    for skill in skills:
        cat = skill.category
        if cat not in branches:
            branches[cat] = {
                "id": cat,
                "name": skill.category_name,
                "color": skill.color,
                "skills": [],
            }
        branches[cat]["skills"].append({
            "id": skill.skill_id,
            "name": skill.name,
            "level": skill.level,
            "maxLevel": skill.max_level,
            "unlocked": skill.unlocked,
            "description": skill.description,
            "projects": [p for p in skill.projects.split(",") if p],
        })
    return {"branches": list(branches.values())}


@router.get("/weekly-summary")
async def get_weekly_summary():
    """Get mock weekly activity summary."""
    return {"summary": weekly_summary()}
