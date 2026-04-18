# Admin Authentication

## 1. Objective

Document how Palletelle admin authentication works, how the seeded admin user is configured, what routes are protected, and what hardening remains for later.

## 2. What is known

- The admin surface lives in `apps/admin/`.
- Admin auth uses Auth.js with a credentials provider.
- Current scope is one seeded admin account.
- Passwords are not stored in plaintext.
- Admin sessions are required for admin UI and server-side actions.

## 3. What is inferred

- Environment-backed seeded credentials are the tightest low-complexity starting point for a single-operator admin surface.
- Route middleware plus server-side guards gives better protection than client-only checks.

## 4. What is uncertain

- Whether future admin users will move into a database-backed user table.
- Whether admin will remain a separate app or move under the storefront later.

## 5. Risks

- Credentials auth without rate limiting is not enough for internet-exposed production.
- A weak `AUTH_SECRET` weakens session security.
- Environment-backed single-user auth does not support audit trails or multi-user administration.

## 6. Proposed action

Use the implementation below until a broader identity system is approved.

## 7. Whether approval is required

No, for local development implementation and documentation.

## 8. Next step

Use this setup for the first protected admin release, then harden it before any public deployment.

---

## How auth works

Palletelle admin currently uses:

- **Auth.js / NextAuth**
- **Credentials provider**
- **JWT session strategy**
- **bcrypt password verification**

Login flow:

1. The admin visits `/login`.
2. They submit `login` and `password`.
3. Auth.js checks the submitted login against the seeded admin login from environment variables.
4. The submitted password is compared against `ADMIN_PASSWORD_HASH` using bcrypt.
5. On success, Auth.js creates a signed session token.
6. The session includes `role = admin`.

Logout flow:

- Logout is handled by a server action that calls Auth.js `signOut()`.

## Seeded admin user strategy

Current admin credentials are environment-backed, not stored in source code.

Required environment variables:

- `AUTH_SECRET`
- `AUTH_URL` (recommended for local/admin app URL)
- `ADMIN_LOGIN`
- `ADMIN_PASSWORD_HASH`

### Where user records live

For now, the single admin user record is synthesized at runtime from environment variables in:

- `apps/admin/lib/auth/seeded-admin.ts`

This means:

- no plaintext password in code
- no shared hardcoded secret in the repo
- one seeded admin account only

### How to seed or update admin credentials

1. Choose the admin login identifier, for example:
   - `admin@example.com`
   - or a username like `palletelle-admin`

2. Generate a bcrypt hash for the password.

Example using Node:

```bash
node -e "require('bcryptjs').hash(process.argv[1], 12).then(v => console.log(v))" "your-strong-password"
```

If bcryptjs is not installed globally, run it from the workspace:

```bash
cd /home/hank/.openclaw/workspace/atelier-orchestrator/apps/admin
node -e "require('bcryptjs').hash(process.argv[1], 12).then(v => console.log(v))" "your-strong-password"
```

3. Put the values into your local env file, for example `.env.local`:

```dotenv
AUTH_SECRET=replace-with-a-long-random-secret
AUTH_URL=http://localhost:3001
ADMIN_LOGIN=admin@example.com
ADMIN_PASSWORD_HASH=$2b$12$...
```

4. Restart the admin dev server.

## What is protected

### UI protection

Protected pages currently include:

- `/`
- `/review/[id]`

Public pages:

- `/login`
- `/api/auth/*`

### Server-side protection

Protection is enforced in multiple layers:

1. **Middleware**
   - redirects unauthenticated users away from protected pages

2. **Server-side guard helper**
   - `requireAdmin()` in `apps/admin/lib/auth/session.ts`
   - used inside server-rendered pages and server actions

3. **Role enforcement**
   - only `role = admin` sessions pass authorization

### Route handlers and admin actions

Admin server actions and any future route handlers must call `requireAdmin()` so they are not protected only by UI state.

Current protected server endpoints include:

- logout action
- placeholder review action forms

## Future hardening items

Before public or internet-exposed use, add at least:

- persistent user storage instead of env-only single user
- rate limiting for login attempts
- audit logging for admin sign-in and admin actions
- CSRF review for any custom state-changing endpoints
- secure cookie review in the target deployment environment
- HTTPS-only deployment
- secret rotation process for `AUTH_SECRET`
- stronger role model if non-admin staff users are introduced
- optional MFA for admins
- optional password reset flow backed by verified email

## Notes on scope

Intentionally out of scope for now:

- OAuth
- multi-user admin management
- password reset flow
- MFA
- public self-signup
