import Link from 'next/link';
import type { DashboardInboxItem } from '@/lib/services/dashboard-service';

export function AgentInboxPanel({ items }: { items: DashboardInboxItem[] }) {
  return (
    <section style={panelStyle}>
      <p style={eyebrowStyle}>Agent inbox</p>
      <h3 style={{ margin: '4px 0', fontSize: 18 }}>Operational workload</h3>
      <div style={{ display: 'grid', gap: 10 }}>
        {items.map((item) => (
          <article key={item.id} style={itemStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <strong>{item.title}</strong>
              <span style={mutedStyle}>{item.owner}</span>
            </div>
            <p style={mutedStyle}>Waiting on {item.waitingOn}, age {item.age}</p>
            <Link href={item.href} style={linkStyle}>{item.cta}</Link>
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
