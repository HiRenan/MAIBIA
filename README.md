# DevQuest - Projeto Final de IA Generativa

Aluno: Renan Mocelin  
Disciplina: IA Generativa  
Fase: Avaliacao Final  
Data da avaliacao final: 26/02/2026

## 1) Problema e Solucao
Portfolios tecnicos tradicionais mostram stack e projetos, mas raramente entregam orientacao personalizada e acionavel.

O DevQuest resolve isso com uma experiencia gamificada e tres fluxos de IA generativa no backend:
1. Oracle: mentoria de carreira em chat persistente.
2. CV: analise estruturada de curriculo para feedback objetivo.
3. Repo Analyze: analise tecnica de repositorio GitHub para melhoria continua.

A prioridade da fase final foi engenharia de LLM (prompting, contratos, parametros, resiliencia e seguranca), nao novos efeitos visuais.

## 2) Rubrica Final - Status Item a Item
| Item da rubrica final | Evidencia no repositorio | Status |
| --- | --- | --- |
| Integracao de LLM real em fluxo principal | `backend/app/routers/oracle.py`, `backend/app/services/oracle_service.py`, `backend/app/services/llm_client.py` | Concluido |
| Integracao LLM em fluxo extra (CV/Repo) | `backend/app/routers/cv.py`, `backend/app/services/cv_service.py`, `backend/app/routers/github.py`, `backend/app/services/repo_analysis_service.py` | Concluido |
| Prompts versionados fora do codigo | `prompts/system_prompt.txt`, `prompts/oracle_prompt.md`, `prompts/cv_prompt.md`, `prompts/repo_prompt.md` | Concluido |
| Tools documentadas e tipadas | `tools/index.json`, `tools/*.json`, `tools/README.md` | Concluido |
| Decisoes de arquitetura LLM e trade-offs | `docs/llm-architecture.md` | Concluido |
| Evidencia de parametros e configuracao | `.env.example`, `backend/README-env.md`, secoes 6 e 7 deste README | Concluido |
| Estrutura facil para avaliacao rapida | `docs/INDEX.md`, `prompts/README.md`, `tools/README.md`, `agents/README.md` | Concluido |
| Pitch tecnico 3 min + Q&A | Secao 11 deste README | Concluido |

## 3) Arquitetura LLM (Input -> Prompt -> Modelo -> Tools -> Resposta)
### 3.1 Fluxo geral
1. Frontend envia request para endpoint `/api/*`.
2. Router FastAPI delega para service de fluxo.
3. Service monta prompt final com:
   - `prompts/system_prompt.txt` (regras globais)
   - prompt especifico de fluxo (`oracle_prompt.md`, `cv_prompt.md`, `repo_prompt.md`)
   - contexto de aplicacao + contexto de seguranca.
4. Service chama OpenAI via SDK oficial (`openai-python`).
5. Service normaliza/valida saida:
   - Oracle: normalizacao textual com limite de formato.
   - CV/Repo: JSON schema estrito + validacao Pydantic.
6. Em falha de provedor/parse/contexto: fallback gracioso para mock, mantendo contrato de resposta.
7. Router persiste quando aplicavel (chat e analises) e retorna payload compativel com UI.

### 3.2 Fluxo Oracle
- Endpoint: `POST /api/oracle/chat`
- Router: `backend/app/routers/oracle.py`
- Service: `backend/app/services/oracle_service.py`
- Cliente LLM/resiliencia: `backend/app/services/llm_client.py`
- Prompt chain:
  - `prompts/system_prompt.txt`
  - `prompts/oracle_prompt.md`
- Contrato de resposta externo:
```json
{
  "role": "oracle",
  "text": "...",
  "topic": "skills|career|project|...",
  "gamification": {
    "xp_gained": 25
  }
}
```

### 3.3 Fluxo CV
- Endpoint: `POST /api/cv/upload`
- Router: `backend/app/routers/cv.py`
- Service: `backend/app/services/cv_service.py`
- Prompt chain:
  - `prompts/system_prompt.txt`
  - `prompts/cv_prompt.md`
- Structured output: JSON schema estrito (`CV_JSON_SCHEMA`) + Pydantic (`CVAnalysisStructured`)
- Contrato de resposta externo (shape principal):
```json
{
  "score": 0,
  "sections": [{"name": "", "score": 0, "feedback": ""}],
  "strengths": [""],
  "weaknesses": [""],
  "tips": [""]
}
```

### 3.4 Fluxo Repo Analyze
- Endpoint: `POST /api/github/repos/{owner}/{repo}/analyze`
- Router: `backend/app/routers/github.py`
- Service: `backend/app/services/repo_analysis_service.py`
- Prompt chain:
  - `prompts/system_prompt.txt`
  - `prompts/repo_prompt.md`
- Structured output: JSON schema estrito (`REPO_JSON_SCHEMA`) + Pydantic (`RepoAnalysisStructured`)
- Contrato de resposta externo:
```json
{
  "repo": "owner/repo",
  "score": 0,
  "strengths": [""],
  "improvements": [""],
  "summary": "",
  "metrics": {
    "code_quality": 0,
    "documentation": 0,
    "testing": 0,
    "architecture": 0,
    "security": 0
  },
  "category_tags": [""]
}
```

## 4) Decisoes de Engenharia LLM e Trade-offs
### 4.1 Provedor e SDK
Decisao final:
1. Provedor: OpenAI API.
2. Integracao: SDK oficial `openai-python`.
3. Framework policy: sem LangChain/LangGraph/Agents SDK nesta fase.

Justificativa:
1. Menor complexidade operacional para prazo curto.
2. Melhor previsibilidade para structured outputs.
3. Controle direto de timeout/retry/fallback no proprio codigo.

### 4.2 Modelo
Modelo escolhido por fluxo:
1. Oracle: `gpt-4o-mini`
2. CV: `gpt-4o-mini`
3. Repo: `gpt-4o-mini`

Trade-off consolidado:
1. Custo: menor que modelos maiores.
2. Latencia: adequada para UX de chat e analise.
3. Qualidade: suficiente para mentoria e analise estruturada nesta fase.
4. Privacidade: dado sai do ambiente local para provedor hospedado (mitigado com redacao de logs e sem segredos em payloads de log).

## 5) Prompts e Guardrails
### 5.1 Prompting strategy
1. Prompt global em `prompts/system_prompt.txt` com hierarquia de instrucoes.
2. Prompt por fluxo para estilo e contrato de saida:
   - Oracle: texto curto + bullets acionaveis.
   - CV: JSON estrito.
   - Repo: JSON estrito.

### 5.2 Protecoes contra prompt injection
Implementadas em duas camadas:
1. Camada de prompt (policy): regras explicitas para ignorar instrucoes maliciosas e nao vazar segredo.
2. Camada de runtime:
   - Oracle: deteccao de padroes maliciosos + recusa segura (`backend/app/services/oracle_service.py`).
   - CV/Repo: contexto tratado como nao confiavel + validacao estrita de formato.

## 6) Parametros Finais e Evidencia de Escolha
Fonte de verdade: `.env.example` e `backend/README-env.md`.

### 6.1 Parametros globais
| Variavel | Default | Papel |
| --- | --- | --- |
| `OPENAI_TIMEOUT_SECONDS` | `20` | Limite de latencia por chamada |
| `OPENAI_MAX_RETRIES` | `2` | Retry do SDK para falhas transientes |
| `LLM_MAX_INSTRUCTIONS_CHARS` | `12000` | Limite de instrucoes |
| `LLM_MAX_INPUT_CHARS` | `24000` | Limite de input |
| `LLM_MAX_TOTAL_CHARS` | `32000` | Limite total de payload |

### 6.2 Parametros por fluxo
| Fluxo | Modelo | Temperature | Top-p | Max tokens |
| --- | --- | --- | --- | --- |
| Oracle | `gpt-4o-mini` | `0.7` | `1.0` | `600` |
| CV | `gpt-4o-mini` | `0.2` | `1.0` | `900` |
| Repo | `gpt-4o-mini` | `0.2` | `1.0` | `900` |

### 6.3 Comparacao sintetica usada na decisao
| Opcao | Vantagem | Risco | Decisao |
| --- | --- | --- | --- |
| Temperatura alta em todos os fluxos | Mais criatividade | Menor consistencia estrutural em CV/Repo | Rejeitada |
| Temperatura baixa em todos os fluxos | Consistencia | Oracle fica menos util/conversacional | Rejeitada |
| Hibrido (Oracle 0.7, CV/Repo 0.2) | Equilibrio entre UX e estrutura | Exige ajuste fino por fluxo | Escolhida |

## 7) Tools e Contratos
- Registro central: `tools/index.json`
- Guia: `tools/README.md`
- Contratos por tool: `tools/*.json`

Convencoes principais:
1. `additionalProperties: false` para schema de entrada.
2. Envelope de sucesso e erro definido.
3. Codigos de erro previsiveis (`VALIDATION_ERROR`, `UPSTREAM_TIMEOUT`, `RATE_LIMITED`, etc.).
4. Politica por fluxo para uso controlado de tools.

## 8) Resiliencia, Degradacao e Seguranca
### 8.1 Resiliencia
1. Timeout e retries configuraveis por env.
2. Oracle com retry adicional no app + backoff/jitter:
   - `OPENAI_ORACLE_APP_RETRIES`
   - `OPENAI_ORACLE_BACKOFF_BASE_MS`
   - `OPENAI_ORACLE_BACKOFF_MAX_MS`
   - `OPENAI_ORACLE_BACKOFF_JITTER_MS`
3. Fallback gracioso para mock em falha de LLM/contexto/parse.
4. Contratos de API permanecem estaveis mesmo em degradacao.

### 8.2 Seguranca e privacidade
1. Nao expor `OPENAI_API_KEY` no frontend.
2. Redacao de logs habilitavel por `LOG_REDACTION_ENABLED=true`.
3. Politica de nao logar prompt completo, CV bruto e headers de autorizacao.
4. Bloqueio de exfiltracao de segredo/prompt interno no Oracle.

## 9) O que Funcionou e O que Nao Funcionou
### 9.1 Funcionou bem
1. Integracao LLM real sem quebrar contratos da UI.
2. Prompting externo ao codigo (versionavel e revisavel).
3. Saida estruturada robusta em CV/Repo com schema + validacao.
4. Fallback manteve UX funcional quando houve erro de request/parse.
5. Observabilidade basica por request id, status e latencia.

### 9.2 Limites atuais
1. Sem suite automatizada de avaliacao de qualidade de resposta (benchmark formal).
2. CV depende da qualidade de extracao de texto de PDF/DOCX.
3. Repo Analyze depende da disponibilidade da API do GitHub para contexto completo.
4. Persistencia SQLite local e simples para contexto academico.

### 9.3 Proximos passos tecnicos
1. Criar matriz formal de experimentos de parametros com casos fixos.
2. Adicionar testes automatizados de regressao de schema.
3. Instrumentar metricas de custo/tokens por fluxo.

## 10) Como Executar e Validar
### 10.1 Setup
```bash
# Frontend
cd frontend
npm install

# Backend (Windows)
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
```

### 10.2 Rodar aplicacao
```bash
# na raiz do repositorio
uvicorn app.main:app --reload --app-dir backend --env-file .env

# em outro terminal
cd frontend
npm run dev
```

### 10.3 Gate minimo de validacao
```bash
# frontend
cd frontend
npm run lint
npm run build

# backend
python -m compileall backend\app

# health
curl http://127.0.0.1:8000/api/health
```

### 10.4 Teste manual rapido dos fluxos LLM
```bash
# Oracle
curl -sS -X POST "http://127.0.0.1:8000/api/oracle/chat" -H "Content-Type: application/json" --data-raw '{"message":"me da um plano de estudo de backend"}'

# CV: usar upload pela UI em /guild

# Repo Analyze
curl -sS -X POST "http://127.0.0.1:8000/api/github/repos/HiRenan/MAIBIA/analyze"
```

## 11) Pitch de 3 Minutos e Q&A
### 11.1 Script de 3 minutos
1. 30s - Valor do sistema:
   - "DevQuest transforma portfolio em uma plataforma gamificada com IA aplicada em mentoria, CV e analise tecnica de repositorio."
2. 2min - Engenharia LLM:
   - Arquitetura: input -> prompt -> modelo -> validacao -> resposta/fallback.
   - Decisao tecnica: OpenAI + SDK oficial + `gpt-4o-mini` por equilibrio custo/latencia/qualidade.
   - Prompting: system prompt global + templates por fluxo.
   - Confiabilidade: retries, backoff, limites de payload, structured output e fallback.
   - Seguranca: anti-injection e bloqueio de vazamento de segredo.
3. 30s - Resultado e limites:
   - Funcionou: contratos estaveis e UX preservada em falhas.
   - Nao funcionou 100%: falta benchmark automatizado formal de qualidade/custo.

### 11.2 Q&A tecnico (perguntas provaveis)
1. Por que `gpt-4o-mini`?
   - Melhor relacao custo/latencia para este escopo, mantendo qualidade suficiente para Oracle/CV/Repo.
2. Por que nao LangChain/LangGraph?
   - Prazo curto e necessidade de reduzir superficie de complexidade; SDK direto foi suficiente e mais previsivel.
3. Como voce mitigou prompt injection?
   - Guardrails no prompt global + deteccao e recusa no runtime + validacao de saida.
4. O que acontece se a API falhar?
   - Fallback para mock mantendo shape de resposta e sem quebrar a UI.
5. Qual principal melhoria futura?
   - Suite de evaluacao automatizada com casos fixos e metricas comparativas por parametro.

## 12) Links Rapidos para Correcao
1. Hub de navegacao: `docs/INDEX.md`
2. Decisao arquitetural: `docs/llm-architecture.md`
3. Prompts: `prompts/README.md`
4. Tools: `tools/README.md`
5. Agents: `agents/README.md`
6. Scope freeze/backlog: `docs/final/scope-freeze.md`, `docs/final/backlog-final.md`

## 13) Licenca
Projeto academico para uso educacional.
