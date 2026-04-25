# PostgreSQL migration kickoff, 2026-04-22

## What I checked on this machine

### Current app/database state
- Repo: `/home/hank/.openclaw/workspace/atelier-orchestrator`
- Current Prisma datasource: SQLite (`prisma/schema.prisma` -> `provider = "sqlite"`)
- Current database file: `prisma/dev.db`
- Snapshot of current SQLite contents:
  - Product: 25
  - ProductSourceData: 25
  - ProductPriceSnapshot: 3
  - ProductNormalizedData: 25
  - ProductInferredData: 25
  - ProductLifecycleState: 25
  - ProductLifecycleAudit: 59
  - ProductReviewState: 25
  - ProductVisibility: 25
  - ProductSourceHealth: 25
  - ExternalProductSignals: 15
  - Ensemble: 2
  - EnsembleItem: 4
  - AffiliateConfig: 1
  - User/auth/customer tables currently empty

### PostgreSQL readiness on host
Observed on `Ubuntu 24.04.4 LTS`:
- `psql` not installed
- `postgres` not installed
- `pg_ctl` not installed
- `initdb` not installed
- `postgresql.service` not present
- passwordless sudo is not available from this session

### Exact blocker
I cannot install or start PostgreSQL from this subagent because host-level package installation and service management require privileged access.

## Exact install/start commands to run once privileged access is available

```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib postgresql-client
sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo systemctl status postgresql --no-pager
sudo -u postgres psql -c "CREATE ROLE atelier_app WITH LOGIN PASSWORD 'change-me';"
sudo -u postgres psql -c "CREATE DATABASE atelier OWNER atelier_app;"
sudo -u postgres psql -d atelier -c "ALTER SCHEMA public OWNER TO atelier_app;"
```

Recommended app env after install:

```bash
DATABASE_URL="postgresql://atelier_app:change-me@localhost:5432/atelier"
```

Recommended first schema bootstrap after install:

```bash
cd /home/hank/.openclaw/workspace/atelier-orchestrator
cp .env.postgres.example .env.postgres
# edit password if needed, then:
DATABASE_URL="postgresql://atelier_app:change-me@localhost:5432/atelier" \
  ./node_modules/.bin/prisma db push --schema prisma/schema.postgres.prisma
```

## Target PostgreSQL schema and tables

The initial PostgreSQL target intentionally mirrors the current Prisma/SQLite model to reduce migration risk.

### Core catalog and ingestion tables
- `Product`
- `ProductSourceData`
- `ProductPriceSnapshot`
- `ProductNormalizedData`
- `ProductInferredData`
- `ProductLifecycleState`
- `ProductLifecycleAudit`
- `ProductReviewState`
- `ProductVisibility`
- `ProductSourceHealth`
- `ExternalProductSignals`

### Customer and trust tables
- `CustomerReview`
- `ReviewSummary`
- `User`
- `UserProfile`
- `ColorProfile`
- `PreferenceProfile`
- `SavedProduct`
- `SavedEnsemble`
- `AuthMethod`
- `MFAEnrollment`

### Styling/curation tables
- `Ensemble`
- `EnsembleItem`
- `AffiliateConfig`

### Enums to preserve in PostgreSQL
- `ProductWorkflowState`
- `ProductIngestState`
- `ProductReviewStatus`
- `ProductPreviewStatus`
- `ProductPublishStatus`
- `SourceStatus`
- `ExternalReputationState`
- `ExternalRecommendation`
- `ModerationStatus`
- `CustomerRole`
- `AuthMethodType`

## Data mapping from current SQLite/Prisma structures

This is mostly a 1:1 relational move.

### Direct 1:1 table migrations
- `Product` -> `Product`
- `ProductLifecycleState` -> `ProductLifecycleState`
- `ProductLifecycleAudit` -> `ProductLifecycleAudit`
- `ProductPriceSnapshot` -> `ProductPriceSnapshot`
- `ProductSourceData` -> `ProductSourceData`
- `ProductNormalizedData` -> `ProductNormalizedData`
- `ProductInferredData` -> `ProductInferredData`
- `ProductReviewState` -> `ProductReviewState`
- `ProductVisibility` -> `ProductVisibility`
- `ProductSourceHealth` -> `ProductSourceHealth`
- `ExternalProductSignals` -> `ExternalProductSignals`
- `CustomerReview` -> `CustomerReview`
- `ReviewSummary` -> `ReviewSummary`
- `Ensemble` -> `Ensemble`
- `EnsembleItem` -> `EnsembleItem`
- `AffiliateConfig` -> `AffiliateConfig`
- `User` -> `User`
- `UserProfile` -> `UserProfile`
- `ColorProfile` -> `ColorProfile`
- `PreferenceProfile` -> `PreferenceProfile`
- `SavedProduct` -> `SavedProduct`
- `SavedEnsemble` -> `SavedEnsemble`
- `AuthMethod` -> `AuthMethod`
- `MFAEnrollment` -> `MFAEnrollment`

### Column-level handling notes
- Existing `String @id` values remain application-managed string primary keys. No UUID rewrite in phase 1.
- Existing JSON-like string columns remain strings in phase 1:
  - `rawSnapshotJson`
  - `sourceFieldMapJson`
  - `missingAttributesJson`
  - `uncertainAttributesJson`
  - `paletteFamiliesJson`
  - `colorProfileTagsJson`
  - `preferenceTagsJson`
  - `preferredCategoriesJson`
  - `avoidedColorsJson`
  - `likedPaletteFamiliesJson`
  - `dislikedPaletteFamiliesJson`
  - `fitNotesJson`
  - `transportsJson`
- Phase 2 can selectively promote these to `Json`/`JSONB` once import parity is confirmed.
- Prisma enums map cleanly to PostgreSQL enums via Prisma schema generation.
- Date/time fields map from SQLite text-backed Prisma datetimes to PostgreSQL timestamps through Prisma.
- Foreign key relationships should remain unchanged, with the same cascade/set-null behavior defined in Prisma.

## Migration phases

### Phase 0, bootstrap
1. Install PostgreSQL on host.
2. Create app role and `atelier` database.
3. Use `prisma/schema.postgres.prisma` as the PostgreSQL bootstrap schema.
4. Push schema to empty PostgreSQL database.

### Phase 1, data extraction and import
1. Export current SQLite contents to a deterministic snapshot.
2. Import tables into PostgreSQL in dependency-safe order.
3. Validate row counts and key relationships.
4. Run smoke queries through app Prisma client.

### Phase 2, application cutover
1. Point `DATABASE_URL` to PostgreSQL.
2. Regenerate Prisma client against PostgreSQL schema.
3. Run app/admin smoke tests.
4. Freeze SQLite writes during final sync window.
5. Switch default runtime to PostgreSQL.

### Phase 3, hardening and optimization
1. Convert selected stringified JSON columns to Prisma `Json` where justified.
2. Add PostgreSQL-specific indexes where query patterns warrant them.
3. Review connection pooling strategy for Next.js/server runtime.
4. Add backup/restore procedure and retention checks.

## Concrete artifacts created in this kickoff

### 1. PostgreSQL Prisma schema
Created:
- `prisma/schema.postgres.prisma`

Purpose:
- lets us generate/push a PostgreSQL-compatible schema without breaking the current SQLite path

Validation completed:
- `./node_modules/.bin/prisma generate --schema prisma/schema.postgres.prisma`

### 2. SQLite export artifact and exporter
Created:
- `scripts/export_sqlite_snapshot.py`
- `data/migration/sqlite-snapshot.json`

Purpose:
- produces a stable snapshot of current SQLite rows for verification and import scripting

### 3. PostgreSQL import scaffold
Created:
- `scripts/import_sqlite_snapshot_to_postgres.ts`

Purpose:
- imports the exported snapshot into PostgreSQL via Prisma `createMany()` in dependency-safe order once PostgreSQL is online

### 4. PostgreSQL env template
Created:
- `.env.postgres.example`

### 5. Package scripts
Added:
- `db:postgres:generate`
- `db:postgres:push`
- `db:sqlite:export`
- `db:postgres:import`

## Immediate next implementation tasks

1. Install/start PostgreSQL with sudo using the commands above.
2. Create `.env.postgres` from `.env.postgres.example` with a real password.
3. Run PostgreSQL schema push against the new `atelier` database.
4. Add an import script that reads `data/migration/sqlite-snapshot.json` and inserts into PostgreSQL in table order.
5. Run parity checks:
   - row counts by table
   - orphan checks on foreign keys
   - sample product read from storefront/admin Prisma clients
6. After parity is proven, switch main runtime `DATABASE_URL` from SQLite to PostgreSQL.

## Recommendation

Do not do a schema redesign during cutover. Keep the first PostgreSQL migration structurally equivalent to SQLite, prove parity, then do PostgreSQL-native improvements afterward. That is the lowest-risk path.
