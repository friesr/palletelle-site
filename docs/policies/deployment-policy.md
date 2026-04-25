# Deployment Policy

## 1. Objective

Define how Atelier frontend changes move through development, staging, and production while preserving trust, safety, and rollback readiness.

## 2. What is known

- Production-impacting actions require explicit approval under workspace governance.
- The frontend has not yet been implemented.
- The user wants protected production deployment rules defined before action.

## 3. What is inferred

- The delivery model should optimize for safe previews and deliberate production release.
- Deployment policy should distinguish autonomous-safe actions in development and staging from approval-gated production actions.

## 4. What is uncertain

- Final hosting vendor
- Final CI provider
- Release cadence

## 5. Risks

- Shipping misleading copy or unstable behavior to production could damage trust quickly.
- Weak release controls could let unreviewed changes bypass governance.

## 6. Proposed action

Adopt the policy below.

## 7. Whether approval is required

No, for drafting policy.

## 8. Next step

Review and approve before implementation-specific CI or hosting setup.

---

## Environment Policy

### Development
Purpose:
- individual and collaborative implementation
- local testing
- reversible experimentation

Default rule:
- autonomous execution allowed for low-risk reversible work

### Staging
Purpose:
- preview validation
- trust review
- non-production integration verification

Default rule:
- autonomous execution allowed for low-risk and some medium-risk reversible work with explicit disclosure in logs

### Production
Purpose:
- customer-facing release

Default rule:
- approval-gated

## Autonomous-safe actions in development

Allowed without explicit approval:
- create, edit, and remove local reversible code
- run local dev servers and tests
- create fixtures and mock integrations
- create preview-safe UI copy drafts clearly marked in code review context
- add non-secret environment examples
- run local lint, unit, and e2e checks

Conditions:
- changes must remain reversible
- no production credentials
- no destructive data operations
- no silent disabling of trust safeguards

## Autonomous-safe actions in staging

Allowed without explicit approval when non-production and reversible:
- generate preview builds
- run automated tests
- validate staging-only configuration
- update staging-only non-secret variables
- rollback staging to a prior known-good non-production build
- test trust presentation and recommendation wording with fixture or staging data

Conditions:
- disclose medium-risk uncertainty explicitly
- attribute the change
- do not present staging as production truth
- do not use production secrets or production-only integrations unless already approved

## Actions requiring explicit approval in production

Never proceed without explicit approval for:
- production deploys
- production environment variable creation or modification
- DNS or domain changes
- credential or token changes
- release of new customer-visible recommendation logic
- release of materially changed copy affecting trust, pricing, availability, fit, or color certainty
- disabling checks, safeguards, or monitoring
- rollback actions that may affect data integrity or customer behavior unexpectedly

## Release requirements for production

Before release:
- required checks pass
- deployment diff is attributable
- environment changes are recorded
- material trust-sensitive changes are summarized
- rollback path is identified
- explicit approval is recorded

After release:
- run smoke checks
- verify key pages render
- verify environment markers and critical integrations
- log outcome and any follow-up risk
