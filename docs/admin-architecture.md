# Admin Architecture

## 1. Objective

Define the target admin architecture for Palletelle so pages stay thin, fixture-backed data can later move to a database with minimal churn, and product/review/config logic does not remain embedded in page files.

## 2. What is known

- The admin app is a separate protected Next.js app.
- The current implementation is still fixture-backed.
- Admin pages need to remain auth-protected.
- Review, product editor, affiliate config, and ensemble builder flows now exist.

## 3. What is inferred

- As the admin surface grows, page files should not own record lookup or data shaping.
- Fixture-backed data should already be accessed through service/load layers so DB migration later is incremental instead of disruptive.

## 4. What is uncertain

- Final database choice.
- Whether admin will eventually run against a shared API or query the DB directly.
- Whether loaders will later add caching, pagination, or audit/version support.

## 5. Risks

- Page-local logic becomes hard to test and hard to replace later.
- Tight coupling to fixture files makes later DB migration more expensive.
- UI changes can accidentally reshape business logic if responsibilities stay blurred.

## 6. Proposed action

Use the layered pattern below.

## 7. Whether approval is required

No, for local fixture-backed refactoring and documentation.

## 8. Next step

Keep the current admin pages on services/loaders now, then replace the fixture-backed service implementations with DB-backed implementations later.

---

## Current pain points

Before refactor, pages were directly:
- importing fixture files
- looking up records by route param
- deciding missing-record behavior

That made logic like this page-local:
- review record retrieval
- product editor record retrieval
- config retrieval
- ensemble retrieval

## Target architecture

### 1. Page layer

Responsibilities:
- handle route params
- enforce auth with `requireAdmin()`
- call loader/service functions
- render components

Pages should not:
- know fixture file locations
- shape domain records deeply
- contain business lookup logic beyond simple orchestration

### 2. Component layer

Responsibilities:
- render admin UI
- show trust boundaries clearly
- render missing/empty/error states honestly

Components should not:
- own route param parsing
- fetch fixture data directly
- enforce auth directly

### 3. Service / data-access layer

Current location:
- `apps/admin/lib/services/`

Responsibilities:
- load review records
- load product editor records
- load affiliate config records
- load ensemble definitions
- provide stable function signatures the page layer can depend on

Current implementation:
- fixture-backed imports

Future implementation:
- DB queries or API access behind the same function names/shapes

Current lifecycle note:
- product review/publish state now routes through explicit lifecycle state and audit tables
- admin review UI should explain lifecycle, visibility outcome, and valid transitions instead of exposing raw booleans alone
- see `docs/product-lifecycle.md`

### 4. Domain model layer

Current location:
- `packages/domain/src/`

Responsibilities:
- hold product, sourcing, customer, config, ensemble, and future visualization types
- keep truth, normalization, inference, and provenance concepts structurally distinct

### 5. Future DB-backed path

Later, the fixture-backed service functions can move from:
- importing local sample files

to:
- querying a DB
- calling a repository layer
- calling an internal service/API

without forcing route-page rewrites.

## Current service pattern

Implemented service files:
- `apps/admin/lib/services/review-service.ts`
- `apps/admin/lib/services/product-service.ts`
- `apps/admin/lib/services/config-service.ts`
- `apps/admin/lib/services/ensemble-service.ts`

Examples:
- `listReviewRecords()`
- `getReviewRecordById(id)`
- `listEditableProducts()`
- `getEditableProductById(id)`
- `getAffiliateConfig()`
- `listEnsembleDefinitions()`
- `listEnsembleProducts()`

## Migration path from fixtures to DB

### Today
- page calls service
- service imports sample fixture
- component renders domain-shaped record

### Later
- page calls same service signature
- service queries DB or repository
- component renders the same domain-shaped record

This keeps change localized to the service layer.

## Recommended next architectural step

If admin complexity grows further, split services into:
- `loaders/` for page-oriented composition
- `repositories/` for persistence access
- `mappers/` for raw-to-domain translation

But for current scale, the `lib/services/` layer is enough and is materially better than page-local fixture lookups.
