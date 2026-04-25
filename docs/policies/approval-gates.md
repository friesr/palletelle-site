# Approval Gates

## 1. Objective

Define clear approval boundaries for Atelier frontend delivery work.

## 2. What is known

- Workspace governance already requires approval for destructive, irreversible, production-impacting, credential-affecting, or high-blast-radius actions.
- The user specifically requested approval guidance for frontend delivery.

## 3. What is inferred

- Frontend delivery needs a more specific operational checklist so autonomous work remains bounded.

## 4. What is uncertain

- Which provider-specific controls will ultimately enforce these gates

## 5. Risks

- Ambiguous approval boundaries can cause either unsafe autonomy or unnecessary stalls.

## 6. Proposed action

Adopt the following approval gates.

## 7. Whether approval is required

No, for drafting these gates.

## 8. Next step

Use these gates when implementation and deployment workflows are added.

---

## Approval gate matrix

### No approval required

Allowed when low-risk, reversible, and non-production:
- local scaffolding
- local refactors
- fixture creation
- component development
- local testing
- preview-safe staging validation
- documentation updates

### Explicit disclosure, no approval usually required

Allowed in development or staging when reversible, but must be explained and logged:
- medium-risk UI changes that could confuse reviewers
- staging configuration adjustments without secrets
- recommendation wording experiments in non-production
- trust presentation changes under review

### Explicit approval required

Required before proceeding with:
- any production deploy
- any production secret or environment change
- customer-visible release of new trust-sensitive behavior
- removal or weakening of validation checks
- any destructive migration or irreversible content operation
- large catalog imports or changes that could affect recommendations materially
- auth, networking, or domain changes

### Stop and escalate immediately

Do not proceed autonomously when there is:
- active security exposure
- trust breach risk
- known misrepresentation in release candidate behavior
- uncertain rollback for a production-impacting change
- conflicting evidence on customer-visible factual behavior
