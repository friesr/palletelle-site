# Titus alignment status, 2026-04-22

## Directive target
Re-align the admin root strictly to:
- single-page KPI + system health dashboard
- real agent status
- real database + pipeline health visibility
- quick-add product URL intake for Ada
- no mock or placeholder data on the admin root

## Exactly what changed this run

### 1) Real agent status on admin root
- Updated `apps/admin/app/api/agents/status/route.ts`
- Changed the agent-status API from `getLaunchControlData()` synthetic/derived agent rows to `getOperationalControlSurface()` real runtime telemetry.
- Admin root now receives the same live agent cards used by system health, including real status, heartbeat, last action, and error state.

### 2) Real pipeline + Ada intake data exposed to the root board
- Updated `apps/admin/lib/services/launch-control-service.ts`
- Added `listRecentManualSubmissions()` into the root dashboard payload.
- Added `quickAddState` to the root launch-control payload so the page can show real recent Ada URL submissions from the database.

### 3) Root pipeline API now returns the real intake payload needed by the single page
- Updated `apps/admin/app/api/commerce/pipeline_status/route.ts`
- Extended the response with:
  - `quickAddState`
  - `lastPublishedAt`

### 4) Quick-add intake API now supports real Ada batch URL intake from the root page
- Updated `apps/admin/app/api/commerce/quick_add/route.ts`
- Added support for:
  - `sourceUrls`
  - `sourceUrlsText`
  - existing single `sourceUrl`
  - optional `title`
  - optional `notes`
- Added revalidation for admin paths after submission.
- This lets the root page queue one or many product URLs directly to the real manual-submission pipeline.

### 5) Admin root board rewritten around the directive
- Updated `apps/admin/components/launch-control-board.tsx`
- The page now centers on:
  - KPI tiles
  - real pipeline state table
  - real database health panel
  - real system health panel
  - real agent status panel
  - Ada quick-add URL intake form
  - recent Ada intake list from real submissions
- Removed the old synthetic agent-status presentation from the root page.
- Replaced the previous single-URL quick-add input with a batch URL textarea plus notes/title.

## Verification completed
- Ran TypeScript compile check successfully:
  - `apps/admin/node_modules/.bin/tsc -p apps/admin/tsconfig.json --noEmit`

## What remains
- The root page still depends on synthesized summary copy in `hankBrief` from `getLaunchControlData()`. The counts are real, but the prose summary and action text are generated summaries rather than first-class operational records.
- `getOperationalControlSurface()` still includes some clearly marked non-live telemetry elsewhere in the system, especially token telemetry notes such as "Historical token telemetry is not wired yet." These are not mocked numbers, but they are still missing real token telemetry.
- The broader admin app still contains many non-root sections labeled as pending or placeholder. This run only re-aligned the admin root as directed.

## Blockers
- No dedicated real agent telemetry source exists yet for Ada as an actual runtime service card distinct from database-derived intake effects, unless it is added into `getOperationalControlSurface()` from a real runtime/process source.
- No dedicated real queue-worker/job-run endpoint was found for Ada intake execution state beyond the persisted manual submission records.
- `next lint` is not currently usable as a non-interactive validation step because it triggers first-time ESLint setup in this repo.

## Missing real endpoints or telemetry discovered
- Missing dedicated real endpoint for Ada worker/runtime status, separate from DB submission evidence.
- Missing dedicated real endpoint for queue/job processing state for quick-add intake.
- Missing real token telemetry endpoint/source for agent usage history in `system-status-service.ts`.

## Notes
- The repository already had many unrelated modified and untracked files before this run. This alignment pass only changed the files listed above.
