'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const email = formData.get('email')?.toString() ?? '';
  const password = formData.get('password')?.toString() ?? '';

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/bootstrap-security',
    });

    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid bootstrap credentials.' };
        default:
          return { error: 'Unable to sign in right now.' };
      }
    }

    throw error;
  }
}
