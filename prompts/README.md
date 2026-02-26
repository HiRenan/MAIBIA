# Prompts Index

## Quick Links
1. Docs hub: [`docs/INDEX.md`](../docs/INDEX.md)
2. Tools contracts: [`tools/README.md`](../tools/README.md)
3. Agents orchestration: [`agents/README.md`](../agents/README.md)

## Objetivo
Centralizar os prompts versionados fora do codigo para revisao rapida de estrategia e guardrails.

## Inventario de Prompts

### 1) `prompts/system_prompt.txt`
1. Papel: prompt global de identidade, hierarquia de instrucoes, seguranca, output discipline e fallback policy.
2. Fluxos que consomem:
   - Oracle
   - CV
   - Repo
3. Renderizado em:
   - [`backend/app/services/oracle_service.py`](../backend/app/services/oracle_service.py)
   - [`backend/app/services/cv_service.py`](../backend/app/services/cv_service.py)
   - [`backend/app/services/repo_analysis_service.py`](../backend/app/services/repo_analysis_service.py)
4. Placeholders:
   - `{{FLOW_NAME}}`
   - `{{APP_CONTEXT}}`
   - `{{SAFETY_CONTEXT}}`
   - `{{USER_INPUT}}`
   - `{{OUTPUT_CONTRACT}}`

### 2) `prompts/oracle_prompt.md`
1. Papel: estilo e contrato textual do Oracle (lead sentence + bullets + pergunta final opcional).
2. Fluxo: Oracle.
3. Consumido por:
   - [`backend/app/services/oracle_service.py`](../backend/app/services/oracle_service.py)
4. Placeholders de contexto esperados pelo fluxo:
   - `{{USER_MESSAGE}}`
   - `{{PLAYER_PROFILE}}` (via model input estruturado)
   - `{{SKILLS_SUMMARY}}` (via model input estruturado)
   - `{{RECENT_CONTEXT}}` (via model input estruturado)

### 3) `prompts/cv_prompt.md`
1. Papel: contrato JSON estrito para analise de CV.
2. Fluxo: CV.
3. Consumido por:
   - [`backend/app/services/cv_service.py`](../backend/app/services/cv_service.py)
4. Placeholders:
   - `{{USER_MESSAGE}}`
   - `{{CV_TEXT}}`
   - `{{FILE_NAME}}`
   - `{{FILE_SIZE_BYTES}}`
   - `{{LANGUAGE}}`

### 4) `prompts/repo_prompt.md`
1. Papel: contrato JSON estrito para analise tecnica de repositorio.
2. Fluxo: Repo.
3. Consumido por:
   - [`backend/app/services/repo_analysis_service.py`](../backend/app/services/repo_analysis_service.py)
4. Placeholders:
   - `{{USER_MESSAGE}}`
   - `{{REPO_FULL_NAME}}`
   - `{{REPO_METADATA}}`
   - `{{REPO_LANGUAGES}}`
   - `{{README_EXCERPT}}`

## Regras de Versionamento
1. Nao hardcode prompt em router/handler.
2. Alteracao de prompt deve ficar em diff de arquivo dedicado.
3. Mudanca de contrato de output deve manter compatibilidade com UI/API.
4. Toda alteracao de guardrail deve ser refletida no fluxo correspondente em `agents/`.

