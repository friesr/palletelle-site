import {
  applyLifecycleAction,
  type ProductLifecycleAction,
  type ProductLifecycleStateRecord,
} from '@atelier/domain';
import { lifecycleTransitionAction } from '@/app/review/actions';

const actionDefinitions: Array<{ action: ProductLifecycleAction; label: string; reason: string; primary?: boolean }> = [
  {
    action: 'mark_normalized',
    label: 'Mark normalized',
    reason: 'Normalized facts are ready for review.',
  },
  {
    action: 'approve_review',
    label: 'Approve review',
    reason: 'Approved from admin lifecycle workflow.',
  },
  {
    action: 'hold_review',
    label: 'Hold review',
    reason: 'Placed on hold from admin lifecycle workflow.',
  },
  {
    action: 'reject_review',
    label: 'Reject review',
    reason: 'Rejected from admin lifecycle workflow.',
  },
  {
    action: 'reset_review',
    label: 'Reset to pending',
    reason: 'Reset for another review pass.',
  },
  {
    action: 'enable_admin_preview',
    label: 'Enable admin preview',
    reason: 'Enabled for admin-only preview.',
  },
  {
    action: 'enable_dev_preview',
    label: 'Enable dev customer preview',
    reason: 'Enabled for development customer preview.',
    primary: true,
  },
  {
    action: 'disable_preview',
    label: 'Disable preview',
    reason: 'Preview disabled from admin lifecycle workflow.',
  },
  {
    action: 'publish',
    label: 'Publish',
    reason: 'Published from admin lifecycle workflow.',
    primary: true,
  },
  {
    action: 'withdraw',
    label: 'Withdraw',
    reason: 'Withdrawn from customer visibility.',
  },
];

export function ReviewActions({
  productId,
  lifecycle,
}: {
  productId: string;
  lifecycle?: ProductLifecycleStateRecord;
}) {
  const availableActions = lifecycle
    ? actionDefinitions.filter((definition) =>
        applyLifecycleAction({
          current: lifecycle,
          action: definition.action,
          changedAt: '2026-04-18T00:00:00.000Z',
          changedBy: 'preview',
          reason: definition.reason,
        }).valid,
      )
    : actionDefinitions;

  return (
    <section style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {availableActions.map((definition) => (
        <form key={definition.action} action={lifecycleTransitionAction}>
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="action" value={definition.action} />
          <input type="hidden" name="reason" value={definition.reason} />
          <button style={definition.primary ? primaryButtonStyle : buttonStyle} type="submit">{definition.label}</button>
        </form>
      ))}
    </section>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 999,
  border: '1px solid rgba(0,0,0,0.12)',
  background: '#fff',
  cursor: 'pointer',
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: '#111111',
  color: '#ffffff',
};
