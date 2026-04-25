import fs from 'node:fs';
import path from 'node:path';

function getRawEnvFileValue(key: string): string | undefined {
  const fallbackPaths = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '../../.env.local'),
  ];

  for (const filePath of fallbackPaths) {
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) {
        continue;
      }

      const name = trimmed.slice(0, separatorIndex).trim();
      if (name !== key) {
        continue;
      }

      const value = trimmed.slice(separatorIndex + 1).trim();
      return value.replace(/^['"]|['"]$/g, '');
    }
  }

  return undefined;
}

function getEnvValue(key: string): string | undefined {
  const direct = process.env[key]?.trim();
  const rawFileValue = getRawEnvFileValue(key);

  if (key.endsWith('_HASH')) {
    if (rawFileValue?.startsWith('$2')) {
      return rawFileValue;
    }

    if (direct) {
      return direct;
    }

    return rawFileValue;
  }

  if (direct) {
    return direct;
  }

  return rawFileValue;
}

export interface SeededAdminUser {
  id: string;
  name: string;
  email?: string;
  login: string;
  passwordHash: string;
  role: 'admin';
}

export function getSeededAdminUser(): SeededAdminUser | null {
  const login = getEnvValue('ADMIN_LOGIN');
  const passwordHash = getEnvValue('ADMIN_PASSWORD_HASH');

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

  if (!getEnvValue('AUTH_SECRET')) {
    reasons.push('AUTH_SECRET is missing');
  }

  if (!getEnvValue('ADMIN_LOGIN')) {
    reasons.push('ADMIN_LOGIN is missing');
  }

  const hash = getEnvValue('ADMIN_PASSWORD_HASH');
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
