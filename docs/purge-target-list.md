# Purge Target List

## Keep

These should remain intact:
- `/home/hank/.openclaw/workspace/atelier-orchestrator/**`
- `/home/hank/.openclaw/workspace/atelier-orchestrator/docs/canonical-agent-roster.md`
- `/home/hank/.openclaw/workspace/atelier-orchestrator/docs/purge-and-rebuild-plan.md`
- `/home/hank/.openclaw/agents/main/agent/**`
- `/home/hank/.openclaw/agents/main/sessions/**`
- `/home/hank/.openclaw/agents/atelier-orchestrator/agent/**` only as preserved auth/profile/config reference unless replaced during rebuild

## Archive

These should be archived as historical reference, not treated as live operating state:
- `/home/hank/.openclaw/agents/atelier-orchestrator/sessions/**`
- `/home/hank/.openclaw/agents/ada/sessions/**`
- `/home/hank/.openclaw/agents/ezra/sessions/**`
- `/home/hank/.openclaw/agents/isaac/sessions/**`
- `/home/hank/.openclaw/agents/leah/sessions/**`
- `/home/hank/.openclaw/agents/noah/sessions/**`
- `/home/hank/.openclaw/agents/ruthe/sessions/**`
- `/home/hank/.openclaw/agents/titus/sessions/**`
- `/home/hank/.openclaw/agents/codex/sessions/**`

Recommended archive destination:
- `/home/hank/.openclaw/archive/atelier-agent-rebuild-2026-04-20/`

## Remove From Live State

These should be removed from active config/runtime once archived:
- old mixed session state for `atelier-orchestrator`
- stale session state for named agents created during the failed persistence attempt
- old `ruthe` spelling references in live agent config/state
- the temporary ACP binding/config experiments that do not match the final rebuild architecture
- any duplicate/conflicting role definitions that imply both `atelier-*` and named persistent agents are simultaneously authoritative

## Rebuild Fresh

These should be rebuilt as clean persistent entities:
- Micah (`atelier-orchestrator` identity)
- Noah
- Ada
- Ruth
- Ezra
- Leah
- Titus
- Isaac
- Ensemble Design Agent

## Defer

Do not rebuild in first wave:
- Mark
- CFO
- CIO
- CTO

## Config Cleanup Targets

The following need explicit cleanup/rewrite during rebuild:
- `openclaw.json` agent roster for non-canonical or misspelled entries
- route vs ACP binding strategy for Telegram and Milo
- invalid or partial runtime assumptions attached to old agent entries

## Notes

- `main` remains the Telegram route owner/front desk
- Micah should become a separate durable persistent agent that can be switched to without stealing the front-desk role from `main`
- no archived session state should be treated as authoritative runtime state after rebuild
