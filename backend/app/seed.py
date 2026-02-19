"""Seed initial data matching frontend hardcoded values."""

from sqlmodel import Session, select

from app.models import Achievement, BlogPost, PlayerProfile, Skill


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

    # Blog posts — seed only if none exist
    if not session.exec(select(BlogPost)).first():
        blog_posts = [
            BlogPost(
                title="Won ActInSpace Hackathon — 1st Place!",
                content="## Representing Brazil on the World Stage\n\nOur team competed in the **ActInSpace international hackathon** in France, tackling real challenges from the European Space Agency.\n\nWe developed an innovative solution combining satellite data with AI-powered analytics, and the judges awarded us **1st place** out of teams from over 20 countries.\n\n### Key Takeaways\n- Cross-cultural collaboration is a superpower\n- Space tech is more accessible than ever\n- 48-hour sprints teach you more than months of comfortable coding\n\nThis was a career-defining moment. Grateful for the team and the opportunity.",
                category="achievement",
                tags="hackathon,space-tech,innovation,france,1st-place",
                color="#f0c040",
                pinned=True,
                created_at="2026-01-20T10:00:00",
                updated_at="2026-01-20T10:00:00",
            ),
            BlogPost(
                title="Started AI Residency at SENAI/SC",
                content="## A New Chapter Begins\n\nExcited to announce that I've started my **AI Residency** at SENAI/SC, one of Brazil's premier technology institutions.\n\nThe program covers:\n- **Machine Learning** & Deep Learning fundamentals\n- **Computer Vision** applications for industry\n- **Generative AI** and LLM fine-tuning\n- **Embedded AI** for IoT devices\n- MLOps and production deployment\n\nLooking forward to bridging the gap between theoretical AI and real-world industrial applications.",
                category="update",
                tags="ai,machine-learning,senai,career,education",
                color="#8b5cf6",
                pinned=False,
                created_at="2025-03-15T09:00:00",
                updated_at="2025-03-15T09:00:00",
            ),
            BlogPost(
                title="DevQuest: Building My Career as an RPG",
                content="## Why Gamify a Portfolio?\n\nTraditional portfolios are static and boring. I wanted something that tells a **story** — my story as a developer, gamified.\n\n**DevQuest** transforms my career into an RPG adventure:\n- **Skill Tree** with real technologies I've mastered\n- **Quest Log** tracking GitHub projects as quests\n- **Chronicle** as an interactive timeline\n- **Oracle** — an AI advisor (mock, for now)\n\n### Tech Stack\n- React 19 + TypeScript + Vite\n- FastAPI + SQLModel + SQLite\n- Tailwind CSS v4 + Framer Motion\n- Three.js for particle effects\n\nBuilding this project taught me more about frontend architecture than any course ever could.",
                category="project",
                tags="devquest,react,fastapi,portfolio,typescript",
                color="#3b82f6",
                pinned=False,
                created_at="2025-06-10T14:00:00",
                updated_at="2025-06-10T14:00:00",
            ),
            BlogPost(
                title="2nd Place at AKCIT Hackathon",
                content="## 48 Hours of Pure Innovation\n\nOur team secured **2nd place** at the AKCIT Hackathon with a Generative AI solution for automated document analysis.\n\nWe built a pipeline that:\n1. Ingests unstructured documents\n2. Extracts key entities using NLP\n3. Generates structured summaries with an LLM\n4. Presents results in an interactive dashboard\n\n### Lessons Learned\n- Rapid prototyping > perfect architecture\n- Team communication is the real bottleneck\n- Demo polish matters as much as technical depth\n\nAlready looking forward to the next hackathon challenge!",
                category="achievement",
                tags="hackathon,generative-ai,nlp,2nd-place",
                color="#22c55e",
                pinned=False,
                created_at="2025-10-05T18:00:00",
                updated_at="2025-10-05T18:00:00",
            ),
        ]
        for post in blog_posts:
            session.add(post)

    session.commit()
