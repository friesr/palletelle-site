# Non-TUI Agent Operating Model

1. Objective
- Define how the Atelier agent team should operate without depending on transient TUI-style specialist chats as the primary execution model.

2. What is known
- Only `atelier-orchestrator` is currently channel-bound in practice.
- Specialist agents are mostly invoked through transient subagent or inter-session runs.
- Current channel routing does not expose a stable selectable roster of specialists in the way originally hoped for.
- The most reliable current pattern is Milo as the routed front door, with internal delegation behind Milo.

3. Recommended operating model

## Front door
- `atelier-orchestrator` (Milo) remains the single user-facing routed front door.
- Milo owns:
  - intake
  - delegation
  - truth alignment
  - escalation
  - final synthesis

## Canonical internal roster
Use these as the default internal specialist contracts:
- `atelier-catalog`
- `atelier-storefront`
- `atelier-trust`
- `atelier-security`
- `atelier-ops`
- `ezra`
- `titus`
- `isaac`
- `mark`
- `atelier-design`
- supporting narrow specialists: `atelier-ensemble`, `atelier-palette`

## Legacy role treatment
Legacy named roles such as `Ada`, `Leah`, `Ruth`, and `Noah` should not be treated as the default operating contracts.
They may remain in the repo for transition/reference, but canonical delegation should target the newer `atelier-*` roles instead.

4. Decision rule for whether a specialist is operational
A specialist is operational only when all of the following are true:
1. its contract exists
2. Milo delegates a concrete task
3. a real execution path exists
4. the agent returns evidence or concrete output
5. quota/runtime state is healthy enough for the task

If any of these are missing, the role is not considered operational for that task.

5. Practical non-TUI guidance
- Do not promise users separate selectable specialist chat endpoints unless those bindings actually exist.
- Treat Milo as the stable contact surface on Telegram and similar channels.
- Invoke specialists as internal operators, not as if each were an independently reachable public chat identity.
- Prefer durable workflow ownership and documented contracts over persona-only delegation.

6. Risks
- Pretending the specialist roster is independently reachable would misrepresent the actual runtime model.
- Running too much through brittle transient subagent sessions can recreate the same failures even with better contracts.
- Quota/runtime instability can still make a conceptually good specialist non-operational in practice.

7. Proposed action
- Keep Milo as the external front door.
- Consolidate delegation onto the canonical roster.
- Rebuild missing operational roles, especially Ezra, around explicit evidence-returning workflows.
- Add separate bindings only when they are intentionally supported and verified.

8. Whether approval is required
- No approval required for this documentation and operating recommendation.
- Channel-binding changes should be treated as operational changes and verified before being presented as user-facing capability.
