import {
  canDisplayAvailability,
  canDisplayPrice,
  isPublishable,
  validateForReview,
} from '@atelier/domain';
import { ReviewActions } from '@/components/review-actions';

export function ReviewDetail({ product }: { product: import('@atelier/domain').SourcedProductRecord }) {
  const validation = validateForReview(product);
  const lifecycle = product.lifecycle;
  const visibilityDecision = product.visibilityDecision;
  const rawSnapshot = product.source.rawSnapshot ?? {};
  const sourceImage = [rawSnapshot.image, rawSnapshot.imageUrl, rawSnapshot.mainImage, rawSnapshot.mainImageUrl]
    .find((value) => typeof value === 'string' && value.length > 0) as string | undefined;
  const badges = [
    product.source.ingestMethod,
    lifecycle ? `${lifecycle.reviewState} review` : product.stagingStatus,
    lifecycle?.previewState,
    lifecycle?.publishState,
    `${product.provenance.dataConfidence} confidence`,
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
          <h3 style={sectionTitle}>Lifecycle state</h3>
          {lifecycle ? (
            <>
              <p style={mutedText}><strong>Ingest:</strong> {lifecycle.ingestState}</p>
              <p style={mutedText}><strong>Review:</strong> {lifecycle.reviewState}</p>
              <p style={mutedText}><strong>Preview:</strong> {lifecycle.previewState}</p>
              <p style={mutedText}><strong>Publish:</strong> {lifecycle.publishState}</p>
              <p style={mutedText}><strong>Last changed:</strong> {lifecycle.lastChangedAt ?? 'unknown'} by {lifecycle.lastChangedBy ?? 'unknown'}</p>
              <p style={mutedText}><strong>Notes:</strong> {lifecycle.stateNotes ?? 'none'}</p>
            </>
          ) : (
            <p style={mutedText}>Lifecycle state has not been initialized yet.</p>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitle}>Visibility decision</h3>
          <p style={mutedText}><strong>Current mode:</strong> {visibilityDecision?.mode ?? 'not_visible'}</p>
          <p style={mutedText}><strong>Admin preview visible:</strong> {visibilityDecision?.adminPreviewVisible ? 'yes' : 'no'}</p>
          <p style={mutedText}><strong>Dev customer visible:</strong> {visibilityDecision?.devCustomerVisible ? 'yes' : 'no'}</p>
          <p style={mutedText}><strong>Prod customer visible:</strong> {visibilityDecision?.prodCustomerVisible ? 'yes' : 'no'}</p>
          <p style={mutedText}><strong>Why not customer-visible:</strong> {visibilityDecision?.reasons.join(', ') || 'currently visible'}</p>
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitle}>State-changing actions</h3>
          <p style={mutedText}>Only valid transitions are offered here. Review, preview, and publish remain separate lifecycle states.</p>
          <ReviewActions productId={product.id} lifecycle={lifecycle} />
        </div>
      </section>

      <section style={gridStyle}>
        <div style={cardStyle}>
          <h3 style={sectionTitle}>Source links</h3>
          <p style={mutedText}><strong>Canonical URL:</strong> {product.source.canonicalUrl ? <a href={product.source.canonicalUrl} target="_blank" rel="noreferrer">{product.source.canonicalUrl}</a> : 'unknown'}</p>
          <p style={mutedText}><strong>Affiliate URL:</strong> {product.source.affiliateUrl ? <a href={product.source.affiliateUrl} target="_blank" rel="noreferrer">{product.source.affiliateUrl}</a> : 'unknown'}</p>
          <p style={mutedText}><strong>Source identifier:</strong> {product.source.sourceIdentifier}</p>
          {sourceImage ? (
            <div style={{ marginTop: 14 }}>
              <p style={mutedText}><strong>Source image preview:</strong></p>
              <img src={sourceImage} alt={product.normalized.title} style={sourceImageStyle} />
            </div>
          ) : (
            <p style={mutedText}>No source image URL has been captured yet.</p>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitle}>Raw source fields</h3>
          <p style={mutedText}><strong>Purpose:</strong> captured source truth snapshot, not normalized storefront truth.</p>
          {Object.entries(rawSnapshot).map(([key, value]) => (
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
        <h3 style={sectionTitle}>Price history</h3>
        {product.priceHistory ? (
          <>
            <p style={mutedText}><strong>Current price:</strong> {product.priceHistory.summary.currentPriceText ?? 'unknown'}</p>
            <p style={mutedText}><strong>Previously observed:</strong> {product.priceHistory.summary.previousComparablePriceText ?? 'not yet available'}</p>
            <p style={mutedText}><strong>Lowest observed:</strong> {product.priceHistory.summary.lowestObservedPriceText ?? 'not yet available'}</p>
            <p style={mutedText}><strong>Lowest observed at:</strong> {product.priceHistory.summary.lowestObservedAt ?? 'not yet available'}</p>
            <p style={mutedText}><strong>Tracked observations:</strong> {product.priceHistory.summary.observedPriceCount}</p>
            <p style={mutedText}><strong>History note:</strong> {product.priceHistory.summary.note}</p>
            <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              {product.priceHistory.snapshots.map((snapshot) => (
                <div key={snapshot.id ?? `${snapshot.capturedAt}-${snapshot.priceText}`} style={snapshotCardStyle}>
                  <p style={snapshotTextStyle}><strong>Observed:</strong> {snapshot.priceText}</p>
                  <p style={snapshotTextStyle}><strong>Captured at:</strong> {snapshot.capturedAt}</p>
                  <p style={snapshotTextStyle}><strong>Source listing:</strong> {snapshot.sourceIdentifier ?? 'unknown'}</p>
                  <p style={snapshotTextStyle}><strong>Capture method:</strong> {snapshot.captureMethod ?? 'unknown'}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p style={mutedText}>No source price history has been captured yet for this product.</p>
        )}
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitle}>Display enforcement</h3>
        <p style={mutedText}><strong>Can display price:</strong> {canDisplayPrice(product) ? 'yes' : 'no'}</p>
        <p style={mutedText}><strong>Can display availability:</strong> {canDisplayAvailability(product) ? 'yes' : 'no'}</p>
        <p style={mutedText}><strong>Publishable:</strong> {isPublishable(product) ? 'yes' : 'no'}</p>
        <p style={mutedText}><strong>Validation:</strong> {validation.valid ? 'passes review checks' : `fails: ${validation.reasons.join(', ')}`}</p>
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitle}>Lifecycle audit trail</h3>
        {product.lifecycleAuditTrail?.length ? (
          <div style={{ display: 'grid', gap: 10 }}>
            {product.lifecycleAuditTrail.map((audit) => (
              <div key={`${audit.productId}-${audit.changedAt}-${audit.action}`} style={snapshotCardStyle}>
                <p style={snapshotTextStyle}><strong>When:</strong> {audit.changedAt}</p>
                <p style={snapshotTextStyle}><strong>Who:</strong> {audit.changedBy}</p>
                <p style={snapshotTextStyle}><strong>Action:</strong> {audit.action}</p>
                <p style={snapshotTextStyle}><strong>From:</strong> {audit.fromIngestState} / {audit.fromReviewState} / {audit.fromPreviewState} / {audit.fromPublishState}</p>
                <p style={snapshotTextStyle}><strong>To:</strong> {audit.toIngestState} / {audit.toReviewState} / {audit.toPreviewState} / {audit.toPublishState}</p>
                <p style={snapshotTextStyle}><strong>Reason:</strong> {audit.reason ?? 'none'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={mutedText}>No lifecycle transitions have been recorded yet.</p>
        )}
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

const snapshotCardStyle: React.CSSProperties = {
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 16,
  padding: 14,
};

const snapshotTextStyle: React.CSSProperties = {
  margin: '6px 0 0',
  fontSize: 13,
  lineHeight: 1.6,
  color: 'rgba(0,0,0,0.72)',
};

const sourceImageStyle: React.CSSProperties = {
  marginTop: 10,
  maxWidth: '100%',
  maxHeight: 320,
  borderRadius: 16,
  border: '1px solid rgba(0,0,0,0.08)',
  objectFit: 'contain',
  background: '#fff',
};
