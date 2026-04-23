# Environment Variable Strategy

## 1. Objective

Define a safe and clear environment variable strategy for the Atelier frontend.

## 2. What is known

- Environment separation is required across dev, staging, and prod.
- The app is expected to use a frontend framework with client and server execution contexts.
- Staging and production PostgreSQL databases live on the same host.
- The public frontend target is Cloudflare Pages.

## 3. What is inferred

- Public and server-only variables must be separated early to avoid accidental leakage.
- Development should not depend on real secrets by default.

## 4. What is uncertain

- Which providers and integrations will be added first

## 5. Risks

- Client exposure of secrets
- drift between staging and production
- hidden environment-dependent behavior

## 6. Proposed action

Adopt the strategy below.

## 7. Whether approval is required

No, for planning.

## 8. Next step

Use this strategy when the app scaffold is created.

---

## Principles

- Default to fixture-backed development.
- Keep secrets out of source control.
- Separate public and server-only variables.
- Keep staging and production values independent.
- Prefer explicit naming over clever shortcuts.

## Recommended files

- `.env.example` committed, placeholders only
- `.env.local` ignored, local overrides
- Cloudflare Pages staging environment settings
- Cloudflare Pages production environment settings
- host-local admin/runtime secrets for services that stay on this machine

## Naming guidance

Public values:
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_APP_ENV`

Server-only examples:
- `DATABASE_URL`
- `AUTH_SECRET`
- `CATALOG_API_BASE_URL`
- `CATALOG_API_TOKEN`
- `INTERNAL_RECOMMENDATION_KEY`

## Rules

- Never put secrets in `NEXT_PUBLIC_` variables.
- Never commit live credentials.
- Never reuse production secrets in staging by default.
- Keep staging and production database names distinct even when they share the same PostgreSQL host and port.
- Prefer `prisma migrate deploy` for staging and production schema application from zero, not `prisma db push`.
- Explain any environment variable that materially changes recommendation behavior or customer-visible output.

## Review triggers

Require explicit approval before:
- adding production secrets
- changing production environment values
- introducing environment flags that can weaken safeguards
- introducing hidden behavior differences across environments
