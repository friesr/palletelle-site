# Frontend Delivery Model

## 1. Objective

Define a trustworthy frontend delivery architecture for Atelier across development, staging, and production.

## 2. What is known

- Atelier is a trust-first clothing ensemble website.
- Governance, sub-agent contracts, and shared trust policy already exist.
- The repository is currently a scaffold, not a running app.
- The user wants dev, staging, and prod defined before implementation proceeds.

## 3. What is inferred

- A frontend-first deployment model with clear environment separation will reduce operational ambiguity.
- Previewable staging builds will be valuable for trust review, UX review, and agent-safe iteration.
- Protected production workflows should bias toward explicit approvals and rollback readiness.

## 4. What is uncertain

- Exact Cloudflare Pages project wiring and build settings
- Whether SSR, static generation, or hybrid rendering will dominate
- Authentication and backend integration strategy
- Whether a separate API service will exist at first milestone

## 5. Risks

- Environment drift could cause staging and production to behave differently.
- Inadequate environment-variable hygiene could leak secrets or create confusing behavior.
- Fast-moving frontend work can accidentally ship misleading copy or unsupported claims if not gated.

## 6. Proposed action

Use a three-environment frontend model:

### Development
Purpose:
- local implementation
- rapid iteration
- fixture-backed development
- safe autonomous testing

Characteristics:
- local-only or developer-hosted
- uses mock or fixture data by default
- permissive debugging
- no production secrets required
- reversible and disposable

### Staging
Purpose:
- preview builds
- QA and trust review
- pre-production validation of UX, copy, and recommendation presentation

Characteristics:
- deployed from protected mainline or release branches
- environment-specific configuration
- production-like build settings
- non-production credentials only
- safe for stakeholder review
- should support rollback to prior healthy preview or previous staging release

### Production
Purpose:
- customer-facing delivery

Characteristics:
- protected branch and deployment workflow
- explicit approval gate before release
- minimal necessary secrets
- monitored release history
- rollback path documented before first launch
- no autonomous deployment by default

## 7. Whether approval is required

No, for documentation and planning.

## 8. Next step

Document repository structure, env strategy, deployment policy, approval gates, and rollback expectations.

---

## Recommended Environment Architecture

### Repository shape

Recommended monorepo layout:

- `apps/storefront/` frontend application
- `packages/domain/` factual catalog, palette, ensemble, provenance, and explanation models
- `packages/trust/` trust policies, wording constraints, confidence helpers, and audit utilities
- `data/fixtures/` local sample catalog and recommendation fixtures
- `docs/architecture/` environment and deployment design
- `docs/policies/` governance, approval, and release policy

Why this shape:
- keeps customer-facing UI separate from domain logic
- makes trust logic reusable and testable
- supports bounded work by sub-agents
- reduces the chance of mixing subjective presentation logic with factual data models

### Initial frontend stack

Recommended stack:
- Next.js
- TypeScript
- React Server Components plus selective client components
- Tailwind CSS
- pnpm workspace monorepo
- Cloudflare Pages for preview-friendly frontend hosting
- Vitest for unit tests
- Playwright for end-to-end smoke tests

Why:
- Next.js gives a fast path to a polished storefront shell, previews, routing, metadata, and hybrid rendering.
- TypeScript helps encode boundaries between fact, inference, opinion, and uncertainty.
- Tailwind accelerates tasteful UI scaffolding without locking visual trust work into premature design systems.
- pnpm workspaces keep the monorepo lightweight and explicit.
- Cloudflare Pages preview deployments make staging review easier and safer.
- Vitest and Playwright support fast local validation and trustworthy release checks.

### Rendering guidance

Start hybrid, biased toward static plus server rendering:
- static or ISR for stable merchandising pages
- server rendering for environment-sensitive or future backend-driven pages
- client components only where interaction requires them

This keeps the shell fast, reviewable, and less fragile.

### Environment variable strategy

Principles:
- default to no secret requirement in development
- separate public and server-only variables
- keep naming explicit by environment and purpose
- never expose server-only secrets to the client bundle
- keep staging and production values distinct even when providers match

Recommended categories:
- public app metadata, for example site name and public base URL
- server-only integration values, for example backend tokens
- environment flags, for example feature enablement for non-production testing
- observability values, if later added

Recommended files and handling:
- `.env.example` committed with placeholders only
- `.env.local` for local developer overrides, uncommitted
- staging secrets in Cloudflare Pages environment settings
- production secrets in Cloudflare Pages protected environment settings
- server-side database and admin secrets kept on the machine hosting PostgreSQL/runtime services

Recommended prefixes:
- public: `NEXT_PUBLIC_`
- server only: no public prefix

Rules:
- no real secrets in repo
- no production credentials in staging
- no staging credentials in local fixture mode unless intentionally testing integration
- staging and production may share the same PostgreSQL host, but must use distinct databases and distinct secrets

### Local development workflow

Recommended workflow:
1. install workspace dependencies
2. run storefront locally against fixtures by default
3. run unit tests for domain and trust packages
4. run smoke tests before merging significant UI changes
5. record major UI, data-shape, or trust-impacting decisions in docs or PR notes

Autonomous-safe dev actions:
- create and refactor local components
- add routes and static content
- add or update fixtures
- write tests
- run local builds and checks
- adjust non-secret local config
- create previewable UI states using mock data

Not autonomous-safe even in dev:
- introducing hidden telemetry without review
- adding credentials to repo or scripts
- disabling trust safeguards silently

### Staging preview workflow

Recommended workflow:
1. merge reviewed code into protected integration branch or main branch with previews enabled
2. automatically build preview deployment
3. run automated tests against preview
4. review trust-sensitive flows, copy, recommendation wording, and factual boundaries
5. promote only after explicit signoff

Autonomous-safe staging actions:
- deploy preview builds from reviewed code
- run smoke tests
- validate non-production integrations
- compare staging behavior against expected policy and fixtures
- roll back staging to prior known-good build if reversible and non-customer-facing

Approval advised in staging when:
- changes alter recommendation framing materially
- new integrations introduce non-trivial data or trust risk
- customer-visible content is likely to be screenshotted or externally shared as authoritative

### Protected production deployment workflow

Recommended workflow:
1. code merged to protected release path
2. production checks pass
3. release notes and approval record prepared
4. explicit human approval given
5. production deployment executed
6. post-deploy smoke checks run
7. rollback triggered if trust, stability, or data issues appear

Production protections:
- protected branch
- required checks
- explicit approval gate
- least-privilege secrets
- deploy log with attribution
- documented rollback path

### First milestone

Milestone 1: get a truthful site shell online in development and staging

Scope:
- working Next.js storefront shell
- home page with brand framing
- placeholder browse page
- sample product card driven by fixture data with provenance fields
- recommendation explanation component that visibly separates facts, inference, and subjective style opinion
- environment-aware footer or status badge showing dev or staging context
- local tests and one staging preview path

Success criteria:
- app runs locally
- preview deploy is possible in staging architecture
- UI shows trust boundaries clearly
- no unsupported product claims are hardcoded as facts
