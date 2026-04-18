import Link from 'next/link';
import type { SourcedProductRecord } from '@atelier/domain';

export function StagingQueueTable({ products }: { products: SourcedProductRecord[] }) {
  return (
    <section style={tableWrapStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={headerCellStyle}>Title</th>
            <th style={headerCellStyle}>Source</th>
            <th style={headerCellStyle}>Status</th>
            <th style={headerCellStyle}>Confidence</th>
            <th style={headerCellStyle}>Freshness</th>
            <th style={headerCellStyle}>Review</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const freshness = `${product.freshness.priceFreshness.status} price / ${product.freshness.availabilityFreshness.status} availability`;

            return (
              <tr key={product.id} style={rowStyle}>
                <td style={cellStyle}>
                  <div>
                    <p style={titleStyle}>{product.normalized.title}</p>
                    <p style={subtleStyle}>{product.id}</p>
                  </div>
                </td>
                <td style={cellStyle}>
                  <p style={bodyTextStyle}>{product.source.sourcePlatform}</p>
                  <p style={subtleStyle}>{product.source.sourceIdentifier}</p>
                </td>
                <td style={cellStyle}><span style={pillStyle}>{product.stagingStatus}</span></td>
                <td style={cellStyle}><span style={pillStyle}>{product.provenance.dataConfidence}</span></td>
                <td style={cellStyle}><p style={bodyTextStyle}>{freshness}</p></td>
                <td style={cellStyle}>
                  <Link href={`/review/${product.id}`} style={linkStyle}>Open</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

const tableWrapStyle: React.CSSProperties = {
  overflowX: 'auto',
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 20,
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const headerCellStyle: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 12,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  opacity: 0.55,
  padding: '16px 18px',
  borderBottom: '1px solid rgba(0,0,0,0.08)',
};

const rowStyle: React.CSSProperties = {
  borderBottom: '1px solid rgba(0,0,0,0.06)',
};

const cellStyle: React.CSSProperties = {
  padding: '16px 18px',
  verticalAlign: 'top',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 600,
};

const bodyTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.5,
  color: 'rgba(0,0,0,0.78)',
};

const subtleStyle: React.CSSProperties = {
  margin: '6px 0 0',
  fontSize: 12,
  color: 'rgba(0,0,0,0.55)',
};

const pillStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '6px 10px',
  borderRadius: 999,
  border: '1px solid rgba(0,0,0,0.12)',
  fontSize: 12,
  textTransform: 'uppercase',
};

const linkStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '8px 12px',
  borderRadius: 999,
  border: '1px solid rgba(0,0,0,0.12)',
};
