import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/session';

const plannedControls = [
  'Homepage hero copy and seasonal campaign blocks',
  'Primary navigation labels and featured collection links',
  'Brand assets including wordmark, accent colors, and trust messaging',
  'Merchandising slots for featured products and ensembles',
  'Storefront notices for attribution, freshness, and editorial disclaimers',
];

export default async function SiteConfigurationPage() {
  await requireAdmin();

  return (
    <section style={cardStyle}>
      <p style={eyebrowStyle}>Site configuration</p>
      <h2 style={{ margin: '8px 0 0', fontSize: 30 }}>Storefront presentation controls</h2>
      <p style={mutedText}>
        This page is the landing area for site-wide configuration. Affiliate connection settings stay in the existing config page, while presentation and merchandising controls are staged here for the next implementation pass.
      </p>

      <div style={gridStyle}>
        {plannedControls.map((item) => (
          <div key={item} style={slotStyle}>{item}</div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/config" style={linkStyle}>Open affiliate configuration</Link>
        <Link href="/ensembles" style={linkStyle}>Open ensemble builder</Link>
      </div>
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 20,
  padding: 20,
  display: 'grid',
  gap: 16,
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
};

const slotStyle: React.CSSProperties = {
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 16,
  padding: 16,
  background: '#f8f6f2',
  lineHeight: 1.5,
};

const linkStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 16px',
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: 999,
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  opacity: 0.55,
};

const mutedText: React.CSSProperties = {
  margin: '10px 0 0',
  fontSize: 14,
  lineHeight: 1.6,
  color: 'rgba(0,0,0,0.72)',
};
