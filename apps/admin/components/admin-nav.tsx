import Link from 'next/link';

const links = [
  { href: '/', label: 'Review queue' },
  { href: '/config', label: 'Affiliate config' },
  { href: '/products', label: 'Product editor' },
  { href: '/ensembles', label: 'Ensemble builder' },
];

export function AdminNav() {
  return (
    <nav style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
      {links.map((link) => (
        <Link key={link.href} href={link.href} style={linkStyle}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

const linkStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 999,
  border: '1px solid rgba(0,0,0,0.12)',
  background: '#fff',
  fontSize: 14,
};
