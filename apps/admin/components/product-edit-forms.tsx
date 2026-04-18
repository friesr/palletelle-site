import { updateInferredProductAction, updateNormalizedProductAction } from '@/app/products/actions';
import type { SourcedProductRecord } from '@atelier/domain';

export function ProductEditForms({ product }: { product: SourcedProductRecord }) {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section style={cardStyle}>
        <h3 style={sectionTitle}>Edit normalized fields</h3>
        <p style={mutedText}>These are reviewable factual fields. Source data remains read-only and is not editable here.</p>
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
            <textarea name="summary" defaultValue={product.source.rawSnapshot?.summary ?? ''} rows={4} style={textareaStyle} />
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
