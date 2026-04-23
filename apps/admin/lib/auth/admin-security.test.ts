import { describe, expect, it } from 'vitest';
import { deriveAdminSecurityState } from './admin-security';

describe('deriveAdminSecurityState', () => {
  it('keeps admin in bootstrap until both passkey and verified MFA exist', () => {
    expect(deriveAdminSecurityState({ hasPasskey: false, hasVerifiedMfa: false })).toBe('bootstrap');
    expect(deriveAdminSecurityState({ hasPasskey: true, hasVerifiedMfa: false })).toBe('bootstrap');
    expect(deriveAdminSecurityState({ hasPasskey: false, hasVerifiedMfa: true })).toBe('bootstrap');
  });

  it('activates admin only when passkey and verified MFA are both present', () => {
    expect(deriveAdminSecurityState({ hasPasskey: true, hasVerifiedMfa: true })).toBe('active');
  });
});
