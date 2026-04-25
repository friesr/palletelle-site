# Admin Command Center Spec

## Goal
Build `/` as a true command center so Rodney can tell in under one second:
1. what is great,
2. what needs attention,
3. where to go next.

This is not a text-heavy admin homepage. It is a visual control surface with strong signal, dense hierarchy, and obvious next actions.

## Core operating principle
The dashboard exists to answer fast. Deep work moves to sub-pages.

- **Dashboard** = health, momentum, risk, next actions
- **Sub-pages** = investigation, editing, queue handling, configuration
- **Approval system** = distribute review work safely across the product team, auto-clear the obvious passes/fails, and escalate only uncertainty to Rodney or other senior reviewers

## Product approval principle at scale
Rodney should not personally triage thousands of products.

The admin IA and workflow must support:
- delegated review ownership by role or queue
- high-volume queue handling with strong filters and keyboard-friendly review patterns
- clear review states: `clear pass`, `clear fail`, `borderline`, `needs specialist`, `needs Rodney`
- escalation based on uncertainty, policy conflict, or commercial/trust risk, not raw volume
- product detail pages that make approval easy by separating evidence, recommendation, and final decision controls

Default rule:
- obvious good items should be batchable or one-click approvable by trained internal reviewers
- obvious bad items should be batchable or one-click rejectable by trained internal reviewers
- only ambiguous, conflicting, or high-impact items should escalate upward

## Information architecture

### Primary nav
1. Dashboard
2. Catalog
3. Intake Queue
4. Review Queue
5. Ensembles
6. Analytics
7. R&D Lab
8. Configuration
9. System Health

`R&D Lab` is internal-only. It exists for live experiments, evaluator workflows, and operational learning that should not be presented as a stable public product capability yet.

### Navigation pattern
- Left rail on desktop, bottom nav + More sheet on mobile.
- `Dashboard` is always first.
- Every non-dashboard screen gets a persistent `← Back to Dashboard` action in the page header.
- Dashboard stays visually distinct: darker shell, denser layout, stronger status color system.
- `R&D Lab` should carry clear internal/experimental badges in nav and page chrome so it never reads like a production customer workflow.

## Dashboard, above-the-fold layout
Use a **12-column desktop grid**:
- **Left rail:** 2 cols
- **Main command surface:** 7 cols
- **Right rail:** 3 cols

The first viewport must show, without scrolling on a common laptop:
- status tiles,
- at least 2 trend charts,
- alerts,
- Hank daily summary,
- quick-add product intake.

## Dashboard modules

### 1) Command header
Contains:
- `Command Center` title
- last refresh time
- environment badge
- jump/search control
- primary CTA: `Quick Add Product`
- secondary CTA: `Open Reviews`

### 2) Status tile strip
Top row, instantly scannable. Each tile must use **green / yellow / red** state with icon + label + delta.

Required tiles:
- Review queue
- Intake queue
- Public products
- Borderline escalations
- Source quality warnings
- Agent health
- DB / system latency

Each tile includes:
- primary number
- state label
- short reason
- mini sparkline
- 7d delta

### 3) Trend board
At least **3 trend charts**, visible as real charts, not text summaries.

Required charts:
1. **Catalog throughput trend**: submitted → approved over time
2. **Commercial readiness trend**: approved products with valid monetization / publish readiness
3. **Operational load trend**: review backlog + intake backlog over time

Chart rules:
- green means improving, yellow mixed, red worsening
- current value and delta shown in header
- 7d / 30d toggle
- notable spikes or drops annotated

### 4) Distribution panel
Include **1 histogram / distribution panel** on the dashboard.

Recommended panel:
- **Product confidence distribution** or **source quality score distribution**

Purpose:
- show whether the catalog is clustered in healthy ranges or piling up in risky ranges
- make quality shape visible at a glance, not just averages

### 5) Alerts list
A compact, severity-sorted list of the highest-priority issues.

Priority order:
1. system degraded
2. stuck intake jobs
3. review SLA breaches
4. source revalidation failures
5. config / affiliate blockers

Rules:
- max 5 visible items
- each item has severity color, terse reason, timestamp, CTA
- this is the "needs attention now" rail

### 6) Agent inbox
Separate from alerts. Alerts are emergencies, inbox is workload.

Show:
- assigned agent or owner
- item title
- waiting-on state
- age / freshness
- CTA into queue or record

Examples:
- Ada needs source review
- Ezra flagged validation mismatch
- Review item awaiting publish decision

### 7) Team approval overview
A dedicated dashboard module for review operations at scale.

Show:
- counts by decision bucket: `clear pass`, `clear fail`, `borderline`, `needs specialist`, `needs Rodney`
- counts by owner/team
- oldest unassigned review age
- SLA risk for escalations
- direct actions into the right queue slice

Purpose:
- make delegation visible
- show whether work is flowing to the right people
- surface when Rodney is becoming a bottleneck

### 8) Hank daily summary
Right-rail executive summary card.

Sections:
- headline
- today is going well
- watch closely
- decisions needed
- recommended next move

Rules:
- max ~100 words visible
- crisp, opinionated, action-linked
- not chat UI

### 9) Quick-add product intake
First-class dashboard module, not buried.


Fields:
- product URL
- source selector or auto-detect
- optional working title
- optional note

Actions:
- `Send to Intake`
- `Open Intake Queue`

Success state must show:
- intake ID
- queued status
- routed-to agent/workflow
- link to intake record

### 10) Command menu / launcher
A compact launcher for deeper destinations:
- Catalog
- Intake Queue
- Review Queue
- Ensembles
- Analytics
- R&D Lab
- Configuration
- System Health
- Site Settings

This is navigation support, not the main event.

## What belongs on dashboard vs sub-pages

### Dashboard only
- status tiles
- trend charts
- histogram / distribution
- alerts list
- agent inbox preview
- team approval overview
- Hank daily summary
- quick-add intake
- destination launcher

### Sub-pages
- full queue tables
- item detail and editing
- full product editor
- review decision workflows
- ensemble builder
- analytics deep dives
- R&D experiment tracking and evaluator review
- raw system diagnostics
- config forms

Rule: if it requires reading rows, editing fields, or comparing many records, it belongs off-dashboard.

## Sub-page expectations

### Catalog
- full product table
- filters, search, publish state, product detail editing
- clear link to current review status and assigned owner
- ability to jump from catalog row to product detail or active review record

### Intake Queue
- lifecycle states, ownership, retries, blockers, timestamps
- explicit routing outcomes: `send to review queue`, `return for enrichment`, `auto-fail`, `hold`
- queue rows should explain why an item has not yet become reviewable

### Review Queue
- review backlog with ownership, SLA, and escalation state
- filters for `clear pass`, `clear fail`, `borderline`, `needs specialist`, `needs Rodney`
- fast assignment and reassignment controls
- batch actions for obvious pass/fail items
- detail pages and decision actions

### Product detail / review detail
This page is the decision surface, not just a raw record dump.

It must show, in order:
1. product summary and primary recommendation
2. confidence / risk state with explicit explanation
3. source evidence and provenance
4. normalized product facts
5. issues, policy flags, and uncertainty reasons
6. decision controls and escalation path
7. audit trail

Decision design rules:
- `Approve` should feel safe only when evidence is clean and required fields are present
- `Reject` should support explicit reasons and reusable failure codes
- `Borderline` should capture why the item is uncertain and route to the correct senior queue
- `Needs specialist` should route to the right domain reviewer without bouncing through Rodney
- `Needs Rodney` should be reserved for true judgment calls, not missing admin ergonomics

### Analytics
- deeper charts, date range control, drilldowns, exports

### R&D Lab
This is an internal experimentation surface for testing new operational tooling before it graduates into the core admin workflow.

Initial use case: automated color-season onboarding.

The section should feel native to the command-center model, but clearly separated from production queues and canonical catalog operations.

Routes / panels to support:
- **Experiment tracker**
  - experiment list with status (`draft`, `running`, `paused`, `completed`)
  - owner, hypothesis, cohort size, start date, and latest outcome snapshot
  - explicit guardrail showing whether the experiment affects real user flows, shadow mode only, or internal test data only
- **Sample submissions**
  - intake area for uploading or linking sample onboarding submissions
  - sample metadata: source, lighting quality, demographic notes if captured, consent/test-use state, and whether it is synthetic, seeded, or real-with-permission
  - routing into evaluation batches without polluting the main production intake queue
- **Model confidence review**
  - table or card view of predictions with top predicted season, confidence score, runner-up score, and explanation signals
  - filters for low-confidence outputs, high-confidence disagreements, and no-decision cases
  - quick action to mark `looks correct`, `needs human correction`, or `needs deeper investigation`
- **Failure-case review**
  - cluster failures by reason: image quality, missing context, ambiguous undertone, poor lighting, model overconfidence, taxonomy mismatch, etc.
  - show exemplars, notes, recurrence counts, and whether the issue is data, prompt, model, or UX related
  - support creating follow-up actions without mixing them into customer-facing issue queues
- **Human vs tool comparison**
  - side-by-side comparison of automated output vs human reviewer outcome
  - track agreement rate, direction of disagreement, correction patterns, and time-to-resolution
  - allow confidence-calibration review so the team can see whether the model is wrong, uncertain, or confidently wrong

Design rules:
- internal-only visual labeling, with `Lab`, `Experimental`, or equivalent badges throughout
- clear separation between production decisions and experiment observations
- no public-facing naming or promises embedded in the UI copy
- easy export of reviewed samples and disagreement sets for model iteration
- direct links back to canonical records when a lab sample corresponds to a real catalog or onboarding entity

Primary R&D destinations:
- `Experiments`
- `Sample Library`
- `Confidence Review`
- `Failure Analysis`
- `Human vs Tool`

### Configuration
- site config, affiliate config, thresholds, content controls
- experiment flags, evaluator thresholds, and internal access controls for lab tooling

### System Health
- service-level diagnostics, heartbeat history, latency detail, failure logs

## Visual direction
Make it feel like a command center:
- dark or high-contrast shell is acceptable if premium and quiet
- strong typography hierarchy
- compact cards with real density
- visible state color everywhere it matters
- charts are prominent, not decorative
- minimal prose
- no marketing hero, no oversized empty spacing

## Queue routing model
The admin IA must make route boundaries obvious:

- **Dashboard** answers what needs attention and where to go.
- **Intake Queue** is for newly submitted or machine/agent-prepared items that are not yet decision-ready.
- **Review Queue** is for human approval work on reviewable items.
- **Catalog** is for browsing and editing product records across states.
- **Product Detail / Review Detail** is the focused decision surface for one item.
- **R&D Lab** is for internal experiments, evaluator comparison, and failure analysis that should stay distinct from production operations.

Expected routing:
- new submission → `Intake Queue`
- intake validated and ready for human decision → `Review Queue`
- reviewer opens item → `Product Detail / Review Detail`
- approved item remains editable in `Catalog`
- rejected or held item remains traceable in `Catalog` and relevant queue history
- borderline or high-risk item escalates from `Review Queue` to specialist or Rodney lane
- experimental color-season samples or shadow-mode onboarding runs → `R&D Lab`

The UI should never make a reviewer guess whether they are looking at intake work, approval work, a canonical product record, or experimental lab material.

## Data contract
Create a single dashboard payload that includes:
- `tiles`
- `trendPanels`
- `distributionPanel`
- `alerts`
- `agentInbox`
- `teamApprovalOverview`
- `hankDailySummary`
- `quickAddState`
- `destinations`
- `labSummary` (optional dashboard preview for active experiments or anomaly spikes)
- `lastUpdatedAt`

## Build targets
- `apps/admin/app/page.tsx`
- `apps/admin/app/lab/page.tsx` or `apps/admin/app/r-and-d/page.tsx`
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
- `apps/admin/components/lab-experiment-tracker.tsx`
- `apps/admin/components/lab-sample-submissions.tsx`
- `apps/admin/components/lab-confidence-review.tsx`
- `apps/admin/components/lab-failure-analysis.tsx`
- `apps/admin/components/lab-human-vs-tool.tsx`
- `apps/admin/lib/services/dashboard-service.ts`
- `apps/admin/lib/services/lab-service.ts`

## Non-negotiables
- at least **3 trend charts**
- at least **1 histogram/distribution panel**
- **green / yellow / red** status tiles
- **alerts list**
- **agent inbox**
- **team approval overview**
- **Hank daily summary**
- **quick-add product intake**
- **menu/navigation with back-to-dashboard pattern**
- dashboard optimized for instant comprehension, not explanation
- review UX optimized for delegated approval at scale, not founder-only handholding

## Bottom line
The admin home should feel like an operations cockpit. One glance tells Rodney what is strong, what is slipping, and the fastest next move. Everything else lives on sub-pages.

The new R&D Lab should extend that system cleanly: useful, operationally grounded, and explicitly experimental, with strong boundaries between live production workflows and internal color-season research.
