"""Oracle chat mock endpoint — mirrors Oracle.tsx RESPONSES."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/oracle", tags=["oracle"])


class ChatMessage(BaseModel):
    message: str


# Exact mirror of Oracle.tsx RESPONSES (lines 12-24)
RESPONSES: dict[str, str] = {
    "improve": "I sense great potential in your skill tree. Focus on deepening your backend expertise — it will unlock the Full-Stack Paladin class. Contributing to 2-3 more open source projects would earn you the \"Community Champion\" badge.",
    "skill": "Your Frontend Arcana is strong at Level 78. To reach mastery, I recommend exploring Next.js and server-side rendering. For Backend Warfare, consider learning Docker — it will unlock container orchestration abilities.",
    "learn": "The ancient scrolls suggest these paths: 1) Machine Learning fundamentals for the Data Sorcery branch, 2) Cloud Architecture (AWS/GCP) for deployment mastery, 3) System Design patterns to unlock the Architect class.",
    "profile": "Your developer profile radiates a combined power level of 6,450 XP. You are classified as a Full-Stack Mage, Level 15. Your strongest attributes are INT (88) and STR (72). The weakest area is DEX (65) — focus on adaptability and new frameworks.",
    "project": "Your most impressive quest is DevQuest Portfolio (Legendary rarity, 92/100 score). To boost your quest log further, consider starting a project that combines AI with your existing React skills — perhaps an intelligent code review tool.",
    "career": "The stars align for a Senior Developer path. Your diverse skill set across frontend, backend, and data puts you in a strong position. Consider specializing in one area while maintaining breadth. Technical leadership roles await at Level 20.",
    "github": "Your GitHub presence shows 6 active repositories with 177 combined stars. To increase visibility: 1) Write detailed READMEs, 2) Add live demos, 3) Contribute to trending repositories in your tech stack.",
    "react": "React is one of your strongest abilities at Level 4/5. To reach mastery: explore React Server Components, master advanced hooks patterns, and build a complex state management solution without external libraries.",
    "python": "Your Python mastery is at Level 4/5 — impressive! Consider diving into async Python with asyncio, explore FastAPI middleware patterns, and contribute to the Python ecosystem with a published package.",
    "hello": "Greetings, brave adventurer! I am the Oracle of DevQuest, keeper of ancient coding wisdom. Ask me about your skills, career path, projects, or how to level up your developer profile.",
    "help": "I can advise you on: your skill progression, career path recommendations, project ideas, GitHub profile optimization, specific technologies (React, Python, etc.), and your overall developer level assessment. What interests you?",
}

DEFAULT_RESPONSE = "The ancient runes are unclear on this matter. Try asking about your skills, career path, projects, or specific technologies like React and Python. I can also analyze your profile and suggest improvements."


@router.post("/chat")
async def chat(msg: ChatMessage):
    """Process chat message and return mock Oracle response."""
    text = msg.message.lower()
    for keyword, response in RESPONSES.items():
        if keyword in text:
            return {"role": "oracle", "text": response}
    return {"role": "oracle", "text": DEFAULT_RESPONSE}
