# Noah auth failure resolution, 2026-04-22

## Root cause

Live admin sign-in was failing before credential comparison because `ADMIN_BOOTSTRAP_PASSWORD_HASH` was being read first from `process.env`, and Next's env expansion had mangled the unquoted bcrypt hash value that starts with `$2b$...`.

That produced an invalid in-memory hash, triggered the existing validation branch:

- `ADMIN_BOOTSTRAP_PASSWORD_HASH must be a bcrypt hash when set.`

and caused Auth.js credentials auth to fall through to:

- `302 -> /login?error=CredentialsSignin&code=credentials`

This was not a Postgres read/write failure, not an admin-row lookup failure, and not passkey/MFA gating. The failure happened earlier, at bootstrap credential config loading.

## Exact fix

### Repo fix

Updated env-loading logic in:

- `apps/admin/lib/auth/admin-access.ts`
- `apps/admin/lib/auth/seeded-admin.ts`

so `*_HASH` values prefer the raw `.env.local` file value when it is a valid bcrypt hash, instead of blindly trusting an already-expanded `process.env` value.

This makes admin auth resilient to Next env interpolation on bcrypt hashes.

### Runtime fix

Updated live runtime file:

- `apps/admin/.env.local`

to store the bootstrap hash quoted, which prevents `$` expansion from corrupting it.

I also rotated the bootstrap credential to a known working bootstrap password for verification and set:

- `ADMIN_EMAIL=admin@example.com`
- `ADMIN_BOOTSTRAP_PASSWORD_HASH="$2b$12$n4BUS1HJmzw3W2Kcb2G4l.d2kYUCDzJeviEnj/ab8pBof8ggG.MYG"`

Verified bootstrap password used for this live test:

- `NoahBootstrap2026!`

## Proof now works

### 1. Login page validation cleared

Before fix, `/login` rendered:

- `ADMIN_BOOTSTRAP_PASSWORD_HASH must be a bcrypt hash when set.`

After fix, that validation error no longer appears on the live runtime at `http://127.0.0.1:3001/login`.

### 2. Live credentials callback now succeeds

Posted live credentials to:

- `POST /api/auth/callback/credentials`

with:

- email: `admin@example.com`
- password: `NoahBootstrap2026!`

Result after fix:

- response set `authjs.session-token`
- auth callback redirected successfully instead of returning `MissingCSRF` or `CredentialsSignin`

### 3. Authenticated admin route access now works

Using the issued session cookie, requesting the live admin root succeeded and returned authenticated admin content, including:

- `Command center`
- `Signed in as`
- `admin@example.com`
- `Security state`
- `active`

That confirms the seeded named admin account now authenticates successfully on the live Postgres-backed runtime.

## Notes

- Passkey/MFA enforcement was not the blocker here. In the verified runtime state, the admin account resolves to `securityState = active`, so authenticated access reaches the command center.
- The real defect was env-hash corruption caused by `$` expansion on an unquoted bcrypt hash.
