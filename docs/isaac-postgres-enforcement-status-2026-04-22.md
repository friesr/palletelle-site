# Isaac PostgreSQL Enforcement Status - 2026-04-22

## Implemented this run

1. **Made PostgreSQL the default Prisma direction**
   - Changed `prisma/schema.prisma` datasource provider from `sqlite` to `postgresql`.
   - Kept a dedicated PostgreSQL schema file at `prisma/schema.postgres.prisma`.

2. **Moved SQLite to an explicit dev-only path**
   - Added `prisma/schema.sqlite.prisma` as the local-development-only SQLite schema.
   - Added explicit dev-only scripts in `package.json`:
     - `db:dev:generate`
     - `db:dev:push`
     - `db:dev:seed`

3. **Added migration-backed PostgreSQL bootstrap artifacts**
   - Added `prisma/migrations/migration_lock.toml` with PostgreSQL provider.
   - Added baseline migration at `prisma/migrations/20260422125000_postgres_baseline/migration.sql` generated from the PostgreSQL schema.
   - Added default migration scripts in `package.json`:
     - `db:migrate:dev`
     - `db:migrate:deploy`

4. **Changed default environment expectations to PostgreSQL**
   - Updated `.env.example` so the default `DATABASE_URL` is PostgreSQL, not SQLite.
   - Added `.env.sqlite.example` so SQLite remains available only as an explicit local-dev fallback.
   - Annotated app-local env files to say SQLite is local-dev-only:
     - `apps/storefront/.env.local`
     - `apps/admin/.env.local`

5. **Updated repo guidance**
   - Updated `README.md` to state that staging and production require PostgreSQL and that SQLite is local-only.
   - Documented the new default/db-dev command split in `README.md`.

6. **Validated schema/tooling state**
   - `prisma validate` passed for both `prisma/schema.prisma` and `prisma/schema.sqlite.prisma`.
   - `prisma generate` succeeded for both schemas.

## What remains

1. Stand up an actual PostgreSQL instance for this environment.
2. Set a real PostgreSQL `DATABASE_URL` in the active runtime env files used by staging/admin/storefront.
3. Run the baseline migration against PostgreSQL:
   - `pnpm db:migrate:deploy`
4. Import existing SQLite data into PostgreSQL and verify row parity.
5. Remove remaining SQLite operational habits in docs, scripts, and local assumptions beyond explicitly local development.
6. Switch application runtime verification from `db push` habits to migration-first deployment flow everywhere.

## Blockers

1. **No confirmed running PostgreSQL service/database from inside this run**
   - Repo-side enforcement is in place, but migration application to a real database could not be completed here.

2. **Privileged install/setup may still be required on the host**
   - If PostgreSQL is not already installed, the exact commands are:

```bash
sudo apt-get install -y postgresql postgresql-contrib postgresql-client
sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo -u postgres psql -c "CREATE ROLE atelier_app WITH LOGIN PASSWORD 'change-me';"
sudo -u postgres psql -c "CREATE DATABASE atelier OWNER atelier_app;"
sudo -u postgres psql -d atelier -c "ALTER SCHEMA public OWNER TO atelier_app;"
```

## Files changed in this run

- `prisma/schema.prisma`
- `prisma/schema.sqlite.prisma`
- `prisma/migrations/migration_lock.toml`
- `prisma/migrations/20260422125000_postgres_baseline/migration.sql`
- `package.json`
- `.env.example`
- `.env.sqlite.example`
- `apps/storefront/.env.local`
- `apps/admin/.env.local`
- `README.md`
