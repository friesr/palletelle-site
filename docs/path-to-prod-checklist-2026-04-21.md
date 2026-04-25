# Path to production checklist - 2026-04-21

## Executive goal
Move from planning-heavy, partially working development posture to a launch-ready Palletelle production posture through a controlled checklist with named owners, explicit gates, and evidence-based completion.

Production is blocked until all critical pre-launch gates are satisfied.

---

## Gate 0 - environment stability and change discipline
**Owner:** Hank (main), Titus, Noah

### Actions
- [ ] Reconfirm local/staging web services can be started, restarted, and health-checked reliably
- [ ] Stop treating unstable dev service state as acceptable for launch progress
- [ ] Adopt per-change discipline for risky auth/security/data work:
  - backup/recovery point
  - exact change
  - validation
  - rollback
  - post-change test
- [ ] Define a lightweight release log for major environment/auth/data changes

### Evidence required
- app health checks pass after restart
- documented change discipline exists in repo and is followed
- recent outage/restart issues are understood well enough to avoid repeat chaos

### Gate outcome
- **Gate 0 passes only when environment changes are controlled and repeatable**

---

## Gate 1 - security leadership and launch-security plan
**Owners:** Noah (lead), Isaac (data layer), Hank (approval/orchestration)

### Actions
- [x] Complete admin-auth quick audit
- [x] Complete DB/data-security assessment
- [x] Produce security production-readiness plan
- [x] Produce security execution sequence with backup/validation/rollback discipline
- [ ] Convert plan into implementation tasks with explicit approval boundaries
- [ ] Identify which changes are safe/read-only/planning only versus which require Rodney approval before execution

### Evidence required
- `docs/security-admin-auth-quick-audit-2026-04-21.md`
- `docs/db-security-assessment-2026-04-21.md`
- `docs/security-production-readiness-plan-2026-04-21.md`
- `docs/security-execution-sequence-2026-04-21.md`
- implementation task breakdown with approval boundaries

### Gate outcome
- **Gate 1 passes when security has a real owner, a real plan, and a controlled execution path**

---

## Gate 2 - admin auth hardening and safe owner migration
**Owners:** Noah (lead), Isaac (data model), Titus (implementation support)

### Actions
- [ ] Design named admin identity model
- [ ] Design passkey-first / MFA-required admin auth target
- [ ] Define Rodney-safe migration sequence
- [ ] Define break-glass recovery path
- [ ] Define brute-force protection plan for admin auth
- [ ] Define session management and revocation approach
- [ ] Implement admin auth changes in staging first
- [ ] Verify Rodney can log in through the new path before old path is retired
- [ ] Retire shared/generic env-seeded admin logic only after successful cutover

### Gating activities
- Rodney access preserved at every stage
- rollback path tested before removing old admin path
- no live cutover without validation success

### Evidence required
- migration runbook
- validation checklist
- rollback checklist
- proof of staging login success
- proof of Rodney-safe cutover plan

### Gate outcome
- **Gate 2 passes when admin access is named, auditable, strongly authenticated, and migration-safe**

---

## Gate 3 - database and data protection foundation
**Owners:** Isaac (lead), Noah (security review), Titus (platform implementation)

### Actions
- [ ] Approve production DB target (recommended: PostgreSQL)
- [ ] Stand up staging DB on production-like architecture
- [ ] Move off SQLite/dev.db for any real pre-launch environment
- [ ] Introduce checked-in migrations
- [ ] Define backup and restore process
- [ ] Complete at least one restore test into a fresh environment
- [ ] Define data-domain separation for:
  - catalog/product
  - customer auth/profile
  - admin/security audit
  - billing/subscription
- [ ] Tighten secret storage and reduce env-file sprawl

### Gating activities
- no real-user environment on SQLite
- restore test must succeed
- migration path must be repeatable
- secrets cannot remain casually scattered in app-local files

### Evidence required
- DB decision record
- migration baseline in repo
- restore test record
- secret-handling plan
- least-privilege DB/access model

### Gate outcome
- **Gate 3 passes when the data layer is production-grade, recoverable, and migration-safe**

---

## Gate 4 - customer identity, PII handling, communications, and billing boundary
**Owners:** Noah (security), Isaac (data), Titus (platform), Leah (customer UX), Rodney (provider setup at cutover)

### Actions
- [ ] Replace browser-only profile persistence for real customer flows with server-backed identity/profile records
- [ ] Define PII classes and encryption requirements
- [ ] Define key custody, recovery-key backup, and restore/recovery testing approach
- [ ] Define customer auth direction: passwordless-first / passkeys preferred
- [ ] Define recovery path that does not create weak fallback abuse
- [ ] Design email capability for auth/security/billing communications
- [ ] Design SMS capability for recovery/security alerts if used
- [ ] Build and test auth/recovery/notification flows with simulation first
- [ ] Produce Rodney cutover checklist for real email/SMS provider setup
- [ ] Select payment processor boundary and tokenization approach
- [ ] Define what billing data is stored and what is never stored
- [ ] Define audit requirements for billing/admin-sensitive actions

### Gating activities
- no real customer PII relying on localStorage-only flows
- no billing without processor boundary and webhook/security design
- no sensitive PII launch without encryption and recovery-key plan
- no auth cutover without email capability ready
- no SMS dependency without explicit policy on when SMS is used
- provider setup tasks for Rodney must be explicit before cutover

### Evidence required
- auth/customer identity design
- PII encryption/key management decision
- communications design for email/SMS flows
- simulation test evidence for verification/recovery/alerts
- Rodney provider setup checklist
- payment/billing security boundary doc
- storage/retention matrix

### Gate outcome
- **Gate 4 passes when customer identity, sensitive data handling, and communications/recovery paths are safe enough for real users**

---

## Gate 5 - commerce pipeline readiness
**Owners:** Ada (lead), Ruth (review policy), Ezra (validation/enrichment), Hank (accountability)

### Actions
- [ ] Report hard funnel counts:
  - discovered
  - auto-rejected
  - held
  - validation
  - ready
  - published
- [ ] Separate net-new pipeline volume from Rodney-seeded items
- [ ] Prove candidate throughput at scale
- [ ] Deepen publishable assortment beyond current manually seeded baseline
- [ ] Enforce modesty policy consistently
- [ ] Keep Rodney’s queue exception-only
- [ ] Improve same-day freshness verification process

### Gating activities
- pipeline progress must be measured by verified counts, not candidate memos
- launch assortment must be broad enough to feel intentional, not skeletal
- publishing cannot leak incomplete/unverified product records

### Evidence required
- hard funnel report
- net-new product counts
- launch-ready assortment list
- same-day verification evidence/process

### Gate outcome
- **Gate 5 passes when commerce shows real scalable intake and a credible launch assortment**

---

## Gate 6 - product enrichment and public-readiness rules
**Owners:** Ezra (lead), Ada, Titus, Leah

### Actions
- [ ] Define minimum public product-readiness fields
- [ ] Block or suppress products missing required public fields such as:
  - brand
  - price
  - color
  - usable imagery/metadata
- [ ] Normalize color data and confidence handling
- [ ] Ensure staging/enrichment text does not leak to customer-facing surfaces
- [ ] Improve internal review UI to make approval-at-scale practical

### Gating activities
- no public product leakage of placeholder/staging-grade data
- customer-facing product views must feel curated and trustworthy

### Evidence required
- readiness rules in code/spec
- suppression/fallback logic implemented
- reviewed product-page examples before/after

### Gate outcome
- **Gate 6 passes when storefront products are publicly trustworthy and presentable**

---

## Gate 7 - customer-facing UI and brand execution
**Owners:** Leah (customer UI lead), Iris (brand system), Titus (support where platform changes are needed)

### Actions
- [ ] Extend the Palletelle brand system beyond homepage into:
  - browse
  - product pages
  - registration
  - subscription messaging
  - account area
- [ ] Make the customer journey feel premium, intentional, and motivating
- [ ] Ensure responsive behavior is truly desktop-aware and mobile-aware
- [ ] Improve registration/profile onboarding clarity and appeal
- [ ] Resolve weak/vanilla styling that undermines premium positioning

### Gating activities
- customer experience must feel launchable, not like a draft or template
- major customer routes must be coherent, branded, and polished

### Evidence required
- updated live routes/components
- visual review against brand brief
- responsive validation across major layouts

### Gate outcome
- **Gate 7 passes when the customer experience looks and feels worthy of launch**

---

## Gate 8 - admin command center readiness
**Owners:** Titus (lead), Noah (security visibility requirements), Hank (executive standard)

### Actions
- [ ] Complete command-center dashboard to spec
- [ ] Ensure minimal-scroll executive cockpit behavior
- [ ] Finish strong nav / left-rail / mobile-aware admin navigation
- [ ] Improve alerting, inbox, and quick-add intake visibility
- [ ] Support approval-at-scale workflow cleanly
- [ ] Make graphs communicate good/bad instantly

### Gating activities
- admin root must function as a true command center
- dashboard must support both operational action and executive judgment

### Evidence required
- visible dashboard implementation
- chart/status/alert/inbox/quick-add working on root surface
- executive review pass

### Gate outcome
- **Gate 8 passes when admin is a real command center, not a partial dashboard experiment**

---

## Gate 9 - billing and subscription readiness
**Owners:** Noah (security), Isaac (data), Titus (platform), Ruth (policy/ops)

### Actions
- [ ] Finalize subscription/payment design boundaries
- [ ] Choose processor integration approach
- [ ] Confirm offset/credit handling rules
- [ ] Define webhook verification and billing audit paths
- [ ] Define admin visibility/control boundaries for billing operations
- [ ] Ensure no card data is stored directly

### Gating activities
- billing cannot launch as an afterthought
- security, auditability, and customer clarity must be in place first

### Evidence required
- payment boundary doc
- subscription state model
- webhook/security design
- billing admin controls plan

### Gate outcome
- **Gate 9 passes when billing is safe, bounded, and understandable**

---

## Gate 10 - launch campaign and growth-readiness
**Owners:** marketing-manager (lead), Iris (brand), Leah (customer experience), Ruth (ops/policy), Hank (coordination), Rodney (final direction/approval)

### Actions
- [ ] Define the Palletelle launch campaign concept
- [ ] Define target audience segments for launch
- [ ] Define core launch messages and offer framing
- [ ] Define the launch funnel from ad -> landing -> registration -> profile -> recommendation
- [ ] Recommend launch ad types and creative needs
- [ ] Define which channels are in-scope for launch
- [ ] Define minimal measurement plan for launch performance
- [ ] Ensure marketing claims match actual product/security/readiness reality
- [ ] Produce a founder external accounts register listing every Google/Meta/email/SMS/payment/ops account Rodney needs to create or verify for launch
- [ ] Produce a Rodney review packet with campaign recommendation, ad requirements, and required external account setup tasks

### Gating activities
- no launch without a clear campaign story
- no ads without matching landing/registration readiness
- no marketing promises that the product cannot yet fulfill

### Evidence required
- launch campaign brief
- launch channel/ad recommendation list
- creative asset requirements
- funnel map and success metrics
- founder external accounts register
- Rodney review/approval packet

### Gate outcome
- **Gate 10 passes when launch marketing is coherent, realistic, and ready to support launch**

---

## Gate 11 - final launch review
**Owners:** Hank (lead), Rodney (go/no-go), all domain leads

### Actions
- [ ] Review all prior gates for evidence, not optimism
- [ ] Confirm unresolved issues are explicitly accepted or blocked
- [ ] Verify system stability, security, catalog depth, UI quality, admin readiness, and launch campaign readiness together
- [ ] Produce launch recommendation: go / no-go / limited beta

### Gating activities
- no launch on vibes
- no launch on partial assumptions
- go/no-go must be based on explicit evidence from each gate

### Evidence required
- completed checklist with owners and proofs
- risk register for any deferred items
- executive go/no-go note

### Gate outcome
- **Launch only if critical gates are truly complete**

---

## Rodney-owned cutover/setup tasks
These are tasks Rodney should expect to own when the team is ready for real provider hookup and cutover.

### Email provider setup
- [ ] Create/approve production email provider account
- [ ] Verify sending domain
- [ ] Configure SPF, DKIM, and DMARC
- [ ] Approve production sender identities
- [ ] Provide secret hookup path/credentials to the deployment environment

### SMS provider setup (if used)
- [ ] Create/approve SMS provider account
- [ ] Provision sender number or messaging service
- [ ] Complete any required compliance/registration steps
- [ ] Provide secret hookup path/credentials to the deployment environment
- [ ] Confirm approved regions/use cases

### Policy/approval decisions Rodney must make
- [ ] Approve which flows may use email
- [ ] Approve which flows may use SMS
- [ ] Confirm whether SMS is fallback-only, recovery-only, alerts-only, or broader
- [ ] Approve cutover timing once simulated flows are validated

## Immediate next actions
1. Turn Gates 2, 3, and 4 into implementation-ready tasks under Noah and Isaac, including communications readiness and Rodney-owned provider setup tasks.
2. Force Ada to report real commerce funnel counts and net-new throughput.
3. Put Leah explicitly on customer UI execution and continue Iris on brand system direction.
4. Push Titus to complete the admin command center as a real operational surface.
5. Put marketing-manager on launch campaign, ad plan, and launch funnel definition work.
6. Reassess launch timing only after critical security/data, communications, commerce/UI, and launch campaign gates materially move.
