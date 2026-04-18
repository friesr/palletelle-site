import {
  canDisplayAvailability,
  canDisplayPrice,
  isPublishable,
  type SourcedProductRecord,
  validateForReview,
} from '@atelier/domain';
import { ReviewActions } from '@/components/review-actions';
import { ReviewVisibilityForm } from '@/components/review-visibility-form';

export function ReviewDetail({ product }: { product: SourcedProductRecord }) {
  const validation = validateForReview(product);
  const badges = [
    product.source.ingestMethod,
    product.stagingStatus,
    `${product.provenance.dataConfidence} confidence`,
    product.visibility.isPublic && product.visibility.intendedActive ? 'customer preview enabled' : 'customer preview off',
  ].filter(Boolean) as string[];

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Review detail</p>
        <h2 style={{ margin: '8px 0 0', fontSize: 28 }}>{product.normalized.title}</h2>
        <p style={mutedText}><strong>Source:</strong> {product.source.sourcePlatform} / {product.source.sourceIdentifier}</p>
        <p style={mutedText}><strong>Retrieved:</strong> {product.source.retrievedAt}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {badges.map((badge) => (
            <span key={badge} style={pillStyle}>{badge}</span>
          ))}
        </div>
      </section>

      <section style={gridStyle}>
        <div style={cardStyle}>
          <h3 style={sectionTitle}>Raw source fields</h3>
          <p style={mutedText}><strong>Purpose:</strong> captured source truth snapshot, not normalized storefront truth.</p>
          {Object.entries(product.source.rawSnapshot ?? {}).map(([key, value]) => (
            <p key={key} style={mutedText}><strong>{key}:</strong> {value ?? 'unknown'}</p>
          ))}
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitle}>Normalized facts</h3>
          <p style={mutedText}><strong>Purpose:</strong> explicit source-derived facts mapped into Palletelle structure.</p>
          {Object.entries(product.normalized).map(([key, value]) => (
            <p key={key} style={mutedText}><strong>{key}:</strong> {value ?? 'unknown'}</p>
          ))}
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitle}>Inferred fields</h3>
          <p style={mutedText}><strong>Purpose:</strong> Palletelle interpretation, kept separate from source truth.</p>
          {Object.entries(product.inferred).map(([key, value]) => (
            <p key={key} style={mutedText}><strong>{key}:</strong> {value ?? 'unknown'}</p>
          ))}
        </div>
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitle}>Freshness</h3>
        <p style={mutedText}><strong>Price:</strong> {product.freshness.priceFreshness.status} ({product.freshness.priceFreshness.reason})</p>
        <p style={mutedText}><strong>Availability:</strong> {product.freshness.availabilityFreshness.status} ({product.freshness.availabilityFreshness.reason})</p>
        <p style={mutedText}><strong>Last checked:</strong> {product.freshness.lastCheckedAt ?? 'unknown'}</p>
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitle}>Provenance and confidence</h3>
        <p style={mutedText}><strong>Confidence:</strong> {product.provenance.dataConfidence}</p>
        <p style={mutedText}><strong>Reason:</strong> {product.provenance.confidenceReason}</p>
        <p style={mutedText}><strong>Improve confidence:</strong> {product.provenance.confidenceImprovement}</p>
        <p style={mutedText}><strong>Missing:</strong> {product.provenance.missingAttributes.join(', ') || 'none'}</p>
        <p style={mutedText}><strong>Uncertain:</strong> {product.provenance.uncertainAttributes.join(', ') || 'none'}</p>
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitle}>Display enforcement</h3>
        <p style={mutedText}><strong>Can display price:</strong> {canDisplayPrice(product) ? 'yes' : 'no'}</p>
        <p style={mutedText}><strong>Can display availability:</strong> {canDisplayAvailability(product) ? 'yes' : 'no'}</p>
        <p style={mutedText}><strong>Publishable:</strong> {isPublishable(product) ? 'yes' : 'no'}</p>
        <p style={mutedText}><strong>Validation:</strong> {validation.valid ? 'passes review checks' : `fails: ${validation.reasons.join(', ')}`}</p>
        <p style={mutedText}><strong>Customer preview:</strong> {product.visibility.isPublic && product.visibility.intendedActive ? 'enabled' : 'disabled'}</p>
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitle}>Review actions</h3>
        <p style={mutedText}>Use the primary action to approve and enable customer preview in one step. Hold and reject remain separate workflow states.</p>
        <ReviewActions productId={product.id} />
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitle}>Visibility control</h3>
        <p style={mutedText}>Public intent is editable here, but actual displayability remains derived from review, source health, and trust rules.</p>
        <ReviewVisibilityForm
          productId={product.id}
          isPublic={product.visibility.isPublic}
          intendedActive={product.visibility.intendedActive}
          visibilityNotes={product.visibility.visibilityNotes}
        />
      </section>
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
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
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

const pillStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '6px 10px',
  borderRadius: 999,
  border: '1px solid rgba(0,0,0,0.12)',
  fontSize: 12,
  textTransform: 'uppercase',
};
