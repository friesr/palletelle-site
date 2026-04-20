# Agent Audit - 2026-04-20

1. Objective
- Audit the Atelier agent roster for operational readiness, alignment with intended responsibilities, and readiness to function outside a transient TUI-style execution model.

2. What is known
- Only `atelier-orchestrator` is currently channel-bound, via Telegram routing.
- Most specialist work has been attempted through transient subagent/webchat runs rather than durable channel-bound agent endpoints.
- Multiple specialist runs failed with provider quota errors, including Ada, Ezra, and Titus.
- Stronger canonical contracts already exist for several roles:
  - `agents/atelier-catalog/AGENT.md`
  - `agents/atelier-storefront/AGENT.md`
  - `agents/atelier-trust/AGENT.md`
  - `agents/atelier-security/AGENT.md`
  - `agents/atelier-ops/AGENT.md`
- Legacy role contracts remain in the repo and some collaboration instructions still reference those legacy names.

3. Audit matrix

| Role | Current contract | Decision | Reasoning | Notes |
|---|---|---|---|---|
| Milo / atelier-orchestrator | active | retain | only genuinely operational channel-bound front door today | should remain owner/coordinator |
| Ada | legacy | replace | repeated quota/runtime failures plus weak delegated continuity | supersede with Atelier Catalog |
| Atelier Catalog | canonical | retain | stronger catalog truth, provenance, freshness, and suppression model than Ada | should become primary catalog/sourcing role |
| Ezra | current | rebuild | role is conceptually right, but there is no reliably operating enrichment/validation execution path | needs rebuild before operational trust |
| Leah | legacy | replace | better canonical equivalent already exists | supersede with Atelier Storefront |
| Atelier Storefront | canonical | retain | better aligned storefront contract | should replace Leah as default storefront role |
| Ruth | legacy | replace | better canonical equivalent already exists | supersede with Atelier Trust |
| Atelier Trust | canonical | retain | better aligned trust and integrity contract | should replace Ruth as default trust role |
| Noah | legacy | replace | better canonical equivalent already exists | supersede with Atelier Security |
| Atelier Security | canonical | retain | clearer operational/security scope | should replace Noah as default security role |
| Titus | current | retain with repair | backend role is still needed, but execution reliability was poor under transient subagent runs | audit passed conceptually, operational mode still weak |
| Isaac | current | retain | DB integrity role is still distinct and useful | may need better handoff path, not replacement |
| Mark | current | rebuild lightly | role is useful, but collaborator references are stale and point to legacy names | update collaboration references |
| Atelier Design | current | retain | role is still useful, but depends on missing seasonal substrate and vetted products | not replaced, but downstream-blocked |
| Atelier Ensemble | current | retain as supporting specialist | useful narrow specialist under Design | not an independent front-door role |
| Atelier Palette | current | retain as supporting specialist | useful narrow specialist under Design | not an independent front-door role |
| Atelier Ops | canonical | retain | useful for validation/testing/operability | can support non-TUI operational model |

4. What is inferred
- The biggest real problem is not that the contracts are all bad. It is that the operating model is weak: specialist roles are mostly being invoked through transient subagent sessions, not durable non-TUI pathways.
- The healthiest repair path is to consolidate around the canonical `atelier-*` contracts where they already exist instead of trying to rehabilitate every older named persona.
- Ezra is the only clearly important role that still lacks a strong canonical replacement and needs a real rebuild.

5. What is uncertain
- Whether provider quota failures are temporary or structural.
- How much non-TUI autonomy is feasible with current OpenClaw channel/binding limits versus using Milo as the single routed front door.
- Whether separate channel-selectable specialist endpoints are worth setting up, or whether the better model is canonical internal specialists behind Milo.

6. Risks
- Keeping legacy and canonical contracts side by side without explicit precedence will keep causing drift.
- Collaboration references that still name Ada/Ruth/Leah can silently pull work back toward retired contracts.
- Replacing too many roles at once without changing the operating model could still leave the team as fragile transient runs.

7. Proposed action
- Treat the canonical `atelier-*` contracts as the default roster.
- Rebuild Ezra into a concrete enrichment/validation operator with explicit execution boundaries.
- Update remaining agent collaboration references away from superseded legacy names.
- Keep Milo as the channel/front-door owner unless and until durable non-TUI specialist routing is intentionally created.

8. Whether approval is required
- No approval required for audit documentation or low-risk contract cleanup.
- Channel binding/routing changes should be treated as operational changes and reviewed before being presented as the final external interaction model.

9. Next step
- Draft Ezra’s rebuilt contract and non-TUI role model.
- Patch stale collaborator references in surviving agents.
- Document the recommended non-TUI operating model explicitly.
