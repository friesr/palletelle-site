import type { EnsembleDefinition, ProductRecord } from '@atelier/domain';

function getProductName(products: ProductRecord[], productId: string) {
  return products.find((product) => product.id === productId)?.name ?? productId;
}

export function EnsembleBuilderPanel({
  ensembles,
  products,
}: {
  ensembles: EnsembleDefinition[];
  products: ProductRecord[];
}) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Fixture-backed builder scaffold</p>
        <h2 style={{ margin: '8px 0 0', fontSize: 28 }}>Admin ensemble builder</h2>
        <p style={mutedText}>
          This builder is currently a local scaffold. It groups fixture products into reviewable ensembles without implying live publishing or personalization.
        </p>
      </section>

      {ensembles.map((ensemble) => (
        <section key={ensemble.id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <p style={eyebrowStyle}>{ensemble.source}</p>
              <h3 style={{ margin: '8px 0 0', fontSize: 24 }}>{ensemble.name}</h3>
            </div>
            <div style={{ fontSize: 14, opacity: 0.7 }}>{ensemble.confidence} confidence</div>
          </div>

          <p style={mutedText}><strong>Summary:</strong> {ensemble.summary}</p>
          <p style={mutedText}><strong>Palette relevance:</strong> {ensemble.profileRelevance.paletteFamilies.join(', ') || 'none'}</p>
          <p style={mutedText}><strong>Profile tags:</strong> {ensemble.profileRelevance.colorProfileTags.join(', ') || 'none'}</p>
          <p style={mutedText}><strong>Preference tags:</strong> {ensemble.profileRelevance.preferenceTags.join(', ') || 'none'}</p>

          <div style={{ marginTop: 16, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {ensemble.productSelections.map((selection) => (
              <div key={`${ensemble.id}-${selection.productId}`} style={slotStyle}>
                <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.55 }}>{selection.role}</p>
                <p style={{ margin: '8px 0 0', fontWeight: 600 }}>{getProductName(products, selection.productId)}</p>
                <p style={{ margin: '8px 0 0', fontSize: 14, color: 'rgba(0,0,0,0.72)' }}>Product id: {selection.productId}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
            <div style={slotStyle}>
              <p style={{ margin: 0, fontWeight: 600 }}>Objective rationale</p>
              <p style={mutedText}>{ensemble.rationale.objectiveMatch}</p>
            </div>
            <div style={slotStyle}>
              <p style={{ margin: 0, fontWeight: 600 }}>Inferred rationale</p>
              <p style={mutedText}>{ensemble.rationale.inferredMatch}</p>
            </div>
            <div style={slotStyle}>
              <p style={{ margin: 0, fontWeight: 600 }}>Subjective suggestion</p>
              <p style={mutedText}>{ensemble.rationale.subjectiveSuggestion}</p>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 20,
  padding: 20,
};

const slotStyle: React.CSSProperties = {
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 16,
  padding: 14,
  background: '#f7f5f1',
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
