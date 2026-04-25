# Security quick audit, admin auth, 2026-04-21

## Scope and evidence
Reviewed current admin auth implementation only:
- `apps/admin/auth.ts`
- `apps/admin/auth.config.ts`
- `apps/admin/lib/auth/seeded-admin.ts`
- `apps/admin/lib/auth/session.ts`
- `apps/admin/app/login/actions.ts`
- `apps/admin/.env.local`
- `docs/admin-auth.md`

## Current state
- Admin auth is **password-based**, not passwordless. Evidence: `apps/admin/auth.ts` uses a `Credentials` provider with `login` and `password`, then `bcryptjs.compare(...)` against `ADMIN_PASSWORD_HASH`.
- It is **not passwordless-ready in practice**. There is no implemented passkey, WebAuthn, magic link, or email-link flow in admin source, and `authConfig.providers` starts empty until `Credentials(...)` is injected.
- MFA/passkeys are **absent in practice**. `docs/admin-auth.md` lists MFA as a future hardening item, not a shipped control.
- Sessions are JWT-based. Evidence: `apps/admin/auth.config.ts` sets `session.strategy = 'jwt'`.
- Access control is role-gated but single-role and single-user. Evidence: middleware and session callback allow only `role === 'admin'`; `seeded-admin.ts` synthesizes one env-backed user with fixed id `seeded-admin`.

## Shared or generic admin credential risk
- The current model is effectively a **generic shared admin identity**: one seeded account, fixed id, fixed role, env-backed login. `seeded-admin.ts` does not model individual named admins or per-user records.
- This blocks attribution, revocation by person, and reliable audit trails. If multiple humans use the same login, every action appears to come from the same synthetic principal.

## Brute-force and suspicious-login protections, visible gaps
- **No login rate limiting visible** on the credentials path. `loginAction` calls `signIn('credentials', ...)` directly, and `authorize(...)` performs only login and bcrypt checks.
- **No account lockout, backoff, or CAPTCHA visible**.
- **No suspicious-login detection visible**: no IP/device checks, geo-velocity checks, failed-attempt counters, or alerting hooks in reviewed code.
- **No sign-in audit log visible** for successful or failed admin authentication.
- **Weak default/local credential example exists**: `apps/admin/.env.local` contains `ADMIN_LOGIN=admin@example.com` and a concrete bcrypt hash, which is fine for local bootstrap but unsafe if copied forward into any shared or real environment.

## Severity-ranked findings

### Critical
1. **Single shared/generic admin identity with no per-person accountability**.
   - Evidence: `getSeededAdminUser()` returns one synthetic user (`id: 'seeded-admin'`, `role: 'admin'`).
   - Risk: no non-repudiation, weak offboarding, weak incident response.

### High
2. **Internet-exposed password login appears to have no brute-force protection**.
   - Evidence: no rate limiting, lockout, delay, or challenge controls in reviewed login flow.
3. **MFA/passkeys are not implemented for admin access**.
   - Evidence: credentials-only auth path, MFA called out as future work in `docs/admin-auth.md`.

### Medium
4. **JWT session model plus static env-backed admin credential increases blast radius of secret leakage or credential reuse**.
   - Evidence: `session.strategy = 'jwt'`, seeded env credential model.
5. **No visible suspicious-login telemetry or auth audit trail**.
   - Evidence: no logging or monitoring hooks in reviewed auth flow.

### Low
6. **Passwordless/passkey support is not on the current implementation path**.
   - Evidence: no WebAuthn/passkey provider or registration flow in admin source.
7. **Local example credential material may normalize weak operational habits**.
   - Evidence: placeholder-like `.env.local` values present in repo workspace.

## 3 immediate fixes
1. Put the admin login endpoint behind **rate limiting plus exponential backoff / temporary lockout** before any public exposure.
2. Replace the single shared seeded login with **named admin identities**, even if the first step is a tiny admin-users table.
3. Require **admin MFA** now, preferably passkey/WebAuthn first, or TOTP as a short bridge.

## 3 next-step fixes
1. Move to a **passkey-first admin auth design** with password fallback disabled or tightly constrained.
2. Add **auth event logging and alerting** for success, failure, lockout, password reset, and role changes.
3. Add **suspicious-activity controls**: IP/device fingerprinting, impossible-travel heuristics where relevant, session review, and rapid revoke capability.

## Bottom line
Current admin auth is acceptable only for a tightly controlled early internal environment. For any real customer-facing or internet-exposed launch, the lack of per-user admin identity, MFA/passkeys, and brute-force defenses makes the present state a launch blocker.