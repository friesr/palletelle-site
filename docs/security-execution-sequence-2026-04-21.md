# Security execution sequence, 2026-04-21

## Purpose
This sequence turns the production-readiness plan into a safer implementation order with explicit backup, validation, rollback, and post-change testing. It is designed to reduce the chance of lockout, data loss, or overlapping auth/security failures during the move from development posture to production-safe posture.

## Operating rules
For every risky step, capture and retain:
1. pre-change state
2. backup or recovery point
3. exact change
4. immediate validation checks
5. rollback path
6. post-change test

Additional rules:
- Do not combine multiple risky auth or data-path changes in one deployment.
- Preserve Rodney access throughout all admin-auth migrations.
- Prefer staging-first validation, then production.
- No real customer launch, billing launch, or production admin operations until all critical launch gates are complete.
- Any change that affects live auth, secrets, DB connectivity, or recovery paths requires explicit approval before production execution.

## Safest first implementation slice
The safest first slice is the one that creates safety rails before live-behavior cutovers:
1. stand up staging PostgreSQL
2. introduce checked-in Prisma migrations
3. add backup and restore runbooks plus an actual restore test
4. baseline audit-event schema and logging plumbing in staging
5. define named admin identity models and break-glass process in staging only

Why this is first:
- it improves recovery and change control before touching live login paths
- it surfaces migration issues before production
- it creates the evidence needed for later high-risk auth cutovers

## What can be done now vs what waits for explicit approval

### Can be audited, designed, and prepared immediately
- architecture decisions and schema design
- staging PostgreSQL provisioning
- Prisma migration setup and migration baselines
- backup automation design and restore rehearsal in staging
- audit log schema and event taxonomy
- secrets inventory and consolidation plan
- admin/account role model design
- customer identity model design to replace browser-local-only storage
- payment processor boundary design
- pre-launch security gate checklist and evidence collection format

### Requires explicit approval before changing live behavior
- changing production database engine or connection target
- modifying live auth flows
- enabling or disabling seeded env-admin access
- creating or changing real production admin accounts
- rotating production secrets or moving live apps to a new secret source
- migrating any real customer/admin data
- enabling billing-related live integrations
- any production cutover that could affect Rodney access, login continuity, or data availability

## Execution sequence

### Phase 0, freeze unsafe launch assumptions
**Goal:** prevent accidental launch on the current posture.

**Pre-change state**
- Document current dev posture: SQLite, env-seeded admin, JWT-only admin sessions, localStorage customer profile flow, current secret sources.

**Backup or recovery point**
- Snapshot repo state and deployment config references.
- Archive current environment variable inventory and deployment manifests in a restricted internal location.

**Exact change**
- Declare a launch block for real customer accounts, billing, and production admin operations until critical gates pass.
- Mark SQLite and `db push` as non-production-only.

**Immediate validation checks**
- Written decision recorded.
- Team-aligned list of blocked launch capabilities exists.

**Rollback path**
- None needed for documentation/governance change, but remove block only through explicit gate review.

**Post-change test**
- Confirm future work references the launch block and production requirements.

---

### Phase 1, establish production-safe database workflow in staging
**Goal:** replace ad hoc schema evolution with a recoverable staging baseline.

**Pre-change state**
- Capture current Prisma schema, SQLite file locations, seed behavior, and any `db push` usage.

**Backup or recovery point**
- Copy current dev SQLite database files.
- Tag current repository state.

**Exact change**
- Provision staging PostgreSQL.
- Introduce checked-in Prisma migrations.
- Build initial schema baselines for admin users/roles/sessions, customer identity/profile, and audit events.
- Reconfigure staging to use PostgreSQL only.

**Immediate validation checks**
- Fresh staging environment can bootstrap from migrations alone.
- No staging path depends on SQLite.
- Seed scripts are non-destructive and environment-safe.

**Rollback path**
- Revert repository changes.
- Point staging back to prior non-production configuration if needed.
- Restore copied SQLite dev data for local recovery.

**Post-change test**
- Create a fresh empty staging DB, apply migrations, run app smoke tests, and verify basic reads/writes.

---

### Phase 2, prove backup and restore before any live migration
**Goal:** create evidence that recovery works.

**Pre-change state**
- Document backup coverage gaps and current restore capability.

**Backup or recovery point**
- Baseline staging database snapshot before backup tooling changes.

**Exact change**
- Configure automated staging backups and retention.
- Write restore runbook.
- Perform restore into a fresh isolated environment.

**Immediate validation checks**
- Backup artifacts are created successfully.
- Restore completes without manual improvisation.
- Restored environment starts and passes integrity checks.

**Rollback path**
- Disable faulty backup automation and revert to known-good staging setup.
- Preserve failed-run artifacts for debugging.

**Post-change test**
- Time a full restore rehearsal and record achieved RPO/RTO.

---

### Phase 3, centralize secrets before auth cutover
**Goal:** reduce secret sprawl and unsafe fallback patterns.

**Pre-change state**
- Inventory all secrets in `.env*`, deployment config, and fallback reads.

**Backup or recovery point**
- Securely export current secret values and mappings.
- Record which services use which secrets.

**Exact change**
- Move staging secrets to a managed secret store or hardened equivalent.
- Remove unsafe fallback patterns in staging.
- Introduce versioned secret references and rotation procedure.

**Immediate validation checks**
- App boots from managed secret source only.
- No secret values are logged.
- All dependent services authenticate successfully.

**Rollback path**
- Restore previous staging secret injection path.
- Revert code that removed fallback only if necessary for temporary recovery.

**Post-change test**
- Rotate a non-critical staging secret and verify service continuity.

---

### Phase 4, build named admin identities and server-side sessions in staging
**Goal:** prepare safe admin auth without touching production access yet.

**Pre-change state**
- Document current env-admin logic, JWT issuance path, and admin-only routes.

**Backup or recovery point**
- Preserve current auth code path in source control.
- Capture test credentials and current admin behavior in staging.

**Exact change**
- Add `AdminUser`, `AdminRole`, `AdminSession`, and security-event models.
- Implement named admin accounts, server-side session issuance/revocation, and audit logging.
- Add step-up auth hooks for sensitive actions.

**Immediate validation checks**
- Admin login works in staging with named identities.
- Session revocation works.
- Audit events appear for login, failure, logout, and role-sensitive actions.

**Rollback path**
- Revert to prior staging auth branch and session behavior.
- Remove new staging-only admin tables if the model is abandoned.

**Post-change test**
- Simulate login, revoked session reuse, role change, and audit review.

---

### Phase 5, enroll Rodney-safe admin recovery paths in staging first
**Goal:** prove no-lockout admin migration.

**Pre-change state**
- Identify Rodney's future named account, secondary trusted admin, and break-glass ownership process.

**Backup or recovery point**
- Preserve old admin path in staging during side-by-side testing.
- Store recovery procedure draft offline.

**Exact change**
- Create Rodney named admin account in staging.
- Enroll at least two passkeys on separate devices.
- Enroll one secondary recovery factor.
- Create and document break-glass flow.

**Immediate validation checks**
- Rodney can authenticate with both passkeys.
- Recovery factor works.
- Break-glass procedure can be executed by the documented process.

**Rollback path**
- Keep old staged admin path available until signoff.
- Remove staged passkey requirement and fall back to prior staged auth if testing fails.

**Post-change test**
- Run device-loss and lockout drill end to end.

---

### Phase 6, replace browser-local-only customer profile handling in staging
**Goal:** move customer identity and profile data to server-backed control.

**Pre-change state**
- Document every field stored in `localStorage` and the current onboarding flow.

**Backup or recovery point**
- Save representative non-sensitive test fixtures and flow recordings.

**Exact change**
- Add server-backed customer identity/profile records.
- Minimize stored PII and apply encryption requirements by data class.
- Keep browser-local drafts only as temporary UX cache, not source of truth.

**Immediate validation checks**
- Profiles persist server-side.
- Access control is enforced server-side.
- Local device clearing does not destroy authoritative records.

**Rollback path**
- Revert staging onboarding to prior flow while retaining migrated test data separately for analysis.

**Post-change test**
- Complete onboarding on one device, resume on another, and verify authorized recovery path.

---

### Phase 7, production readiness gate review before any production cutover
**Goal:** approve only evidence-backed production changes.

**Required evidence**
- staging on PostgreSQL
- checked-in migrations working from empty state
- successful backup and restore rehearsal
- secrets centralized for staging and production design approved
- named admin identities, sessions, passkeys, recovery, and audit events working in staging
- customer server-backed identity/profile flow working in staging
- payment processor boundary reviewed to avoid card-data storage
- clear rollback plans for each production cutover

**Decision output**
- Explicit approval for production sequence, or launch remains blocked.

---

### Phase 8, controlled production database foundation cutover
**Goal:** move production to managed PostgreSQL before real-user launch.

**Pre-change state**
- Capture production deployment config, current SQLite artifacts, and data inventory.

**Backup or recovery point**
- Full production snapshot/export of all existing data.
- Verified backup of application code and configuration.
- Tested restore destination ready.

**Exact change**
- Provision production PostgreSQL.
- Apply checked-in migrations.
- Migrate only approved data.
- Repoint production app to PostgreSQL.

**Immediate validation checks**
- App connects successfully.
- Data counts and integrity checks match expectations.
- Key read/write paths work.

**Rollback path**
- Repoint app to prior production datastore/config if cutover validation fails.
- Restore from pre-cutover snapshot if partial writes occurred.

**Post-change test**
- Run smoke tests for storefront, admin, and audit writes on production.

---

### Phase 9, controlled production admin-auth side-by-side period
**Goal:** introduce named admin access without removing Rodney's fallback too early.

**Pre-change state**
- Existing env-admin path still works.
- Production PostgreSQL and audit logging are live.

**Backup or recovery point**
- Preserve current admin auth configuration and secrets.
- Keep break-glass materials offline and accessible to authorized owners.

**Exact change**
- Create named production admin accounts for Rodney and secondary trusted admin.
- Enable server-side admin sessions, passkeys/MFA, and audit logging.
- Restrict legacy env-admin path to emergency-only monitored use during transition.

**Immediate validation checks**
- Rodney can log in through named admin path with enrolled factors.
- Session revocation works.
- Alerts/audit entries fire for all admin auth events.
- Legacy path is still recoverable but visibly restricted.

**Rollback path**
- Re-enable primary use of legacy admin path temporarily.
- Disable new admin auth enforcement while preserving audit evidence.

**Post-change test**
- Run a supervised login, revoke, and recovery drill with Rodney.

---

### Phase 10, remove seeded env-admin logic
**Goal:** eliminate shared/untracked admin access only after safe proof.

**Pre-change state**
- Named admin path is proven in production.
- Rodney and second admin both have working passkeys/recovery.
- Break-glass is tested.

**Backup or recovery point**
- Preserve exact legacy auth code/config for emergency reintroduction if absolutely necessary.

**Exact change**
- Disable seeded env-admin login.
- Remove shared admin credential logic from runtime path.

**Immediate validation checks**
- Legacy path no longer authenticates.
- Named admin login remains healthy.
- Alerts fire on any attempted legacy-path use.

**Rollback path**
- Restore legacy auth path only under explicit incident approval if named admin access fails unexpectedly.

**Post-change test**
- Verify only named identities can access admin panel.

---

### Phase 11, launch customer auth and billing only after final gate
**Goal:** turn on real-user features after core security foundations exist.

**Pre-change state**
- All previous phases completed and evidenced.

**Backup or recovery point**
- Final pre-launch production backup.
- Config snapshot and rollout plan.

**Exact change**
- Enable server-backed customer auth.
- Enable brute-force protection and anti-enumeration responses.
- Enable payment processor integration using tokenization-only boundaries and verified webhooks.

**Immediate validation checks**
- Customer auth, recovery, and profile persistence work.
- Rate limiting/lockout controls trigger correctly.
- Billing events and admin actions are audited.

**Rollback path**
- Disable signup or billing entry points.
- Revert to maintenance mode if integrity or auth issues appear.

**Post-change test**
- Run supervised end-to-end tests for signup, recovery, subscription action, and audit review.

## Cross-cutting validation checklist
Apply after each phase where relevant:
- logs show expected security events
- no secrets leaked to logs, browser, or client bundles
- least-privilege access still holds
- backups still succeed after schema/auth changes
- documented owner signs off on validation evidence

## Minimum production cutover discipline
For any production phase, require:
- one designated operator
- one reviewer/observer
- written change record with timestamps
- explicit go/no-go checkpoint
- rollback owner and rollback trigger thresholds
- post-change evidence attached before closing the step

## Launch gate
Do not approve secure production launch until all critical blockers from the readiness plan are closed with evidence, not intention.