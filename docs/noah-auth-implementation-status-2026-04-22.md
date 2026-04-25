# Noah auth implementation status, 2026-04-22

## Implemented this run

1. Started passkey-first admin hardening in `apps/admin/`.
   - Added `apps/admin/lib/auth/admin-access.ts`.
   - Enforced named-admin-email validation (`ADMIN_EMAIL`, with temporary fallback read from legacy `ADMIN_LOGIN` if it is an email).
   - Added bootstrap password validation using `ADMIN_BOOTSTRAP_PASSWORD_HASH` (with temporary fallback to legacy `ADMIN_PASSWORD_HASH`).
   - Added database-backed security-state checks against existing Prisma models:
     - `User.role = admin`
     - `AuthMethod.type = passkey`
     - verified `MFAEnrollment`

2. Changed admin session semantics so bootstrap login is no longer equivalent to full admin access.
   - `apps/admin/auth.ts` now treats password login as bootstrap-only.
   - `apps/admin/auth.config.ts` now stores `securityState` and `authMethod` in JWT/session.
   - Normal admin routes now require `securityState = active`.
   - Bootstrap sessions are redirected to `/bootstrap-security` instead of the command center.

3. Added a bootstrap lock page.
   - Created `apps/admin/app/bootstrap-security/page.tsx`.
   - Shows whether the named admin has:
     - configured email
     - passkey present in DB
     - verified MFA present in DB
   - Explains that command-center access remains blocked until passkey and MFA are in place.

4. Updated login UX to match the new security posture.
   - `apps/admin/app/login/page.tsx` now frames login as passkey-first with bootstrap-password bridge only.
   - `apps/admin/app/login/login-form.tsx` now requires named admin email instead of username/email.
   - `apps/admin/app/login/actions.ts` now signs in with `email` + `password` and returns bootstrap-specific error text.

5. Updated server-side guard behavior.
   - `apps/admin/lib/auth/session.ts` now distinguishes bootstrap access from full admin access.
   - `apps/admin/app/layout.tsx` now exposes the current security state in admin chrome.

6. Updated configuration and docs.
   - Updated `.env.example`.
   - Updated `.env.postgres.example`.
   - Updated `docs/admin-auth.md` to reflect named-admin email, bootstrap-password bridge, and route gating.

## What remains

1. Real passkey implementation.
   - WebAuthn registration ceremony.
   - WebAuthn assertion ceremony.
   - Challenge generation/storage and replay protection.
   - Persistence updates for passkey registration lifecycle.

2. Real MFA implementation.
   - Enrollment ceremony.
   - Verification challenge flow.
   - Session step-up or equivalent proof that MFA was satisfied during this sign-in.

3. Admin identity persistence and bootstrap reduction.
   - Move fully from env-synthesized admin identity to DB-backed named admin accounts.
   - Remove legacy `ADMIN_LOGIN` / `ADMIN_PASSWORD_HASH` compatibility.
   - Add admin creation, revocation, and offboarding workflow.

4. Auth protection hardening still needed.
   - Rate limiting / lockout on bootstrap login.
   - Auth event logging for success/failure/setup changes.
   - Cloudflare-aware origin / proxy trust review for production.
   - Email verification and email-required cutover path for broader user auth.

5. Production/staging DB alignment.
   - Rodney’s decision is PostgreSQL for production and staging, SQLite dev-only.
   - This run did not complete the full auth-path cutover to PostgreSQL-only runtime behavior.

## Blockers / ambiguities

1. Passkey and MFA UX/API paths were not already present in the admin app, so this run implemented the enforcement boundary and bootstrap lock first rather than the full ceremony.
2. Existing Prisma schema already has `AuthMethod` and `MFAEnrollment`, but there is no shipped WebAuthn challenge or MFA challenge flow yet.
3. Type-checking the admin app surfaced an existing unrelated error outside this auth work:
   - `app/api/commerce/pipeline_status/route.ts(15,25): error TS2339: Property 'quickAddState' does not exist ...`
   - This was not introduced by the auth changes and was not fixed in this run.
4. Repo state already contains many unrelated staged/unstaged changes; this run was limited to auth-hardening files listed above.

## Recommendation for next auth run

1. Implement WebAuthn challenge storage and registration/authentication route handlers.
2. Implement MFA enrollment and verification flow.
3. Replace bootstrap-password-only session trust with proof that passkey and MFA were actually satisfied during the current authentication event.
4. Add login rate limiting and auth event logs before any public exposure.
