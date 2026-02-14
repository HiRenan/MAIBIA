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
        "improvements": ["Add more tests", "Consider CI/CD pipeline"],
        "summary": f"Project '{repo_name}' shows strong development practices.",
    }


def analyze_cv(sections: list[str]) -> dict:
    """Mock: analyze CV sections and return suggestions."""
    return {
        "overall_score": 78,
        "suggestions": {
            "experience": "Add quantifiable achievements to each role.",
            "education": "Highlight relevant coursework and projects.",
            "skills": "Group skills by category and proficiency level.",
        },
    }


def oracle_chat(message: str) -> str:
    """Mock: Oracle chatbot responses."""
    responses = {
        "default": "The Oracle senses great potential in your journey. Keep pushing forward, adventurer.",
        "skills": "Your skill tree reveals a balanced path. Consider deepening your expertise in one area.",
        "career": "The stars align for growth. Focus on building projects that showcase your unique abilities.",
    }
    for key in responses:
        if key in message.lower():
            return responses[key]
    return responses["default"]


def weekly_summary() -> str:
    """Mock: generate weekly activity summary."""
    return "This week you completed 3 quests, gained 450 XP, and unlocked the 'Consistent Coder' badge."
