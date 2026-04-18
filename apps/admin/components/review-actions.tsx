import { reviewWorkflowAction } from '@/app/review/actions';

export function ReviewActions({ productId }: { productId: string }) {
  return (
    <section style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {[
        {
          label: 'Approve + enable preview',
          workflowState: 'approved',
          reviewerNotes: 'Approved and enabled for customer preview from admin workflow action',
          enableStorefront: true,
          primary: true,
        },
        {
          label: 'Approve only',
          workflowState: 'approved',
          reviewerNotes: 'Approved from admin workflow action',
        },
        {
          label: 'Hold',
          workflowState: 'hold',
          reviewerNotes: 'Placed on hold from admin workflow action',
        },
        {
          label: 'Reject',
          workflowState: 'rejected',
          reviewerNotes: 'Rejected from admin workflow action',
        },
      ].map((action) => (
        <form key={action.workflowState} action={reviewWorkflowAction}>
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="workflowState" value={action.workflowState} />
          <input type="hidden" name="reviewerNotes" value={action.reviewerNotes} />
          <input type="hidden" name="enableStorefront" value={String(Boolean(action.enableStorefront))} />
          <button style={action.primary ? primaryButtonStyle : buttonStyle} type="submit">{action.label}</button>
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
