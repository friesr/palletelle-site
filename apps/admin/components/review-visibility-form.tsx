import type { ProductLifecycleStateRecord } from '@atelier/domain';
import { lifecycleTransitionAction } from '@/app/review/actions';

export function ReviewVisibilityForm({
  productId,
  lifecycle,
}: {
  productId: string;
  lifecycle?: ProductLifecycleStateRecord;
}) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p style={{ margin: 0, fontSize: 14, color: 'rgba(0,0,0,0.72)' }}>
        Preview and publish are controlled by explicit lifecycle transitions, not direct booleans.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {lifecycle?.previewState !== 'admin_only' ? (
          <form action={lifecycleTransitionAction}>
            <input type="hidden" name="productId" value={productId} />
            <input type="hidden" name="action" value="enable_admin_preview" />
            <input type="hidden" name="reason" value="Enabled for admin-only preview." />
            <button type="submit" style={buttonStyle}>Enable admin preview</button>
          </form>
        ) : null}
        {lifecycle?.previewState !== 'none' ? (
          <form action={lifecycleTransitionAction}>
            <input type="hidden" name="productId" value={productId} />
            <input type="hidden" name="action" value="disable_preview" />
            <input type="hidden" name="reason" value="Preview disabled from lifecycle controls." />
            <button type="submit" style={buttonStyle}>Disable preview</button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 999,
  border: '1px solid rgba(0,0,0,0.12)',
  background: '#fff',
  cursor: 'pointer',
};
