# Product Lifecycle State Model

## 1. Objective

Make product lifecycle state explicit, auditable, and DB-driven so admin and storefront visibility no longer depend on scattered flags or UI-only logic.

## 2. What is known

- Palletelle already separates source facts, normalized facts, inferred fields, source health, and external risk signals.
- Manual seeds and reviewed products both need clear lifecycle state.
- Dev preview and production publication are not the same thing.
- Customer visibility must stay conservative and explainable.

## 3. What is inferred

- A four-part lifecycle model is the clearest current fit:
  - `ingestState`
  - `reviewState`
  - `previewState`
  - `publishState`
- Audit rows should be append-only and capture full before/after lifecycle values.
- Legacy `ProductReviewState` and `ProductVisibility` rows can remain temporarily as compatibility mirrors while reads move to the new lifecycle path.

## 4. What is uncertain

- Whether the legacy mirrored tables will remain long-term.
- Whether future production operations need separate scheduled publish windows or approval gates beyond this first explicit lifecycle model.
- How future multi-listing review UI should represent listing-level publish constraints.

## 5. Risks

- Mixing dev preview with publication would weaken trust.
- Publishing without source-health and external-risk checks would create misleading visibility.
- Removing compatibility layers too early would create unnecessary churn.

## 6. Proposed action

Use the DB models, domain rules, and admin/storefront paths below.

## 7. Whether approval is required

No, for local development implementation.

## 8. Next step

Keep storefront and admin on the lifecycle decision path, then remove remaining legacy mirrors once no callers depend on them.

---

## Lifecycle schema

Primary DB models:

- `/home/hank/.openclaw/workspace/atelier-orchestrator/prisma/schema.prisma`
  - `ProductLifecycleState`
  - `ProductLifecycleAudit`

State fields:

- `ingestState`
  - `manual_seeded`
  - `source_captured`
  - `normalized`
  - `refresh_required`
- `reviewState`
  - `pending`
  - `approved`
  - `hold`
  - `rejected`
- `previewState`
  - `none`
  - `admin_only`
  - `dev_customer`
- `publishState`
  - `unpublished`
  - `published`
  - `withdrawn`

Audit fields:

- `changedBy`
- `changedAt`
- `action`
- full `from*` state tuple
- full `to*` state tuple
- optional `reason`

## Lifecycle diagram

```text
manual_seeded/source_captured/normalized/refresh_required
                │
                ▼
review: pending ──► approved ──► preview: dev_customer ──► publish: published
     │              │   │                 │                     │
     │              │   └──► preview: admin_only               └──► withdrawn
     │              │
     ├──► hold ◄────┘
     │
     └──► rejected ──► reset_review ──► pending
```

Notes:
- preview is not publish
- publish is not allowed before `normalized + approved`
- hold/reject clear preview and can withdraw customer visibility

## Transition rules

Implemented in:

- `/home/hank/.openclaw/workspace/atelier-orchestrator/packages/domain/src/product-lifecycle.ts`
- `/home/hank/.openclaw/workspace/atelier-orchestrator/apps/admin/lib/services/review-service.ts`

Current allowed actions:

- `mark_source_captured`
- `mark_normalized`
- `approve_review`
- `hold_review`
- `reject_review`
- `reset_review`
- `enable_admin_preview`
- `enable_dev_preview`
- `disable_preview`
- `publish`
- `withdraw`

Important rules:

- `enable_dev_preview` requires `reviewState = approved`
- `publish` requires:
  - `reviewState = approved`
  - `ingestState = normalized`
- `withdraw` requires `publishState = published`
- `hold_review` and `reject_review` clear preview and can withdraw publication
- invalid transitions return row-level failure instead of silently mutating state

## Visibility rules by environment

Single derived visibility function:

- `/home/hank/.openclaw/workspace/atelier-orchestrator/packages/domain/src/product-lifecycle.ts`
  - `deriveProductVisibilityDecision(...)`

Storefront read path using it:

- `/home/hank/.openclaw/workspace/atelier-orchestrator/apps/storefront/lib/db-products.ts`

Admin mapped visibility explanation:

- `/home/hank/.openclaw/workspace/atelier-orchestrator/apps/admin/lib/services/db-mappers.ts`
- `/home/hank/.openclaw/workspace/atelier-orchestrator/apps/admin/components/review-detail.tsx`
- `/home/hank/.openclaw/workspace/atelier-orchestrator/apps/admin/components/staging-queue-table.tsx`

Rules:

### Admin preview visibility

Visible when:
- `previewState = admin_only`, or
- `previewState = dev_customer`, or
- `publishState = published`

### Dev customer visibility

Visible when:
- `reviewState = approved`
- `previewState = dev_customer`
- `publishState != withdrawn`

### Customer-visible published state

Published-state candidate when:
- `publishState = published`
- `reviewState = approved`

### Production customer visibility

Visible only when all are true:
- `publishState = published`
- `reviewState = approved`
- `sourceHealth.sourceStatus = active`
- `sourceHealth.needsRevalidation = false`
- `externalSignals.recommendation != deactivate`

### Development customer visibility

Visible when either:
- the production rule passes, or
- dev preview rule passes

## Admin behavior

Admin state machine UI paths:

- `/home/hank/.openclaw/workspace/atelier-orchestrator/apps/admin/components/review-detail.tsx`
- `/home/hank/.openclaw/workspace/atelier-orchestrator/apps/admin/components/review-actions.tsx`
- `/home/hank/.openclaw/workspace/atelier-orchestrator/apps/admin/components/staging-queue-filters.tsx`
- `/home/hank/.openclaw/workspace/atelier-orchestrator/apps/admin/components/staging-queue-table.tsx`
- `/home/hank/.openclaw/workspace/atelier-orchestrator/apps/admin/app/review/actions.ts`

Admin now shows:
- current lifecycle tuple
- current derived visibility mode
- why the product is or is not customer-visible
- only valid state-changing actions
- bulk transition results per row
- lifecycle audit trail

## Storefront behavior

Storefront reads now rely on the lifecycle decision path instead of separate review/visibility booleans:

- `/home/hank/.openclaw/workspace/atelier-orchestrator/apps/storefront/lib/db-products.ts`

Effects:
- browse excludes products whose derived lifecycle visibility is false
- detail route returns `null` for products not customer-visible
- dev preview remains separate from publication
- customer-facing provenance notes reflect whether a record is dev preview or published

## Tests

Lifecycle tests:
- `/home/hank/.openclaw/workspace/atelier-orchestrator/packages/domain/src/product-lifecycle.test.ts`

Storefront visibility tests:
- `/home/hank/.openclaw/workspace/atelier-orchestrator/apps/storefront/lib/db-products.test.ts`
- `/home/hank/.openclaw/workspace/atelier-orchestrator/apps/storefront/vitest.config.ts`

Covered cases:
- valid and invalid state transitions
- dev vs prod visibility
- bulk mixed-success behavior
- storefront exclusion of hidden products

## Migration notes

This phase adds new lifecycle tables but does not yet remove legacy compatibility rows:

- `ProductReviewState`
- `ProductVisibility`

Current implementation mirrors lifecycle writes into those legacy tables so existing code paths do not break during the transition.

Local dev workflow used here:

- `corepack pnpm db:generate`
- `DATABASE_URL='file:./dev.db' corepack pnpm prisma db push`

Future cleanup goal:
- move all callers to lifecycle-native reads
- remove legacy mirrored state only after the old path is fully unused

## Sample transitions

### Example A: manual seed becomes dev preview

Before:
- ingest `manual_seeded`
- review `pending`
- preview `none`
- publish `unpublished`
- visibility mode `not_visible`

Actions:
1. `mark_normalized`
2. `approve_review`
3. `enable_dev_preview`

After:
- ingest `normalized`
- review `approved`
- preview `dev_customer`
- publish `unpublished`
- dev visibility `true`
- prod visibility `false`

### Example B: published product withdrawn

Before:
- ingest `normalized`
- review `approved`
- preview `dev_customer`
- publish `published`
- prod visibility `true` when source health and external signals are safe

Action:
- `withdraw`

After:
- ingest `normalized`
- review `approved`
- preview `none`
- publish `withdrawn`
- customer visibility `false`
- reason includes `publishWithdrawn`
