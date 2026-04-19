import { updateInferredProductAction, updateNormalizedProductAction, updateSourceHealthAction, updateSourceProductAction } from '@/app/products/actions';
import type { SourcedProductRecord } from '@atelier/domain';

export function ProductEditForms({ product }: { product: SourcedProductRecord }) {
  const visibilityReasons = product.visibilityDecision?.reasons?.join('; ') ?? '';
  const defaultSourceStatus = product.freshness.lastCheckedAt
    ? product.freshness.priceFreshness.status === 'stale'
      ? 'changed'
      : 'active'
    : 'unknown';
  const defaultNeedsRevalidation = product.freshness.priceFreshness.status === 'stale' ? 'true' : 'false';

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section style={cardStyle}>
        <h3 style={sectionTitle}>Edit source capture</h3>
        <p style={mutedText}>These are captured listing fields. They support manual enrichment intake without claiming that every pasted field has been independently verified.</p>
        <form action={updateSourceProductAction} style={formGridStyle}>
          <input type="hidden" name="productId" value={product.id} />
          {renderInput('sourcePlatform', 'Source platform', product.source.sourcePlatform ?? 'amazon')}
          {renderInput('ingestMethod', 'Ingest method', product.source.ingestMethod ?? 'manual_capture')}
          {renderInput('sourceIdentifier', 'Source identifier', product.source.sourceIdentifier)}
          {renderInput('canonicalUrl', 'Canonical URL', product.source.canonicalUrl ?? '')}
          {renderInput('affiliateUrl', 'Affiliate URL', product.source.affiliateUrl ?? '')}
          {renderInput('imageUrl', 'Image URL', getStringValue(product.source.rawSnapshot?.image))}
          {renderInput('sourceTitle', 'Source title', getStringValue(product.source.rawSnapshot?.title, product.normalized.title))}
          {renderInput('categoryText', 'Source category text', getStringValue(product.source.rawSnapshot?.categoryText, product.normalized.category))}
          {renderInput('colorText', 'Source color text', getStringValue(product.source.rawSnapshot?.colorText, product.normalized.sourceColor))}
          {renderInput('sourcePriceText', 'Source price text', getStringValue(product.source.rawSnapshot?.priceText, product.normalized.priceText))}
          {renderInput('sourceAvailabilityText', 'Source availability text', getStringValue(product.source.rawSnapshot?.availabilityText, product.normalized.availabilityText))}
          <label style={fieldStyle}>
            <span>Source summary</span>
            <textarea name="sourceSummary" defaultValue={getStringValue(product.source.rawSnapshot?.summary)} rows={3} style={textareaStyle} />
          </label>
          <label style={fieldStyle}>
            <span>Source notes</span>
            <textarea name="sourceNotes" defaultValue={getStringValue(product.source.rawSnapshot?.sourceNotes)} rows={3} style={textareaStyle} />
          </label>
          <button type="submit" style={buttonStyle}>Save source capture</button>
        </form>
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitle}>Edit source health</h3>
        <p style={mutedText}>Track whether the listing is active, changed, or needs revalidation. This is operational status, not customer-facing merchandising copy.</p>
        <form action={updateSourceHealthAction} style={formGridStyle}>
          <input type="hidden" name="productId" value={product.id} />
          <label style={fieldStyle}>
            <span>Source status</span>
            <select name="sourceStatus" defaultValue={defaultSourceStatus} style={inputStyle}>
              <option value="unknown">Unknown</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="unavailable">Unavailable</option>
              <option value="changed">Changed</option>
            </select>
          </label>
          {renderInput('sourceCheckResult', 'Source check result', getStringValue(product.freshness.priceFreshness.reason))}
          {renderInput('revalidationReason', 'Revalidation reason', visibilityReasons)}
          <label style={fieldStyle}>
            <span>Needs revalidation</span>
            <select name="needsRevalidation" defaultValue={defaultNeedsRevalidation} style={inputStyle}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </label>
          <button type="submit" style={buttonStyle}>Save source health</button>
        </form>
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitle}>Edit normalized fields</h3>
        <p style={mutedText}>These are reviewable factual fields. Source data remains separate from normalized storefront fields.</p>
        <form action={updateNormalizedProductAction} style={formGridStyle}>
          <input type="hidden" name="productId" value={product.id} />
          {renderInput('title', 'Title', product.normalized.title)}
          {renderInput('brand', 'Brand', product.normalized.brand ?? '')}
          {renderInput('category', 'Category', product.normalized.category ?? '')}
          {renderInput('sourceColor', 'Source color', product.normalized.sourceColor ?? '')}
          {renderInput('material', 'Material', product.normalized.material ?? '')}
          {renderInput('priceText', 'Price text', product.normalized.priceText ?? '')}
          {renderInput('availabilityText', 'Availability text', product.normalized.availabilityText ?? '')}
          <label style={fieldStyle}>
            <span>Summary</span>
            <textarea name="summary" defaultValue={getStringValue(product.source.rawSnapshot?.summary)} rows={4} style={textareaStyle} />
          </label>
          <button type="submit" style={buttonStyle}>Save normalized fields</button>
        </form>
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitle}>Edit inferred fields</h3>
        <p style={mutedText}>These remain explicitly separate interpretation fields, not source facts.</p>
        <form action={updateInferredProductAction} style={formGridStyle}>
          <input type="hidden" name="productId" value={product.id} />
          {renderInput('paletteFamily', 'Palette family', product.inferred.paletteFamily ?? '')}
          {renderInput('colorHarmony', 'Color harmony', product.inferred.colorHarmony ?? '')}
          {renderInput('styleDirection', 'Style direction', product.inferred.styleDirection ?? '')}
          {renderInput('styleOpinion', 'Style opinion', product.inferred.styleOpinion ?? '')}
          <label style={fieldStyle}>
            <span>Confidence</span>
            <select name="dataConfidence" defaultValue={product.provenance.dataConfidence} style={inputStyle}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          {renderInput('confidenceReason', 'Confidence reason', product.provenance.confidenceReason)}
          {renderInput('confidenceImprovement', 'Confidence improvement', product.provenance.confidenceImprovement)}
          {renderInput('missingAttributes', 'Missing attributes (comma separated)', product.provenance.missingAttributes.join(', '))}
          {renderInput('uncertainAttributes', 'Uncertain attributes (comma separated)', product.provenance.uncertainAttributes.join(', '))}
          <button type="submit" style={buttonStyle}>Save inferred fields</button>
        </form>
      </section>
    </div>
  );
}

function getStringValue(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return '';
}

function renderInput(name: string, label: string, defaultValue: string) {
  return (
    <label key={name} style={fieldStyle}>
      <span>{label}</span>
      <input name={name} defaultValue={defaultValue} style={inputStyle} />
    </label>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 20,
  padding: 20,
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
};

const mutedText: React.CSSProperties = {
  margin: '10px 0 0',
  fontSize: 14,
  lineHeight: 1.6,
  color: 'rgba(0,0,0,0.72)',
};

const formGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  marginTop: 16,
};

const fieldStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  fontSize: 13,
  color: 'rgba(0,0,0,0.72)',
};

const inputStyle: React.CSSProperties = {
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: 12,
  padding: '10px 12px',
  fontSize: 14,
};

const textareaStyle: React.CSSProperties = {
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: 12,
  padding: '10px 12px',
  fontSize: 14,
  resize: 'vertical',
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 999,
  border: '1px solid rgba(0,0,0,0.12)',
  background: '#111111',
  color: '#ffffff',
};
