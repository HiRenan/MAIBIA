# Sprint 02 - LLM Architecture Decision

## Objective
Establish one formal LLM architecture decision for the final phase, with no ambiguity for implementation.

Decision date: February 24, 2026
Project phase: Final evaluation (Oracle + CV as MUST flows)

## Final Decision (Single Path)
1. Provider: OpenAI API.
2. Integration layer: official `openai-python` SDK (direct SDK usage).
3. Framework policy: do not use LangChain, LangGraph, or Agents SDK in this phase.
4. Model tier: balanced profile.
5. Model selection:
   - Oracle: `gpt-4o-mini`
   - CV analysis: `gpt-4o-mini`
   - Repo analysis: `gpt-4o-mini`

## Why This Decision

### Cost
1. `gpt-4o-mini` keeps request cost lower than larger models.
2. Suitable for high interaction volume in Oracle and repeated CV analysis calls.

### Latency
1. Balanced tier prioritizes fast enough responses for chat UX.
2. Async client + timeout controls reduce blocking risk in FastAPI endpoints.

### Quality
1. Expected quality is enough for Oracle mentoring responses and CV structured feedback.
2. Any remaining quality gaps are acceptable under this phase timeline and documented in risks.

### Tool Calling and Structured Outputs
1. Official SDK supports structured parsing with Pydantic models.
2. Official SDK supports function/tool calling patterns needed for deterministic backend contracts.
3. This reduces custom parsing complexity and failure surface.
4. Runtime decision for this phase:
   - Oracle: real tool-calling enabled (`oracle_get_player_profile`, `oracle_get_player_skills`, `oracle_get_oracle_history`).
   - CV/Repo: structured outputs with strict JSON schema; tools remain documented as API contracts.

### Privacy
1. Trade-off accepted: requests leave local environment to a hosted provider.
2. Mitigations required:
   - do not log full user/CV raw content,
   - log operational metadata only (latency, status, model, token estimates if available),
   - keep sensitive payloads out of debug traces in production.

## Rejected Alternatives (for this phase)
1. Ollama local as primary provider:
   - pros: privacy/local control.
   - cons: higher risk for stable structured outputs and consistency under deadline.
2. LangChain/LangGraph:
   - pros: abstraction/orchestration.
   - cons: extra dependency and complexity not required for MUST scope.
3. Agents SDK:
   - pros: advanced multi-agent workflows.
   - cons: unnecessary for Oracle + CV MVP and increases delivery risk.

## Implementation Contracts for Next Sprints

### Oracle (planned)
1. Input: user message + current profile/skills context from DB.
2. Output contract (unchanged externally):
   - `role`
   - `text`
   - `topic`
   - `gamification`
3. Behavior:
   - LLM-first response path.
   - fallback response when provider fails or times out.

### CV Analysis (planned)
1. Input: filename + extracted text/content metadata from upload pipeline.
2. Output contract (unchanged externally):
   - `score`
   - `sections`
   - `strengths`
   - `weaknesses`
   - `tips`
3. Behavior:
   - structured generation and parse validation.
   - fallback analysis if parse/provider fails.

## Required Environment Variables (Default Values)
1. `OPENAI_API_KEY` = required, no default.
2. `OPENAI_MODEL_ORACLE` = `gpt-4o-mini`
3. `OPENAI_MODEL_CV` = `gpt-4o-mini`
4. `OPENAI_TIMEOUT_SECONDS` = `20`
5. `OPENAI_MAX_RETRIES` = `2`
6. `OPENAI_TEMPERATURE_ORACLE` = `0.7`
7. `OPENAI_TOP_P_ORACLE` = `1.0`
8. `OPENAI_TEMPERATURE_CV` = `0.2`
9. `OPENAI_TOP_P_CV` = `1.0`
10. `OPENAI_MAX_TOKENS_ORACLE` = `600`
11. `OPENAI_MAX_TOKENS_CV` = `900`

## Reliability Rules
1. Use async client calls from FastAPI handlers/services.
2. Apply timeout and retry policy for transient failures.
3. On provider failure:
   - keep API response shape stable,
   - return graceful fallback content,
   - never break frontend flow.
4. Public API returns standardized envelope `ok/data/meta` with predictable error codes.

## Risks and Mitigations
1. Risk: provider rate limit or transient outage.
   - Mitigation: retries + fallback message + stable response shape.
2. Risk: malformed structured output in CV.
   - Mitigation: strict schema validation + safe fallback object.
3. Risk: cost drift with high usage.
   - Mitigation: balanced model, token caps, track request volume.
4. Risk: response inconsistency.
   - Mitigation: domain-specific prompts and lower CV temperature.

## Acceptance Criteria (Sprint 02 DoD)
1. This file exists and contains one final provider/model/framework decision.
2. No open decision remains for provider, SDK choice, or model tier.
3. Trade-offs are explicitly documented: cost, latency, quality, tool-calling, privacy.
4. Env vars and defaults are fully specified for implementation.
5. Oracle and CV planned contracts are explicit and implementation-ready.
