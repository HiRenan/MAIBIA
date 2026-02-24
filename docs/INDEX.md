# Docs Index (Final Evaluation)

## Comece Aqui (90 segundos)
1. Arquitetura LLM: [`docs/llm-architecture.md`](../docs/llm-architecture.md)
2. Prompts (versionados): [`prompts/README.md`](../prompts/README.md)
3. Tools (contratos JSON): [`tools/README.md`](../tools/README.md)
4. Agents (orquestracao): [`agents/README.md`](../agents/README.md)
5. Visao geral do projeto: [`README.md`](../README.md)

## Mapa Rapido por Fluxo

### Oracle
1. Prompt: [`prompts/oracle_prompt.md`](../prompts/oracle_prompt.md)
2. System prompt: [`prompts/system_prompt.txt`](../prompts/system_prompt.txt)
3. Tools: [`tools/oracle.get_player_profile.json`](../tools/oracle.get_player_profile.json), [`tools/oracle.get_player_skills.json`](../tools/oracle.get_player_skills.json), [`tools/oracle.get_oracle_history.json`](../tools/oracle.get_oracle_history.json)
4. Router: [`backend/app/routers/oracle.py`](../backend/app/routers/oracle.py)
5. Services: [`backend/app/services/oracle_service.py`](../backend/app/services/oracle_service.py), [`backend/app/services/llm_client.py`](../backend/app/services/llm_client.py)
6. Orquestracao: [`agents/oracle-agent.md`](../agents/oracle-agent.md)

### CV
1. Prompt: [`prompts/cv_prompt.md`](../prompts/cv_prompt.md)
2. System prompt: [`prompts/system_prompt.txt`](../prompts/system_prompt.txt)
3. Tools: [`tools/cv.get_latest_analysis.json`](../tools/cv.get_latest_analysis.json), [`tools/cv.list_analyses.json`](../tools/cv.list_analyses.json)
4. Router: [`backend/app/routers/cv.py`](../backend/app/routers/cv.py)
5. Service: [`backend/app/services/cv_service.py`](../backend/app/services/cv_service.py)
6. Orquestracao: [`agents/cv-agent.md`](../agents/cv-agent.md)

### Repo
1. Prompt: [`prompts/repo_prompt.md`](../prompts/repo_prompt.md)
2. System prompt: [`prompts/system_prompt.txt`](../prompts/system_prompt.txt)
3. Tools: [`tools/repo.get_repos.json`](../tools/repo.get_repos.json), [`tools/repo.get_repo_detail.json`](../tools/repo.get_repo_detail.json), [`tools/repo.get_github_profile.json`](../tools/repo.get_github_profile.json), [`tools/repo.analyze_repo.json`](../tools/repo.analyze_repo.json)
4. Router: [`backend/app/routers/github.py`](../backend/app/routers/github.py)
5. Service: [`backend/app/services/repo_analysis_service.py`](../backend/app/services/repo_analysis_service.py)
6. Orquestracao: [`agents/repo-agent.md`](../agents/repo-agent.md)

## Onde Esta a Evidencia de Engenharia LLM
1. Decisao arquitetural: [`docs/llm-architecture.md`](../docs/llm-architecture.md)
2. Parametros e env: [`.env.example`](../.env.example), [`backend/README-env.md`](../backend/README-env.md)
3. Resiliencia/fallback: [`backend/app/services/llm_client.py`](../backend/app/services/llm_client.py), [`backend/app/services/oracle_service.py`](../backend/app/services/oracle_service.py), [`backend/app/services/cv_service.py`](../backend/app/services/cv_service.py), [`backend/app/services/repo_analysis_service.py`](../backend/app/services/repo_analysis_service.py)
4. Contratos estruturados: [`tools/index.json`](../tools/index.json) e `tools/*.json`
5. Prompt guardrails: [`prompts/system_prompt.txt`](../prompts/system_prompt.txt)

## Checklist do Avaliador
1. Encontrar prompt de cada fluxo em menos de 30s.
2. Encontrar contratos de tools e regras de erro em menos de 30s.
3. Encontrar router e service de Oracle em menos de 30s.
4. Encontrar router e service de CV em menos de 30s.
5. Encontrar router e service de Repo em menos de 30s.
6. Ver fallback documentado por fluxo.
7. Ver seguranca de prompt-injection e segredo.
8. Ver parametros configuraveis no `.env.example`.
9. Ver decisao tecnica de arquitetura LLM.

## Quick Links
1. [`prompts/README.md`](../prompts/README.md)
2. [`tools/README.md`](../tools/README.md)
3. [`agents/README.md`](../agents/README.md)
4. [`docs/final/backlog-final.md`](../docs/final/backlog-final.md)
5. [`docs/final/scope-freeze.md`](../docs/final/scope-freeze.md)

