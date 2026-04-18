import Link from 'next/link';
import type { SourcedProductRecord } from '@atelier/domain';

export function ProductEditorList({ products }: { products: SourcedProductRecord[] }) {
  return (
    <section style={{ display: 'grid', gap: 16 }}>
      {products.map((product) => (
        <article key={product.id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <p style={eyebrowStyle}>{product.stagingStatus}</p>
              <h2 style={{ margin: '8px 0 0', fontSize: 24 }}>{product.normalized.title}</h2>
            </div>
            <div style={{ fontSize: 14, opacity: 0.7 }}>{product.provenance.dataConfidence} confidence</div>
          </div>
          <p style={mutedText}><strong>Source:</strong> {product.source.sourcePlatform} / {product.source.sourceIdentifier}</p>
          <p style={mutedText}><strong>Normalization:</strong> {product.normalized.category ?? 'unknown'} / {product.normalized.sourceColor ?? 'unknown'}</p>
          <p style={mutedText}><strong>Inference boundary:</strong> {product.inferred.colorHarmony ?? 'none'}</p>
          <Link href={`/products/${product.id}`} style={linkStyle}>Open product editor</Link>
        </article>
      ))}
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 20,
  padding: 20,
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  opacity: 0.55,
};

const mutedText: React.CSSProperties = {
  margin: '10px 0 0',
  fontSize: 14,
  lineHeight: 1.6,
  color: 'rgba(0,0,0,0.72)',
};

const linkStyle: React.CSSProperties = {
  display: 'inline-block',
  marginTop: 12,
  padding: '10px 16px',
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: 999,
};
