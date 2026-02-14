# Repository Guidelines

## Project Structure & Module Organization
- `frontend/`: React 19 + Vite + TypeScript UI.
- `frontend/src/pages/`: route-level screens (for example `Oracle.tsx`, `QuestLog.tsx`).
- `frontend/src/components/`: reusable UI, layout, and 3D components.
- `backend/`: FastAPI service.
- `backend/app/routers/`: API endpoints (`github.py`, `cv.py`, `oracle.py`, `gamification.py`).
- `backend/app/services/`: service-layer logic (`mock_ai.py`).
- `data/devquest.db`: local SQLite database file.

## Build, Test, and Development Commands
- Frontend setup: `cd frontend && npm install`
- Frontend dev server: `npm run dev` (Vite on `localhost:5173`, proxies `/api` to `localhost:8000`).
- Frontend production build: `npm run build`
- Frontend lint: `npm run lint`
- Frontend preview build: `npm run preview`
- Backend setup: `python -m venv .venv && .venv\Scripts\activate && pip install -r backend/requirements.txt`
- Backend API server: `uvicorn app.main:app --reload --app-dir backend`
- Health check: `GET http://localhost:8000/api/health`

## Coding Style & Naming Conventions
- TypeScript: strict mode is enabled; keep code lint-clean with `eslint`.
- React files/components: `PascalCase` (for example `ParticleBackground.tsx`).
- Variables/functions: `camelCase`; constants: `UPPER_SNAKE_CASE`.
- Python: follow PEP 8, 4-space indentation, and keep router modules focused by domain.
- Prefer small, composable components and keep API route handlers thin by delegating logic to `services/`.

## Testing Guidelines
- No automated test framework is configured yet in this repository.
- Minimum pre-PR quality gate today: `npm run lint`, backend startup, and `/api/health` verification.
- When adding tests, use:
  - `backend/tests/test_<feature>.py`
  - `frontend/src/**/__tests__/*.test.tsx` or `*.test.tsx`
- Include manual validation steps in the PR until a full CI test pipeline is added.

## Commit & Pull Request Guidelines
- Follow Conventional Commits used in history: `feat: ...`, `chore: ...` (scopes optional, e.g. `feat(frontend): ...`).
- Keep each commit focused on one concern.
- PRs should include:
  - clear summary of behavior changes,
  - linked issue/task (if available),
  - screenshots or short video for UI updates,
  - local verification steps/commands run.

## Security & Configuration Tips
- Current CORS allows `*` for development; tighten origins before production.
- Do not commit secrets or local-only artifacts beyond intended files (for example avoid checking in ad-hoc DB dumps).
