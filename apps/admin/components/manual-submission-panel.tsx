import Link from 'next/link';
import { createManualSubmissionAction } from '@/app/products/manual-submission/actions';

interface RecentSubmission {
  id: string;
  slug: string;
  createdAt: Date;
  normalizedData: { title: string } | null;
  reviewState: { workflowState: string } | null;
  sourceData: Array<{
    canonicalUrl: string | null;
    sourceIdentifier: string;
  }>;
}

export function ManualSubmissionPanel({ recentSubmissions }: { recentSubmissions: RecentSubmission[] }) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Products</p>
        <h2 style={{ margin: '8px 0 0', fontSize: 30 }}>Manual URL submission</h2>
        <p style={mutedText}>
          Seed a new catalog record from a single URL so Ada can start review before full normalization and enrichment are done.
        </p>
        <form action={createManualSubmissionAction} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          {renderInput('sourceUrl', 'Source URL', 'https://')}
          {renderInput('sourceIdentifier', 'Source identifier', '')}
          {renderInput('title', 'Working title', '')}
          <label style={fieldStyle}>
            <span>Submission notes</span>
            <textarea name="notes" rows={4} style={textareaStyle} placeholder="Why this product matters, any caveats, or sourcing notes." />
          </label>
          <button type="submit" style={buttonStyle}>Create manual submission</button>
        </form>
      </section>

      <section style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <p style={eyebrowStyle}>Recent submissions</p>
            <h3 style={{ margin: '8px 0 0', fontSize: 24 }}>Latest manual intake records</h3>
          </div>
          <Link href="/products" style={linkStyle}>Open product listing editor</Link>
        </div>
        <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          {recentSubmissions.length === 0 ? (
            <div style={emptyStyle}>No manual URL submissions yet.</div>
          ) : (
            recentSubmissions.map((submission) => {
              const source = submission.sourceData[0];
              return (
                <article key={submission.id} style={itemStyle}>
                  <div>
                    <p style={eyebrowStyle}>{submission.reviewState?.workflowState ?? 'discovered'}</p>
                    <h4 style={{ margin: '8px 0 0', fontSize: 18 }}>{submission.normalizedData?.title ?? source?.sourceIdentifier ?? submission.slug}</h4>
                    <p style={mutedText}>{source?.canonicalUrl ?? source?.sourceIdentifier ?? 'No source URL recorded.'}</p>
                  </div>
                  <Link href={`/products/${submission.id}`} style={linkStyle}>Edit record</Link>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function renderInput(name: string, label: string, placeholder: string) {
  return (
    <label style={fieldStyle}>
      <span>{label}</span>
      <input name={name} placeholder={placeholder} style={inputStyle} />
    </label>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 20,
  padding: 20,
};

const itemStyle: React.CSSProperties = {
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 16,
  padding: 16,
  display: 'flex',
  gap: 12,
  justifyContent: 'space-between',
  alignItems: 'flex-start',
};

const emptyStyle: React.CSSProperties = {
  border: '1px dashed rgba(0,0,0,0.14)',
  borderRadius: 16,
  padding: 16,
  color: 'rgba(0,0,0,0.62)',
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
  ...inputStyle,
  resize: 'vertical',
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 999,
  border: '1px solid rgba(0,0,0,0.12)',
  background: '#111111',
  color: '#ffffff',
  width: 'fit-content',
};

const linkStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 16px',
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: 999,
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  opacity: 0.55,
};

const mutedText: React.CSSProperties = {
  margin: '10px 0 0',
  fontSize: 14,
  lineHeight: 1.6,
  color: 'rgba(0,0,0,0.72)',
};
