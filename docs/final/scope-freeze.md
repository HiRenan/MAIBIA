# Sprint 00 - Scope Freeze

## Contexto
Este documento congela o escopo da entrega final para evitar creep e proteger qualidade tecnica da avaliacao final.

Data de congelamento: February 24, 2026
Data da apresentacao: February 26, 2026

## In Scope
1. Integracao LLM real no Oracle.
2. Integracao LLM real no CV Analysis.
3. Estrutura de engenharia no repo:
   - `prompts/`
   - `tools/`
   - `agents/`
4. README final orientado a decisoes de engenharia de LLM.
5. Pitch tecnico de 3 minutos e preparacao para Q&A.

## Out of Scope
1. Novas features de produto nao exigidas pela rubrica final.
2. Grandes refatoracoes visuais sem impacto em prompt/tools/parametros/arquitetura.
3. Multi-agente e RAG antes de todos os MUST estarem 100% verdes.

## Kill Rules (Criterios de Corte)
1. Se qualquer item MUST estiver incompleto no checkpoint final de February 25, 2026, cortar todos os SHOULD e COULD.
2. Se Oracle estiver estavel e CV instavel, pausar qualquer expansao e focar exclusivamente em estabilizar CV.
3. Repo Analysis so entra se:
   - Oracle + CV estiverem entregues e validados.
   - README base ja estiver em andamento.
4. Sem mudanca de stack apos decisao arquitetural, exceto bloqueio tecnico comprovado.

## Regras de Mudanca de Escopo
1. Qualquer novo item so entra com justificativa escrita e impacto explicitado em:
   - prazo,
   - risco,
   - nota.
2. Todo item novo precisa indicar qual item atual sera removido para manter carga total realista.
3. Itens MUST nao podem ser rebaixados para SHOULD sem aprovacao explicita.

## Checkpoints de Controle
1. February 24, 2026 (fim do dia):
   - Escopo congelado.
   - Decisao arquitetural preparada.
2. February 25, 2026 (meio do dia):
   - Oracle LLM funcional em ambiente local.
   - CV LLM em progresso com schema definido.
3. February 25, 2026 (fim do dia):
   - Oracle + CV MUST concluidos ou corte automatico de SHOULD/COULD.
4. February 26, 2026 (pre-apresentacao):
   - README final.
   - Script de pitch.
   - Q&A tecnico.

## Aceite da Sprint 00
1. O backlog em `docs/final/backlog-final.md` esta coerente com este freeze.
2. Nao existem ambiguidades sobre o que entra e o que nao entra.
3. Criterios de corte estao claros e acionaveis.
