'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/login/actions';

const initialState: { error?: string } = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} style={{ display: 'grid', gap: 16 }}>
      <label style={fieldStyle}>
        <span>Named admin email</span>
        <input name="email" type="email" autoComplete="username webauthn" required style={inputStyle} />
      </label>
      <label style={fieldStyle}>
        <span>Bootstrap password</span>
        <input name="password" type="password" autoComplete="current-password" required style={inputStyle} />
      </label>
      {state?.error ? (
        <p style={{ margin: 0, color: '#8A3B34', fontSize: 14 }}>{state.error}</p>
      ) : null}
      <button type="submit" disabled={pending} style={buttonStyle}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

const fieldStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  fontSize: 14,
  color: 'rgba(0,0,0,0.75)',
};

const inputStyle: React.CSSProperties = {
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: 14,
  padding: '12px 14px',
  fontSize: 15,
};

const buttonStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: 999,
  border: 'none',
  background: '#111111',
  color: '#ffffff',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};
