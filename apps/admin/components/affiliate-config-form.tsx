import { updateAffiliateConfigAction } from '@/app/config/actions';
import type { AffiliateConnectionConfig } from '@atelier/domain';

export function AffiliateConfigForm({ config }: { config: AffiliateConnectionConfig }) {
  return (
    <form action={updateAffiliateConfigAction} style={{ display: 'grid', gap: 12 }}>
      <input type="hidden" name="id" value={config.id} />
      <label style={fieldStyle}>
        <span>Store name</span>
        <input name="storeName" defaultValue={config.storeName} style={inputStyle} />
      </label>
      <label style={fieldStyle}>
        <span>Platform</span>
        <select name="platform" defaultValue={config.affiliatePlatform} style={inputStyle}>
          <option value="amazon">Amazon</option>
        </select>
      </label>
      <label style={fieldStyle}>
        <span>Associate/store ID</span>
        <input name="associateStoreId" defaultValue={config.associateTag ?? ''} style={inputStyle} />
      </label>
      <label style={fieldStyle}>
        <span>API status</span>
        <select name="apiStatus" defaultValue={config.apiStatus} style={inputStyle}>
          <option value="not_connected">Not connected</option>
          <option value="placeholder_only">Placeholder only</option>
          <option value="future_api">Future API</option>
        </select>
      </label>
      <label style={fieldStyle}>
        <span>Enabled</span>
        <select name="enabled" defaultValue={String(config.connectionStatus !== 'not_configured')} style={inputStyle}>
          <option value="false">Disabled</option>
          <option value="true">Enabled</option>
        </select>
      </label>
      <label style={fieldStyle}>
        <span>Price freshness threshold (hours)</span>
        <input name="freshnessPriceHours" type="number" min="0" defaultValue={config.refreshPolicy.priceThresholdHours} style={inputStyle} />
      </label>
      <label style={fieldStyle}>
        <span>Availability freshness threshold (hours)</span>
        <input name="freshnessAvailabilityHours" type="number" min="0" defaultValue={config.refreshPolicy.availabilityThresholdHours} style={inputStyle} />
      </label>
      <label style={fieldStyle}>
        <span>Connection notes</span>
        <textarea name="connectionNotes" defaultValue={config.notes ?? ''} rows={4} style={textareaStyle} />
      </label>
      <button type="submit" style={buttonStyle}>Save affiliate config</button>
    </form>
  );
}

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
