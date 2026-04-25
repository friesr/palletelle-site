import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

const SESSION_COOKIE = 'palletelle_customer_session';
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 5;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function checkRateLimit(key: string) {
  const now = Date.now();
  const current = rateLimitStore.get(key);
  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS_PER_WINDOW - 1 };
  }
  if (current.count >= MAX_ATTEMPTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
  }
  current.count += 1;
  rateLimitStore.set(key, current);
  return { allowed: true, remaining: MAX_ATTEMPTS_PER_WINDOW - current.count };
}

export async function createCustomerUser(input: { email: string; password: string; displayName?: string }) {
  const email = input.email.trim().toLowerCase();
  const passwordHash = await hashPassword(input.password);
  const userId = `customer-${randomUUID()}`;
  const authMethodId = `auth-${randomUUID()}`;
  const profileId = `profile-${randomUUID()}`;
  const colorProfileId = `color-${randomUUID()}`;

  const user = await prisma.user.create({
    data: {
      id: userId,
      email,
      role: 'customer',
      authMethods: {
        create: {
          id: authMethodId,
          type: 'password',
          isPrimary: true,
          passwordHash,
          passwordUpdatedAt: new Date(),
        },
      },
      profile: {
        create: {
          id: profileId,
          displayName: input.displayName?.trim() || email.split('@')[0],
          onboardingState: 'profile_created',
          timezone: 'UTC',
          locale: 'en-US',
        },
      },
      colorProfile: {
        create: {
          id: colorProfileId,
          paletteFamily: 'pending-analysis',
          undertone: 'unknown',
          contrastLevel: 'unknown',
          source: 'registration_default',
          confidence: 'low',
          notes: 'Placeholder profile created during minimum viable registration flow.',
        },
      },
    },
    include: {
      profile: true,
      colorProfile: true,
      authMethods: true,
    },
  });

  return user;
}

export async function findCustomerByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: {
      profile: true,
      colorProfile: true,
      authMethods: true,
    },
  });
}

export async function issueCustomerSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function readCustomerSession() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function getAuthenticatedCustomer() {
  const userId = await readCustomerSession();
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      colorProfile: true,
    },
  });
}
