# Product Database Foundation

## 1. Objective

Document the first real Palletelle database foundation, including schema boundaries, what is DB-backed now, what remains fixture-backed, and how trust separation is preserved.

## 2. What is known

- Palletelle needs to move beyond large fixture files.
- Trust requires strict separation between source facts, normalized facts, inferred fields, review state, visibility, source health, and external monitoring signals.
- Live affiliate APIs are not yet connected.
- External Amazon feedback is allowed only as an internal risk signal, not public site-owned review content.

## 3. What is inferred

- A local-first SQLite database with typed access is the best current stepping stone.
- The system should expose DB-backed records through a service/data layer instead of page-local queries or raw fixture imports.

## 4. What is uncertain

- Final production database choice.
- Whether storefront will eventually query the DB directly or through an internal API/service layer.
- Exact future agent execution model for source validation and external monitoring.

## 5. Risks

- Collapsing multiple trust boundaries into one table would damage the trust model.
- Over-migrating everything at once would create fake completeness.
- External review/reputation data must not be confused with Palletelle-owned customer reviews.

## 6. Proposed action

Use the schema and service boundaries below as the first real DB foundation.

## 7. Whether approval is required

No, for local development schema and service foundation.

## 8. Next step

Keep building through the service/data layer, then replace remaining fixtures selectively where it is honest and operationally useful.

---

## DB tool choice

Chosen approach:
- **Prisma**
- **SQLite**

Why:
- local/dev-safe
- strong TypeScript support
- clear schema for separated trust domains
- straightforward migration path later to a production DB engine

## Schema overview

Implemented schema entities include:

- `Product`
- `ProductSourceData`
- `ProductPriceSnapshot`
- `ProductNormalizedData`
- `ProductInferredData`
- `ProductReviewState`
- `ProductVisibility`
- `ProductSourceHealth`
- `ExternalProductSignals`
- `CustomerReview`
- `ReviewSummary`
- `Ensemble`
- `EnsembleItem`
- `AffiliateConfig`
- `User`
- `UserProfile`
- `ColorProfile`
- `PreferenceProfile`
- `SavedProduct`
- `SavedEnsemble`
- `AuthMethod`
- `MFAEnrollment`

## Entity boundaries

### Product identity
`Product`
- stable product identity
- independent of review and display state

### Source facts
`ProductSourceData`
- affiliate/source platform
- source identifier
- retrieval timestamp
- raw source fields and field-map snapshot

### Price history
`ProductPriceSnapshot`
- point-in-time tracked price records
- linked to both `Product` and the specific `ProductSourceData` listing observed
- raw `priceText`
- optional parsed numeric amount/currency when safely extractable
- capture method / source reference / notes

Important boundary:
Do not claim a price drop or lowest observed price unless the DB has enough tracked numeric snapshots to support it.

### Normalized facts
`ProductNormalizedData`
- Palletelle-standardized factual representation
- kept separate from raw source and inference

### Inferred fields
`ProductInferredData`
- palette/style interpretation
- confidence framing
- missing/uncertain attributes
- explicitly separated from facts

### Review/staging state
`ProductReviewState`
- discovered
- normalized
- needs_review
- approved
- rejected
- stale
- needs_refresh

### Public visibility
`ProductVisibility`
- `isPublic`
- `intendedActive`
- notes

Important:
public visibility is **not** a single-flag publish switch.
Displayability must remain derived from:
- visibility flags
- review state
- source health
- trust/freshness rules
- external risk recommendations where appropriate

### Source health / validation
`ProductSourceHealth`
- `sourceStatus`
- `lastSourceCheckAt`
- `sourceCheckResult`
- `needsRevalidation`
- `revalidationReason`

This is where a future source validation agent can write its findings.

### External reputation / quality monitoring
`ExternalProductSignals`
- `reputationState`
- `lastExternalCheckAt`
- complaint/risk flags
- recommendation: `hold`, `deactivate`, `needs_review`

Important boundary:
This is for internal monitoring only.
It does **not** mean Amazon review text or star ratings are licensed for public display on Palletelle.

### Palletelle customer reviews
`CustomerReview`
- Palletelle-owned customer review content
- moderation status

`ReviewSummary`
- internal summary / moderation / complaint trend aggregation

This is structurally separate from external source feedback.

### Ensembles
`Ensemble`
- ensemble identity
- rationale
- profile relevance metadata

`EnsembleItem`
- product link
- role in outfit
- order
- notes

### Affiliate/store configuration
`AffiliateConfig`
- platform
- store name
- associate/store ID
- API status
- enabled state
- freshness defaults
- connection notes

### Customer foundation
Included for future use:
- `User`
- `UserProfile`
- `ColorProfile`
- `PreferenceProfile`
- `SavedProduct`
- `SavedEnsemble`
- `AuthMethod`
- `MFAEnrollment`

These prepare the DB for future customer accounts, passkeys, MFA, and saved state without pretending those flows are already implemented.

## What is DB-backed now

DB-backed now:
- local product identity and separated product data tables
- local review/workflow state
- local visibility state
- local source-health state
- local external signal scaffolding
- local ensemble records
- local affiliate config
- admin service/data reads through Prisma-backed service functions
- storefront browse page through a DB-aware product read service

## What remains fixture-backed now

Still fixture-backed or partially fixture-backed in this phase:
- most storefront presentation flows beyond the browse page read-through
- admin editing persistence
- source validation agent execution
- external reputation monitoring agent execution
- Palletelle customer review submission/moderation flow
- customer auth/profile runtime flows
- live affiliate API connectivity

## Service/data layer pattern

DB-backed service layer now lives in admin at:
- `apps/admin/lib/services/review-service.ts`
- `apps/admin/lib/services/product-service.ts`
- `apps/admin/lib/services/config-service.ts`
- `apps/admin/lib/services/ensemble-service.ts`
- `apps/admin/lib/services/db-mappers.ts`

Storefront DB-aware read-through added at:
- `apps/storefront/lib/db-products.ts`

These keep pages thin and make future fixture-to-DB migration less disruptive.

## How public visibility works

Public visibility remains a derived decision, not one flag.

The current domain helper models this principle in:
- `packages/domain/src/product-db.ts`

Current displayability assessment considers:
- public intent flags
- review approval state
- source health
- revalidation need
- external deactivate recommendations

## Future source validation agent fit

A future source validation agent may:
- update source health fields
- update last source check timestamps
- flag products for revalidation
- support safe suppression of misleading stale source fields

It must not:
- publish products directly
- invent facts
- override admin review
- weaken trust/freshness rules

## Future external reputation monitoring fit

A future external monitoring agent may:
- monitor external quality/risk signals
- flag complaint patterns
- flag low-rating risk
- recommend hold/deactivate/review

It must not:
- directly publish or remove products outside workflow rules
- treat external source feedback as Palletelle-owned review content
- weaken disclosure or attribution rules

## Local setup

Example local setup uses:
- `DATABASE_URL="file:./dev.db"`

Commands:

```bash
corepack pnpm db:generate
corepack pnpm db:push
corepack pnpm db:seed
```
