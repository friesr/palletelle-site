'use server';

import { revalidatePath } from 'next/cache';
import { signOut } from '@/auth';
import { requireAdmin } from '@/lib/auth/session';
import { createManualSubmissions } from '@/lib/services/manual-submission-service';

export async function logoutAction() {
  await requireAdmin({ allowBootstrap: true });
  await signOut({ redirectTo: '/login' });
}

function parseLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export async function quickAddProductsAction(formData: FormData) {
  const session = await requireAdmin();
  const sourceUrls = parseLines(formData.get('sourceUrls')?.toString() ?? '');
  const title = formData.get('title')?.toString().trim() || undefined;
  const notes = formData.get('notes')?.toString().trim() || undefined;

  await createManualSubmissions({
    sourceUrls,
    title,
    notes,
    submittedBy: session.user?.email ?? session.user?.name ?? 'admin',
  });

  const paths = ['/', '/products', '/products/manual-submission', '/data-sources'];
  paths.forEach((path) => revalidatePath(path));
}
