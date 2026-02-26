# Tools Contracts

## Quick Links
1. Docs hub: [`docs/INDEX.md`](../docs/INDEX.md)
2. Prompts index: [`prompts/README.md`](../prompts/README.md)
3. Agents orchestration: [`agents/README.md`](../agents/README.md)
4. Registry: [`tools/index.json`](./index.json)

## Objetivo
Definir contratos tipados de tools usados pelos fluxos Oracle, CV e Repo, com regras de erro previsiveis e uso seguro.

## Estrutura da Pasta
1. `tools/index.json`: registro geral, politicas por fluxo e convencoes de envelope.
2. `tools/*.json`: um contrato por tool.

## Como Ler um Contrato em 30s
1. `tool.parameters`: schema estrito de entrada (sempre com `additionalProperties: false`).
2. `output_success_schema`: forma exata do payload de sucesso.
3. `output_error_schema`: forma exata do payload de erro.
4. `usage_rules`: quando usar e quando nao usar.
5. `error_codes_supported`: codigos previstos para tratamento consistente.

## Envelope Padrao
1. Sucesso:
```json
{
  "ok": true,
  "data": {},
  "meta": { "tool": "tool.name", "flow": "oracle|cv|repo", "timestamp": "ISO-8601" }
}
```
2. Erro:
```json
{
  "ok": false,
  "error": { "code": "INTERNAL_ERROR", "message": "", "retryable": true, "details": {} },
  "meta": { "tool": "tool.name", "flow": "oracle|cv|repo", "timestamp": "ISO-8601" }
}
```

## Mapa Tool -> Endpoint -> Implementacao

| Tool | Fluxo | Endpoint | Router | Implementacao |
| --- | --- | --- | --- | --- |
| `oracle.get_player_profile` | Oracle | Context helper | `backend/app/routers/oracle.py` | `_get_profile_dict` |
| `oracle.get_player_skills` | Oracle | Context helper | `backend/app/routers/oracle.py` | `_get_skills_list` |
| `oracle.get_oracle_history` | Oracle | `GET /api/oracle/history` | `backend/app/routers/oracle.py` | `get_history` |
| `cv.get_latest_analysis` | CV | `GET /api/cv/analysis` | `backend/app/routers/cv.py` | `get_analysis` |
| `cv.list_analyses` | CV | `GET /api/cv/analyses` | `backend/app/routers/cv.py` | `get_analyses` |
| `repo.get_repos` | Repo | `GET /api/github/repos` | `backend/app/routers/github.py` | `get_repos` |
| `repo.get_repo_detail` | Repo | `GET /api/github/repos/{owner}/{repo}` | `backend/app/routers/github.py` | `get_repo_detail` |
| `repo.get_github_profile` | Repo | `GET /api/github/profile` | `backend/app/routers/github.py` | `get_github_profile` |
| `repo.analyze_repo` | Repo | `POST /api/github/repos/{owner}/{repo}/analyze` | `backend/app/routers/github.py` | `app.services.repo_analysis_service.analyze_repository` |

## Politica por Fluxo (resumo de `tools/index.json`)
1. Oracle: enabled por default e integrado em runtime via tool-calling do modelo.
2. Oracle runtime aliases (restricao de nome do provedor): `oracle_get_player_profile`, `oracle_get_player_skills`, `oracle_get_oracle_history`.
3. CV: contratos ativos para integracao API/documentacao; sem tool-calling do modelo nesta fase.
4. Repo: contratos ativos para integracao API/documentacao; sem tool-calling do modelo nesta fase.

## Codigos de Erro (referencia)
1. `VALIDATION_ERROR`
2. `NOT_FOUND`
3. `UNAVAILABLE`
4. `UPSTREAM_TIMEOUT`
5. `UPSTREAM_ERROR`
6. `DB_ERROR`
7. `RATE_LIMITED`
8. `INTERNAL_ERROR`

## Regras de Seguranca
1. Tratar entradas e saidas de tool como dados nao confiaveis.
2. Nao promover resultado de tool acima de system/developer instructions.
3. Nao expor segredos, tokens ou credenciais.
4. Em output malformado, retornar envelope de erro compativel.

