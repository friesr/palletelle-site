import type { AgentRuntimeStatus } from '@/lib/services/system-status-service';

export function SystemStatusPanel({ status }: { status: AgentRuntimeStatus }) {
  return (
    <section style={cardStyle}>
      <p style={eyebrowStyle}>Runtime health</p>
      <div style={headerRowStyle}>
        <h2 style={{ margin: 0, fontSize: 28 }}>Agent and system status</h2>
        <span style={{ ...pillStyle, background: statusColor[status.overall] }}>{status.overall}</span>
      </div>
      <p style={mutedText}>
        Live local checks for the TUI, gateway, and host health. The TUI is considered stalled when the process is present but the status probe does not answer.
      </p>

      <div style={gridStyle}>
        <div style={panelStyle}>
          <h3 style={sectionTitle}>Agent TUI</h3>
          <p style={mutedText}><strong>Status:</strong> {status.tui.state}</p>
          <p style={mutedText}><strong>PID:</strong> {status.tui.pid ?? 'none'}</p>
          <p style={mutedText}><strong>Process state:</strong> {status.tui.stat ?? 'unknown'}</p>
          <p style={mutedText}><strong>Elapsed:</strong> {status.tui.elapsed ?? 'unknown'}</p>
          <p style={mutedText}><strong>CPU:</strong> {status.tui.cpu !== null ? `${status.tui.cpu.toFixed(1)}%` : 'unknown'}</p>
          <p style={mutedText}><strong>Memory:</strong> {status.tui.memory !== null ? `${status.tui.memory.toFixed(1)}%` : 'unknown'}</p>
          <p style={mutedText}><strong>Note:</strong> {status.tui.note}</p>
        </div>

        <div style={panelStyle}>
          <h3 style={sectionTitle}>Gateway</h3>
          <p style={mutedText}><strong>Status:</strong> {status.gateway.state}</p>
          <p style={mutedText}>
            <strong>Probe:</strong> {status.probe.state}
          </p>
          <pre style={codeStyle}>{status.gateway.note}</pre>
        </div>

        <div style={panelStyle}>
          <h3 style={sectionTitle}>Host</h3>
          <p style={mutedText}><strong>Uptime:</strong> {status.host.uptime}</p>
          <p style={mutedText}><strong>Load average:</strong> {status.host.loadAverage}</p>
          <p style={mutedText}><strong>Memory:</strong> {status.host.memory}</p>
          <p style={mutedText}><strong>Checked:</strong> {status.checkedAt}</p>
        </div>
      </div>
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 20,
  padding: 20,
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  marginTop: 16,
};

const panelStyle: React.CSSProperties = {
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 16,
  padding: 16,
  background: 'rgba(255,255,255,0.7)',
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
  gap: 12,
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  marginTop: 8,
};

const pillStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#102033',
};

const statusColor: Record<AgentRuntimeStatus['overall'], string> = {
  healthy: '#DCEFE1',
  attention: '#F7E7C8',
  stalled: '#F2D2D2',
};

const sectionTitle: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: 20,
};

const mutedText: React.CSSProperties = {
  margin: '8px 0 0',
  fontSize: 14,
  lineHeight: 1.55,
  color: 'rgba(0,0,0,0.72)',
};

const codeStyle: React.CSSProperties = {
  margin: '12px 0 0',
  padding: 12,
  borderRadius: 12,
  background: 'rgba(0,0,0,0.04)',
  whiteSpace: 'pre-wrap',
  fontSize: 12,
  lineHeight: 1.5,
  overflowX: 'auto',
};

