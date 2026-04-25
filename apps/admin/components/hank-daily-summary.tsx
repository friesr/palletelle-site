import type { DashboardDailySummary } from '@/lib/services/dashboard-service';

export function HankDailySummary({ summary }: { summary: DashboardDailySummary }) {
  return (
    <section style={panelStyle}>
      <p style={eyebrowStyle}>Daily summary</p>
      <h3 style={{ margin: '4px 0', fontSize: 18 }}>Executive view</h3>
      <Block title="Yesterday" value={summary.yesterday} />
      <Block title="Today" value={summary.today} />
      <Block title="Campaigns" value={summary.campaigns.length ? summary.campaigns.join(', ') : 'No launches surfaced yet.'} />
      <Block title="Alerts" value={summary.alerts.join(' • ')} />
      <Block title="Issues" value={summary.issues.join(' • ')} />
    </section>
  );
}

function Block({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <strong style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)' }}>{title}</strong>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45 }}>{value}</p>
    </div>
  );
}

const panelStyle: React.CSSProperties = { background: 'var(--panel-strong)', border: '1px solid var(--border)', borderRadius: 18, padding: 14, display: 'grid', gap: 12 };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' };
