import type { SourcedProductRecord } from '@atelier/domain';
import { ProductEditForms } from '@/components/product-edit-forms';

export function ProductEditorDetail({ product }: { product: SourcedProductRecord }) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Fixture-backed editor scaffold</p>
        <h2 style={{ margin: '8px 0 0', fontSize: 28 }}>{product.normalized.title}</h2>
        <p style={mutedText}>
          This editor writes through guarded admin actions so source capture, normalized fields, and inferred fields can be updated locally without collapsing trust boundaries.
        </p>
      </section>

      <section style={gridStyle}>
        <div style={cardStyle}>
          <h3 style={sectionTitle}>Source fields</h3>
          <p style={mutedText}><strong>Purpose:</strong> preserved listing snapshot, not storefront truth by itself.</p>
          {Object.entries(product.source.rawSnapshot ?? {}).map(([key, value]) => (
            <p key={key} style={mutedText}><strong>{key}:</strong> {value ?? 'unknown'}</p>
          ))}
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitle}>Normalized editable fields</h3>
          <p style={mutedText}><strong>Purpose:</strong> reviewable factual mapping for product presentation.</p>
          {Object.entries(product.normalized).map(([key, value]) => (
            <p key={key} style={mutedText}><strong>{key}:</strong> {value ?? 'unknown'}</p>
          ))}
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitle}>Inferred fields</h3>
          <p style={mutedText}><strong>Purpose:</strong> directional interpretation that must remain distinct from facts.</p>
          {Object.entries(product.inferred).map(([key, value]) => (
            <p key={key} style={mutedText}><strong>{key}:</strong> {value ?? 'unknown'}</p>
          ))}
        </div>
      </section>

      <section style={gridStyle}>
        <div style={cardStyle}>
          <h3 style={sectionTitle}>Review and staging</h3>
          <p style={mutedText}><strong>Current staging status:</strong> {product.stagingStatus}</p>
          <p style={mutedText}><strong>Confidence:</strong> {product.provenance.dataConfidence}</p>
          <p style={mutedText}><strong>Confidence reason:</strong> {product.provenance.confidenceReason}</p>
        </div>
        <div style={cardStyle}>
          <h3 style={sectionTitle}>Provenance notes</h3>
          <p style={mutedText}><strong>Improve confidence:</strong> {product.provenance.confidenceImprovement}</p>
          <p style={mutedText}><strong>Missing attributes:</strong> {product.provenance.missingAttributes.join(', ') || 'none'}</p>
          <p style={mutedText}><strong>Uncertain attributes:</strong> {product.provenance.uncertainAttributes.join(', ') || 'none'}</p>
        </div>
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitle}>Editing boundary</h3>
        <p style={mutedText}>
          Source capture, normalized fields, and inferred fields are all editable here, but they remain deliberately separated so pasted listing data does not silently become customer-facing truth.
        </p>
      </section>

      <ProductEditForms product={product} />
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 20,
  padding: 20,
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
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
