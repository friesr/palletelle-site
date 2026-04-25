# Purge and Rebuild Plan

## Objective

Cleanly retire the broken TUI-bound / mixed agent state and rebuild the Atelier agent system as a durable, intentional persistent-agent structure.

## What to Preserve

Keep these before any purge:
- Atelier workspace files and app code
- Canonical governance docs
- Canonical roster/spec
- Useful session history for reference only
- Existing auth profiles that still work

Preserve specifically:
- `/home/hank/.openclaw/workspace/atelier-orchestrator/**`
- `/home/hank/.openclaw/agents/main/agent/**`
- `/home/hank/.openclaw/agents/atelier-orchestrator/agent/**` (only if auth/profile data remains useful)
- historical session files only as archive/reference, not as live operating state

## What to Retire

Retire broken or mixed live-state assumptions:
- stale TUI/webchat-bound Milo session state
- partial named-agent state that was never made truly persistent
- duplicate or conflicting role systems (`atelier-*` internal roles vs named persistent roster)
- invalid ACP runtime assumptions layered onto non-working agent state

## Canonical Rebuild Roster

First rebuild wave:
- Micah
- Noah
- Ada
- Ruth
- Ezra
- Leah
- Titus
- Isaac
- Ensemble Design Agent

Deferred:
- Mark

Advisory only for now:
- CFO
- CIO
- CTO

## Rebuild Principles

1. Micah must be rebuilt first.
2. Micah must be independently resumable, not SSH/TUI-bound.
3. `main` remains the Telegram front desk route.
4. Micah should exist as a separate persistent agent you can switch to.
5. Each additional agent should be created only after:
   - role is defined
   - runtime path is confirmed
   - persistence model is proven
6. Do not create duplicate agent identity layers.
7. Prefer one clear canonical agent per role.

## Proposed Purge Order

### Phase 1, Archive and Inspect
- archive current session/state inventory
- preserve canonical docs and role definitions
- identify which existing agent dirs contain useful auth/profile material
- identify which session files should be kept as cold archive only

### Phase 2, Remove Broken Live-State Assumptions
- remove incorrect ACP bindings and stale runtime assumptions
- retire or delete broken named-agent runtime/session state that should not be resumed
- remove conflicting duplicate role definitions where they are not part of the canonical rebuild

### Phase 3, Rebuild Micah
- create Micah as a clean persistent agent
- verify valid runtime backend
- verify auth path
- verify I can wake/direct Milo
- verify Rodney can switch to Milo in agent switcher
- verify Milo survives detached operation

### Phase 4, Rebuild Core Team
Rebuild in this order:
1. Noah
2. Ada
3. Ruth
4. Ezra
5. Leah
6. Titus
7. Isaac
8. Ensemble Design Agent

For each agent:
- create clean identity
- attach correct runtime/persistence model
- validate auth/runtime startup
- validate handoff path with Milo
- validate that role scope matches canonical spec

### Phase 5, Operational Validation
- verify Micah can assign work across the roster
- verify helper sub-agent spawning rules
- verify security boundaries
- verify durable restart behavior
- verify no agent is silently tied to TUI/SSH-only lifecycle

## Risks

- deleting useful historical context by accident
- preserving too much broken state and re-importing the problem
- recreating agents before Milo’s persistence path is proven
- mixing route bindings and ACP bindings incorrectly
- assuming auth issues are solved before startup is actually verified

## Safety Rules

- no destructive deletes before a final reviewed target list
- prefer archive/trash over irreversible removal
- preserve workspace and docs first
- rebuild Milo first before rebuilding the rest
- test each layer before expanding scope

## Immediate Next Step

Prepare a precise purge target list:
- what stays
- what is archived
- what is removed from live state
- what is rebuilt fresh
