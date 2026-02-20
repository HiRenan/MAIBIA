"""
Mock AI Service — placeholder for future LLM integration.
All AI features return simulated responses.
"""


def analyze_github_project(repo_name: str) -> dict:
    """Mock: analyze a GitHub project and return feedback."""
    return {
        "repo": repo_name,
        "score": 85,
        "strengths": ["Clean code structure", "Good documentation", "Active development"],
        "improvements": ["Add more tests", "Consider CI/CD pipeline", "Add error handling"],
        "summary": f"Project '{repo_name}' shows strong development practices.",
        "metrics": {
            "code_quality": 88,
            "documentation": 72,
            "testing": 45,
            "architecture": 82,
            "security": 68,
        },
        "category_tags": ["well-structured", "needs-tests", "active"],
    }


def analyze_cv(filename: str, file_size: int) -> dict:
    """Mock: analyze CV with varied responses based on filename hash."""
    import hashlib

    h = int(hashlib.md5(filename.encode()).hexdigest(), 16)

    base_score = 72 + (h % 21)

    section_pools = [
        [
            {"name": "Formatting", "score": min(85 + (h % 10), 98), "feedback": "Clean layout with consistent spacing. ATS-friendly format detected."},
            {"name": "Keywords", "score": min(70 + (h % 15), 95), "feedback": "Good technical keywords present. Consider adding more industry-specific terms."},
            {"name": "Experience", "score": min(80 + (h % 12), 97), "feedback": "Strong action verbs and quantified achievements throughout."},
            {"name": "Skills", "score": min(75 + (h % 18), 96), "feedback": "Comprehensive skill list. Consider grouping by proficiency level."},
            {"name": "Education", "score": min(82 + (h % 10), 95), "feedback": "Education section well-structured with relevant coursework."},
        ],
        [
            {"name": "Formatting", "score": min(78 + (h % 12), 96), "feedback": "Professional layout. Consider adding more whitespace between sections."},
            {"name": "Keywords", "score": min(82 + (h % 10), 97), "feedback": "Strong keyword density for target roles. Well-optimized for ATS."},
            {"name": "Experience", "score": min(74 + (h % 14), 95), "feedback": "Good role descriptions. Add more quantified metrics to strengthen impact."},
            {"name": "Skills", "score": min(80 + (h % 13), 98), "feedback": "Well-organized skills with clear categorization and relevance."},
            {"name": "Education", "score": min(76 + (h % 11), 94), "feedback": "Solid academic background. Highlight relevant projects and coursework."},
        ],
        [
            {"name": "Formatting", "score": min(80 + (h % 14), 97), "feedback": "Modern format with good visual hierarchy and readability."},
            {"name": "Keywords", "score": min(76 + (h % 12), 96), "feedback": "Decent keyword coverage. Tailor keywords to specific job descriptions."},
            {"name": "Experience", "score": min(84 + (h % 10), 98), "feedback": "Excellent experience section with clear progression and impact statements."},
            {"name": "Skills", "score": min(78 + (h % 15), 97), "feedback": "Good technical skills listed. Consider adding soft skills and certifications."},
            {"name": "Education", "score": min(80 + (h % 13), 96), "feedback": "Education aligns well with career goals. GPA and honors noted."},
        ],
    ]

    strengths_pool = [
        ["Clear technical focus and specialization", "Quantified achievements with metrics", "ATS-optimized format and structure"],
        ["Strong project descriptions with impact", "Good keyword density for target roles", "Professional summary captures attention"],
        ["Well-organized sections with hierarchy", "Relevant skill grouping by domain", "Action-oriented language throughout"],
    ]

    weaknesses_pool = [
        ["Could add more quantified metrics", "Professional summary section missing", "Skills need proficiency levels"],
        ["Experience dates could be clearer", "Missing portfolio/GitHub links", "Some sections lack detail"],
        ["No certifications section found", "Contact information could be expanded", "Inconsistent formatting in places"],
    ]

    tips_pool = [
        ["Add a professional summary at the top highlighting your unique value", "Quantify achievements with numbers and percentages", "Include GitHub and portfolio links in the header"],
        ["Tailor keywords to each specific job description you apply for", "Use consistent date formatting throughout (MM/YYYY)", "Add relevant certifications and training programs"],
        ["Group technical skills by category for easier scanning", "Lead each role with your strongest accomplishment", "Keep the CV to 1-2 pages for maximum impact"],
    ]

    idx = h % 3

    return {
        "score": min(base_score, 95),
        "sections": section_pools[idx],
        "strengths": strengths_pool[idx],
        "weaknesses": weaknesses_pool[idx],
        "tips": tips_pool[idx],
    }


def oracle_chat(message: str, profile: dict | None = None, skills: list | None = None) -> dict:
    """Mock: context-aware Oracle chatbot responses.

    When profile/skills data is provided, responses reference actual
    player stats and skill levels for immersion.
    Returns dict with 'text' (response) and 'topic' (matched keyword).
    """
    p = profile or {}
    name = p.get("name", "adventurer")
    level = p.get("level", 15)
    wis = p.get("wisdom", 70)
    int_ = p.get("intelligence", 88)
    str_ = p.get("strength", 72)
    dex = p.get("dexterity", 65)

    def _skill_level(skill_name: str) -> str:
        if skills:
            for s in skills:
                if s["name"].lower() == skill_name.lower() and s.get("unlocked"):
                    return f"Level {s['level']}/{s['max_level']}"
        return "unknown level"

    responses: dict[str, tuple[str, str]] = {
        "improve": (
            f"I sense great potential in your skill tree, {name}. Focus on deepening your backend expertise — "
            f"it will unlock the Full-Stack Paladin class. Your current STR is {str_}/100; contributing to "
            "2-3 more open source projects would boost it significantly.",
            "improve",
        ),
        "skill": (
            f"Your Frontend Arcana is strong — React at {_skill_level('React')}. To reach mastery, "
            "explore Server Components and advanced hooks. For Backend Warfare, consider Docker — "
            "it will unlock container orchestration abilities.",
            "skills",
        ),
        "learn": (
            "The ancient scrolls suggest these paths: 1) Machine Learning fundamentals for the Data Sorcery branch, "
            "2) Cloud Architecture (AWS/GCP) for deployment mastery, 3) System Design patterns to unlock the Architect class.",
            "learn",
        ),
        "profile": (
            f"Your developer profile radiates a combined power level of {level}. You are classified as a "
            f"{p.get('title', 'Full-Stack Mage')}. Strongest attributes: INT ({int_}) and STR ({str_}). "
            f"Weakest area: DEX ({dex}) — focus on adaptability and new frameworks.",
            "profile",
        ),
        "project": (
            "Your most impressive quest is DevQuest Portfolio (Legendary rarity). To boost your quest log, "
            "consider starting a project combining AI with your React skills — perhaps an intelligent code review tool.",
            "project",
        ),
        "career": (
            f"The stars align for a Senior Developer path, {name}. Your diverse skill set across frontend, "
            "backend, and data puts you in a strong position. Consider specializing in one area while maintaining breadth. "
            f"Technical leadership roles await at Level {level + 5}.",
            "career",
        ),
        "github": (
            "Your GitHub presence shows active repositories with growing stars. To increase visibility: "
            "1) Write detailed READMEs, 2) Add live demos, 3) Contribute to trending repos in your stack.",
            "github",
        ),
        "react": (
            f"React is one of your strongest abilities at {_skill_level('React')}. To reach mastery: "
            "explore React Server Components, master advanced hooks patterns, and build a complex state "
            "management solution without external libraries.",
            "react",
        ),
        "python": (
            f"Your Python mastery is at {_skill_level('Python')} — impressive! Consider diving into "
            "async Python with asyncio, explore FastAPI middleware patterns, and contribute to the Python ecosystem.",
            "python",
        ),
        "hello": (
            f"Greetings, {name}! I am the Oracle of DevQuest, keeper of ancient coding wisdom. "
            "Ask me about your skills, career path, projects, or how to level up your developer profile.",
            "greeting",
        ),
        "help": (
            "I can advise you on: skill progression, career path recommendations, project ideas, "
            "GitHub optimization, specific technologies (React, Python, etc.), and your overall level assessment. "
            "What interests you?",
            "help",
        ),
        "strength": (
            f"Your STR (Problem Solving) is at {str_}/100. To boost it: tackle harder algorithmic challenges, "
            "contribute to complex open-source projects, and practice system design interviews.",
            "strength",
        ),
        "intelligence": (
            f"Your INT (Technical Knowledge) is at {int_}/100 — your highest stat! Keep it sharp by "
            "staying current with new technologies and deepening your understanding of CS fundamentals.",
            "intelligence",
        ),
        "wisdom": (
            f"Your WIS (Soft Skills) is at {wis}/100. Improve it by mentoring junior developers, "
            "writing technical blog posts, and practicing your presentation skills at meetups.",
            "wisdom",
        ),
        "dexterity": (
            f"Your DEX (Adaptability) is at {dex}/100 — your lowest stat. Boost it by learning a new "
            "framework each quarter, experimenting with unfamiliar paradigms, and taking on varied project types.",
            "dexterity",
        ),
        "level": (
            f"You are currently Level {level} with {p.get('xp', 6450)} XP. "
            f"You need {p.get('xp_next_level', 10000) - p.get('xp', 6450)} more XP to reach Level {level + 1}. "
            "Complete quests, earn achievements, and master new skills to level up faster.",
            "level",
        ),
        "achievement": (
            "Achievements unlock as you reach milestones. Focus on: completing projects (Quest Master), "
            "fixing bugs (Bug Hunter), maintaining code quality (Shield Bearer), and learning new languages (Polyglot).",
            "achievement",
        ),
        "frontend": (
            f"Your Frontend Arcana branch: React at {_skill_level('React')}, "
            f"TypeScript at {_skill_level('TypeScript')}, Tailwind at {_skill_level('Tailwind CSS')}. "
            "Consider unlocking Next.js to round out this branch.",
            "frontend",
        ),
        "backend": (
            f"Your Backend Warfare branch: Python at {_skill_level('Python')}, "
            f"FastAPI at {_skill_level('FastAPI')}, Node.js at {_skill_level('Node.js')}. "
            "Docker remains locked — consider prioritizing it for deployment mastery.",
            "backend",
        ),
        "data": (
            f"Your Data Sorcery branch: Pandas at {_skill_level('Pandas')}, "
            f"PostgreSQL at {_skill_level('PostgreSQL')}. Machine Learning is still locked — "
            f"it requires Level 18 (you're at {level}).",
            "data",
        ),
        "recommend": (
            "Based on your current stats, I recommend: 1) Unlock Docker to complete Backend Warfare, "
            "2) Push React to Level 5 for Frontend mastery, 3) Start building ML fundamentals for the Data Sorcery endgame.",
            "recommendation",
        ),
        "week": (
            "This week, focus on one concrete goal: ship a feature, write a blog post, or close 5 issues. "
            "Small consistent progress compounds faster than sporadic big pushes.",
            "weekly",
        ),
    }

    lower = message.lower()
    for keyword, (text, topic) in responses.items():
        if keyword in lower:
            return {"text": text, "topic": topic}

    return {
        "text": f"The ancient runes are unclear on this matter, {name}. Try asking about your skills, "
                "career path, projects, or specific technologies like React and Python.",
        "topic": "unknown",
    }


def weekly_summary(profile: dict | None = None) -> dict:
    """Mock: generate structured weekly activity summary."""
    p = profile or {}
    level = p.get("level", 15)
    wis = p.get("wisdom", 70)

    tip_pool = [
        f"Your WIS is {wis}/100 — try mentoring someone this week to boost it.",
        "Focus on completing one quest from start to finish this week.",
        f"At Level {level}, you're close to unlocking new abilities. Push for that next level!",
        "Consider writing a technical blog post — it boosts both WIS and community visibility.",
    ]
    tip = tip_pool[level % len(tip_pool)]

    return {
        "summary": f"This week you completed 3 quests, gained 450 XP, and unlocked the 'Consistent Coder' badge. "
                   f"Your Level {level} profile continues to grow stronger.",
        "xp_gained": 450,
        "quests_completed": 3,
        "skills_practiced": ["React", "Python", "SQL"],
        "achievement_progress": "Consistent Coder — 5/7 days",
        "oracle_tip": tip,
    }
