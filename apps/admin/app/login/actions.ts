'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const login = formData.get('login')?.toString() ?? '';
  const password = formData.get('password')?.toString() ?? '';

  try {
    await signIn('credentials', {
      login,
      password,
      redirectTo: '/',
    });

    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid admin credentials.' };
        default:
          return { error: 'Unable to sign in right now.' };
      }
    }

    throw error;
  }
}
