"""GitHub API integration — real data from github.com/HiRenan."""

from fastapi import APIRouter
import httpx

from app.services.mock_ai import analyze_github_project

router = APIRouter(prefix="/github", tags=["github"])
GITHUB_USER = "HiRenan"
GITHUB_API = "https://api.github.com"

# Fallback repos matching QuestLog.tsx QUESTS when API is unavailable
FALLBACK_REPOS = [
    {"name": "DevQuest", "description": "Gamified career intelligence platform", "language": "TypeScript", "stars": 42, "forks": 5, "status": "Active", "rarity": "Epic", "xp": 320, "html_url": f"https://github.com/{GITHUB_USER}/DevQuest", "updated_at": "2024-11-15", "homepage": "", "topics": ["react", "typescript", "fastapi", "gamification"], "created_at": "2024-06-01", "size": 2400, "open_issues_count": 3, "has_pages": False, "owner": GITHUB_USER},
    {"name": "ML-Pipeline", "description": "End-to-end ML pipeline with FastAPI", "language": "Python", "stars": 28, "forks": 8, "status": "Completed", "rarity": "Epic", "xp": 280, "html_url": f"https://github.com/{GITHUB_USER}/ML-Pipeline", "updated_at": "2024-08-20", "homepage": "", "topics": ["python", "machine-learning", "fastapi"], "created_at": "2024-01-15", "size": 1800, "open_issues_count": 0, "has_pages": False, "owner": GITHUB_USER},
    {"name": "React-Dashboard", "description": "Analytics dashboard with charts", "language": "TypeScript", "stars": 15, "forks": 3, "status": "Completed", "rarity": "Rare", "xp": 200, "html_url": f"https://github.com/{GITHUB_USER}/React-Dashboard", "updated_at": "2024-06-10", "homepage": "", "topics": ["react", "dashboard", "charts"], "created_at": "2024-02-10", "size": 1200, "open_issues_count": 1, "has_pages": False, "owner": GITHUB_USER},
    {"name": "Chat-API", "description": "Real-time chat backend with WebSockets", "language": "JavaScript", "stars": 8, "forks": 2, "status": "Completed", "rarity": "Rare", "xp": 180, "html_url": f"https://github.com/{GITHUB_USER}/Chat-API", "updated_at": "2024-03-15", "homepage": "", "topics": ["nodejs", "websockets", "api"], "created_at": "2023-11-01", "size": 800, "open_issues_count": 0, "has_pages": False, "owner": GITHUB_USER},
    {"name": "Portfolio-v1", "description": "First portfolio website", "language": "HTML", "stars": 3, "forks": 1, "status": "Completed", "rarity": "Common", "xp": 120, "html_url": f"https://github.com/{GITHUB_USER}/Portfolio-v1", "updated_at": "2023-12-01", "homepage": "", "topics": ["html", "css", "portfolio"], "created_at": "2023-06-15", "size": 450, "open_issues_count": 0, "has_pages": True, "owner": GITHUB_USER},
    {"name": "CLI-Tools", "description": "Collection of utility scripts", "language": "Python", "stars": 5, "forks": 0, "status": "Active", "rarity": "Rare", "xp": 150, "html_url": f"https://github.com/{GITHUB_USER}/CLI-Tools", "updated_at": "2024-10-05", "homepage": "", "topics": ["python", "cli", "automation"], "created_at": "2024-04-20", "size": 320, "open_issues_count": 2, "has_pages": False, "owner": GITHUB_USER},
]


def _calculate_rarity(stars: int) -> str:
    if stars >= 50:
        return "Legendary"
    if stars >= 20:
        return "Epic"
    if stars >= 5:
        return "Rare"
    return "Common"


def _calculate_xp(repo: dict) -> int:
    base = 100
    base += repo.get("stargazers_count", 0) * 10
    base += repo.get("forks_count", 0) * 15
    if repo.get("has_wiki"):
        base += 25
    return min(base, 500)


@router.get("/repos")
async def get_repos():
    """Fetch real repos from GitHub API, enriched with RPG metadata."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{GITHUB_API}/users/{GITHUB_USER}/repos",
                params={"sort": "updated", "per_page": 30},
                headers={"Accept": "application/vnd.github.v3+json"},
            )
        if resp.status_code != 200:
            return {"repos": FALLBACK_REPOS, "source": "fallback"}

        repos = resp.json()
        quests = []
        for repo in repos:
            if repo.get("fork"):
                continue
            quests.append({
                "name": repo["name"],
                "description": repo.get("description") or "No description",
                "language": repo.get("language") or "Unknown",
                "stars": repo.get("stargazers_count", 0),
                "forks": repo.get("forks_count", 0),
                "status": "Completed" if repo.get("archived") else "Active",
                "rarity": _calculate_rarity(repo.get("stargazers_count", 0)),
                "xp": _calculate_xp(repo),
                "html_url": repo.get("html_url", ""),
                "updated_at": repo.get("updated_at", ""),
                "homepage": repo.get("homepage") or "",
                "topics": repo.get("topics", []),
                "created_at": repo.get("created_at", ""),
                "size": repo.get("size", 0),
                "open_issues_count": repo.get("open_issues_count", 0),
                "has_pages": repo.get("has_pages", False),
                "owner": repo.get("owner", {}).get("login", GITHUB_USER),
            })
        return {"repos": quests, "source": "github"}
    except Exception:
        return {"repos": FALLBACK_REPOS, "source": "fallback"}


@router.get("/repos/{owner}/{repo}")
async def get_repo_detail(owner: str, repo: str):
    """Get single repo details with language breakdown."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{GITHUB_API}/repos/{owner}/{repo}",
                headers={"Accept": "application/vnd.github.v3+json"},
            )
            lang_resp = await client.get(
                f"{GITHUB_API}/repos/{owner}/{repo}/languages",
                headers={"Accept": "application/vnd.github.v3+json"},
            )
        if resp.status_code != 200:
            return {"error": "Repository not found"}
        data = resp.json()
        languages = lang_resp.json() if lang_resp.status_code == 200 else {}
        return {
            "name": data["name"],
            "description": data.get("description"),
            "language": data.get("language"),
            "stars": data.get("stargazers_count", 0),
            "forks": data.get("forks_count", 0),
            "html_url": data.get("html_url"),
            "languages_breakdown": languages,
        }
    except Exception:
        return {"error": "Failed to fetch repository"}


@router.post("/repos/{owner}/{repo}/analyze")
async def analyze_repo(owner: str, repo: str):
    """Return mock AI analysis for a repo."""
    return analyze_github_project(f"{owner}/{repo}")


@router.get("/quest-stats")
async def get_quest_stats():
    """Aggregate stats for the Quest Log overview."""
    data = await get_repos()
    repos = data.get("repos", [])
    total_stars = sum(r.get("stars", 0) for r in repos)
    total_xp = sum(r.get("xp", 0) for r in repos)
    languages = list({r.get("language", "Unknown") for r in repos})
    return {
        "total_repos": len(repos),
        "total_stars": total_stars,
        "total_xp": total_xp,
        "languages": languages,
        "active_quests": sum(1 for r in repos if r.get("status") == "Active"),
        "completed_quests": sum(1 for r in repos if r.get("status") == "Completed"),
    }


@router.get("/profile")
async def get_github_profile():
    """Get GitHub user profile stats."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{GITHUB_API}/users/{GITHUB_USER}",
                headers={"Accept": "application/vnd.github.v3+json"},
            )
        if resp.status_code != 200:
            return {"error": "Profile not found"}
        data = resp.json()
        return {
            "login": data["login"],
            "name": data.get("name"),
            "avatar_url": data.get("avatar_url"),
            "bio": data.get("bio"),
            "public_repos": data.get("public_repos", 0),
            "followers": data.get("followers", 0),
            "following": data.get("following", 0),
            "html_url": data.get("html_url"),
        }
    except Exception:
        return {"error": "Failed to fetch profile"}
