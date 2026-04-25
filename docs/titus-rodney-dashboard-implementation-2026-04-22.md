### 1. Understanding

Build the admin home as the default operational command dashboard for Palletelle, wire it into the real admin app, keep the desktop view dense and low-scroll, expose live-ready business/system/agent data, add Ada quick-ingest tools, and make the full admin IA navigable through real routes.

### 2. Proposed admin IA

- Dashboard, default admin home and command center
- Products, catalog and review work
- Site Config, storefront settings and presentation controls
- Affiliate Config, affiliate/commercial wiring
- Customer Management, customer counts and issue handling
- Ensemble Building, ensemble creation and merchandising
- Orders, live-ready placeholder route for order ops
- Campaigns / Promotions, campaign operations route
- Agents / Automation, agent ownership and automation workflows
- System / Health, runtime and database diagnostics
- Data Sources / Ingest, Ada intake and manual submissions
- Content / Pages, admin-managed content surfaces
- Reports / Analytics, drilldown reporting destination
- Settings / Access Control, role and policy home
- Audit / Activity Log, operational history and approval trail

### 3. Landing page layout plan

Desktop dashboard is a dense command layout:
- command header
- seven status tiles
- six KPI cards
- two-column trend/distribution grid with 3 trend charts plus 1 distribution panel
- lower operational row with alerts, agent inbox, and team approval overview
- right rail with Hank daily summary, Ada quick-add ingest widget, health snapshot, and full command menu

Scroll is reduced by:
- compact cards and typography
- 2-column main content plus right rail
- summary-first content instead of full tables
- mini sparklines instead of larger historical modules
- only previews on dashboard, deeper work moved to linked sections

### 4. Exact implementation

Files created or heavily updated:
- `apps/admin/app/page.tsx`
- `apps/admin/app/layout.tsx`
- `apps/admin/app/actions.ts`
- `apps/admin/app/globals.css`
- `apps/admin/lib/services/dashboard-service.ts`
- `apps/admin/lib/services/manual-submission-service.ts`
- `apps/admin/components/admin-command-center.tsx`
- `apps/admin/components/admin-nav.tsx`
- `apps/admin/components/status-tiles.tsx`
- `apps/admin/components/trend-panel.tsx`
- `apps/admin/components/distribution-panel.tsx`
- `apps/admin/components/alerts-list.tsx`
- `apps/admin/components/agent-inbox-panel.tsx`
- `apps/admin/components/team-approval-overview.tsx`
- `apps/admin/components/hank-daily-summary.tsx`
- `apps/admin/components/quick-add-product-card.tsx`
- `apps/admin/components/admin-section-shell.tsx`
- `apps/admin/app/site-config/page.tsx`
- `apps/admin/app/affiliate-config/page.tsx`
- `apps/admin/app/customer-management/page.tsx`
- `apps/admin/app/orders/page.tsx`
- `apps/admin/app/campaigns/page.tsx`
- `apps/admin/app/agents-automation/page.tsx`
- `apps/admin/app/system-health/page.tsx`
- `apps/admin/app/data-sources/page.tsx`
- `apps/admin/app/content-pages/page.tsx`
- `apps/admin/app/reports-analytics/page.tsx`
- `apps/admin/app/settings-access/page.tsx`
- `apps/admin/app/audit-log/page.tsx`
- compatibility updates to `apps/admin/components/admin-dashboard.tsx` and `apps/admin/components/admin-dashboard-charts.tsx`

Backend/service changes:
- Replaced dashboard payload with a single command-center contract containing:
  - `tiles`
  - `trendPanels`
  - `distributionPanel`
  - `alerts`
  - `agentInbox`
  - `teamApprovalOverview`
  - `hankDailySummary`
  - `quickAddState`
  - `destinations`
  - `agentStatuses`
  - `healthSummary`
  - `kpis`
  - `lastUpdatedAt`
- Dashboard data now reads from Prisma-backed product, review, visibility, user, affiliate, ensemble, and runtime health services.
- No schema migration was required.
- Added batch quick-add submission support through `createManualSubmissions()`.

API/action shape used by dashboard quick add:
- server action: `quickAddProductsAction(formData)`
- fields:
  - `sourceUrls` newline-separated URLs
  - `title` optional single-item working title
  - `notes` optional Ada note
- result implementation: creates one or more real Prisma product records seeded for Ada intake.

### 5. Ada quick ingest flow

1. Admin pastes one or more URLs into the dashboard Ada quick-add widget.
2. `quickAddProductsAction` parses newline-separated URLs.
3. Action calls `createManualSubmissions()`.
4. Each URL creates a real `Product` plus related source, normalized, inferred, review, lifecycle, source-health, and visibility records.
5. Records are marked with `ingestMethod: manual_url_submission`, routed to Ada in snapshot metadata, and start in `workflowState: discovered`.
6. Dashboard and ingest routes are revalidated.
7. Dashboard shows recent submissions and recent ingest results linking into product detail.

### 6. Validation steps

- Layout behavior
  - open `/` on desktop, confirm command header, status tiles, KPIs, charts, and right rail render in a dense single dashboard view
  - resize below desktop widths and confirm grid collapses to stacked/mobile-safe layout
- Dashboard data loading
  - confirm live counts load from seeded DB and runtime health service
  - verify alerts, quick-add history, and menu render without fixture-only placeholders
- Menu navigation
  - click every nav item in top admin chrome and ensure destination route resolves
  - verify new section pages include back-to-dashboard pattern where used
- Quick ingest submission
  - paste 1 URL, submit, confirm new product record exists
  - paste multiple URLs, submit, confirm multiple records created and appear in recent submissions
- Mobile responsiveness
  - test narrow viewport and confirm tiles/charts/cards stack cleanly and remain usable

### 7. Next highest-value step

Implement the dedicated review queue and decision-surface workflow next, including assignment, escalation buckets, batch pass/fail actions, and clear owner routing. That is the biggest operational unlock after the command dashboard is in place.
