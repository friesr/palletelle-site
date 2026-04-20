import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { prisma } from '@/lib/db';

type CommandResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
  timedOut: boolean;
};

export type ServiceStatus = 'running' | 'stopped' | 'degraded';

export interface AgentStatusCard {
  name: string;
  role: string;
  model: string;
  module: string;
  status: ServiceStatus;
  lastHeartbeat: string | null;
  lastAction: string;
  timeoutState: string;
  errorState?: string;
  tokenRiskStatus?: 'stable' | 'watch' | 'exhausted' | 'unknown';
  tokenUsage24h?: string;
  tokenUsage7d?: string;
  tokenUsage30d?: string;
  tokenTelemetryNote?: string;
}

export interface DatabaseHealthCard {
  name: string;
  role: string;
  model: string;
  module: string;
  status: ServiceStatus;
  connectionStatus: 'connected' | 'disconnected' | 'degraded';
  queryLatencyMs: number | null;
  lastWriteTimestamp: string | null;
  lastHeartbeat: string | null;
  lastAction: string;
  timeoutState: string;
  errorState?: string;
}

export interface SystemHealthCard {
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  uptime: string;
  loadAverage: string;
}

export interface OperationalControlSurface {
  checkedAt: string;
  agents: AgentStatusCard[];
  database: DatabaseHealthCard;
  system: SystemHealthCard;
}

export type AgentRuntimeStatus = OperationalControlSurface;

const execFileAsync = promisify(execFile);

function formatDuration(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GiB`;
}

function formatTimestamp(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  const date = typeof value === 'string' ? new Date(value) : value;
  return `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function buildTokenTelemetry(input: {
  model: string;
  status: ServiceStatus;
  errorState?: string;
}): Pick<AgentStatusCard, 'tokenRiskStatus' | 'tokenUsage24h' | 'tokenUsage7d' | 'tokenUsage30d' | 'tokenTelemetryNote'> {
  const exhausted = /out of tokens|insufficient_quota|quota/i.test(input.errorState ?? '');

  if (exhausted) {
    return {
      tokenRiskStatus: 'exhausted',
      tokenUsage24h: 'unavailable',
      tokenUsage7d: 'unavailable',
      tokenUsage30d: 'unavailable',
      tokenTelemetryNote: 'Recent failure suggests token exhaustion. Historical token telemetry is not wired yet.',
    };
  }

  return {
    tokenRiskStatus: input.status === 'running' ? 'unknown' : 'watch',
    tokenUsage24h: 'unavailable',
    tokenUsage7d: 'unavailable',
    tokenUsage30d: 'unavailable',
    tokenTelemetryNote: `Active model: ${input.model}. Historical token telemetry is not wired yet.`,
  };
}

async function runCommand(command: string, args: string[], timeoutMs = 4000): Promise<CommandResult> {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, { timeout: timeoutMs, maxBuffer: 1024 * 64 });
    return { ok: true, stdout: String(stdout), stderr: String(stderr), timedOut: false };
  } catch (error) {
    const err = error as NodeJS.ErrnoException & { stdout?: string; stderr?: string; timedOut?: boolean; killed?: boolean; signal?: string };
    return {
      ok: false,
      stdout: String(err.stdout ?? ''),
      stderr: String(err.stderr ?? err.message ?? ''),
      timedOut: Boolean(err.timedOut || (err.killed && err.signal === 'SIGTERM')),
    };
  }
}

type SystemdUnitSnapshot = {
  activeState: string;
  subState: string;
  activeEnterTimestamp: string | null;
  result: string;
  execMainStatus: string | null;
};

async function getSystemdUnitSnapshot(unit: string): Promise<SystemdUnitSnapshot> {
  const result = await runCommand('systemctl', ['--user', 'show', unit, '-p', 'ActiveState', '-p', 'SubState', '-p', 'ActiveEnterTimestamp', '-p', 'Result', '-p', 'ExecMainStatus', '--no-pager'], 4000);

  if (!result.ok) {
    return {
      activeState: 'inactive',
      subState: 'dead',
      activeEnterTimestamp: null,
      result: result.timedOut ? 'timeout' : 'failed',
      execMainStatus: null,
    };
  }

  const fields = Object.fromEntries(
    result.stdout
      .trim()
      .split('\n')
      .map((line) => line.split('=', 2))
      .filter((parts) => parts.length === 2),
  ) as Record<string, string>;

  return {
    activeState: fields.ActiveState ?? 'inactive',
    subState: fields.SubState ?? 'dead',
    activeEnterTimestamp: fields.ActiveEnterTimestamp ? fields.ActiveEnterTimestamp : null,
    result: fields.Result ?? 'unknown',
    execMainStatus: fields.ExecMainStatus ?? null,
  };
}

type HttpProbeResult = {
  ok: boolean;
  statusCode: number | null;
  latencyMs: number | null;
  error?: string;
};

async function probeHttp(url: string, timeoutMs = 2500): Promise<HttpProbeResult> {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      redirect: 'manual',
      signal: controller.signal,
    });

    return {
      ok: response.ok || response.status === 307,
      statusCode: response.status,
      latencyMs: Date.now() - startedAt,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'HTTP probe failed';
    return {
      ok: false,
      statusCode: null,
      latencyMs: null,
      error: message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

type ProductSnapshot = {
  id: string;
  slug: string;
  updatedAt: Date;
  createdAt: Date;
  sourceData: Array<{
    sourcePlatform: string;
    ingestMethod: string | null;
    retrievedAt: Date;
  }>;
  reviewState: {
    workflowState: string;
    reviewedAt: Date | null;
    reviewedBy: string | null;
    reviewerNotes: string | null;
  } | null;
  sourceHealth: {
    sourceStatus: string;
    lastSourceCheckAt: Date | null;
    sourceCheckResult: string | null;
    needsRevalidation: boolean;
    revalidationReason: string | null;
  } | null;
};

async function loadRecentProductSnapshots() {
  return prisma.product.findMany({
    take: 25,
    orderBy: { updatedAt: 'desc' },
    include: {
      sourceData: {
        orderBy: { retrievedAt: 'desc' },
        take: 1,
        select: {
          sourcePlatform: true,
          ingestMethod: true,
          retrievedAt: true,
        },
      },
      reviewState: true,
      sourceHealth: true,
    },
  }) as Promise<ProductSnapshot[]>;
}

function summarizeLatestProductAction(product: ProductSnapshot | null) {
  if (!product) {
    return 'No catalog records yet.';
  }

  const source = product.sourceData[0];
  const sourcePlatform = source?.sourcePlatform ?? 'unknown source';
  const ingestMethod = source?.ingestMethod ?? 'unknown ingest';

  return `Latest product ${product.slug} from ${sourcePlatform} via ${ingestMethod}.`;
}

function agentStatusFromProduct(product: ProductSnapshot | null) {
  if (!product) {
    return 'stopped' as const;
  }

  if (product.sourceHealth?.needsRevalidation || product.sourceHealth?.sourceStatus === 'inactive' || product.sourceHealth?.sourceStatus === 'unavailable') {
    return 'degraded' as const;
  }

  return 'running' as const;
}

function reviewStatusFromProduct(product: ProductSnapshot | null) {
  if (!product?.reviewState) {
    return 'stopped' as const;
  }

  if (['hold', 'needs_refresh', 'rejected'].includes(product.reviewState.workflowState)) {
    return 'degraded' as const;
  }

  return 'running' as const;
}

function sourceMonitorStatusFromProduct(product: ProductSnapshot | null) {
  if (!product?.sourceHealth) {
    return 'stopped' as const;
  }

  if (product.sourceHealth.needsRevalidation || ['inactive', 'unavailable', 'changed'].includes(product.sourceHealth.sourceStatus)) {
    return 'degraded' as const;
  }

  return 'running' as const;
}

async function measureDatabaseHealth(): Promise<DatabaseHealthCard> {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const queryLatencyMs = Date.now() - startedAt;
    const latestWrite = await prisma.product.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    });

    const status: ServiceStatus = queryLatencyMs > 250 ? 'degraded' : 'running';

    return {
      name: 'Isaac',
      role: 'database health',
      model: 'Prisma',
      module: 'Prisma + SQLite',
      status,
      connectionStatus: status === 'running' ? 'connected' : 'degraded',
      queryLatencyMs,
      lastWriteTimestamp: formatTimestamp(latestWrite?.updatedAt),
      lastHeartbeat: formatTimestamp(new Date()),
      lastAction: `SELECT 1 in ${queryLatencyMs}ms`,
      timeoutState: 'none',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database probe failed';

    return {
      name: 'Isaac',
      role: 'database health',
      model: 'Prisma',
      module: 'Prisma + SQLite',
      status: 'stopped',
      connectionStatus: 'disconnected',
      queryLatencyMs: null,
      lastWriteTimestamp: null,
      lastHeartbeat: null,
      lastAction: 'Prisma query failed.',
      timeoutState: 'timed out',
      errorState: message,
    };
  }
}

function systemHealthSnapshot(): SystemHealthCard {
  const loadAverage = os.loadavg();
  const cpuCount = Math.max(1, os.cpus().length);
  const cpuUsagePercent = Math.min(100, Math.max(0, (loadAverage[0] / cpuCount) * 100));
  const memoryUsagePercent = Math.min(100, Math.max(0, ((os.totalmem() - os.freemem()) / os.totalmem()) * 100));

  return {
    cpuUsagePercent,
    memoryUsagePercent,
    uptime: formatDuration(os.uptime()),
    loadAverage: loadAverage.map((value) => value.toFixed(2)).join(' / '),
  };
}

async function buildAgentCards(productSnapshots: ProductSnapshot[]): Promise<AgentStatusCard[]> {
  const latestProduct = productSnapshots[0] ?? null;
  const latestReviewed = productSnapshots.find((product) => product.reviewState?.reviewedAt) ?? null;
  const latestSourceHealth = productSnapshots.find((product) => product.sourceHealth?.lastSourceCheckAt) ?? null;
  const latestSourceActivity = productSnapshots.find((product) => product.sourceData[0]) ?? null;

  const orchestratorUnit = await getSystemdUnitSnapshot('openclaw-gateway.service');
  const orchestratorProbe = await runCommand('timeout', ['6s', 'openclaw', 'gateway', 'status'], 7000);
  const orchestratorHealthy = orchestratorUnit.activeState === 'active' && orchestratorUnit.subState === 'running';
  const securityProbe = await runCommand('bash', ['-lc', 'apt list --upgradable 2>/dev/null | tail -n +2 | wc -l'], 4000);
  const pendingUpdateCount = Number.parseInt(securityProbe.stdout.trim(), 10);
  const securityUpdatesPending = Number.isFinite(pendingUpdateCount) ? pendingUpdateCount : 0;

  const uiProbe = await probeHttp('http://127.0.0.1:3000/');
  const adminProbe = await probeHttp('http://127.0.0.1:3001/');
  const database = await measureDatabaseHealth();

  return [
    {
      name: 'Milo',
      role: 'system coordination',
      model: 'OpenClaw Gateway',
      module: 'OpenClaw Gateway',
      status: orchestratorHealthy ? 'running' : orchestratorUnit.activeState === 'active' ? 'degraded' : 'stopped',
      lastHeartbeat: orchestratorHealthy ? formatTimestamp(orchestratorUnit.activeEnterTimestamp) : null,
      lastAction: orchestratorProbe.ok
        ? orchestratorProbe.stdout.trim().split('\n').slice(0, 2).join(' ')
        : `Gateway unit ${orchestratorUnit.activeState}/${orchestratorUnit.subState} (${orchestratorUnit.result}).`,
      timeoutState: orchestratorHealthy ? 'none' : orchestratorProbe.timedOut ? 'timed out' : 'none',
      errorState: orchestratorHealthy ? undefined : orchestratorProbe.timedOut ? 'Gateway status probe timeout.' : `systemd result=${orchestratorUnit.result}${orchestratorUnit.execMainStatus ? `, exit=${orchestratorUnit.execMainStatus}` : ''}`,
      ...buildTokenTelemetry({
        model: 'OpenClaw Gateway',
        status: orchestratorHealthy ? 'running' : orchestratorUnit.activeState === 'active' ? 'degraded' : 'stopped',
        errorState: orchestratorHealthy ? undefined : orchestratorProbe.timedOut ? 'Gateway status probe timeout.' : `systemd result=${orchestratorUnit.result}${orchestratorUnit.execMainStatus ? `, exit=${orchestratorUnit.execMainStatus}` : ''}`,
      }),
    },
    {
      name: 'Atelier Security',
      role: 'system updates & security',
      model: 'apt',
      module: 'system package manager',
      status: securityProbe.ok ? (securityUpdatesPending > 0 ? 'degraded' : 'running') : 'stopped',
      lastHeartbeat: securityProbe.ok ? formatTimestamp(new Date()) : null,
      lastAction: securityProbe.ok
        ? securityUpdatesPending > 0
          ? `Security scan found ${securityUpdatesPending} pending updates.`
          : 'Security scan found no pending updates.'
        : 'Package manager probe failed.',
      timeoutState: securityProbe.timedOut ? 'timed out' : 'none',
      errorState: securityProbe.ok ? undefined : securityProbe.stderr.trim() || 'Package manager probe timeout.',
      ...buildTokenTelemetry({
        model: 'apt',
        status: securityProbe.ok ? (securityUpdatesPending > 0 ? 'degraded' : 'running') : 'stopped',
        errorState: securityProbe.ok ? undefined : securityProbe.stderr.trim() || 'Package manager probe timeout.',
      }),
    },
    {
      name: 'Atelier Catalog',
      role: 'product ingestion, normalization, and provenance',
      model: 'Prisma',
      module: 'Prisma',
      status: agentStatusFromProduct(latestProduct),
      lastHeartbeat: formatTimestamp(latestProduct?.sourceData[0]?.retrievedAt ?? latestProduct?.updatedAt ?? null),
      lastAction: summarizeLatestProductAction(latestProduct),
      timeoutState: 'none',
      errorState: latestProduct?.sourceHealth?.revalidationReason ?? undefined,
      ...buildTokenTelemetry({ model: 'Prisma', status: agentStatusFromProduct(latestProduct), errorState: latestProduct?.sourceHealth?.revalidationReason ?? undefined }),
    },
    {
      name: 'Atelier Trust',
      role: 'trust and quality enforcement',
      model: 'Prisma',
      module: 'Prisma',
      status: reviewStatusFromProduct(latestReviewed),
      lastHeartbeat: formatTimestamp(latestReviewed?.reviewState?.reviewedAt ?? null),
      lastAction: latestReviewed?.reviewState
        ? `Latest review: ${latestReviewed.reviewState.workflowState}${latestReviewed.reviewState.reviewedBy ? ` by ${latestReviewed.reviewState.reviewedBy}` : ''}.`
        : 'No review action recorded.',
      timeoutState: 'none',
      errorState: latestReviewed?.reviewState && ['hold', 'needs_refresh', 'rejected'].includes(latestReviewed.reviewState.workflowState)
        ? latestReviewed.reviewState.reviewerNotes ?? `Workflow state ${latestReviewed.reviewState.workflowState}.`
        : undefined,
      ...buildTokenTelemetry({
        model: 'Prisma',
        status: reviewStatusFromProduct(latestReviewed),
        errorState: latestReviewed?.reviewState && ['hold', 'needs_refresh', 'rejected'].includes(latestReviewed.reviewState.workflowState)
          ? latestReviewed.reviewState.reviewerNotes ?? `Workflow state ${latestReviewed.reviewState.workflowState}.`
          : undefined,
      }),
    },
    {
      name: 'Ezra',
      role: 'external validation and enrichment readiness',
      model: 'Prisma',
      module: 'Prisma',
      status: latestSourceHealth?.sourceHealth?.needsRevalidation || ['inactive', 'unavailable', 'changed'].includes(latestSourceHealth?.sourceHealth?.sourceStatus ?? '')
        ? 'degraded'
        : latestSourceActivity
          ? 'running'
          : 'stopped',
      lastHeartbeat: formatTimestamp(latestSourceActivity?.sourceData[0]?.retrievedAt ?? latestSourceHealth?.sourceHealth?.lastSourceCheckAt ?? null),
      lastAction: latestSourceHealth?.sourceHealth
        ? `Source check: ${latestSourceHealth.sourceHealth.sourceStatus}${latestSourceHealth.sourceHealth.sourceCheckResult ? `, ${latestSourceHealth.sourceHealth.sourceCheckResult}` : ''}.`
        : latestSourceActivity?.sourceData[0]
          ? `Source ingest observed from ${latestSourceActivity.sourceData[0].sourcePlatform} via ${latestSourceActivity.sourceData[0].ingestMethod ?? 'unknown ingest'}.`
          : 'No source validation record yet.',
      timeoutState: 'none',
      errorState: latestSourceHealth?.sourceHealth?.needsRevalidation
        ? latestSourceHealth.sourceHealth.revalidationReason ?? 'Needs revalidation.'
        : undefined,
      ...buildTokenTelemetry({
        model: 'Prisma',
        status: latestSourceHealth?.sourceHealth?.needsRevalidation || ['inactive', 'unavailable', 'changed'].includes(latestSourceHealth?.sourceHealth?.sourceStatus ?? '')
          ? 'degraded'
          : latestSourceActivity
            ? 'running'
            : 'stopped',
        errorState: latestSourceHealth?.sourceHealth?.needsRevalidation
          ? latestSourceHealth.sourceHealth.revalidationReason ?? 'Needs revalidation.'
          : undefined,
      }),
    },
    {
      name: 'Atelier Storefront',
      role: 'storefront runtime',
      model: 'Next.js',
      module: 'Next.js dev',
      status: uiProbe.ok ? 'running' : uiProbe.statusCode ? 'degraded' : 'stopped',
      lastHeartbeat: uiProbe.ok ? formatTimestamp(new Date()) : null,
      lastAction: uiProbe.statusCode ? `GET / -> ${uiProbe.statusCode}${uiProbe.latencyMs !== null ? ` in ${uiProbe.latencyMs}ms` : ''}` : 'Port 3000 probe failed.',
      timeoutState: uiProbe.error?.toLowerCase().includes('timeout') ? 'timed out' : 'none',
      errorState: uiProbe.error ?? undefined,
      ...buildTokenTelemetry({ model: 'Next.js', status: uiProbe.ok ? 'running' : uiProbe.statusCode ? 'degraded' : 'stopped', errorState: uiProbe.error ?? undefined }),
    },
    {
      name: 'Titus',
      role: 'admin backend',
      model: 'Next.js',
      module: 'Next.js dev',
      status: adminProbe.ok ? 'running' : adminProbe.statusCode ? 'degraded' : 'stopped',
      lastHeartbeat: adminProbe.ok ? formatTimestamp(new Date()) : null,
      lastAction: adminProbe.statusCode ? `GET / -> ${adminProbe.statusCode}${adminProbe.latencyMs !== null ? ` in ${adminProbe.latencyMs}ms` : ''}` : 'Port 3001 probe failed.',
      timeoutState: adminProbe.error?.toLowerCase().includes('timeout') ? 'timed out' : 'none',
      errorState: adminProbe.error ?? undefined,
      ...buildTokenTelemetry({ model: 'Next.js', status: adminProbe.ok ? 'running' : adminProbe.statusCode ? 'degraded' : 'stopped', errorState: adminProbe.error ?? undefined }),
    },
    {
      name: 'Mark',
      role: 'trustworthy customer acquisition',
      model: 'Rostered agent',
      module: 'agents/mark/AGENT.md',
      status: 'stopped',
      lastHeartbeat: null,
      lastAction: 'Rostered in the agent contract, with no live runtime probe configured yet.',
      timeoutState: 'none',
      ...buildTokenTelemetry({ model: 'Rostered agent', status: 'stopped' }),
    },
    database,
  ];
}

export async function getOperationalControlSurface(): Promise<OperationalControlSurface> {
  const productSnapshots = await loadRecentProductSnapshots();
  const agents = await buildAgentCards(productSnapshots);
  const database = agents[agents.length - 1] as DatabaseHealthCard;

  return {
    checkedAt: formatTimestamp(new Date()) ?? new Date().toISOString(),
    agents,
    database,
    system: systemHealthSnapshot(),
  };
}

export async function getAgentRuntimeStatus(): Promise<AgentRuntimeStatus> {
  return getOperationalControlSurface();
}
