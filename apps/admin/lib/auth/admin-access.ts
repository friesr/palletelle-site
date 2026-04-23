import fs from 'node:fs';
import path from 'node:path';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/db';
import { sendAuthBootstrapEmail } from '@/lib/auth/smtp-mailer';
import { deriveAdminSecurityState, type AdminSecurityState } from '@/lib/auth/admin-security';

export type AdminAuthMethod = 'password' | 'passkey';

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

      return trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
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

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export interface AdminIdentityConfig {
  email: string;
  displayName: string;
  bootstrapPasswordHash?: string;
}

export interface AdminSecuritySnapshot {
  email: string;
  displayName: string;
  hasPasskey: boolean;
  hasVerifiedMfa: boolean;
  hasBootstrapPassword: boolean;
  securityState: AdminSecurityState;
}

export function getAdminIdentityConfig(): AdminIdentityConfig | null {
  const configuredEmail = getEnvValue('ADMIN_EMAIL') ?? getEnvValue('ADMIN_LOGIN');
  if (!configuredEmail || !isEmail(configuredEmail)) {
    return null;
  }

  return {
    email: normalizeEmail(configuredEmail),
    displayName: getEnvValue('ADMIN_NAME') ?? 'Palletelle Admin',
    bootstrapPasswordHash: getEnvValue('ADMIN_BOOTSTRAP_PASSWORD_HASH') ?? getEnvValue('ADMIN_PASSWORD_HASH'),
  };
}

export function getAdminIdentityValidation() {
  const reasons: string[] = [];

  if (!getEnvValue('AUTH_SECRET')) {
    reasons.push('AUTH_SECRET is missing.');
  }

  const configuredEmail = getEnvValue('ADMIN_EMAIL') ?? getEnvValue('ADMIN_LOGIN');
  if (!configuredEmail) {
    reasons.push('ADMIN_EMAIL is missing.');
  } else if (!isEmail(configuredEmail)) {
    reasons.push('ADMIN_EMAIL must be a real email address.');
  }

  const bootstrapHash = getEnvValue('ADMIN_BOOTSTRAP_PASSWORD_HASH') ?? getEnvValue('ADMIN_PASSWORD_HASH');
  if (bootstrapHash && !bootstrapHash.startsWith('$2')) {
    reasons.push('ADMIN_BOOTSTRAP_PASSWORD_HASH must be a bcrypt hash when set.');
  }

  return {
    valid: reasons.length === 0,
    reasons,
  };
}

export async function getAdminSecuritySnapshot(): Promise<AdminSecuritySnapshot | null> {
  const config = getAdminIdentityConfig();
  if (!config) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: config.email },
    include: {
      profile: true,
      authMethods: true,
      mfaEnrollments: true,
    },
  });

  const hasPasskey = Boolean(user?.role === 'admin' && user.authMethods.some((method) => method.type === 'passkey'));
  const hasVerifiedMfa = Boolean(user?.role === 'admin' && user.mfaEnrollments.some((enrollment) => enrollment.verifiedAt));

  return {
    email: config.email,
    displayName: user?.profile?.displayName ?? config.displayName,
    hasPasskey,
    hasVerifiedMfa,
    hasBootstrapPassword: Boolean(config.bootstrapPasswordHash),
    securityState: deriveAdminSecurityState({ hasPasskey, hasVerifiedMfa }),
  };
}

export async function authorizeAdminBootstrapSignIn(email: string, password: string) {
  const validation = getAdminIdentityValidation();
  if (!validation.valid) {
    console.error('Admin auth configuration invalid:', validation.reasons.join(' '));
    return null;
  }

  const config = getAdminIdentityConfig();
  if (!config) {
    return null;
  }

  if (normalizeEmail(email) !== config.email || !config.bootstrapPasswordHash) {
    return null;
  }

  const passwordMatches = await compare(password, config.bootstrapPasswordHash);
  if (!passwordMatches) {
    return null;
  }

  const snapshot = await getAdminSecuritySnapshot();
  const securityState = snapshot?.securityState ?? 'bootstrap';

  try {
    await sendAuthBootstrapEmail(config.email);
  } catch (error) {
    console.error('Bootstrap auth email delivery failed:', error);
  }

  return {
    id: config.email,
    name: snapshot?.displayName ?? config.displayName,
    email: config.email,
    role: 'admin' as const,
    securityState,
    authMethod: 'password' as const,
  };
}
