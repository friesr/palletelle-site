# Palletelle

A trustworthy color-matching clothing ensemble website with curated affiliate-sourced listings.

## Objective

Build a refined shopping experience that helps customers make better clothing decisions without deception, coercion, or false certainty, while clearly separating sourced product facts from Palletelle's inferred style guidance.

## What is known

- Workspace governance is established.
- Sub-agent roles are defined.
- Shared trust rules are documented.
- PostgreSQL is the required database for staging and production.
- Staging and production databases live on this same machine.
- SQLite is retained only for explicitly local development workflows.
- The public frontend target is Cloudflare Pages.
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

## Database direction

- Default Prisma schema: `prisma/schema.prisma` using PostgreSQL.
- Local-only SQLite schema: `prisma/schema.sqlite.prisma`.
- Baseline PostgreSQL migration: `prisma/migrations/20260422125000_postgres_baseline/migration.sql`.
- Default env template: `.env.example` for PostgreSQL.
- Local SQLite fallback template: `.env.sqlite.example`.
- Production-clean proof and host layout notes: `docs/production-postgres-foundation-proof-2026-04-23.md`.

Useful commands:

- `pnpm db:generate`
- `pnpm db:migrate:dev`
- `pnpm db:migrate:deploy`
- `pnpm db:dev:generate`
- `pnpm db:dev:push`
- `pnpm db:dev:seed`

## Structure

- `agents/` bounded sub-agent contracts
- `apps/storefront/` customer-facing web app
- `apps/admin/` future admin surface for affiliate settings, catalog review, and site customization
- `packages/domain/` shared product, palette, and ensemble logic
- `packages/trust/` trust-oriented helpers and policy logic
- `docs/policies/` shared governance and trust rules
- `docs/architecture/` system design notes
- `docs/dev-setup.md` local reproducible setup guide
- `docs/frontend-milestone-1.md` milestone scope and success criteria
- `data/` local non-secret fixtures and working data
