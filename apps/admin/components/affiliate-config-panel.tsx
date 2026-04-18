import type { AffiliateConnectionConfig } from '@atelier/domain';

export function AffiliateConfigPanel({ config }: { config: AffiliateConnectionConfig }) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Local configuration scaffold</p>
        <h2 style={{ margin: '8px 0 0', fontSize: 28 }}>Affiliate and store setup</h2>
        <p style={mutedText}>
          This panel is fixture-backed and local only. It does not create or verify any live affiliate/API connection.
        </p>
      </section>

      <section style={gridStyle}>
        <div style={cardStyle}>
          <h3 style={sectionTitle}>Store identity</h3>
          <p style={mutedText}><strong>Store name:</strong> {config.storeName}</p>
          <p style={mutedText}><strong>Platform:</strong> {config.affiliatePlatform}</p>
          <p style={mutedText}><strong>Associate/store ID:</strong> {config.associateTag ?? 'unset'}</p>
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitle}>Connection state</h3>
          <p style={mutedText}><strong>API status:</strong> {config.apiStatus}</p>
          <p style={mutedText}><strong>Connection status:</strong> {config.connectionStatus}</p>
          <p style={mutedText}><strong>Credentials handling:</strong> {config.credentialsState}</p>
        </div>
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitle}>Refresh and freshness placeholders</h3>
        <p style={mutedText}><strong>Price freshness threshold:</strong> {config.refreshPolicy.priceThresholdHours}h</p>
        <p style={mutedText}><strong>Availability freshness threshold:</strong> {config.refreshPolicy.availabilityThresholdHours}h</p>
        <p style={mutedText}><strong>Policy note:</strong> {config.refreshPolicy.note}</p>
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitle}>Configuration notes</h3>
        <p style={mutedText}><strong>Last reviewed:</strong> {config.lastReviewedAt ?? 'unknown'}</p>
        <p style={mutedText}><strong>Notes:</strong> {config.notes ?? 'none'}</p>
        <p style={{ ...mutedText, color: '#8A3B34' }}>
          Secrets are intentionally not stored or edited here. Live credentials/config handling remains out of scope until a reviewed integration path is approved.
        </p>
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
