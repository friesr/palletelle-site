# Repository Structure Plan

## 1. Objective

Define the recommended repository structure for Atelier frontend delivery.

## 2. What is known

- The repository already uses an early monorepo-style layout.
- The frontend app will live in `apps/storefront/`.

## 3. What is inferred

- Domain and trust logic should remain in separate packages so they can be tested and reviewed independently.

## 4. What is uncertain

- Whether additional apps such as admin tools will be needed later.

## 5. Risks

- Poor separation could blur factual data handling with presentational logic.

## 6. Proposed action

Use the structure below as the initial delivery plan.

## 7. Whether approval is required

No, for planning.

## 8. Next step

Use this structure when implementation scaffolding begins.

---

## Planned structure

- `apps/storefront/`
  - frontend app
  - routes, layouts, pages, and presentational components
- `packages/domain/`
  - product schemas
  - provenance models
  - palette and ensemble reasoning types
  - confidence and explanation structures
- `packages/trust/`
  - trust copy constraints
  - audit helpers
  - decision logging helpers
  - release and wording checks
- `data/fixtures/`
  - sample product data
  - clearly marked synthetic or sourced fixtures
- `docs/architecture/`
  - environment and system design
- `docs/policies/`
  - governance, deployment, approval, and rollback policies

## Optional later additions

- `packages/ui/` shared design system components
- `apps/storybook/` isolated UI review surface
- `packages/config/` shared lint, test, and TypeScript config
