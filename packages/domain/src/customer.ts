export type UserRole = 'customer' | 'admin';
export type CustomerAuthMethodType = 'password' | 'passkey' | 'totp';
export type CustomerMFAState = 'not_configured' | 'eligible' | 'enrolled' | 'required';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  lastSignedInAt?: string;
}

export interface CredentialMethod {
  passwordHash?: string;
  passwordUpdatedAt?: string;
  passwordResetEligible: boolean;
}

export interface PasskeyCredential {
  id: string;
  userId: string;
  label: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports?: string[];
  backedUp?: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export interface AuthMethod {
  id: string;
  userId: string;
  type: CustomerAuthMethodType;
  isPrimary: boolean;
  createdAt: string;
  credential?: CredentialMethod;
  passkey?: PasskeyCredential;
}

export interface MFAEnrollment {
  id: string;
  userId: string;
  method: 'totp';
  enrolledAt: string;
  verifiedAt?: string;
}

export interface MFAStatus {
  userId: string;
  state: CustomerMFAState;
  enrollments: MFAEnrollment[];
}

export interface UserProfile {
  userId: string;
  displayName?: string;
  pronouns?: string;
  timezone?: string;
  locale?: string;
  onboardingState: 'new' | 'profile_started' | 'profile_completed';
}

export interface ColorProfile {
  userId: string;
  paletteFamily?: string;
  undertone?: 'warm' | 'cool' | 'neutral' | 'unknown';
  contrastLevel?: 'low' | 'medium' | 'high';
  source: 'manual' | 'future-analysis';
  confidence: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface PreferenceProfile {
  userId: string;
  preferredCategories: string[];
  avoidedColors: string[];
  likedPaletteFamilies: string[];
  dislikedPaletteFamilies: string[];
  fitNotes: string[];
  savedForLaterEnabled: boolean;
}

export interface SavedProduct {
  id: string;
  userId: string;
  productId: string;
  savedAt: string;
  note?: string;
}

export interface SavedEnsemble {
  id: string;
  userId: string;
  ensembleId: string;
  savedAt: string;
  note?: string;
}

export interface CustomerIdentityRecord {
  user: User;
  profile: UserProfile;
  colorProfile?: ColorProfile;
  preferenceProfile: PreferenceProfile;
  authMethods: AuthMethod[];
  mfaStatus: MFAStatus;
  savedProducts: SavedProduct[];
  savedEnsembles: SavedEnsemble[];
}

export function supportsFuturePasskeys(record: CustomerIdentityRecord): boolean {
  return record.authMethods.some((method) => method.type === 'passkey') || record.mfaStatus.state !== 'required';
}
