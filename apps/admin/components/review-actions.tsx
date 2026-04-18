import { requireAdmin } from '@/lib/auth/session';

async function guardAdminAction() {
  'use server';
  await requireAdmin();
}

export function ReviewActions() {
  return (
    <section style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <form action={guardAdminAction}><button disabled style={buttonStyle}>Approve (placeholder)</button></form>
      <form action={guardAdminAction}><button disabled style={buttonStyle}>Reject (placeholder)</button></form>
      <form action={guardAdminAction}><button disabled style={buttonStyle}>Hold (placeholder)</button></form>
      <form action={guardAdminAction}><button disabled style={buttonStyle}>Needs refresh (placeholder)</button></form>
    </section>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 999,
  border: '1px solid rgba(0,0,0,0.12)',
  background: '#fff',
  cursor: 'not-allowed',
  opacity: 0.6,
};
