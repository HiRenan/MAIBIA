# Repo Agent

## Missao
Analisar repositorios GitHub com saida estruturada e util para Quest Log, mantendo compatibilidade de contrato e fallback.

## Input
1. Identificador do repositorio (`owner`, `repo`).
2. Contexto coletado da API GitHub:
   - metadata do repo,
   - languages,
   - README (trecho).

## Prompt Chain
1. Prompt global: [`prompts/system_prompt.txt`](../prompts/system_prompt.txt)
2. Prompt de fluxo: [`prompts/repo_prompt.md`](../prompts/repo_prompt.md)

## Tools Permitidas (contratos)
1. [`tools/repo.get_repos.json`](../tools/repo.get_repos.json)
2. [`tools/repo.get_repo_detail.json`](../tools/repo.get_repo_detail.json)
3. [`tools/repo.get_github_profile.json`](../tools/repo.get_github_profile.json)
4. [`tools/repo.analyze_repo.json`](../tools/repo.analyze_repo.json)

## Output Esperado
1. Estrutura compativel com UI:
   - `repo`
   - `score`
   - `strengths`
   - `improvements`
   - `summary`
   - `metrics`
   - `category_tags`

## Fallback e Degradacao
1. Se contexto GitHub falhar ou repo nao existir, aplica fallback mock.
2. Se LLM falhar ou output invalido, aplica fallback mock normalizado.
3. API mantem forma de resposta esperada pela UI.

## Seguranca
1. README e metadados GitHub tratados como texto nao confiavel.
2. Instrucoes maliciosas no repo sao ignoradas.
3. Nao expor segredos nem texto interno de sistema.

## Referencias de Implementacao
1. Router: [`backend/app/routers/github.py`](../backend/app/routers/github.py)
2. Service: [`backend/app/services/repo_analysis_service.py`](../backend/app/services/repo_analysis_service.py)

