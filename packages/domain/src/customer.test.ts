import { describe, expect, it } from 'vitest';
import type { CustomerIdentityRecord } from './customer';
import { supportsFuturePasskeys } from './customer';

describe('customer identity scaffolding', () => {
  it('supports a customer identity record with future auth methods', () => {
    const record: CustomerIdentityRecord = {
      user: {
        id: 'u1',
        email: 'customer@example.com',
        role: 'customer',
        createdAt: '2026-04-18T00:00:00Z',
        updatedAt: '2026-04-18T00:00:00Z',
      },
      profile: {
        userId: 'u1',
        displayName: 'Customer Example',
        onboardingState: 'profile_started',
      },
      preferenceProfile: {
        userId: 'u1',
        preferredCategories: ['Shirt'],
        avoidedColors: ['neon'],
        likedPaletteFamilies: ['warm-neutral'],
        dislikedPaletteFamilies: [],
        fitNotes: [],
        savedForLaterEnabled: true,
      },
      authMethods: [
        {
          id: 'auth-1',
          userId: 'u1',
          type: 'password',
          isPrimary: true,
          createdAt: '2026-04-18T00:00:00Z',
          credential: {
            passwordHash: '$2b$12$hash',
            passwordResetEligible: true,
          },
        },
      ],
      mfaStatus: {
        userId: 'u1',
        state: 'eligible',
        enrollments: [],
      },
      savedProducts: [],
      savedEnsembles: [],
    };

    expect(record.authMethods[0].type).toBe('password');
    expect(supportsFuturePasskeys(record)).toBe(true);
  });
});
