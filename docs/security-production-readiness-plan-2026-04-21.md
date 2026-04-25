# Security production readiness plan, 2026-04-21

## Executive summary
Palletelle is not yet safe for a secure production launch. The current stack is still in a development posture: SQLite `dev.db`, seeded env-based admin credentials, JWT-only admin sessions, browser-local customer profile storage, and no evidence of production migration, backup, restore, or security audit discipline. Real customer data, admin operations, or billing should not launch until the critical items below are complete.

This plan incorporates the current production-readiness direction plus Isaac's database and data-security assessment from 2026-04-21.

## Current blockers to secure launch

### Critical blockers
1. **No production-grade database posture**
   - Current evidence: Prisma uses SQLite, `DATABASE_URL=file:./dev.db`, and local DB files/symlinks are present.
   - Why it blocks launch: weak recovery/scaling model, poor operational separation, and unsafe habits for real-user data.
2. **Admin access is not production-safe**
   - Current evidence: seeded env credential, shared admin identity pattern, JWT-only sessions.
   - Why it blocks launch: no named accountability, weak revocation, weak rotation, no least privilege.
3. **Customer identity and profile handling are not server-backed**
   - Current evidence: storefront onboarding stores profile drafts in `localStorage`; no real customer auth lifecycle is wired.
   - Why it blocks launch: no durable access control, no recovery path, no auditability, easy leakage on shared devices.
4. **No production migration, backup, restore, or security audit discipline**
   - Current evidence: no checked-in Prisma migrations, reliance on `db push`, destructive seed behavior, no proven restore path.
   - Why it blocks launch: unacceptable change risk and disaster-recovery risk.

### High-risk gaps
- Secret sprawl across app-local env files and fallback env reads.
- No server-side session inventory/revocation for admin access.
- Auth, customer, catalog, and future billing data share one broad DB namespace.
- No dedicated security-event audit trail for login failures, role changes, or exports.

## Target architecture

### 1) Identity and authentication
- **Passwordless-first customer auth** using passkeys as the preferred primary factor.
- **Fallback authentication** only where needed for recovery and staged migration, with strict rate limits and step-up verification.
- **Named DB-backed admin identities**, one per human, no shared admin account.
- **Mandatory phishing-resistant MFA for admins**, ideally passkey-first, with a second recovery factor enrolled.
- **Role-based access control** for admin capabilities, with least privilege by default.

### 2) Admin access model
- Replace env-seeded admin login with an `AdminUser` / `AdminRole` / `AdminSession` model.
- Store admin sessions server-side, with explicit issuance, revocation, expiry, device metadata, and last-seen timestamps.
- Require re-auth or step-up auth for sensitive actions such as role changes, exports, billing actions, and secret/config changes.
- Restrict admin panel exposure behind hardened auth, IP/device anomaly checks, and audit logging.

### 3) Suspicious-activity defense
- Centralize security-event logging for:
  - failed logins
  - account lockouts/rate-limit triggers
  - new device/session issuance
  - MFA/passkey enrollment or removal
  - role/privilege changes
  - password or recovery changes
  - export/download of sensitive data
- Add anomaly detection rules for impossible travel, repeated failed attempts, unusual admin access time/location, and repeated recovery events.
- Alert on high-severity admin and billing security events.

## Brute-force protections
- Per-account and per-IP rate limiting on all auth, recovery, and magic-link endpoints.
- Progressive backoff plus temporary lockouts for repeated failures.
- CAPTCHA or equivalent abuse challenge only after suspicious thresholds, not as the first-line control.
- Separate stricter thresholds for admin login and admin recovery.
- Password reset, email verification, and recovery endpoints must have anti-enumeration responses.

## Passwordless-first direction and migration sequence
Goal: move to passkeys safely without locking Rodney out.

### Safe migration sequence
1. **Create named admin accounts in the database first.**
2. **Provision Rodney's individual admin account** with a strong temporary bootstrap path.
3. **Enroll at least two passkeys for Rodney** on separate devices.
4. **Enroll one secondary recovery factor** for Rodney, stored separately from primary devices.
5. **Issue and test break-glass recovery flow** before removing seeded env-admin access.
6. **Run side-by-side transition period** where old admin path exists but is restricted and monitored.
7. **Cut over admin access to DB-backed named identities only.**
8. **Disable and remove seeded env-admin logic.**
9. **Launch customer passkey-first auth** with staged fallback options for account recovery and limited password/email-link compatibility if needed.

## Named admin identities and break-glass path
- Required initial named admins:
  - **Rodney**: primary operational admin.
  - **At least one second trusted admin** for dual control and recovery coverage.
- No shared admin usernames.
- Break-glass account requirements:
  - unique identity, not used day-to-day
  - hardware-backed MFA/passkey where possible
  - credentials split or sealed in an offline recovery process
  - every use generates immediate high-severity alerts and mandatory review
- Recovery kit should include:
  - documented recovery steps
  - stored recovery codes in protected offline custody
  - tested device-loss and lockout procedure

## Production database direction
- Move to a managed production-grade relational database before any real-user launch, preferably **PostgreSQL**.
- Separate access domains at minimum by schema or preferably by bounded-service credentials:
  - catalog/product data
  - customer auth/profile data
  - admin/security audit data
  - billing/subscription metadata
- Use least-privilege DB credentials per service path.
- Stop using SQLite or dev-file patterns in any environment that holds real admin or customer data.

## Migration off current SQLite posture
1. Stand up managed PostgreSQL for staging and production.
2. Introduce checked-in Prisma migrations and stop relying on `db push` for production evolution.
3. Build schema baselines for admin identity, customer auth, sessions, and security audit events.
4. Migrate existing non-sensitive dev/catalog data as needed.
5. Prove restore into a fresh environment from backup plus migrations.
6. Block launch until staging runs on the same DB class and migration process as production.

## PII encryption expectations
Encrypt sensitive data according to class.

### Must be encrypted at rest and tightly access-controlled
- customer profile PII: name, address, phone, email where stored beyond auth necessity
- any government-issued identifiers if ever collected
- sensitive support or account notes
- recovery artifacts and recovery codes
- tokens, API secrets, and service credentials

### Should be encrypted or tokenized with strong minimization
- billing customer identifiers and subscription metadata
- order-linked personal data
- fraud/risk-review notes

### Never store if avoidable
- raw payment card data
- card CVV/CVC
- unnecessary identity documents

### Additional expectations
- Passwords, if used anywhere, must be one-way hashed with modern parameters, never encrypted reversibly.
- Passkey secrets/private keys should follow platform-standard WebAuthn handling; do not invent custom crypto storage.

## Encryption key management and backup/recovery handling
- Store application secrets and encryption keys in a proper secret manager or equivalent hardened key store, not scattered `.env.local` files.
- Separate key-encryption keys from encrypted data where feasible.
- Rotate keys with documented procedures and versioned key identifiers.
- Limit decrypt capability to only the services/operators that truly need it.
- Recovery codes must be generated once, shown once, hashed or encrypted appropriately, and never logged.
- Backup copies containing encrypted data must protect the relevant keys separately to avoid single-artifact compromise.

## Backup, restore, and recovery expectations
Before launch, prove:
- automated scheduled backups for production data stores
- defined retention windows
- point-in-time recovery capability if supported
- documented restore runbook
- successful restore test into isolated environment
- recovery time and recovery point objectives accepted by leadership
- periodic disaster-recovery rehearsal, not just backup existence

## Billing and payment processor requirements
- Use a compliant third-party payment processor.
- Do not store raw card numbers or CVV.
- Store only processor tokens, last4/brand if needed, and minimal billing metadata.
- Separate billing access controls from general product/admin access.
- Log billing-admin actions and refund/subscription changes.
- Validate webhook signatures, replay protection, and secret rotation.
- Restrict billing data visibility to staff with business need.

## Audit logging, retention, and review
### Must log
- admin logins, failures, lockouts, session creation/revocation
- MFA/passkey enrollment, removal, and recovery events
- role/permission changes
- customer-data exports and sensitive record access where feasible
- billing/admin actions
- secret/config changes and break-glass use

### Retention
- Security audit logs should be retained longer than normal app telemetry.
- Recommended baseline: **at least 12 months online/searchable**, with longer archived retention if feasible and regulatory needs require it.

### Review
- Daily or near-daily review of critical security events once live.
- Weekly review of high-severity auth/admin anomalies.
- Documented owner for triage and response.

## Before launch vs after launch

### Must be done before launch
- Replace SQLite/dev DB posture with managed PostgreSQL or equivalent.
- Introduce checked-in migrations and production-safe schema change process.
- Replace seeded env-admin auth with named DB-backed admin identities.
- Enforce strong admin MFA/passkey-based access.
- Implement server-side admin session management and revocation.
- Remove customer profile storage from browser-local-only model for real data.
- Stand up server-backed customer identity and recovery path.
- Implement security audit logging for auth/admin/billing-sensitive events.
- Consolidate secret handling into managed secret storage and remove unsafe env-file fallback patterns.
- Define backup/restore runbook and complete at least one successful restore test.
- Confirm payment processor boundary design that avoids card-data storage.

### Can follow shortly after launch, but should already be planned
- More advanced anomaly detection and geo/device risk scoring.
- Finer-grained service/database separation beyond initial least-privilege boundaries.
- Expanded customer-facing account security controls and self-service security history.
- Longer-term log archival optimization and automated alert tuning.

## Priority order

### Critical
1. Production DB migration to managed PostgreSQL.
2. Named admin identities plus admin MFA/passkeys.
3. Remove seeded env-admin path.
4. Server-backed customer identity/profile storage.
5. Migration discipline, backups, restores, and audited launch readiness.

### High
1. Server-side admin session management and revocation.
2. Security-event audit trail and alerting.
3. Secrets centralization and rotation discipline.
4. Data-domain separation for auth, billing, and audit paths.
5. Brute-force and anti-enumeration controls on all auth/recovery endpoints.

### Medium
1. Stronger anomaly detection and adaptive defenses.
2. Further DB/schema/service separation.
3. Improved retention/deletion automation and privacy workflows.
4. Operational hardening for admin device trust and step-up policies.

## Concrete first implementation steps
1. **Decision this week:** approve PostgreSQL as the production database target and ban SQLite for any real-user environment.
2. **Create a security/auth workstream:** DB-backed admin users, roles, sessions, WebAuthn/passkey support, MFA, recovery.
3. **Create a data migration workstream:** Prisma migrations, staging DB, backup/restore automation, restore test.
4. **Create a customer identity workstream:** replace `localStorage` onboarding with authenticated server-backed records.
5. **Create a security logging workstream:** dedicated audit tables/pipeline for auth/admin/billing events.
6. **Create a secrets hardening workstream:** move secrets out of scattered app-local env files into managed secret storage.
7. **Pick payment processor integration boundaries now:** tokenization only, webhook verification, least-privilege billing access.
8. **Run a pre-launch security gate review:** launch blocked unless all critical items are complete and evidenced.

## Leadership recommendation
Do **not** launch customer accounts, admin operations, or billing on the current posture. The right path is a short, focused production-readiness push that establishes proper identity, database, backup, secrets, and audit foundations first. That is the fastest route to a trustworthy launch, and it avoids a much more painful retrofit later.