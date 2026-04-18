import { reviewWorkflowAction } from '@/app/review/actions';

export function ReviewActions({ productId }: { productId: string }) {
  return (
    <section style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {[
        { label: 'Approve', workflowState: 'approved' },
        { label: 'Reject', workflowState: 'rejected' },
        { label: 'Hold', workflowState: 'hold' },
        { label: 'Needs refresh', workflowState: 'needs_refresh' },
      ].map((action) => (
        <form key={action.workflowState} action={reviewWorkflowAction}>
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="workflowState" value={action.workflowState} />
          <input type="hidden" name="reviewerNotes" value={`${action.label} via admin workflow action`} />
          <button style={buttonStyle} type="submit">{action.label}</button>
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
