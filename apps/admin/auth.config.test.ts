import { describe, expect, it } from 'vitest';
import authConfig from './auth.config';

const authorized = authConfig.callbacks?.authorized;

function makeRequest(pathname: string) {
  return {
    nextUrl: new URL(`https://admin.example.com${pathname}`),
  };
}

describe('admin auth route gating', () => {
  it('allows public auth surfaces without a session', () => {
    expect(authorized?.({ auth: null, request: makeRequest('/login') as never })).toBe(true);
    expect(authorized?.({ auth: null, request: makeRequest('/api/auth/signin') as never })).toBe(true);
  });

  it('redirects bootstrap admins to bootstrap-security for normal routes', () => {
    const result = authorized?.({
      auth: { user: { role: 'admin', securityState: 'bootstrap' } },
      request: makeRequest('/'),
    } as never);

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get('location')).toBe('https://admin.example.com/bootstrap-security');
  });

  it('allows bootstrap admins onto bootstrap-security', () => {
    expect(
      authorized?.({
        auth: { user: { role: 'admin', securityState: 'bootstrap' } },
        request: makeRequest('/bootstrap-security'),
      } as never),
    ).toBe(true);
  });

  it('allows active admins onto protected routes', () => {
    expect(
      authorized?.({
        auth: { user: { role: 'admin', securityState: 'active' } },
        request: makeRequest('/'),
      } as never),
    ).toBe(true);
  });
});
