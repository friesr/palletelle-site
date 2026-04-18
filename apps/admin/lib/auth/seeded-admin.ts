export interface SeededAdminUser {
  id: string;
  name: string;
  email?: string;
  login: string;
  passwordHash: string;
  role: 'admin';
}

export function getSeededAdminUser(): SeededAdminUser | null {
  const login = process.env.ADMIN_LOGIN?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();

  if (!login || !passwordHash) {
    return null;
  }

  const isEmail = login.includes('@');

  return {
    id: 'seeded-admin',
    name: 'Palletelle Admin',
    email: isEmail ? login : undefined,
    login,
    passwordHash,
    role: 'admin',
  };
}

export function getSeededAdminValidation() {
  const reasons: string[] = [];

  if (!process.env.AUTH_SECRET?.trim()) {
    reasons.push('AUTH_SECRET is missing');
  }

  if (!process.env.ADMIN_LOGIN?.trim()) {
    reasons.push('ADMIN_LOGIN is missing');
  }

  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!hash) {
    reasons.push('ADMIN_PASSWORD_HASH is missing');
  } else if (!hash.startsWith('$2')) {
    reasons.push('ADMIN_PASSWORD_HASH does not look like a bcrypt hash');
  }

  return {
    valid: reasons.length === 0,
    reasons,
  };
}
