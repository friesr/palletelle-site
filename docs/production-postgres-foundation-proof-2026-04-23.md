# Production PostgreSQL foundation proof, 2026-04-23

## Objective

Prove the fresh production-shaped PostgreSQL foundation path from zero using Prisma migrations only.

## Founder decisions locked for this proof

- staging and production PostgreSQL databases are on this same machine
- production admin/runtime services are on this system
- stage and admin may use a separate app port
- public frontend is Cloudflare Pages
- SQLite is local-dev-only and is not part of staging or production success

## Repo contract used

- default Prisma schema: `prisma/schema.prisma`
- migration command: `corepack pnpm prisma migrate deploy`
- baseline migration: `prisma/migrations/20260422125000_postgres_baseline/migration.sql`
- no `prisma db push` used in the proof path

## Exact proof run

Source database credentials were taken from the existing local admin runtime env without copying secrets into the repo. The proof then created two brand-new databases on the same local PostgreSQL server:

- `atelier_stage_foundation_proof`
- `atelier_prod_foundation_proof`

For each database, the run did this:

1. `DROP DATABASE IF EXISTS ...`
2. `CREATE DATABASE ...`
3. point `DATABASE_URL` at the empty database
4. run `corepack pnpm prisma migrate deploy`
5. run `corepack pnpm prisma migrate status`
6. query `_prisma_migrations`
7. query public table count and enum presence

## Exact evidence

### Stage proof

- target: `postgresql://atelier_app:***@localhost:5432/atelier_stage_foundation_proof`
- `prisma migrate deploy` output included:
  - `Applying migration 20260422125000_postgres_baseline`
  - `All migrations have been successfully applied.`
- `prisma migrate status` output included:
  - `Database schema is up to date!`
- `_prisma_migrations` query result:
  - `20260422125000_postgres_baseline|true`
- public base table count after deploy:
  - `25`
- `ProductWorkflowState` enum values present:
  - `discovered,normalized,needs_review,hold,approved,rejected,stale,needs_refresh`

### Production proof

- target: `postgresql://atelier_app:***@localhost:5432/atelier_prod_foundation_proof`
- `prisma migrate deploy` output included:
  - `Applying migration 20260422125000_postgres_baseline`
  - `All migrations have been successfully applied.`
- `prisma migrate status` output included:
  - `Database schema is up to date!`
- `_prisma_migrations` query result:
  - `20260422125000_postgres_baseline|true`
- public base table count after deploy:
  - `25`
- `ProductWorkflowState` enum values present:
  - `discovered,normalized,needs_review,hold,approved,rejected,stale,needs_refresh`

## What this proves

- a fresh empty PostgreSQL database on this host can be bootstrapped successfully with `prisma migrate deploy`
- the repo no longer depends on SQLite or `db push` for staging/production foundation
- staging and production can live on the same PostgreSQL host while remaining isolated by database name

## What this does not claim

- this proof does not claim production secrets are finalized
- this proof does not claim Cloudflare Pages wiring is finished
- this proof does not claim runtime smoke tests for the deployed apps are complete
- this proof does not claim any SQLite import or dev database reuse was needed

## Recommended naming pattern on this machine

- staging database: `atelier_stage`
- production database: `atelier_prod`

Example shape only, not live secrets:

```env
DATABASE_URL="postgresql://atelier_app:<staging-secret>@localhost:5432/atelier_stage"
DATABASE_URL="postgresql://atelier_app:<production-secret>@localhost:5432/atelier_prod"
```

## Required production habit

For staging and production schema changes, use:

```bash
corepack pnpm prisma migrate deploy
```

Do not treat `prisma db push` as the release path.
