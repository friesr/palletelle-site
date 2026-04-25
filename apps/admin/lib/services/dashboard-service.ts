import { prisma } from '@/lib/db';
import { getAffiliateConfig } from '@/lib/services/config-service';
import { getOperationalControlSurface } from '@/lib/services/system-status-service';

export type Tone = 'healthy' | 'watch' | 'critical' | 'neutral';

export interface DashboardTile {
  id: string;
  label: string;
  value: string;
  delta: string;
  stateLabel: string;
  reason: string;
  tone: Tone;
  sparkline: number[];
}

export interface DashboardTrendPanel {
  id: string;
  title: string;
  description: string;
  tone: Tone;
  currentValue: string;
  delta: string;
  points7d: Array<{ label: string; value: number }>;
  points30d: Array<{ label: string; value: number }>;
  annotations?: string[];
}

export interface DashboardDistributionBucket {
  label: string;
  value: number;
  color: string;
}

export interface DashboardAlert {
  id: string;
  severity: Tone;
  source: string;
  title: string;
  detail: string;
  timestamp: string;
  href: string;
  cta: string;
}

export interface DashboardInboxItem {
  id: string;
  owner: string;
  title: string;
  waitingOn: string;
  age: string;
  href: string;
  cta: string;
}

export interface DashboardAgentStatus {
  name: string;
  title: string;
  health: Tone;
  status: string;
  currentTask: string;
  lastHeartbeat: string | null;
  warnings: string[];
}

export interface DashboardDestination {
  label: string;
  href: string;
  detail: string;
  badge?: string;
}

export interface DashboardDailySummary {
  yesterday: string;
  today: string;
  campaigns: string[];
  alerts: string[];
  issues: string[];
}

export interface QuickAddState {
  recentSubmissions: Array<{
    id: string;
    title: string;
    url: string;
    status: string;
    submittedAt: string;
  }>;
  recentResults: Array<{
    id: string;
    title: string;
    status: string;
    note: string;
    href: string;
  }>;
}

export interface TeamApprovalOverview {
  buckets: Array<{ label: string; count: number; href: string }>;
  owners: Array<{ owner: string; count: number }>;
  oldestUnassignedAge: string;
  escalationRisk: string;
}

export interface AdminDashboardData {
  tiles: DashboardTile[];
  trendPanels: DashboardTrendPanel[];
  distributionPanel: {
    title: string;
    description: string;
    buckets: DashboardDistributionBucket[];
  };
  alerts: DashboardAlert[];
  agentInbox: DashboardInboxItem[];
  teamApprovalOverview: TeamApprovalOverview;
  hankDailySummary: DashboardDailySummary;
  quickAddState: QuickAddState;
  destinations: DashboardDestination[];
  agentStatuses: DashboardAgentStatus[];
  healthSummary: {
    server: string;
    database: string;
    api: string;
    queue: string;
  };
  kpis: Array<{ label: string; value: string; delta: string; sparkline: number[]; tone: Tone }>;
  lastUpdatedAt: string;
}

function toneFromCounts(value: number, warnAt = 1, criticalAt = 3): Tone {
  if (value >= criticalAt) return 'critical';
  if (value >= warnAt) return 'watch';
  return 'healthy';
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setUTCDate(value.getUTCDate() + days);
  return value;
}

function startOfUtcDay(date: Date) {
  const value = new Date(date);
  value.setUTCHours(0, 0, 0, 0);
  return value;
}

function formatRelativeAge(date: Date | null | undefined, now: Date) {
  if (!date) return 'n/a';
  const diffMinutes = Math.max(0, Math.round((now.getTime() - date.getTime()) / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const now = new Date();
  const startOfDay = startOfUtcDay(now);
  const weekStart = addDays(startOfDay, -6);
  const monthStart = addDays(startOfDay, -29);

  const [status, config, ensembleCount, totalProducts, newCustomers, customerCount, queueProducts, approvedProducts, publicProducts, holdProducts, recentProducts, recentReviews, recentManualProducts, latestCampaignishProducts] = await Promise.all([
    getOperationalControlSurface(),
    getAffiliateConfig(),
    prisma.ensemble.count(),
    prisma.product.count(),
    prisma.user.count({ where: { createdAt: { gte: weekStart }, role: 'customer' } }),
    prisma.user.count({ where: { role: 'customer' } }),
    prisma.productReviewState.count({ where: { workflowState: { in: ['discovered', 'normalized', 'needs_review', 'needs_refresh', 'hold', 'stale'] } } }),
    prisma.productReviewState.count({ where: { workflowState: 'approved' } }),
    prisma.productVisibility.count({ where: { isPublic: true } }),
    prisma.productReviewState.count({ where: { workflowState: { in: ['hold', 'needs_refresh', 'stale'] } } }),
    prisma.product.findMany({ where: { createdAt: { gte: monthStart } }, select: { createdAt: true } }),
    prisma.productReviewState.findMany({ where: { reviewedAt: { gte: monthStart } }, select: { reviewedAt: true, workflowState: true, reviewedBy: true, reviewerNotes: true, productId: true } }),
    prisma.product.findMany({
      where: { sourceData: { some: { ingestMethod: 'manual_url_submission' } } },
      include: { sourceData: { orderBy: { retrievedAt: 'desc' }, take: 1 }, reviewState: true, normalizedData: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.product.findMany({ where: { createdAt: { gte: weekStart } }, include: { normalizedData: true }, orderBy: { createdAt: 'desc' }, take: 3 }),
  ]);

  const runningAgents = status.agents.filter((agent) => agent.status === 'running').length;
  const degradedAgents = status.agents.filter((agent) => agent.status === 'degraded').length;
  const stoppedAgents = status.agents.filter((agent) => agent.status === 'stopped').length;
  const sourceWarnings = status.agents.filter((agent) => agent.errorState).length;

  const trendDays7 = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const trendDays30 = Array.from({ length: 30 }, (_, index) => addDays(monthStart, index));

  const buildDailySeries = (days: Date[], resolver: (start: Date, end: Date) => number) =>
    days.map((day) => ({ label: formatDayLabel(day), value: resolver(day, addDays(day, 1)) }));

  const intake7 = buildDailySeries(trendDays7, (start, end) => recentProducts.filter((item) => item.createdAt >= start && item.createdAt < end).length);
  const intake30 = buildDailySeries(trendDays30, (start, end) => recentProducts.filter((item) => item.createdAt >= start && item.createdAt < end).length);
  const approved7 = buildDailySeries(trendDays7, (start, end) => recentReviews.filter((item) => item.reviewedAt && item.reviewedAt >= start && item.reviewedAt < end && item.workflowState === 'approved').length);
  const approved30 = buildDailySeries(trendDays30, (start, end) => recentReviews.filter((item) => item.reviewedAt && item.reviewedAt >= start && item.reviewedAt < end && item.workflowState === 'approved').length);
  const load7 = buildDailySeries(trendDays7, (start, end) => recentReviews.filter((item) => item.reviewedAt && item.reviewedAt >= start && item.reviewedAt < end && item.workflowState !== 'approved').length);
  const load30 = buildDailySeries(trendDays30, (start, end) => recentReviews.filter((item) => item.reviewedAt && item.reviewedAt >= start && item.reviewedAt < end && item.workflowState !== 'approved').length);

  const reviewNeedRodney = recentReviews.filter((item) => (item.reviewerNotes ?? '').toLowerCase().includes('rodney')).length;
  const reviewNeedsSpecialist = recentReviews.filter((item) => (item.reviewerNotes ?? '').toLowerCase().includes('specialist')).length;
  const borderlineCount = holdProducts;
  const clearPass = approvedProducts;
  const clearFail = recentReviews.filter((item) => item.workflowState === 'rejected').length;

  return {
    tiles: [
      { id: 'review', label: 'Review queue', value: String(queueProducts), delta: `${approvedProducts} approved`, stateLabel: queueProducts > 0 ? 'attention' : 'clear', reason: 'Items waiting on trust review or refresh', tone: toneFromCounts(queueProducts, 1, 8), sparkline: load7.map((p) => p.value) },
      { id: 'intake', label: 'Intake queue', value: String(recentManualProducts.length), delta: `${recentManualProducts.filter((item) => item.reviewState?.workflowState === 'approved').length} cleared`, stateLabel: recentManualProducts.length > 0 ? 'active' : 'quiet', reason: 'Fresh URL submissions waiting for Ada and review', tone: toneFromCounts(recentManualProducts.length, 2, 5), sparkline: intake7.map((p) => p.value) },
      { id: 'public', label: 'Public products', value: String(publicProducts), delta: `${approvedProducts - publicProducts} ready but not live`, stateLabel: publicProducts > 0 ? 'growing' : 'not live', reason: 'Visible catalog count', tone: publicProducts > 0 ? 'healthy' : 'watch', sparkline: approved7.map((p) => p.value) },
      { id: 'borderline', label: 'Borderline escalations', value: String(borderlineCount), delta: `${reviewNeedRodney} need Rodney`, stateLabel: borderlineCount > 0 ? 'watch' : 'clear', reason: 'Hold, stale, and needs-refresh items', tone: toneFromCounts(borderlineCount, 1, 4), sparkline: load7.map((p) => p.value) },
      { id: 'sources', label: 'Source warnings', value: String(sourceWarnings), delta: `${holdProducts} held`, stateLabel: sourceWarnings > 0 ? 'degraded' : 'clear', reason: 'Agent and source warnings surfaced from ops telemetry', tone: toneFromCounts(sourceWarnings, 1, 3), sparkline: load7.map((p) => p.value) },
      { id: 'agents', label: 'Agent health', value: `${runningAgents}/${status.agents.length}`, delta: `${degradedAgents} degraded`, stateLabel: degradedAgents > 0 || stoppedAgents > 0 ? 'watch' : 'healthy', reason: 'Titus, Hank, Ada, and platform runtime health', tone: degradedAgents > 0 || stoppedAgents > 0 ? 'watch' : 'healthy', sparkline: [runningAgents, runningAgents, runningAgents - degradedAgents, runningAgents, runningAgents] },
      { id: 'latency', label: 'DB / system latency', value: status.database.queryLatencyMs ? `${status.database.queryLatencyMs}ms` : 'n/a', delta: `${status.system.cpuUsagePercent.toFixed(0)}% CPU`, stateLabel: (status.database.queryLatencyMs ?? 0) > 250 ? 'slow' : 'good', reason: 'Database response and host load', tone: (status.database.queryLatencyMs ?? 0) > 250 ? 'watch' : 'healthy', sparkline: [status.system.cpuUsagePercent, status.system.memoryUsagePercent, status.system.cpuUsagePercent, status.system.memoryUsagePercent, status.system.cpuUsagePercent] },
    ],
    kpis: [
      { label: 'Active products', value: String(totalProducts), delta: `+${intake7.reduce((sum, item) => sum + item.value, 0)} this week`, sparkline: intake7.map((p) => p.value), tone: 'healthy' },
      { label: 'Pending ingest/review', value: String(queueProducts), delta: `${holdProducts} stalled`, sparkline: load7.map((p) => p.value), tone: toneFromCounts(queueProducts, 1, 8) },
      { label: 'Enabled affiliates', value: config.connectionStatus === 'not_configured' ? '0' : '1', delta: config.connectionStatus, sparkline: [config.connectionStatus === 'not_configured' ? 0 : 1, config.connectionStatus === 'not_configured' ? 0 : 1, config.connectionStatus === 'not_configured' ? 0 : 1, config.connectionStatus === 'not_configured' ? 0 : 1], tone: config.connectionStatus === 'not_configured' ? 'watch' : 'healthy' },
      { label: 'Customers', value: String(customerCount), delta: `+${newCustomers} new`, sparkline: [Math.max(0, customerCount - 3), Math.max(0, customerCount - 2), Math.max(0, customerCount - 1), customerCount], tone: customerCount > 0 ? 'healthy' : 'neutral' },
      { label: 'Catalog health', value: `${approvedProducts}/${totalProducts || 1}`, delta: `${publicProducts} live`, sparkline: approved7.map((p) => p.value), tone: approvedProducts > 0 ? 'healthy' : 'watch' },
      { label: 'Agent throughput', value: `${recentManualProducts.length} recent`, delta: `${runningAgents} active agents`, sparkline: intake7.map((p) => p.value), tone: runningAgents > 0 ? 'healthy' : 'watch' },
    ],
    trendPanels: [
      {
        id: 'throughput',
        title: 'Catalog throughput trend',
        description: 'Submitted to approved flow over time.',
        tone: approvedProducts >= queueProducts ? 'healthy' : 'watch',
        currentValue: `${approvedProducts} approved`,
        delta: `${Math.max(0, approvedProducts - queueProducts)} net over backlog`,
        points7d: approved7.map((point, index) => ({ label: point.label, value: point.value + intake7[index].value })),
        points30d: approved30.map((point, index) => ({ label: point.label, value: point.value + intake30[index].value })),
        annotations: ['Approval momentum visible when green line stays above intake.'],
      },
      {
        id: 'readiness',
        title: 'Commercial readiness trend',
        description: 'Approved products with monetization and publish readiness.',
        tone: config.connectionStatus !== 'not_configured' && publicProducts > 0 ? 'healthy' : 'watch',
        currentValue: `${publicProducts} live-ready`,
        delta: config.connectionStatus !== 'not_configured' ? 'affiliate config live' : 'affiliate config pending',
        points7d: approved7,
        points30d: approved30,
        annotations: [config.connectionStatus !== 'not_configured' ? 'Affiliate config is enabled.' : 'Revenue data still placeholder until affiliate wiring is enabled.'],
      },
      {
        id: 'load',
        title: 'Operational load trend',
        description: 'Review backlog and intake pressure.',
        tone: queueProducts > approvedProducts ? 'critical' : 'watch',
        currentValue: `${queueProducts} waiting`,
        delta: `${holdProducts} stalled`,
        points7d: load7,
        points30d: load30,
        annotations: ['Lower is better.'],
      },
    ],
    distributionPanel: {
      title: 'Product confidence distribution',
      description: 'Shape of catalog confidence and queue quality, not just averages.',
      buckets: [
        { label: 'High confidence', value: approvedProducts, color: '#22c55e' },
        { label: 'Reviewable', value: Math.max(0, queueProducts - holdProducts), color: '#60a5fa' },
        { label: 'Borderline', value: borderlineCount, color: '#f59e0b' },
        { label: 'Blocked', value: clearFail, color: '#ef4444' },
      ],
    },
    alerts: [
      { id: 'system', severity: degradedAgents > 0 ? 'critical' : 'healthy', source: 'System', title: degradedAgents > 0 ? 'System degraded' : 'System healthy', detail: degradedAgents > 0 ? `${degradedAgents} monitored services are degraded.` : 'No runtime degradation detected.', timestamp: status.checkedAt, href: '/system-health', cta: 'Open system health' },
      { id: 'intake', severity: recentManualProducts.length > 3 ? 'watch' : 'healthy', source: 'Intake', title: recentManualProducts.length > 0 ? 'Fresh Ada intake waiting' : 'No stuck intake jobs', detail: `${recentManualProducts.length} recent manual submissions are in the intake stream.`, timestamp: status.checkedAt, href: '/data-sources', cta: 'Open ingest queue' },
      { id: 'review', severity: queueProducts > 5 ? 'critical' : 'watch', source: 'Review', title: queueProducts > 0 ? 'Review SLA pressure building' : 'Review queue clear', detail: `${queueProducts} items currently need review or refresh.`, timestamp: status.checkedAt, href: '/products', cta: 'Open products queue' },
      { id: 'affiliate', severity: config.connectionStatus !== 'not_configured' ? 'healthy' : 'watch', source: 'Affiliate', title: config.connectionStatus !== 'not_configured' ? 'Affiliate config enabled' : 'Affiliate config blocker', detail: config.connectionStatus !== 'not_configured' ? 'Commercial wiring is enabled.' : 'Revenue routing is not fully live yet.', timestamp: status.checkedAt, href: '/affiliate-config', cta: 'Open affiliate config' },
      { id: 'customers', severity: newCustomers > 0 ? 'healthy' : 'neutral', source: 'Customers', title: newCustomers > 0 ? 'New customer activity this week' : 'No fresh customer growth yet', detail: `${newCustomers} new customers in the last 7 days.`, timestamp: status.checkedAt, href: '/customer-management', cta: 'Open customers' },
    ],
    agentInbox: [
      { id: 'ada', owner: 'Ada', title: recentManualProducts[0] ? `Review ${recentManualProducts[0].normalizedData?.title ?? recentManualProducts[0].slug}` : 'Awaiting new ingest work', waitingOn: recentManualProducts[0] ? 'source review' : 'new URLs', age: formatRelativeAge(recentManualProducts[0]?.createdAt, now), href: '/data-sources', cta: 'Open intake' },
      { id: 'titus', owner: 'Titus', title: degradedAgents > 0 ? 'Investigate degraded runtime' : 'Admin dashboard monitoring', waitingOn: degradedAgents > 0 ? 'system remediation' : 'none', age: formatRelativeAge(now, now), href: '/system-health', cta: 'Open health' },
      { id: 'hank', owner: 'Hank', title: queueProducts > 0 ? 'Review pending approvals' : 'No executive approvals blocked', waitingOn: queueProducts > 0 ? 'decision' : 'none', age: `${queueProducts} items`, href: '/products', cta: 'Open review work' },
    ],
    teamApprovalOverview: {
      buckets: [
        { label: 'Clear pass', count: clearPass, href: '/products' },
        { label: 'Clear fail', count: clearFail, href: '/products' },
        { label: 'Borderline', count: borderlineCount, href: '/products' },
        { label: 'Needs specialist', count: reviewNeedsSpecialist, href: '/agents-automation' },
        { label: 'Needs Rodney', count: reviewNeedRodney, href: '/audit-log' },
      ],
      owners: [
        { owner: 'Ada', count: recentManualProducts.length },
        { owner: 'Hank', count: reviewNeedRodney },
        { owner: 'Titus', count: degradedAgents },
      ],
      oldestUnassignedAge: recentManualProducts[0] ? formatRelativeAge(recentManualProducts[0].createdAt, now) : '0m',
      escalationRisk: reviewNeedRodney > 0 ? 'watch' : 'stable',
    },
    hankDailySummary: {
      yesterday: `${approvedProducts} approved, ${publicProducts} public, ${queueProducts} still waiting.`,
      today: queueProducts > 0 ? 'Reduce queue pressure, push clean approvals forward, and keep Ada intake moving.' : 'Keep the dashboard in monitor mode and add more high-quality catalog supply.',
      campaigns: latestCampaignishProducts.map((product) => product.normalizedData?.title ?? product.slug),
      alerts: [degradedAgents > 0 ? `${degradedAgents} degraded agents` : 'No critical runtime alert', config.connectionStatus !== 'not_configured' ? 'Affiliate config live' : 'Affiliate config still pending'],
      issues: [holdProducts > 0 ? `${holdProducts} items on hold or stale` : 'No major hold pressure', stoppedAgents > 0 ? `${stoppedAgents} stopped services` : 'No stopped monitored services'],
    },
    quickAddState: {
      recentSubmissions: recentManualProducts.map((product) => ({
        id: product.id,
        title: product.normalizedData?.title ?? product.slug,
        url: product.sourceData[0]?.canonicalUrl ?? product.sourceData[0]?.sourceIdentifier ?? 'n/a',
        status: product.reviewState?.workflowState ?? 'discovered',
        submittedAt: product.createdAt.toISOString(),
      })),
      recentResults: recentManualProducts.map((product) => ({
        id: product.id,
        title: product.normalizedData?.title ?? product.slug,
        status: product.reviewState?.workflowState ?? 'discovered',
        note: product.reviewState?.reviewerNotes ?? 'Queued for Ada ingest/review.',
        href: `/products/${product.id}`,
      })),
    },
    destinations: [
      { label: 'Dashboard', href: '/', detail: 'Command center home' },
      { label: 'Products', href: '/products', detail: 'Catalog and review work' },
      { label: 'Site Config', href: '/site-config', detail: 'Storefront and presentation settings' },
      { label: 'Affiliate Config', href: '/affiliate-config', detail: 'Commercial wiring and affiliate health' },
      { label: 'Customer Management', href: '/customer-management', detail: 'Customer accounts and issues' },
      { label: 'Ensemble Building', href: '/ensembles', detail: 'Build and manage ensembles' },
      { label: 'Orders', href: '/orders', detail: 'Order and conversion placeholder section', badge: 'pending live data' },
      { label: 'Campaigns / Promotions', href: '/campaigns', detail: 'Campaign operations and launch tracking' },
      { label: 'Agents / Automation', href: '/agents-automation', detail: 'Agent health and workflow ownership' },
      { label: 'System / Health', href: '/system-health', detail: 'Runtime, DB, and infrastructure' },
      { label: 'Data Sources / Ingest', href: '/data-sources', detail: 'Ingest queue, retries, and sources' },
      { label: 'Content / Pages', href: '/content-pages', detail: 'Admin-managed content surfaces' },
      { label: 'Reports / Analytics', href: '/reports-analytics', detail: 'Deeper metrics and exports' },
      { label: 'Settings / Access Control', href: '/settings-access', detail: 'Admin settings and access control' },
      { label: 'Audit / Activity Log', href: '/audit-log', detail: 'Operational history and review trail' },
    ],
    agentStatuses: status.agents.map((agent) => ({
      name: agent.name,
      title: agent.role,
      health: agent.status === 'running' ? 'healthy' : agent.status === 'degraded' ? 'watch' : 'critical',
      status: agent.status,
      currentTask: agent.lastAction,
      lastHeartbeat: agent.lastHeartbeat,
      warnings: [agent.errorState, agent.timeoutState !== 'none' ? agent.timeoutState : undefined].filter(Boolean) as string[],
    })),
    healthSummary: {
      server: `${status.system.cpuUsagePercent.toFixed(0)}% CPU, ${status.system.memoryUsagePercent.toFixed(0)}% memory`,
      database: status.database.connectionStatus === 'connected' ? `connected, ${status.database.queryLatencyMs ?? 0}ms` : status.database.connectionStatus,
      api: degradedAgents > 0 ? 'degraded' : 'healthy',
      queue: `${queueProducts} pending, ${recentManualProducts.length} fresh Ada intake`,
    },
    lastUpdatedAt: status.checkedAt,
  };
}
