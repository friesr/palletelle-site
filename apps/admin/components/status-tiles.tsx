import type { DashboardTile, Tone } from '@/lib/services/dashboard-service';

export function StatusTiles({ tiles }: { tiles: DashboardTile[] }) {
  return (
    <section style={gridStyle}>
      {tiles.map((tile) => (
        <article key={tile.id} style={{ ...cardStyle, borderColor: toneBorder[tile.tone] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <p style={eyebrowStyle}>{tile.label}</p>
            <span style={{ ...pillStyle, ...pillTone[tile.tone] }}>{tile.stateLabel}</span>
          </div>
          <h3 style={{ margin: '4px 0', fontSize: 26 }}>{tile.value}</h3>
          <p style={mutedStyle}>{tile.delta}</p>
          <div style={sparklineStyle}>
            {tile.sparkline.map((value, index) => (
              <span key={`${tile.id}-${index}`} style={{ ...sparkBarStyle, height: `${Math.max(12, value * 8)}px`, background: toneFill[tile.tone] }} />
            ))}
          </div>
          <p style={{ ...mutedStyle, marginTop: 4 }}>{tile.reason}</p>
        </article>
      ))}
    </section>
  );
}

const gridStyle: React.CSSProperties = { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' };
const cardStyle: React.CSSProperties = { background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 18, padding: 14, display: 'grid', gap: 8 };
const sparklineStyle: React.CSSProperties = { display: 'flex', gap: 5, alignItems: 'end', minHeight: 42 };
const sparkBarStyle: React.CSSProperties = { flex: 1, borderRadius: 999, opacity: 0.9 };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' };
const mutedStyle: React.CSSProperties = { margin: 0, color: 'var(--muted)', fontSize: 13 };
const pillStyle: React.CSSProperties = { padding: '4px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' };
const pillTone: Record<Tone, React.CSSProperties> = { healthy: { background: 'rgba(34,197,94,0.14)', color: '#22c55e' }, watch: { background: 'rgba(245,158,11,0.14)', color: '#f59e0b' }, critical: { background: 'rgba(239,68,68,0.14)', color: '#ef4444' }, neutral: { background: 'rgba(148,163,184,0.14)', color: '#94a3b8' } };
const toneBorder: Record<Tone, string> = { healthy: 'rgba(34,197,94,0.22)', watch: 'rgba(245,158,11,0.24)', critical: 'rgba(239,68,68,0.24)', neutral: 'var(--border)' };
const toneFill: Record<Tone, string> = { healthy: '#22c55e', watch: '#f59e0b', critical: '#ef4444', neutral: '#64748b' };
