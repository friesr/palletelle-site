import Link from 'next/link';
import type { TeamApprovalOverview as TeamApprovalOverviewType } from '@/lib/services/dashboard-service';

export function TeamApprovalOverview({ overview }: { overview: TeamApprovalOverviewType }) {
  return (
    <section style={panelStyle}>
      <p style={eyebrowStyle}>Team approval overview</p>
      <h3 style={{ margin: '4px 0', fontSize: 18 }}>Delegation and escalation</h3>
      <div style={bucketGridStyle}>
        {overview.buckets.map((bucket) => (
          <Link key={bucket.label} href={bucket.href} style={bucketStyle}>
            <strong>{bucket.count}</strong>
            <span>{bucket.label}</span>
          </Link>
        ))}
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        {overview.owners.map((owner) => (
          <div key={owner.owner} style={rowStyle}><span>{owner.owner}</span><strong>{owner.count}</strong></div>
        ))}
      </div>
      <div style={rowStyle}><span>Oldest unassigned</span><strong>{overview.oldestUnassignedAge}</strong></div>
      <div style={rowStyle}><span>Escalation risk</span><strong>{overview.escalationRisk}</strong></div>
    </section>
  );
}

const panelStyle: React.CSSProperties = { background: 'var(--panel-strong)', border: '1px solid var(--border)', borderRadius: 18, padding: 14, display: 'grid', gap: 12 };
const bucketGridStyle: React.CSSProperties = { display: 'grid', gap: 8, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' };
const bucketStyle: React.CSSProperties = { border: '1px solid var(--border)', borderRadius: 14, padding: 10, display: 'grid', gap: 4, background: 'var(--subtle-panel)' };
const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, color: 'var(--muted)' };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' };
