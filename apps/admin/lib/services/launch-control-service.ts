import { prisma } from '@/lib/db';
import { getOperationalControlSurface } from '@/lib/services/system-status-service';
import { listRecentManualSubmissions } from '@/lib/services/manual-submission-service';

function hoursBetween(now: Date, then: Date | null | undefined) {
  if (!then) return null;
  return Math.max(0, (now.getTime() - then.getTime()) / 36e5);
}

function formatAge(date: Date | null | undefined, now = new Date()) {
  if (!date) return 'n/a';
  const minutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function isoOrNull(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function deriveAgentState(lastEventAt: Date | null | undefined, blocked: boolean) {
  if (blocked) return 'stalled';
  if (!lastEventAt) return 'stalled';
  return (hoursBetween(new Date(), lastEventAt) ?? Infinity) <= 24 ? 'active' : 'stalled';
}

export async function getLaunchControlData() {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    totalProducts,
    publishedProducts,
    ingested24h,
    published24h,
    errorCount,
    stuckCount,
    status,
    pipelineRows,
    latestManualSubmission,
    latestReview,
    latestPublished,
    latestProductUpdate,
    recentManualSubmissions,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.productVisibility.count({ where: { isPublic: true } }),
    prisma.product.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.productVisibility.count({ where: { isPublic: true, product: { updatedAt: { gte: dayAgo } } } }),
    prisma.productReviewState.count({ where: { workflowState: { in: ['hold', 'rejected', 'needs_refresh', 'stale'] } } }),
    prisma.productReviewState.count({ where: { workflowState: { in: ['hold', 'needs_refresh', 'stale'] }, product: { updatedAt: { lt: dayAgo } } } }),
    getOperationalControlSurface(),
    prisma.productReviewState.groupBy({ by: ['workflowState'], _count: { workflowState: true }, _min: { productId: true } }),
    prisma.product.findFirst({ where: { sourceData: { some: { ingestMethod: 'manual_url_submission' } } }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
    prisma.productReviewState.findFirst({ where: { reviewedAt: { not: null } }, orderBy: { reviewedAt: 'desc' }, select: { reviewedAt: true } }),
    prisma.productVisibility.findFirst({ where: { isPublic: true }, orderBy: { product: { updatedAt: 'desc' } }, select: { product: { select: { updatedAt: true } } } }),
    prisma.product.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
    listRecentManualSubmissions(),
  ]);

  const trendDays30 = Array.from({ length: 30 }, (_, index) => {
    const day = new Date(now);
    day.setUTCHours(0, 0, 0, 0);
    day.setUTCDate(day.getUTCDate() - (29 - index));
    return day;
  });

  const newProducts30d = await Promise.all(
    trendDays30.map(async (day) => {
      const end = new Date(day);
      end.setUTCDate(end.getUTCDate() + 1);
      const value = await prisma.product.count({ where: { createdAt: { gte: day, lt: end } } });
      return {
        label: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        value,
      };
    }),
  );

  const oldestByState = await Promise.all(
    pipelineRows.map(async (row) => {
      const oldest = await prisma.productReviewState.findFirst({
        where: { workflowState: row.workflowState },
        orderBy: { product: { createdAt: 'asc' } },
        select: { product: { select: { createdAt: true } } },
      });

      return {
        status: row.workflowState,
        count: row._count.workflowState,
        oldestAge: formatAge(oldest?.product.createdAt, now),
      };
    }),
  );

  const systemAgent = status.agents.find((agent) => agent.name === 'Titus');
  const sourceAgent = status.agents.find((agent) => agent.name === 'Ezra');

  const agents = [
    {
      name: 'Ada',
      state: deriveAgentState(latestManualSubmission?.createdAt, stuckCount > 0),
      lastUpdateTime: isoOrNull(latestManualSubmission?.createdAt),
    },
    {
      name: 'Ezra',
      state: deriveAgentState(latestProductUpdate?.updatedAt, Boolean(sourceAgent?.errorState)),
      lastUpdateTime: isoOrNull(latestProductUpdate?.updatedAt),
    },
    {
      name: 'Titus',
      state: systemAgent?.status === 'running' ? 'active' : 'stalled',
      lastUpdateTime: systemAgent?.lastHeartbeat ? new Date(systemAgent.lastHeartbeat.replace(' UTC', 'Z')).toISOString() : null,
    },
    {
      name: 'Hank',
      state: deriveAgentState(latestReview?.reviewedAt, stuckCount > 0),
      lastUpdateTime: isoOrNull(latestReview?.reviewedAt),
    },
  ];

  const blockers = [] as string[];
  if (stuckCount > 0) blockers.push(`${stuckCount} records are stale, on hold, or need refresh for more than 24h.`);
  if (errorCount > 0) blockers.push(`${errorCount} records are currently in error-like review states.`);
  if (status.database.connectionStatus !== 'connected') blockers.push(`Database health is ${status.database.connectionStatus}.`);
  if (systemAgent && systemAgent.status !== 'running') blockers.push(`Admin runtime is ${systemAgent.status}.`);
  if (sourceAgent?.errorState) blockers.push(`Ezra: ${sourceAgent.errorState}`);

  const nextActions = [] as string[];
  if (stuckCount > 0) nextActions.push('Clear oldest stuck review states first.');
  if (errorCount > 0) nextActions.push('Inspect hold/rejected/needs-refresh items in the pipeline table.');
  if (published24h === 0 && publishedProducts > 0) nextActions.push('Push at least one approved product live today.');
  if (nextActions.length === 0) nextActions.push('Maintain ingest flow and monitor agent updates.');

  return {
    generatedAt: now.toISOString(),
    kpis: {
      totalProducts,
      publishedProducts,
      ingested24h,
      published24h,
      errorCount,
      stuckCount,
    },
    trends: {
      newProducts24h: ingested24h,
      newProducts30d,
    },
    pipeline: oldestByState.sort((a, b) => b.count - a.count),
    hankBrief: {
      summary: `${totalProducts} products tracked, ${publishedProducts} published, ${ingested24h} ingested in the last 24h.`,
      blockers,
      nextActions,
    },
    agents,
    quickAddState: {
      recentSubmissions: recentManualSubmissions.slice(0, 6).map((product) => ({
        id: product.id,
        title: product.normalizedData?.title ?? product.slug,
        url: product.sourceData[0]?.canonicalUrl ?? product.sourceData[0]?.sourceIdentifier ?? 'n/a',
        status: product.reviewState?.workflowState ?? 'discovered',
        submittedAt: product.createdAt.toISOString(),
      })),
      recentResults: recentManualSubmissions.slice(0, 6).map((product) => ({
        id: product.id,
        title: product.normalizedData?.title ?? product.slug,
        status: product.reviewState?.workflowState ?? 'discovered',
        note: product.reviewState?.reviewerNotes ?? 'Queued for Ada ingest/review.',
        href: `/products/${product.id}`,
      })),
    },
    lastPublishedAt: isoOrNull(latestPublished?.product.updatedAt),
  };
}
