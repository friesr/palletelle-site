# Deployment

## 1. Objective

Define the Atelier frontend deployment model for dev, staging, and production, including approval gates and rollback expectations.

## 2. What is known

- Production deploys are not allowed without explicit approval.
- The project is still pre-implementation.
- The delivery model must support safe previews and deliberate release control.

## 3. What is inferred

- Preview-based staging deploys are the safest default.
- Rollback needs to be designed before the first live release.
- Deployment policy should separate autonomous-safe non-production work from approval-gated production work.

## 4. What is uncertain

- Hosting provider
- CI/CD provider
- release branch strategy

## 5. Risks

- Unreviewed frontend releases can create trust breaches quickly.
- Inadequate rollback planning can turn manageable issues into customer-visible failures.
- Poorly defined approval gates can cause unsafe autonomy or operational confusion.

## 6. Proposed action

Adopt the deployment model below.

## 7. Whether approval is required

No, for planning and documentation.

## 8. Next step

After approval, encode this model into repo scaffolding and non-production workflows only.

---

## Dev deploy model

### How dev deploys work
- local dev server is the default dev deployment mode
- optional developer-hosted preview instances may exist, but remain non-production
- fixture-backed workflows are preferred

### Autonomous-safe in dev
- local scaffolding
- local builds
- route and component creation
- fixture creation and updates
- local tests
- non-secret config changes

### Not allowed autonomously in dev
- committing secrets
- hidden telemetry introduction
- silent weakening of trust checks

## Staging deploy model

### How staging previews work
- reviewed code triggers preview or staging build
- automated tests run against preview when possible
- trust-sensitive UI and wording are reviewed in staging
- staging remains clearly separate from production

### Autonomous-safe in staging
- preview deployments from reviewed code
- non-production environment updates without secrets
- smoke testing
- reversible staging rollback to prior known-good build

### Caution in staging
- if recommendation framing changes materially, disclose explicitly
- if customer-visible screens may be shared externally, review before treating them as representative

## Production deploy model

### How production deploys are gated
- protected release path
- required checks must pass
- explicit approval before deployment
- release notes and trust-sensitive changes summarized
- environment changes recorded and attributable

### Production actions requiring explicit approval
- production deployment
- production env var changes
- DNS or domain changes
- credential or token updates
- customer-visible trust-sensitive recommendation changes
- release of materially changed copy related to pricing, fit, inventory, or color certainty
- disabling checks, safeguards, or monitoring

## Rollback strategy

### Principles
- prefer immutable deployment artifacts
- maintain a known-good previous release target
- log rollback decisions and attribution
- bias toward rollback when customer trust is at risk

### Staging rollback
- may be autonomous when reversible, non-production, and logged

### Production rollback
- requires explicit human approval unless already covered by an approved emergency procedure
- should be ready before first launch
- should trigger when trust-sensitive issues, rendering failures, or unsupported factual claims appear
