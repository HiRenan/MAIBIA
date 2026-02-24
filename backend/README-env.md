# Backend Environment Guide

This file defines how environment variables must be configured for local development and production for the LLM phase.

## Scope
1. Backend secrets stay server-side only.
2. Frontend public variables are non-secret and can be exposed to the browser.
3. Source of truth for defaults: `.env.example` in repository root.

## Local Setup
1. Copy `.env.example` to `.env`.
2. Fill `OPENAI_API_KEY` with a valid key.
3. Keep `.env` untracked by git.

## Run Backend with Env File
Run from repository root:

```bash
uvicorn app.main:app --reload --app-dir backend --env-file .env
```

## Required Backend Variables
1. `OPENAI_API_KEY` (required)
2. `OPENAI_MODEL_ORACLE` (default `gpt-4o-mini`)
3. `OPENAI_MODEL_CV` (default `gpt-4o-mini`)
4. `OPENAI_MODEL_REPO` (default `gpt-4o-mini`)
5. `OPENAI_TIMEOUT_SECONDS` (default `20`)
6. `OPENAI_MAX_RETRIES` (default `2`)
7. `OPENAI_TEMPERATURE_ORACLE` (default `0.7`)
8. `OPENAI_TOP_P_ORACLE` (default `1.0`)
9. `OPENAI_MAX_TOKENS_ORACLE` (default `600`)
10. `OPENAI_TEMPERATURE_CV` (default `0.2`)
11. `OPENAI_TOP_P_CV` (default `1.0`)
12. `OPENAI_MAX_TOKENS_CV` (default `900`)
13. `OPENAI_TEMPERATURE_REPO` (default `0.2`)
14. `OPENAI_TOP_P_REPO` (default `1.0`)
15. `OPENAI_MAX_TOKENS_REPO` (default `900`)
16. `FRONTEND_URL` (default `http://localhost:5173`)
17. `DB_PATH` (default `data`)
18. `LOG_LEVEL` (default `INFO`)
19. `LOG_REDACTION_ENABLED` (default `true`)

## Optional GitHub Context Variables
1. `GITHUB_TOKEN` (recommended in production/high-volume usage to reduce rate-limit risk)
2. `GITHUB_TIMEOUT_SECONDS` (default `10`)

## Frontend/Proxy Variables (Non-Secret)
1. `VITE_API_URL`
2. `RAILWAY_BACKEND_URL`

## Logging Policy (Strict Redaction)
Never log:
1. `OPENAI_API_KEY` or any token.
2. Full prompt bodies.
3. Raw CV content.
4. Authorization headers.

Allowed logs:
1. Request id / correlation id.
2. Model name, status code, latency, retry count.
3. Token counts only as aggregate metadata.

## Production Notes
1. Do not use `.env` file in production.
2. Configure secrets directly in platform settings (Railway/Vercel).
3. Restrict access to environment variable dashboards.

## Quick Verification
1. Start backend with `--env-file`.
2. Call `GET /api/health`.
3. Ensure app boots without missing variable errors.
