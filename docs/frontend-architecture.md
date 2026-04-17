# Frontend Architecture

## 1. Objective

Define the recommended frontend stack, repository structure, environment handling, milestone scope, and post-approval execution tasks for Atelier.

## 2. What is known

- The project is a trustworthy color-matching clothing ensemble website.
- Governance and trust policy are already established.
- The frontend has not yet been implemented.

## 3. What is inferred

- The system should optimize for maintainability, speed of iteration, and long-term scalability without sacrificing truthful behavior.
- The architecture should keep factual data handling, recommendation logic, and trust constraints distinct.

## 4. What is uncertain

- Final hosting provider
- Future backend/API design
- Whether admin tooling will be needed soon

## 5. Risks

- Mixing factual and subjective logic can weaken trust.
- Overcomplicated early architecture can slow the team down.
- Under-specified architecture can create drift and inconsistency between agents.

## 6. Proposed action

Adopt the frontend architecture below.

## 7. Whether approval is required

No, for documentation and planning.

## 8. Next step

After review, scaffold the repo and first site shell in dev-safe mode.

---

## Frontend stack

### Framework
- Next.js with TypeScript

Why:
- fast route and layout scaffolding
- strong support for hybrid rendering
- good preview deployment ergonomics
- mature ecosystem
- good long-term maintainability for a storefront

### Styling approach
- Tailwind CSS initially
- optional shared UI package later if the system grows

Why:
- rapid tasteful iteration
- easy consistency without overcommitting to a design system too early
- scalable into shared component patterns later

### Data fetching strategy
- start with fixture-backed server-side loading and static content where possible
- use server components or server-side data access for factual product data
- use client components only for interaction that genuinely needs them

Why:
- keeps early development simple
- supports trust-aware rendering of facts vs inference
- reduces accidental client exposure of sensitive logic or data

### Hosting approach
- preview-friendly frontend host such as Vercel or equivalent
- staging previews for review
- protected production deployment path

Why:
- fast staging feedback loops
- straightforward rollback model
- low operational overhead for the initial storefront

## Repository structure

### Frontend structure
- `apps/storefront/`
  - app routes
  - layouts
  - pages
  - components
  - local app config

### Shared logic
- `packages/domain/`
  - product schemas
  - provenance models
  - palette and ensemble types
  - confidence and explanation models

- `packages/trust/`
  - wording constraints
  - trust helpers
  - audit and decision-log helpers

### Config organization
- root workspace config for package manager and shared tooling
- app-local config in `apps/storefront/`
- shared lint, test, or tsconfig packages may be added later under `packages/config/`

### Environment handling
- `.env.example` committed with placeholders
- `.env.local` ignored for local development
- provider-managed staging env settings
- provider-managed production env settings
- public env vars use `NEXT_PUBLIC_`
- secrets never use `NEXT_PUBLIC_`

### Agent-generated artifacts
- generated docs or plans should live under `docs/`
- generated fixtures under `data/fixtures/`
- generated implementation artifacts should live in normal source directories, not hidden side paths
- any material generated artifact must remain attributable and reviewable

## Autonomy boundaries

### Automatic in dev
- local scaffolding
- local code edits
- component creation
- fixture creation
- tests and local validation
- non-secret local env example updates

### Automatic in staging
- preview deployments from reviewed non-production code
- smoke testing
- staging-only non-secret configuration changes
- reversible staging rollback

### Requires explicit approval in production
- any production deployment
- any production environment variable or secret change
- any customer-visible trust-sensitive release
- any DNS, domain, auth, networking, or credential change
- any rollback with uncertain customer impact

## Initial milestone

### First working version
A truthful storefront shell online in development and staging.

### Pages and components
- home page
- browse page placeholder
- product detail placeholder
- product card component
- recommendation explanation component
- provenance badge or fact/inference labeling component
- environment indicator/footer

### Mocked vs real data
Mocked initially:
- catalog data fixtures
- palette and ensemble examples
- recommendation explanations

Not assumed yet:
- live inventory
- live pricing integration
- live recommendation service

### Success criteria
- storefront runs locally
- staging preview path is ready
- pages render consistently
- fact vs inference vs opinion is visible in the UI
- no deceptive or overconfident claims are hardcoded

## First tasks to execute after approval

1. scaffold workspace config
   - `pnpm-workspace.yaml`
   - root `package.json`
   - `.gitignore`
   - `.env.example`

2. scaffold `apps/storefront/`
   - Next.js app shell
   - base layout
   - home page
   - browse page

3. scaffold shared packages
   - domain types for product facts, provenance, confidence, and explanations
   - trust helpers for labeling and wording constraints

4. add fixture data
   - sample products
   - sample recommendation explanations

5. add validation
   - unit tests for trust/domain helpers
   - basic smoke test for storefront shell

6. prepare non-production preview workflow
   - document commands
   - keep provider-specific production steps out until approved
