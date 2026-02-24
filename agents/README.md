# Agents Orchestration Index

## Quick Links
1. Docs hub: [`docs/INDEX.md`](../docs/INDEX.md)
2. Prompts index: [`prompts/README.md`](../prompts/README.md)
3. Tools contracts: [`tools/README.md`](../tools/README.md)

## Objetivo
Documentar a orquestracao dos fluxos LLM em formato de "agentes de fluxo" para facilitar avaliacao tecnica.

## Escopo Nesta Fase
1. Esta pasta descreve **orquestracao documental**.
2. Nao introduz framework novo de agentes em runtime.
3. Fonte de verdade de execucao continua em `backend/app/services/*`.

## Fluxos
1. Oracle: [`agents/oracle-agent.md`](./oracle-agent.md)
2. CV: [`agents/cv-agent.md`](./cv-agent.md)
3. Repo: [`agents/repo-agent.md`](./repo-agent.md)

## Regras Comuns
1. Prompt chain: `system_prompt.txt` + prompt especifico do fluxo.
2. Entrada tratada como nao confiavel.
3. Saida deve respeitar contrato consumido pela API/UI.
4. Em falha de LLM/provedor: fallback gracioso sem quebrar fluxo.

