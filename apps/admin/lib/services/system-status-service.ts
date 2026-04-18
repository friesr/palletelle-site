import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

type CommandResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
  timedOut: boolean;
};

export type AgentRuntimeStatus = {
  overall: 'healthy' | 'attention' | 'stalled';
  checkedAt: string;
  tui: {
    state: 'running' | 'idle' | 'stalled' | 'stopped' | 'unknown';
    pid: number | null;
    stat: string | null;
    elapsed: string | null;
    cpu: number | null;
    memory: number | null;
    note: string;
  };
  gateway: {
    state: 'healthy' | 'degraded' | 'stalled' | 'unknown';
    note: string;
  };
  probe: {
    state: 'responsive' | 'unresponsive';
    note: string;
  };
  host: {
    uptime: string;
    loadAverage: string;
    memory: string;
  };
};

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

async function runCommand(command: string, args: string[], timeoutMs = 5000): Promise<CommandResult> {
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

function parseTuiProcess(stdout: string) {
  const line = stdout.trim().split('\n').find(Boolean);

  if (!line) {
    return null;
  }

  const match = line.trim().match(/^(\d+)\s+(\S+)\s+(\S+)\s+([\d:.]+)\s+([\d.]+)\s+([\d.]+)\s+(.*)$/);

  if (!match) {
    return null;
  }

  const [, pidText, stat, elapsed, cpuText, memoryText, command] = match;

  return {
    pid: Number(pidText),
    stat,
    elapsed,
    cpu: Number(cpuText),
    memory: Number(memoryText),
    command,
  };
}

function summarizeHost() {
  const loadAverage = os.loadavg();
  const memory = `${formatBytes(os.freemem())} free / ${formatBytes(os.totalmem())} total`;

  return {
    uptime: formatDuration(os.uptime()),
    loadAverage: loadAverage.map((value) => value.toFixed(2)).join(' / '),
    memory,
  };
}

export async function getAgentRuntimeStatus(): Promise<AgentRuntimeStatus> {
  const [gatewayResult, probeResult, tuiResult] = await Promise.all([
    runCommand('openclaw', ['gateway', 'status'], 5000),
    runCommand('openclaw', ['status'], 5000),
    runCommand('ps', ['-C', 'openclaw-tui', '-o', 'pid=,stat=,etime=,pcpu=,pmem=,args='], 5000),
  ]);

  const tuiProcess = parseTuiProcess(tuiResult.stdout);
  const tuiRunning = Boolean(tuiProcess);
  const tuiProbeResponsive = probeResult.ok && !probeResult.timedOut;

  const tuiState: AgentRuntimeStatus['tui']['state'] = !tuiRunning
    ? 'stopped'
    : !tuiProbeResponsive
      ? 'stalled'
      : (tuiProcess?.cpu ?? 0) < 0.3
        ? 'idle'
        : 'running';

  const gatewayState: AgentRuntimeStatus['gateway']['state'] = gatewayResult.ok && gatewayResult.stdout.includes('RPC probe: ok')
    ? 'healthy'
    : gatewayResult.timedOut
      ? 'stalled'
      : gatewayResult.ok
        ? 'degraded'
        : 'unknown';

  const overall: AgentRuntimeStatus['overall'] = tuiState === 'stalled' || gatewayState === 'stalled'
    ? 'stalled'
    : tuiState === 'running' && gatewayState === 'healthy'
      ? 'healthy'
      : 'attention';

  return {
    overall,
    checkedAt: new Date().toISOString(),
    tui: {
      state: tuiState,
      pid: tuiProcess?.pid ?? null,
      stat: tuiProcess?.stat ?? null,
      elapsed: tuiProcess?.elapsed ?? null,
      cpu: tuiProcess?.cpu ?? null,
      memory: tuiProcess?.memory ?? null,
      note: tuiRunning
        ? tuiProbeResponsive
          ? 'Process exists and the CLI probe returned.'
          : 'Process exists, but the CLI probe did not return within the timeout.'
        : 'No openclaw-tui process was found.',
    },
    gateway: {
      state: gatewayState,
      note: gatewayResult.ok
        ? gatewayResult.stdout.trim().split('\n').slice(0, 8).join('\n')
        : gatewayResult.timedOut
          ? 'Gateway status command timed out.'
          : gatewayResult.stderr.trim() || 'Gateway status command failed.',
    },
    probe: {
      state: tuiProbeResponsive ? 'responsive' : 'unresponsive',
      note: tuiProbeResponsive
        ? 'openclaw status returned within the timeout.'
        : 'openclaw status did not return within the timeout window.',
    },
    host: summarizeHost(),
  };
}

