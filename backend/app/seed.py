"""Seed initial data matching frontend hardcoded values."""

from sqlmodel import Session, select

from app.models import Achievement, PlayerProfile, Skill


def seed_initial_data(session: Session) -> None:
    """Populate database with initial data if empty."""
    if session.exec(select(PlayerProfile)).first():
        return

    # Player profile — matches Hero.tsx STATS and GuildHall.tsx
    profile = PlayerProfile(
        name="Renan Carvalho",
        title="Full-Stack Mage",
        dev_class="Full-Stack Mage",
        level=15,
        xp=6450,
        xp_next_level=10000,
        avatar_initials="RC",
        strength=72,
        intelligence=88,
        dexterity=65,
        wisdom=70,
    )
    session.add(profile)

    # Skills — matches SkillTree.tsx BRANCHES (3 branches x 5 skills)
    skills_data = [
        # Frontend Arcana
        ("react", "React", "frontend", "Frontend Arcana", 4, 5, True, "Component-based UI library with hooks, context, and state management patterns.", "#8b5cf6", "DevQuest,Dashboard UI"),
        ("typescript", "TypeScript", "frontend", "Frontend Arcana", 4, 5, True, "Strongly typed JavaScript for safer, more maintainable code.", "#8b5cf6", "DevQuest,ML Pipeline"),
        ("tailwind", "Tailwind CSS", "frontend", "Frontend Arcana", 3, 5, True, "Utility-first CSS framework for rapid UI development.", "#8b5cf6", "DevQuest"),
        ("threejs", "Three.js", "frontend", "Frontend Arcana", 2, 5, True, "3D graphics library for immersive web experiences.", "#8b5cf6", "DevQuest"),
        ("nextjs", "Next.js", "frontend", "Frontend Arcana", 0, 5, False, "React framework for production — SSR, routing, and optimization.", "#8b5cf6", ""),
        # Backend Warfare
        ("python", "Python", "backend", "Backend Warfare", 4, 5, True, "Versatile language for backend, data science, and scripting.", "#3b82f6", "ML Pipeline,DevQuest API"),
        ("fastapi", "FastAPI", "backend", "Backend Warfare", 3, 5, True, "Modern, high-performance Python web framework with auto docs.", "#3b82f6", "DevQuest API"),
        ("nodejs", "Node.js", "backend", "Backend Warfare", 3, 5, True, "JavaScript runtime for server-side applications.", "#3b82f6", "Chat API"),
        ("sql", "SQL", "backend", "Backend Warfare", 3, 5, True, "Database querying and management across multiple engines.", "#3b82f6", "ML Pipeline,DevQuest"),
        ("docker", "Docker", "backend", "Backend Warfare", 0, 5, False, "Container orchestration for reproducible deployments.", "#3b82f6", ""),
        # Data Sorcery
        ("pandas", "Pandas", "data", "Data Sorcery", 3, 5, True, "Data manipulation and analysis library for Python.", "#22c55e", "ML Pipeline"),
        ("postgresql", "PostgreSQL", "data", "Data Sorcery", 3, 5, True, "Advanced open-source relational database system.", "#22c55e", "ML Pipeline"),
        ("etl", "ETL Pipelines", "data", "Data Sorcery", 2, 5, True, "Extract, Transform, Load workflows for data processing.", "#22c55e", "ML Pipeline"),
        ("analytics", "Analytics", "data", "Data Sorcery", 2, 5, True, "Data visualization and business intelligence insights.", "#22c55e", "ML Pipeline"),
        ("ml", "Machine Learning", "data", "Data Sorcery", 0, 5, False, "Predictive models and intelligent systems. Requires Level 18.", "#22c55e", ""),
    ]

    for skill_id, name, cat, cat_name, level, max_lvl, unlocked, desc, color, projects in skills_data:
        session.add(Skill(
            skill_id=skill_id, name=name, category=cat, category_name=cat_name,
            level=level, max_level=max_lvl, unlocked=unlocked,
            description=desc, color=color, projects=projects,
        ))

    # Achievements — matches Hero.tsx BADGES + GuildHall.tsx TITLES
    achievements_data = [
        ("First Commit", "Made your first repository contribution", "git-branch", "coding", "#22c55e", True, "2024-01-15"),
        ("Polyglot", "Proficient in 3+ programming languages", "code", "skills", "#3b82f6", True, "2024-03-20"),
        ("Star Collector", "Earned 10+ stars across repositories", "star", "social", "#f0c040", True, "2024-06-10"),
        ("Quest Master", "Completed 5+ major projects", "trophy", "quests", "#8b5cf6", True, "2024-09-01"),
        ("Bug Hunter", "Fixed 50+ bugs across projects", "flame", "coding", "#ef4444", True, "2024-05-12"),
        ("Code Wizard", "Wrote 10,000+ lines of clean code", "code", "coding", "#8b5cf6", True, "2024-07-22"),
        ("Shield Bearer", "Maintained 90%+ test coverage", "shield", "quality", "#3b82f6", True, "2024-08-15"),
        ("Quest Champion", "Delivered a project ahead of deadline", "trophy", "quests", "#f0c040", True, "2024-11-30"),
    ]

    for name, desc, icon, cat, color, unlocked, date in achievements_data:
        session.add(Achievement(
            name=name, description=desc, icon=icon, category=cat,
            color=color, unlocked=unlocked, unlock_date=date,
        ))

    session.commit()
