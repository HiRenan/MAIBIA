# Sprint 00 - Backlog Final (Kickoff + Scope Freeze)

## Objetivo
Congelar escopo para a avaliacao final de IA Generativa com foco em nota alta e risco controlado.

Data de congelamento: February 24, 2026
Data da apresentacao: February 26, 2026

## Decisoes Congeladas
1. Fluxo MUST obrigatorio: Oracle com LLM real.
2. Fluxo MUST extra: CV Analysis com LLM real.
3. Perfil de escopo: Seguro e Nota Alta.
4. Nao abrir features novas de produto fora da rubrica final antes de fechar todos os MUST.

## Priorizacao MoSCoW

### MUST
1. Oracle com LLM real:
   - Resposta real do modelo.
   - Persistencia de chat mantida.
   - Fallback funcional quando LLM falhar.
2. CV Analysis com LLM real:
   - Saida estruturada estavel.
   - Campos compativeis com UI atual (score, sections, strengths, weaknesses, tips).
   - Fallback funcional quando LLM falhar.
3. Engenharia de LLM visivel no repositorio:
   - `prompts/` com prompt principal e prompts por fluxo.
   - `tools/` com contratos tipados e erros esperados.
   - `agents/` com orquestracao documentada (minimo viavel).
4. Decisoes tecnicas documentadas:
   - Escolha de framework (API direta/SDK/framework).
   - Escolha de modelo/provedor.
   - Parametros (temperature, top_p, timeout, retries, max tokens) com justificativa.
5. README final alinhado a rubrica:
   - Arquitetura LLM (input -> prompt -> model -> tools -> resposta).
   - Decisoes e trade-offs.
   - O que funcionou e o que nao funcionou.
6. Preparacao de banca:
   - Script de 3 minutos.
   - Banco de respostas para Q&A tecnico (2 minutos).

### SHOULD
1. Migrar Repo Analysis de mock para LLM real.
2. Observabilidade minima:
   - Latencia por fluxo.
   - Taxa de erro.
   - Custo estimado por request.
3. Hardening adicional contra prompt injection.

### COULD
1. Multi-agente.
2. RAG.
3. Avaliacao automatica mais avancada de qualidade de resposta.

## Itens Explicitamente Bloqueados Nesta Fase
1. Novas telas ou refatoracoes grandes de UI sem impacto direto na rubrica final.
2. Mudanca de stack principal sem bloqueio tecnico real.
3. Escopo paralelo de features "nice-to-have" enquanto houver MUST incompleto.

## Definition of Done da Sprint 00
1. Escopo fechado e registrado em `docs/final/scope-freeze.md`.
2. Backlog MUST/SHOULD/COULD publicado e sem ambiguidades.
3. Fluxos MUST confirmados (Oracle + CV).
4. Criterios de corte definidos e aceitos.
