export type AdminSecurityState = 'bootstrap' | 'active';

export function deriveAdminSecurityState(options: { hasPasskey: boolean; hasVerifiedMfa: boolean }): AdminSecurityState {
  return options.hasPasskey && options.hasVerifiedMfa ? 'active' : 'bootstrap';
}
