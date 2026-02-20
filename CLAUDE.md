# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

### Frontend (React 19 + Vite + TypeScript)
- Install: `cd frontend && npm install`
- Dev server: `cd frontend && npm run dev` (localhost:5173, proxies /api → localhost:8000)
- Build: `cd frontend && npm run build` (runs tsc + vite build)
- Lint: `cd frontend && npm run lint`

### Backend (FastAPI + SQLModel + SQLite)
- Install: `pip install -r backend/requirements.txt`
- Dev server: `uvicorn app.main:app --reload --app-dir backend` (localhost:8000)
- Health check: GET http://localhost:8000/api/health
- API docs: http://localhost:8000/docs

### Both together (typical dev workflow)
Run backend and frontend in separate terminals. Frontend proxies /api to backend via vite.config.ts.

## Architecture

### Frontend (`frontend/src/`)
- **Pages** (`pages/`): 6 route-level screens — Hero, SkillTree, QuestLog, Chronicle, GuildHall, Oracle
- **Components** (`components/`): `ui/` (GlassCard, Modal, Badge, etc.), `layout/` (Navbar, Layout), `3d/` (ParticleBackground)
- **API client** (`services/api.ts`): Typed fetchers for all backend endpoints, centralized error handling
- **Graceful degradation** (`hooks/useAPI.ts`): `useAPI<T>(fetcher, fallback)` hook — returns fallback data immediately, replaces with real data on success, keeps fallback on failure
- **Routing**: React Router v7 in `App.tsx`, wrapped by `Layout` component
- **Styling**: Tailwind CSS v4 with custom RPG theme tokens in `index.css`
- **Animations**: Framer Motion (`motion/react`) for page transitions, stagger effects, scroll triggers
- **3D**: React Three Fiber for particle background on Hero page

### Backend (`backend/app/`)
- **Entry**: `main.py` — FastAPI app with CORS, lifespan (DB init + seed), 4 routers
- **Routers** (`routers/`): `github.py`, `gamification.py`, `cv.py`, `oracle.py` — all under `/api` prefix
- **Mock AI** (`services/mock_ai.py`): Simulated AI responses (project analysis, CV analysis, chat, weekly summary)
- **Models** (`models.py`): SQLModel tables — PlayerProfile, Skill, Achievement
- **Database** (`database.py`): SQLite at `data/devquest.db`, auto-created on startup
- **Seed** (`seed.py`): Populates initial data (1 profile, 15 skills, 8 achievements) on first run

## Critical Project Constraints

- **NO real LLM/AI integration** — all AI features use `mock_ai.py` with hardcoded responses
- **Public endpoint required** — must be accessible via internet (Vercel frontend + Railway backend)
- **Frequent small commits** — conventional commits (`feat:`, `fix:`, `chore:`), never giant commits
- **All 6 screens must be navigable** with functional interactions and simulated data
- **Responsiveness mandatory** — professor opens in their own browser
- **SQLite only** — no Docker, DB file at `data/devquest.db`

## Coding Conventions

- TypeScript strict mode, ESLint clean
- React components: PascalCase files, camelCase functions/vars, UPPER_SNAKE_CASE constants
- Python: PEP 8, type hints, thin route handlers delegating to services
- Framer Motion imported as `motion/react` (not `framer-motion`)
- No automated tests configured — verify via lint + backend startup + /api/health
