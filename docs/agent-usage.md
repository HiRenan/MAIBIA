# Evidencias de Uso de Agente de Codificacao

## Objetivo
Documentar iteracoes reais de uso de agente para desenvolvimento do projeto e decisoes de engenharia LLM.

## Ferramenta principal usada
1. Codex (assistente de desenvolvimento) para planejamento, implementacao e revisao tecnica.

## Iteracoes relevantes
1. Definicao de arquitetura LLM:
   - decisao por OpenAI + SDK direto, sem LangChain/LangGraph nesta fase.
   - trade-off registrado em `docs/llm-architecture.md`.
2. Extracao de prompts para arquivos versionados:
   - `prompts/system_prompt.txt`
   - `prompts/oracle_prompt.md`
   - `prompts/cv_prompt.md`
   - `prompts/repo_prompt.md`
3. Contratos de tools e erros previsiveis:
   - `tools/index.json`
   - `tools/*.json`
4. Hardening de runtime:
   - fallback gracioso nos 3 fluxos.
   - anti-prompt injection no Oracle.
   - structured output em CV/Repo.
5. Ajuste final de conformidade:
   - envelope padrao `ok/data/meta`.
   - tool-calling real no Oracle com aliases de runtime.
   - suite de testes backend para contratos.

## O que funcionou bem com agente
1. Acelerou a criacao de estrutura modular (prompts/tools/agents/services).
2. Facilitou revisao de contratos e pontos de falha.
3. Reduziu tempo de implementacao de validacoes de schema e fallback.

## O que nao funcionou bem
1. Primeira versao de tools ficou apenas documental; exigiu iteracao para integrar tool-calling real.
2. Contratos de resposta e docs ficaram desalinhados em alguns endpoints; precisou rodada de correcoes.
3. Necessidade de ajustar nomes de tools para regex do provedor (`.` nao permitido em runtime).

## Evidencias tecnicas no historico
1. Commits de integracao LLM Oracle/CV/Repo.
2. Commits de prompts e tools versionados.
3. Commits de resiliencia, tracing e padronizacao de envelope.
