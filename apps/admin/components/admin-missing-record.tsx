import Link from 'next/link';

export function AdminMissingRecord({
  title,
  backHref,
  backLabel,
}: {
  title: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <section style={cardStyle}>
      <p style={eyebrowStyle}>Admin item state</p>
      <h2 style={{ margin: '8px 0 0', fontSize: 28 }}>{title} not found</h2>
      <p style={mutedText}>
        The requested record could not be found in the current fixture-backed admin dataset.
      </p>
      <div style={{ marginTop: 16 }}>
        <p style={{ ...mutedText, marginTop: 0 }}><strong>Possible reasons:</strong></p>
        <ul style={listStyle}>
          <li>The URL id is incorrect.</li>
          <li>The fixture record was renamed or removed.</li>
          <li>You followed an outdated local admin link.</li>
        </ul>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
        <Link href={backHref} style={primaryLinkStyle}>{backLabel}</Link>
        <Link href="/" style={secondaryLinkStyle}>Back to review queue</Link>
      </div>
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 20,
  padding: 24,
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  opacity: 0.55,
};

const mutedText: React.CSSProperties = {
  margin: '12px 0 0',
  fontSize: 15,
  lineHeight: 1.6,
  color: 'rgba(0,0,0,0.72)',
};

const listStyle: React.CSSProperties = {
  margin: '8px 0 0',
  paddingLeft: 18,
  color: 'rgba(0,0,0,0.72)',
  lineHeight: 1.7,
};

const primaryLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 16px',
  borderRadius: 999,
  background: '#111111',
  color: '#ffffff',
};

const secondaryLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 16px',
  borderRadius: 999,
  border: '1px solid rgba(0,0,0,0.12)',
};
