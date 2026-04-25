import Link from 'next/link';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/products', label: 'Products' },
  { href: '/site-config', label: 'Site Config' },
  { href: '/affiliate-config', label: 'Affiliate Config' },
  { href: '/customer-management', label: 'Customer Management' },
  { href: '/ensembles', label: 'Ensemble Building' },
  { href: '/orders', label: 'Orders' },
  { href: '/campaigns', label: 'Campaigns / Promotions' },
  { href: '/agents-automation', label: 'Agents / Automation' },
  { href: '/system-health', label: 'System / Health' },
  { href: '/data-sources', label: 'Data Sources / Ingest' },
  { href: '/content-pages', label: 'Content / Pages' },
  { href: '/reports-analytics', label: 'Reports / Analytics' },
  { href: '/settings-access', label: 'Settings / Access Control' },
  { href: '/audit-log', label: 'Audit / Activity Log' },
];

export function AdminNav() {
  return (
    <nav style={navStyle}>
      {links.map((link) => (
        <Link key={link.href} href={link.href} style={linkStyle}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

const navStyle: React.CSSProperties = { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 };
const linkStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 999, border: '1px solid var(--border)', background: 'var(--panel)', fontSize: 13 };
