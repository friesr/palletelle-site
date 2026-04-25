# Rollback Expectations

## 1. Objective

Define rollback expectations for the Atelier frontend delivery model before the first live deployment exists.

## 2. What is known

- Production rollback expectations must be documented before release work.
- The project is still pre-implementation.

## 3. What is inferred

- Rollback should be simple, attributable, and fast for the frontend shell.
- The first delivery design should prefer deployment models with straightforward version rollback.

## 4. What is uncertain

- Final hosting platform
- Whether backend dependencies will exist by milestone one

## 5. Risks

- Without rollback expectations, production deployment pressure can lead to unsafe improvisation.
- Frontend issues can still damage trust even when no database changes are involved.

## 6. Proposed action

Adopt the expectations below and refine once hosting is chosen.

## 7. Whether approval is required

No, for documentation.

## 8. Next step

Review and then encode these expectations into deployment tooling later.

---

## Rollback principles

- Prefer immutable deployment artifacts.
- Every production release should have a clear previous version to restore.
- Rollback should be attributable and logged.
- If trust-sensitive behavior is in doubt, bias toward rollback.
- If rollback risk is unknown, escalate instead of guessing.

## Development rollback expectations

- Local changes should be reversible through git and local config resets.
- Developers and agents may discard local preview work freely if no data loss is involved.

## Staging rollback expectations

- Staging should support reverting to the prior known-good build.
- Rollback may be autonomous if non-production, reversible, and clearly logged.
- If staging rollback could hide a material issue from review, explain that explicitly.

## Production rollback expectations

- Production rollback requires a defined target version.
- Production rollback requires explicit human approval unless it is part of an already approved emergency procedure.
- Rollback should be considered when:
  - customer-visible trust issues appear
  - critical rendering failures occur
  - environment misconfiguration affects behavior
  - unsupported factual claims are exposed

## Minimum release note for rollback readiness

Before any production release, record:
- release identifier
- approver
- major surfaces changed
- trust-sensitive surfaces changed
- rollback target
- smoke-check plan
