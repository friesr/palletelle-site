import Link from 'next/link';
import type { DashboardAlert, Tone } from '@/lib/services/dashboard-service';

export function AlertsList({ alerts }: { alerts: DashboardAlert[] }) {
  return (
    <section style={panelStyle}>
      <p style={eyebrowStyle}>Alerts</p>
      <h3 style={{ margin: '4px 0', fontSize: 18 }}>Needs attention now</h3>
      <div style={{ display: 'grid', gap: 10 }}>
        {alerts.slice(0, 5).map((alert) => (
          <article key={alert.id} style={{ ...itemStyle, borderColor: toneBorder[alert.severity] }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <strong>{alert.title}</strong>
              <span style={{ ...pillStyle, ...pillTone[alert.severity] }}>{alert.severity}</span>
            </div>
            <p style={mutedStyle}>{alert.detail}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={mutedStyle}>{alert.timestamp}</span>
              <Link href={alert.href} style={linkStyle}>{alert.cta}</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const panelStyle: React.CSSProperties = { background: 'var(--panel-strong)', border: '1px solid var(--border)', borderRadius: 18, padding: 14, display: 'grid', gap: 12 };
const itemStyle: React.CSSProperties = { border: '1px solid var(--border)', borderRadius: 14, padding: 12, display: 'grid', gap: 8, background: 'var(--subtle-panel)' };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' };
const mutedStyle: React.CSSProperties = { margin: 0, color: 'var(--muted)', fontSize: 12 };
const linkStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: 'var(--accent)' };
const pillStyle: React.CSSProperties = { padding: '4px 8px', borderRadius: 999, fontSize: 10, textTransform: 'uppercase' };
const toneBorder: Record<Tone, string> = { healthy: 'rgba(34,197,94,0.2)', watch: 'rgba(245,158,11,0.2)', critical: 'rgba(239,68,68,0.22)', neutral: 'var(--border)' };
const pillTone: Record<Tone, React.CSSProperties> = { healthy: { background: 'rgba(34,197,94,0.14)', color: '#22c55e' }, watch: { background: 'rgba(245,158,11,0.14)', color: '#f59e0b' }, critical: { background: 'rgba(239,68,68,0.14)', color: '#ef4444' }, neutral: { background: 'rgba(148,163,184,0.14)', color: '#94a3b8' } };
