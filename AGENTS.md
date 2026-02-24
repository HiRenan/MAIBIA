# Repository Guidelines (Projeto Final)

## Contexto Atual (Avaliacao Final)
- Data da avaliacao final: `26/02/2026`.
- Projeto base da avaliacao intermediaria ja esta pronto (UI + backend + mock AI).
- Foco desta fase: integrar IA generativa real e justificar claramente as decisoes de engenharia de LLM.
- Prioridade: qualidade tecnica de prompt/tools/parametros/framework acima de novos efeitos visuais.

## Objetivo da Fase Final (Definition of Done)
Para considerar o projeto final pronto, todos os itens abaixo devem estar completos:
1. Integracao de LLM real em fluxo principal (no minimo Oracle, idealmente tambem CV/analise de projeto).
2. Prompts versionados em arquivos (`prompts/`) e nao hardcoded em handlers.
3. Ferramentas do modelo documentadas e tipadas (`tools/`), com tratamento de erro.
4. README atualizado com foco em engenharia de LLM (decisoes, trade-offs, experimentos, limites).
5. Evidencia de escolha de parametros (temperatura, top-p, modelo) com comparacao breve entre opcoes.
6. Estrutura de repositorio com prompts/tools/agents facil de localizar.
7. Preparacao de pitch de 3 minutos com justificativas tecnicas objetivas.

## Project Structure & Module Organization
- `frontend/`: React 19 + Vite + TypeScript UI.
- `frontend/src/pages/`: screens de rota (`Hero.tsx`, `SkillTree.tsx`, `QuestLog.tsx`, `Chronicle.tsx`, `GuildHall.tsx`, `Oracle.tsx`, `TavernBoard.tsx`).
- `frontend/src/components/`: componentes reutilizaveis (`ui/`, `layout/`, `3d/`).
- `backend/`: servico FastAPI.
- `backend/app/routers/`: endpoints (`github.py`, `cv.py`, `oracle.py`, `gamification.py`, `blog.py`).
- `backend/app/services/`: logica de servico (`mock_ai.py`, `gamification_engine.py`).
- `data/devquest.db`: banco SQLite local.

### Estrutura recomendada para a avaliacao final
- `prompts/system_prompt.txt`: prompt principal.
- `prompts/*.md|*.txt`: prompts auxiliares, few-shot, templates.
- `tools/`: contratos JSON/schema e descricao das ferramentas usadas pelo LLM.
- `agents/`: orquestracao de agentes (se houver).
- `docs/llm-decisions.md` (opcional, recomendado): log de decisoes e experimentos.

## Build, Test, and Development Commands
- Frontend setup: `cd frontend && npm install`
- Frontend dev server: `npm run dev` (Vite em `localhost:5173`, proxy `/api` -> `localhost:8000`).
- Frontend production build: `npm run build`
- Frontend lint: `npm run lint`
- Frontend preview build: `npm run preview`
- Backend setup: `python -m venv .venv && .venv\Scripts\activate && pip install -r backend/requirements.txt`
- Backend API server: `uvicorn app.main:app --reload --app-dir backend`
- Health check: `GET http://localhost:8000/api/health`

## LLM Engineering Guidelines (Obrigatorio nesta fase)
- Definir e documentar a escolha de framework: API direta vs SDK vs LangChain/LangGraph.
- Manter system prompt em arquivo dedicado e descrever a intencao de cada bloco.
- Configurar parametros conscientemente (`temperature`, `top_p`, `max_tokens`, modelo) e registrar trade-offs.
- Se usar tools, descrever cada uma para o modelo com parametros tipados e erro previsivel.
- Preferir saidas estruturadas para reduzir parsing fragil.
- Tratar entradas maliciosas (prompt injection), limites de contexto e falhas de rede/API.
- Nao quebrar o fallback atual: quando LLM falhar, retornar resposta util com degradacao graciosa.

## Coding Style & Naming Conventions
- TypeScript: strict mode habilitado; manter lint limpo com `eslint`.
- React arquivos/componentes: `PascalCase` (ex.: `ParticleBackground.tsx`).
- Variaveis/funcoes: `camelCase`; constantes: `UPPER_SNAKE_CASE`.
- Python: PEP 8, indentacao 4 espacos, handlers de rota finos delegando para `services/`.
- Preferir componentes pequenos e composaveis.

## Testing & Validation Guidelines
- Ainda nao existe framework de testes automatizados configurado.
- Gate minimo antes de PR/entrega:
  - `cd frontend && npm run lint`
  - `cd frontend && npm run build`
  - backend sobe sem erro
  - `GET /api/health` responde OK
  - fluxo principal com LLM validado manualmente
- Ao adicionar testes:
  - `backend/tests/test_<feature>.py`
  - `frontend/src/**/__tests__/*.test.tsx` ou `*.test.tsx`
- Sempre registrar passos de validacao manual no PR/README.

## README Checklist (Avaliacao Final)
O README deve obrigatoriamente cobrir:
1. Problema e solucao: o que o sistema faz e onde a IA entra.
2. Arquitetura LLM: fluxo de dados (input -> prompt -> modelo -> tools -> resposta).
3. Decisoes e justificativas: modelo, parametros, framework, tools.
4. O que funcionou: resultados bons de prompting/integracao.
5. O que nao funcionou: falhas, limites, ajustes tentados, proximos passos.

## Presentation Checklist (3 min + 2 min Q&A)
- 30s: explicar o sistema em uma frase de valor.
- 2min: explicar escolhas de LLM (modelo, prompt, parametros, tools, framework).
- 30s: dizer o que funcionou e o que nao funcionou.
- Preparar respostas para perguntas de trade-off (temperatura, seguranca, custo, local vs pago).

## Commit & Pull Request Guidelines
- Seguir Conventional Commits (`feat:`, `fix:`, `chore:`; escopo opcional).
- Um commit por assunto tecnico.
- PR deve incluir:
  - resumo claro de mudanca comportamental,
  - issue/tarefa vinculada (se houver),
  - screenshot/video curto para mudancas de UI,
  - comandos/validacoes executadas localmente.

## Security & Configuration Tips
- Nao commitar segredos (chaves de API, tokens).
- Usar variaveis de ambiente para provedores LLM.
- Evitar logar prompt completo com dados sensiveis do usuario.
- CORS com `*` e aceitavel em dev, mas restringir origens antes de producao.
- Nao commitar artefatos locais desnecessarios (dumps, arquivos temporarios grandes).
