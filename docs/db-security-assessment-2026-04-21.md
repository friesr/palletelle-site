# DB security assessment, 2026-04-21

## Bottom line
Not launch-suitable for real users, admin operations, or billing. The current posture is a local-development scaffold with SQLite, seeded admin credentials, local-only profile storage in the storefront, and no evidence of production-grade migrations, backups, audit controls, or data separation.

## Evidence observed
- Prisma is configured for SQLite: `prisma/schema.prisma` uses `provider = "sqlite"` and `DATABASE_URL` points to `file:./dev.db` in `.env.example`, `apps/admin/.env.local`, and `apps/storefront/.env.local`.
- The active DB is a local file: `prisma/dev.db` exists, and `apps/storefront/dev.db` is a symlink to it.
- Admin auth is seeded from env, not from DB-backed identities: `apps/admin/auth.ts` plus `apps/admin/lib/auth/seeded-admin.ts`.
- Admin sessions use stateless JWTs: `apps/admin/auth.config.ts` sets `session.strategy = 'jwt'`.
- Storefront customer onboarding is browser-local only: `apps/storefront/components/profile-onboarding-shell.tsx` stores profile data in `localStorage` under `palletelle-profile-draft` and explicitly says live accounts are not wired yet.
- Customer/auth/passkey/MFA structures exist in `prisma/schema.prisma`, but seed flow only clears and seeds product/catalog data. No customer auth lifecycle is present in `prisma/seed.ts`.
- No Prisma migrations directory is present under `prisma/`; repo scripts use `prisma db push` and `prisma db:seed` from `package.json`.

## Launch suitability
- **Customer launch:** No. Customer identity is not server-backed, so there is no durable protection, access control, or recovery path for user data.
- **Admin launch:** No. Single seeded admin credential, env-file fallback loading, and JWT-only sessions are acceptable for local setup, not for production administration.
- **Billing launch:** No. There is no billing boundary yet, which is safer than improvising, but it means the current DB posture is not ready to hold payment, subscription, or invoicing data.

## Severity-ranked findings

### Critical
1. **Production DB is still a local SQLite/dev-file pattern.** Evidence: `prisma/schema.prisma`, `DATABASE_URL=file:./dev.db`, local `prisma/dev.db`. Risks: weak concurrency story, file-copy backup habits, accidental exposure, poor HA/recovery, and unsafe scaling assumptions.
2. **Admin identity is a seeded env credential, not a managed admin account model.** Evidence: `apps/admin/auth.ts`, `apps/admin/lib/auth/seeded-admin.ts`, `ADMIN_LOGIN`, `ADMIN_PASSWORD_HASH`. Risks: single shared admin identity, weak accountability, hard rotation, no per-admin least privilege, no revocation/audit boundary.
3. **Customer profile data is currently stored in browser localStorage.** Evidence: `apps/storefront/components/profile-onboarding-shell.tsx`. Risks: no server-side retention control, no access logging, no secure recovery, easy leakage on shared devices, and no meaningful privacy/security guarantees.

### High
1. **Secrets/config are spread across app-local env files with fallback file reads.** Evidence: `apps/admin/.env.local`, `apps/storefront/.env.local`, `getEnvValue()` reads `.env.local` and `../../.env.local`. Risks: secret sprawl, accidental misbinding across apps, and harder secret rotation.
2. **JWT-only admin sessions without server-side session records.** Evidence: `apps/admin/auth.config.ts`. Risks: limited revocation control, weaker session auditability, and less visibility into active admin sessions.
3. **Auth, customer data, catalog, and future billing data are modeled in one database namespace.** Evidence: single `prisma/schema.prisma` contains products, users, auth methods, MFA, reviews, saved items, and affiliate config. Risks: over-broad DB access, harder retention controls, and higher blast radius.
4. **No evidence of migrations, backup, or restore discipline.** Evidence: no `prisma/migrations/`; only `db:push`, `db:seed`; seed script deletes and recreates major tables. Risks: unsafe schema change path and weak disaster recovery.

### Medium
1. **DB file permissions are not tightly locked by default.** Evidence: `prisma/dev.db` is present as mode `644`. Risk: local read exposure to other users/processes on the host.
2. **Audit logging exists for product lifecycle only, not for auth/admin security events.** Evidence: `ProductLifecycleAudit` model and review service usage, but no admin-login/auth-event/audit-event tables.
3. **Passkey/MFA models exist, but no operational protection path is wired.** Evidence: `AuthMethod`, `MFAEnrollment` in schema and domain types, but current login is credentials-only seeded admin.

### Low
1. **Sample/fixture fallback behavior can blur environment expectations.** Evidence: `apps/storefront/lib/db-products.ts` returns `sampleProducts` when DB is empty in development.
2. **Trust/audit intent is documented, but storage/control implementation is incomplete.** Evidence: `packages/trust/README.md` mentions decision logging and audit-friendly checks.

## Data protection gaps
- No demonstrated per-admin identities, RBAC expansion path, or least-privilege separation.
- No retention/deletion policy visible for user profile, auth, review, or future billing data.
- No encryption-at-rest strategy visible beyond host defaults.
- No evidence of audit trail for login attempts, privilege changes, export actions, or secret/config changes.
- No evidence of row-level or service-level separation between customer, admin, catalog-ops, and future billing workloads.

## Billing and customer-data separation recommendation
- Keep **catalog/product data** in the main app DB.
- Put **customer identity/auth** in a tightly controlled auth schema or separate database with narrower application access.
- Put **billing/subscription/payment metadata** in a separate bounded store or schema, never mixed into general app tables, and never store raw card data.
- Keep **admin/audit/security event logs** append-oriented and access-restricted from normal application reads.

## Logging and audit-data storage
- Add immutable-ish security event storage for admin logins, failed logins, session issuance/revocation, MFA/passkey changes, role changes, and sensitive data exports.
- Keep product workflow audit logs separate from security audit logs.
- Set retention windows explicitly so audit data is preserved longer than routine app telemetry.

## Backup, recovery, migration concerns
- Current posture suggests ad hoc file-based backup behavior because the DB is SQLite.
- No checked-in migration history means restore and environment rebuilds may drift.
- Seed script uses destructive deletes before reseeding, which is acceptable for dev but dangerous as a mental model near launch.

## 3 immediate fixes
1. Move off SQLite/dev.db for any pre-launch environment intended to hold real admin or customer data; stand up a managed production-grade relational DB with restricted credentials.
2. Replace seeded env-admin auth with DB-backed named admin accounts, password reset/rotation, and auditable role assignments.
3. Stop storing real customer profile data in `localStorage`; move profile drafts and identity to server-backed records with authenticated access.

## 3 next-step fixes
1. Introduce migration discipline now, with checked-in Prisma migrations, environment-specific DBs, and tested rollback/restore steps.
2. Split access paths for catalog, customer auth/profile, and future billing/security logging so each service gets least privilege.
3. Add security audit tables and operational controls for admin/session/auth events before passkeys, MFA, or billing are introduced.
