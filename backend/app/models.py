"""SQLModel database models for DevQuest gamification system."""

from typing import Optional

from sqlmodel import Field, SQLModel


class PlayerProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = "Renan Carvalho"
    title: str = "Full-Stack Mage"
    dev_class: str = "Full-Stack Mage"
    level: int = 15
    xp: int = 6450
    xp_next_level: int = 10000
    avatar_initials: str = "RC"
    strength: int = 72
    intelligence: int = 88
    dexterity: int = 65
    wisdom: int = 70


class Skill(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    skill_id: str = Field(index=True)
    name: str
    category: str  # "frontend", "backend", "data"
    category_name: str  # "Frontend Arcana", etc.
    level: int = 0
    max_level: int = 5
    unlocked: bool = True
    description: str = ""
    color: str = "#8b5cf6"
    projects: str = ""  # comma-separated project names


class Achievement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str = ""
    icon: str = "trophy"
    category: str = "general"
    color: str = "#f0c040"
    unlocked: bool = False
    unlock_date: Optional[str] = None
