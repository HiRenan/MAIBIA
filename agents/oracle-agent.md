# Oracle Agent

## Missao
Responder perguntas de mentoria de carreira com tom pratico, mantendo seguranca e estabilidade de fluxo.

## Input
1. `user_message` do chat.
2. Contexto do jogador (perfil, skills, historico recente).

## Prompt Chain
1. Prompt global: [`prompts/system_prompt.txt`](../prompts/system_prompt.txt)
2. Prompt de fluxo: [`prompts/oracle_prompt.md`](../prompts/oracle_prompt.md)

## Tools Permitidas (contratos)
1. [`tools/oracle.get_player_profile.json`](../tools/oracle.get_player_profile.json)
2. [`tools/oracle.get_player_skills.json`](../tools/oracle.get_player_skills.json)
3. [`tools/oracle.get_oracle_history.json`](../tools/oracle.get_oracle_history.json)
4. Runtime aliases usados no provider:
   - `oracle_get_player_profile`
   - `oracle_get_player_skills`
   - `oracle_get_oracle_history`

## Output Esperado
1. Texto curto com a estrutura definida no fluxo Oracle.
2. API publica mantem shape:
   - `role`
   - `text`
   - `topic`
   - `gamification`

## Fallback e Degradacao
1. Se LLM falhar (timeout, auth, rate limit, etc.), retorna resposta util via fallback.
2. Se detectar input malicioso, responde com recusa segura.
3. Fluxo nao quebra o chat nem a persistencia.

## Seguranca
1. Anti-prompt-injection aplicado no service.
2. Bloqueio de tentativa de exfiltracao de segredo/prompt interno.
3. Normalizacao de output para reduzir verbosidade e vazamento.

## Referencias de Implementacao
1. Router: [`backend/app/routers/oracle.py`](../backend/app/routers/oracle.py)
2. Service de orquestracao: [`backend/app/services/oracle_service.py`](../backend/app/services/oracle_service.py)
3. Cliente LLM e resiliencia: [`backend/app/services/llm_client.py`](../backend/app/services/llm_client.py)

