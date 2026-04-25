import Link from 'next/link';

export function AdminSectionShell({ title, description, bullets }: { title: string; description: string; bullets: string[] }) {
  return (
    <section style={shellStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <p style={eyebrowStyle}>Admin section</p>
          <h2 style={{ margin: '6px 0 8px', fontSize: 30 }}>{title}</h2>
          <p style={mutedStyle}>{description}</p>
        </div>
        <Link href="/" style={linkStyle}>← Back to Dashboard</Link>
      </div>
      <div style={panelStyle}>
        {bullets.map((item) => <p key={item} style={{ margin: 0, color: 'var(--muted)' }}>• {item}</p>)}
      </div>
    </section>
  );
}

const shellStyle: React.CSSProperties = { display: 'grid', gap: 16 };
const panelStyle: React.CSSProperties = { background: 'var(--panel-strong)', border: '1px solid var(--border)', borderRadius: 20, padding: 18, display: 'grid', gap: 8 };
const linkStyle: React.CSSProperties = { padding: '10px 14px', borderRadius: 999, border: '1px solid var(--border)', background: 'var(--panel)' };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' };
const mutedStyle: React.CSSProperties = { margin: 0, color: 'var(--muted)', fontSize: 14 };
