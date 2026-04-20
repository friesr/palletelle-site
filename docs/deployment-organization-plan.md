# Deployment Organization Plan

## Objective

Restructure Atelier for a simpler launch model where `main` acts as CEO/front desk/orchestrator and specialist agents operate as focused business-unit leads or bounded helpers. The goal is to get the dev environment ready to move toward staging and production without depending on a separate always-on orchestrator persona.

## Operating Model

### Executive Layer

#### main
- **Job title:** CEO and Orchestration Lead
- **Mission:** Own priorities, sequencing, approvals, cross-unit coordination, and final accountability across Atelier and future ventures.
- **Responsibilities:**
  - define priorities and approve deployment sequencing
  - coordinate all agent work across business units
  - enforce approval, trust, security, and budget gates
  - decide when to spawn bounded helper agents
  - manage multiple ventures from one central executive layer

## Core Business Units

### 1. Product Intelligence Unit
Purpose: discover, validate, enrich, and organize trustworthy products for launch.

#### Ada, Product Ingestion and Normalization Lead
- source candidate products
- apply modesty filter at intake
- preserve source vs normalized vs inferred data separation
- stage products for review

#### Ruth, Truth and Quality Lead
- remove clearly disqualifying products
- flag uncertain cases for human review
- enforce truth/provenance boundaries
- monitor quality risks and counterfeit/discontinued issues

#### Ezra, Product Validation, Enrichment, and Content Intelligence Lead
- validate product information against external references
- enrich incomplete records and maintain freshness
- track price and link integrity
- generate internal-only descriptive/supporting content
- clearly separate verified facts, derived structured data, and internally generated content

#### Ensemble Design Agent, Color Season and Wardrobe Grouping Lead
- study and apply the color season framework
- group vetted products into coherent wardrobes/ensembles
- produce subjective style/grouping intelligence for the site
- consume only products that have passed through Ada, Ruth, and Ezra
- never act as source-of-truth authority for product facts

### Product Pipeline
1. Ada finds and stages products.
2. Ruth filters/removes/flags based on trust and quality.
3. Ezra validates, enriches, and prepares internal generated content.
4. Ensemble Design Agent creates color-season groupings and wardrobe logic.

### 2. Platform and Delivery Unit
Purpose: build, ship, and operate the application safely.

#### Leah, Frontend Lead
- storefront and admin UX
- trust-safe presentation
- clear separation of subjective guidance vs product facts

#### Titus, Backend and Operations Lead
- API/server logic
- orchestration plumbing
- deployment and ops workflows
- model usage and budget monitoring

#### Isaac, Database Administrator
- schema governance
- backups and recoverability
- data durability and safety
- production-facing database risk posture

### 3. Security and Risk Unit
Purpose: protect production safety and compliance.

#### Noah, Systems and Security Lead
- security posture reviews
- infra hardening and exposure review
- auth/access and deployment risk review
- cross-cutting security signoff for staging/prod readiness

### 4. Advisory Bench
Purpose: provide direction when needed without adding standing complexity.

- CFO, advisory only
- CIO, advisory only
- CTO, advisory only
- Mark, deferred

## Launch-Critical Team

The minimum production-ready operating spine is:
- main, CEO/orchestrator
- Noah
- Ada
- Ruth
- Ezra
- Ensemble Design Agent
- Leah
- Titus
- Isaac

## Staging Readiness Gate

Before promoting dev toward staging, the system should prove:
- `main` owns orchestration and approval flow cleanly
- product pipeline works end-to-end: Ada -> Ruth -> Ezra -> Ensemble
- Leah/Titus/Isaac can move vetted data into trustworthy site/admin flows
- Noah signs off on deployment posture and exposure risk
- data/change/rollback expectations are documented
- all internally generated content is clearly separated from sourced truth
- color-season grouping operates only on vetted product inputs

## Recommended Build Order

1. Confirm `main` is the only standing executive/orchestrator identity.
2. Stand up the Product Intelligence Unit first:
   - Ada
   - Ruth
   - Ezra
   - Ensemble Design Agent
3. Stand up Platform and Delivery:
   - Titus
   - Isaac
   - Leah
4. Stand up Noah as cross-cutting production gatekeeper.
5. Run one end-to-end dev workflow and document blockers before staging.

## Deployment Notes

- Prefer a smaller set of clear standing leads and use short-lived helper agents for bounded work.
- Keep agent outputs attributable to the owning lead.
- Do not recreate the old pattern of mixed duplicate orchestrator identities.
- Future ventures should reuse this structure: central executive layer, venture-specific business units, bounded helper agents.
