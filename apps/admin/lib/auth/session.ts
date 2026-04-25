import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export async function requireAdmin(options?: { allowBootstrap?: boolean }) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }

  if (!options?.allowBootstrap && session.user.securityState !== 'active') {
    redirect('/bootstrap-security');
  }

  return session;
}
