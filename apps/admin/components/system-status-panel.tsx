import type { OperationalControlSurface, ServiceStatus } from '@/lib/services/system-status-service';

export function SystemStatusPanel({ status }: { status: OperationalControlSurface }) {
  const counts = status.agents.reduce(
    (acc, agent) => {
      acc[agent.status] += 1;
      return acc;
    },
    { running: 0, degraded: 0, stopped: 0 } satisfies Record<ServiceStatus, number>,
  );

  return (
    <section style={cardStyle}>
      <div style={headerRowStyle}>
        <div>
          <p style={eyebrowStyle}>Operational control surface</p>
          <h2 style={{ margin: '8px 0 0', fontSize: 28 }}>Agent and system status</h2>
          <p style={mutedText}>
            Live, local status signals for the orchestrator, content pipeline, runtimes, and database. Colors mean running, degraded, or stopped, nothing more.
          </p>
        </div>
        <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
          <span style={{ ...pillStyle, ...pillTone.running }}>Running {counts.running}</span>
          <span style={{ ...pillStyle, ...pillTone.degraded }}>Degraded {counts.degraded}</span>
          <span style={{ ...pillStyle, ...pillTone.stopped }}>Stopped {counts.stopped}</span>
        </div>
      </div>

      <div style={summaryRowStyle}>
        <SummaryChip label="Checked" value={status.checkedAt} />
        <SummaryChip label="CPU" value={formatPercent(status.system.cpuUsagePercent)} tone={status.system.cpuUsagePercent >= 80 ? 'degraded' : 'running'} />
        <SummaryChip label="Memory" value={formatPercent(status.system.memoryUsagePercent)} tone={status.system.memoryUsagePercent >= 80 ? 'degraded' : 'running'} />
        <SummaryChip label="Uptime" value={status.system.uptime} />
        <SummaryChip label="Load" value={status.system.loadAverage} />
      </div>

      <div style={sectionHeaderRowStyle}>
        <h3 style={sectionTitle}>Named agents</h3>
        <p style={sectionHint}>Each card shows role, current state, last heartbeat, last action, and any error state.</p>
      </div>

      <div style={agentGridStyle}>
        {status.agents.map((agent) => (
          <AgentCard key={agent.name} agent={agent} />
        ))}
      </div>

      <div style={lowerGridStyle}>
        <DatabasePanel database={status.database} />
        <section style={panelStyle}>
          <h3 style={sectionTitle}>System health</h3>
          <p style={mutedText}><strong>CPU usage:</strong> {formatPercent(status.system.cpuUsagePercent)}</p>
          <p style={mutedText}><strong>Memory usage:</strong> {formatPercent(status.system.memoryUsagePercent)}</p>
          <p style={mutedText}><strong>Uptime:</strong> {status.system.uptime}</p>
          <p style={mutedText}><strong>Load average:</strong> {status.system.loadAverage}</p>
          <p style={mutedText}>This is a lightweight local snapshot, suitable for dev-safe monitoring and future signal wiring.</p>
        </section>
      </div>
    </section>
  );
}

function AgentCard({ agent }: { agent: OperationalControlSurface['agents'][number] }) {
  return (
    <section style={panelStyle}>
      <div style={cardHeaderRowStyle}>
        <div>
          <h4 style={cardTitle}>{agent.name}</h4>
          <p style={cardRole}>{agent.role}</p>
        </div>
        <span style={{ ...pillStyle, ...pillTone[agent.status] }}>{agent.status}</span>
      </div>
      <p style={mutedText}><strong>Model:</strong> {agent.model}</p>
      <p style={mutedText}><strong>Module:</strong> {agent.module}</p>
      <p style={mutedText}><strong>Token risk:</strong> {agent.tokenRiskStatus ?? 'unknown'}</p>
      <p style={mutedText}><strong>Token use 24h:</strong> {agent.tokenUsage24h ?? 'unavailable'}</p>
      <p style={mutedText}><strong>Token use 7d:</strong> {agent.tokenUsage7d ?? 'unavailable'}</p>
      <p style={mutedText}><strong>Token use 30d:</strong> {agent.tokenUsage30d ?? 'unavailable'}</p>
      <p style={mutedText}><strong>Timeout:</strong> {agent.timeoutState}</p>
      <p style={mutedText}><strong>Last heartbeat:</strong> {formatTimestamp(agent.lastHeartbeat)}</p>
      <p style={mutedText}><strong>Last action:</strong> {agent.lastAction}</p>
      {agent.tokenTelemetryNote ? <p style={mutedText}><strong>Telemetry:</strong> {agent.tokenTelemetryNote}</p> : null}
      {agent.errorState ? <p style={{ ...mutedText, color: '#8A3B34' }}><strong>Error:</strong> {agent.errorState}</p> : null}
    </section>
  );
}

function DatabasePanel({ database }: { database: OperationalControlSurface['database'] }) {
  return (
    <section style={panelStyle}>
      <h3 style={sectionTitle}>Database health</h3>
      <div style={cardHeaderRowStyle}>
        <div>
          <p style={cardRole}>{database.role}</p>
          <h4 style={cardTitle}>{database.name}</h4>
        </div>
        <span style={{ ...pillStyle, ...pillTone[database.status] }}>{database.status}</span>
      </div>
      <p style={mutedText}><strong>Model:</strong> {database.model}</p>
      <p style={mutedText}><strong>Module:</strong> {database.module}</p>
      <p style={mutedText}><strong>Timeout:</strong> {database.timeoutState}</p>
      <p style={mutedText}><strong>Connection:</strong> {database.connectionStatus}</p>
      <p style={mutedText}><strong>Query latency:</strong> {database.queryLatencyMs !== null ? `${database.queryLatencyMs}ms` : '—'}</p>
      <p style={mutedText}><strong>Last write:</strong> {formatTimestamp(database.lastWriteTimestamp)}</p>
      <p style={mutedText}><strong>Last heartbeat:</strong> {formatTimestamp(database.lastHeartbeat)}</p>
      <p style={mutedText}><strong>Last action:</strong> {database.lastAction}</p>
      {database.errorState ? <p style={{ ...mutedText, color: '#8A3B34' }}><strong>Error:</strong> {database.errorState}</p> : null}
    </section>
  );
}

function SummaryChip({ label, value, tone = 'running' }: { label: string; value: string; tone?: ServiceStatus }) {
  return (
    <div style={{ ...summaryChipStyle, ...pillTone[tone] }}>
      <span style={summaryChipLabel}>{label}</span>
      <span style={summaryChipValue}>{value}</span>
    </div>
  );
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return '—';
  }

  return value;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 20,
  padding: 20,
};

const panelStyle: React.CSSProperties = {
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 16,
  padding: 16,
  background: 'rgba(255,255,255,0.82)',
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  opacity: 0.55,
};

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
};

const summaryRowStyle: React.CSSProperties = {
  display: 'grid',
  gap: 10,
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  marginTop: 18,
};

const summaryChipStyle: React.CSSProperties = {
  borderRadius: 14,
  padding: '10px 12px',
  border: '1px solid rgba(0,0,0,0.08)',
  display: 'grid',
  gap: 2,
};

const summaryChipLabel: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  opacity: 0.7,
};

const summaryChipValue: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.35,
};

const sectionHeaderRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  justifyContent: 'space-between',
  alignItems: 'baseline',
  flexWrap: 'wrap',
  marginTop: 20,
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
};

const sectionHint: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: 'rgba(0,0,0,0.62)',
};

const agentGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 14,
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  marginTop: 14,
};

const lowerGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 14,
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  marginTop: 16,
};

const cardHeaderRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'flex-start',
  marginBottom: 8,
};

const cardTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
};

const cardRole: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: 12,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  opacity: 0.6,
};

const mutedText: React.CSSProperties = {
  margin: '8px 0 0',
  fontSize: 14,
  lineHeight: 1.55,
  color: 'rgba(0,0,0,0.72)',
};

const pillStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#102033',
  whiteSpace: 'nowrap',
};

const pillTone: Record<ServiceStatus, React.CSSProperties> = {
  running: { background: '#DCEFE1' },
  degraded: { background: '#F7E7C8' },
  stopped: { background: '#F2D2D2' },
};
