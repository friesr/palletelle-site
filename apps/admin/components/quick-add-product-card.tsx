import Link from 'next/link';
import { quickAddProductsAction } from '@/app/actions';
import type { QuickAddState } from '@/lib/services/dashboard-service';

export function QuickAddProductCard({ quickAddState }: { quickAddState: QuickAddState }) {
  return (
    <section id="ada-quick-add" style={panelStyle}>
      <p style={eyebrowStyle}>Ada quick tools</p>
      <h3 style={{ margin: '4px 0', fontSize: 18 }}>Quick add product ingest</h3>
      <form action={quickAddProductsAction} style={{ display: 'grid', gap: 10 }}>
        <label style={fieldStyle}>
          <span>Product URLs</span>
          <textarea name="sourceUrls" rows={5} style={inputStyle} placeholder="Paste one URL per line" />
        </label>
        <label style={fieldStyle}>
          <span>Working title</span>
          <input name="title" style={inputStyle} placeholder="Optional title applied to single submission" />
        </label>
        <label style={fieldStyle}>
          <span>Notes for Ada</span>
          <textarea name="notes" rows={3} style={inputStyle} placeholder="Priority, caveats, or source notes" />
        </label>
        <button type="submit" style={buttonStyle}>Send to Ada intake</button>
      </form>
      <div style={{ display: 'grid', gap: 10 }}>
        <strong style={{ fontSize: 13 }}>Recent submissions</strong>
        {quickAddState.recentSubmissions.map((item) => (
          <article key={item.id} style={itemStyle}>
            <div>
              <strong>{item.title}</strong>
              <p style={mutedStyle}>{item.url}</p>
            </div>
            <span style={mutedStyle}>{item.status}</span>
          </article>
        ))}
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        <strong style={{ fontSize: 13 }}>Recent results</strong>
        {quickAddState.recentResults.map((item) => (
          <Link key={item.id} href={item.href} style={itemStyle}>
            <div>
              <strong>{item.title}</strong>
              <p style={mutedStyle}>{item.note}</p>
            </div>
            <span style={mutedStyle}>{item.status}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

const panelStyle: React.CSSProperties = { background: 'var(--panel-strong)', border: '1px solid var(--border)', borderRadius: 18, padding: 14, display: 'grid', gap: 12 };
const fieldStyle: React.CSSProperties = { display: 'grid', gap: 6, fontSize: 12, color: 'var(--muted)' };
const inputStyle: React.CSSProperties = { border: '1px solid var(--border)', borderRadius: 12, background: 'var(--subtle-panel)', color: 'var(--text)', padding: '10px 12px', fontSize: 14 };
const buttonStyle: React.CSSProperties = { padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(59,130,246,0.2)', background: '#2563eb', color: '#eff6ff', fontWeight: 700 };
const itemStyle: React.CSSProperties = { border: '1px solid var(--border)', borderRadius: 12, background: 'var(--subtle-panel)', padding: 10, display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' };
const mutedStyle: React.CSSProperties = { margin: '4px 0 0', color: 'var(--muted)', fontSize: 12, lineHeight: 1.4 };
