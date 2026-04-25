# Isaac clean rebuild status, 2026-04-22

## Completed (verifiable)

1. Confirmed local PostgreSQL is reachable on the expected host and port.
   - Command: `pg_isready -h localhost -p 5432`
   - Result: `localhost:5432 - accepting connections`

2. Confirmed the configured application credentials from `apps/admin/.env.local` point to PostgreSQL and work for login.
   - `DATABASE_URL="postgresql://atelier_app:change-me@localhost:5432/atelier"`
   - Command: `PGPASSWORD='change-me' psql -h localhost -p 5432 -U atelier_app -d postgres -c '\\conninfo'`
   - Result: connected successfully as `atelier_app`

3. Confirmed the current runtime role does **not** have database-creation rights.
   - Command: `PGPASSWORD='change-me' psql -h localhost -p 5432 -U atelier_app -d postgres -Atqc "select rolname, rolsuper, rolcreatedb, rolcreaterole from pg_roles where rolname = current_user;"`
   - Result: `atelier_app|f|f|f`

4. Attempted clean fresh-target creation for this run.
   - Target name attempted: `atelier_clean_20260422_2118`
   - Drop command succeeded as a no-op because the DB did not exist.
   - Create command failed with permission error.

5. Confirmed elevated recovery path is unavailable from this subagent runtime.
   - Attempted `sudo -u postgres ... CREATE DATABASE ... OWNER atelier_app;`
   - Tool returned: `elevated is not available right now (runtime=direct)`

## Blocked (with cause)

### Blocker
The clean-from-zero rebuild path is blocked at **proof step 1, fresh Postgres target created**.

### Cause
The only verified working database identity in repo runtime config is `atelier_app`, and that role lacks `CREATEDB`. This subagent runtime also cannot use elevated execution to create the database as `postgres`.

### Exact first failed proof link
- Step: **1) fresh Postgres target created**
- Command:
  ```bash
  export PGPASSWORD='change-me'
  DB=atelier_clean_20260422_2118
  psql -h localhost -p 5432 -U atelier_app -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"$DB\";"
  psql -h localhost -p 5432 -U atelier_app -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"$DB\";"
  ```
- First failing output:
  ```text
  ERROR:  permission denied to create database
  ```

Because step 1 failed, the following required proof steps were **not reachable** on a valid clean-from-zero path in this run:
- 2) clean env/secrets loaded
- 3) prisma migrate deploy run
- 4) first failing step identified if any beyond step 1
- 5) blocker isolated beyond step 1
- 6) rerun until migrate passes
- 7) app boots
- 8) owner/admin auth tested
- 9) reference admin loop reproduced

## Divergence (who/what/why)

- **Who:** runtime / infrastructure boundary, not application code in this run.
- **What:** the configured app role can connect to PostgreSQL but cannot create a fresh database; elevated database-admin execution is disabled for this subagent session.
- **Why it matters:** any claim of successful clean rebuild from zero would require bypassing the stated path, reusing a non-fresh database, or performing privileged creation outside the verified app runtime path. That would not satisfy the requested proof standard.

## Current truth

The clean-from-zero PostgreSQL rebuild path is presently blocked before migrations begin. The first hard failure is database creation permission for the configured runtime role `atelier_app`.