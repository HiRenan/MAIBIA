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
