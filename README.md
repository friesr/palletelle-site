# Atelier

A trustworthy color-matching clothing ensemble website.

## Objective

Build a refined shopping experience that helps customers make better clothing decisions without deception, coercion, or false certainty.

## What is known

- Workspace governance is established.
- Sub-agent roles are defined.
- Shared trust rules are documented.
- The codebase is currently at the scaffolding stage.

## What is inferred

- The project will likely benefit from a monorepo structure separating storefront, domain logic, and trust logic.
- Recommendation quality will depend on keeping factual product data separate from subjective style guidance.

## What is uncertain

- Frontend framework
- Commerce/data backend
- Deployment target
- Authentication model

## Risks

- Blending subjective style judgment with factual claims could erode trust.
- Early architecture choices may need revision once product constraints are clearer.

## Proposed action

Use this repository as a trust-first monorepo scaffold and evolve it deliberately.

## Approval required

No, for local reversible scaffolding.

## Next step

Continue expanding the truthful storefront shell with reproducible local development workflow and stronger trust-oriented UI states.

## Structure

- `agents/` bounded sub-agent contracts
- `apps/storefront/` customer-facing web app
- `packages/domain/` shared product, palette, and ensemble logic
- `packages/trust/` trust-oriented helpers and policy logic
- `docs/policies/` shared governance and trust rules
- `docs/architecture/` system design notes
- `docs/dev-setup.md` local reproducible setup guide
- `docs/frontend-milestone-1.md` milestone scope and success criteria
- `data/` local non-secret fixtures and working data
