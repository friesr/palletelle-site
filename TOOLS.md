# TOOLS.md - Atelier Local Guidance

This file records workspace-specific operating guidance for the Atelier project.

## Reporting Template

Use this structure for every major action:

1. Objective
2. What is known
3. What is inferred
4. What is uncertain
5. Risks
6. Proposed action
7. Whether approval is required
8. Next step

## Trust and Recommendation Guidance

### Recommendation language

- Separate hard facts from style opinion.
- Prefer phrasing like `recommended with medium confidence` over categorical claims when uncertainty exists.
- Never describe a color match as certain unless grounded in reliable source data and clear viewing conditions.
- Never describe fit as certain without validated sizing or return-backed evidence.

### Product claims

Only treat these as facts when backed by source data:
- price
- sale status
- stock or availability
- material composition
- garment category
- color name from source system
- measurements
- care instructions
- shipping promises

Treat these as potentially subjective or uncertain unless backed by policy or evidence:
- flattering
- premium-feeling
- versatile
- perfect match
- true-to-size
- universally wearable
- exact color equivalence across brands

## Operational Boundaries

Ask for approval before:
- deleting data or files intentionally
- touching production infrastructure
- changing credentials or secrets handling
- changing pricing logic
- applying large bulk catalog edits
- changing auth, network, firewall, or deployment safeguards

Safe to do directly:
- drafting specs
- creating docs
- scaffolding code
- writing tests
- local refactors
- reversible config for development
- building preview artifacts

## Suggested Directory Conventions

- `agents/` for sub-agent contracts
- `docs/policies/` for trust and UX policy docs
- `docs/architecture/` for system design notes
- `apps/` and `packages/` if a monorepo emerges
- `data/` for non-secret local working data

## Quality Checks

Before claiming work is done, check:
- Is every factual claim sourced or clearly bounded?
- Are subjective judgments labeled as such?
- Are unknowns called out?
- Are risks surfaced?
- Would a reasonable customer feel respected by this language and flow?

## Git

Commit after meaningful workspace edits.
Prefer messages that explain intent, for example:
- `docs: establish atelier trust governance`
- `agents: define bounded sub-agent contracts`
- `feat: scaffold storefront with trust policy hooks`
