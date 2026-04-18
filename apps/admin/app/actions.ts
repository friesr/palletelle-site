'use server';

import { signOut } from '@/auth';
import { requireAdmin } from '@/lib/auth/session';

export async function logoutAction() {
  await requireAdmin();
  await signOut({ redirectTo: '/login' });
}
