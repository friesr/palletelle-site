# Environments

## 1. Objective

Define the Atelier frontend environment architecture for development, staging, and production.

## 2. What is known

- Atelier is a trust-first frontend project.
- The system must distinguish development, staging, and production clearly.
- Production-impacting actions are approval-gated.

## 3. What is inferred

- Clear environment separation will reduce risk, improve review quality, and support bounded autonomy.
- Staging previews are important because trust-sensitive UI needs review before release.

## 4. What is uncertain

- Final hosting provider
- Exact backend integration model
- Final release cadence

## 5. Risks

- Environment drift can make staging results misleading.
- Hidden environment behavior can create trust and operational failures.
- Weak separation of secrets can leak sensitive data or distort test conditions.

## 6. Proposed action

Adopt the environment model below.

## 7. Whether approval is required

No, for documentation and planning.

## 8. Next step

Use this model when scaffolding the frontend and CI workflows.

---

## Development

### Purpose
- local implementation
- rapid iteration
- fixture-backed development
- safe autonomous testing

### Characteristics
- local-first
- reversible
- uses fixture or mock data by default
- no production secrets required
- permissive debugging allowed

### Boundaries
- must not depend on production state by default
- must not silently disable trust safeguards
- must not introduce hidden behavior that differs materially from later environments without documentation

## Staging

### Purpose
- preview deployments
- QA and trust review
- validation of customer-facing flows before release

### Characteristics
- production-like build settings
- non-production credentials only
- preview URLs or dedicated staging surface
- automated checks and review-friendly output

### Boundaries
- must remain clearly non-production
- should not use production secrets by default
- medium-risk changes may proceed only with explicit disclosure and attribution
- customer-visible trust-sensitive behavior should be reviewed before promotion

## Production

### Purpose
- customer-facing site delivery

### Characteristics
- protected deployment path
- explicit human approval gate
- minimal necessary secrets
- monitored release history
- rollback target identified before release

### Boundaries
- no autonomous deploys by default
- no production secret changes without approval
- no materially trust-sensitive customer-facing changes without approval
- no destructive or irreversible operations without approval

## Environment differences summary

### Dev vs staging
- dev is for fast local iteration
- staging is for production-like validation and review

### Staging vs production
- staging is reversible and non-customer-facing
- production is customer-facing and approval-gated

### Shared rule
- all material changes affecting data, user experience, or system behavior must be explained, logged, and attributable
