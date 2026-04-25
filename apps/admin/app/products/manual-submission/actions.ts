'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { createManualSubmission } from '@/lib/services/manual-submission-service';

function getTrimmedString(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? '';
}

export async function createManualSubmissionAction(formData: FormData) {
  const session = await requireAdmin();

  await createManualSubmission({
    sourceUrl: getTrimmedString(formData, 'sourceUrl'),
    sourceIdentifier: getTrimmedString(formData, 'sourceIdentifier') || undefined,
    title: getTrimmedString(formData, 'title') || undefined,
    notes: getTrimmedString(formData, 'notes') || undefined,
    submittedBy: session.user?.email ?? session.user?.name ?? 'admin',
  });

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/products/manual-submission');
}
