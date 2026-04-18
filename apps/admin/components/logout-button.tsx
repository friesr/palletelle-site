import { logoutAction } from '@/app/actions';

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button style={buttonStyle} type="submit">Log out</button>
    </form>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 999,
  border: '1px solid rgba(0,0,0,0.12)',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 14,
};
