'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { updateManyProductReviewWorkflows, updateProductReviewWorkflow, updateProductVisibility } from '@/lib/services/review-service';

function getTrimmedString(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? '';
}

export async function reviewWorkflowAction(formData: FormData) {
  const session = await requireAdmin();
  const productId = getTrimmedString(formData, 'productId');
  const workflowState = getTrimmedString(formData, 'workflowState');
  const reviewerNotes = getTrimmedString(formData, 'reviewerNotes');
  const enableStorefront = formData.get('enableStorefront')?.toString() === 'true';

  await updateProductReviewWorkflow({
    productId,
    workflowState,
    reviewerNotes,
    reviewedBy: session.user?.email ?? session.user?.name ?? 'admin',
    enableStorefront,
  });

  revalidatePath('/');
  revalidatePath(`/review/${productId}`);
  revalidatePath('/products');
  revalidatePath(`/products/${productId}`);
  revalidatePath('/browse');
}

export async function bulkReviewWorkflowAction(formData: FormData) {
  const session = await requireAdmin();
  const productIds = getTrimmedString(formData, 'productIds')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const workflowState = getTrimmedString(formData, 'workflowState');
  const reviewerNotes = getTrimmedString(formData, 'reviewerNotes');
  const enableStorefront = formData.get('enableStorefront')?.toString() === 'true';

  await updateManyProductReviewWorkflows({
    productIds,
    workflowState,
    reviewerNotes,
    reviewedBy: session.user?.email ?? session.user?.name ?? 'admin',
    enableStorefront,
  });

  revalidatePath('/');
  revalidatePath('/browse');
  revalidatePath('/products');
}

export async function toggleVisibilityAction(formData: FormData) {
  await requireAdmin();
  const productId = getTrimmedString(formData, 'productId');
  const isPublic = formData.get('isPublic')?.toString() === 'true';
  const intendedActive = formData.get('intendedActive')?.toString() === 'true';
  const visibilityNotes = getTrimmedString(formData, 'visibilityNotes');

  await updateProductVisibility({
    productId,
    isPublic,
    intendedActive,
    visibilityNotes,
  });

  revalidatePath('/');
  revalidatePath(`/review/${productId}`);
  revalidatePath('/products');
  revalidatePath(`/products/${productId}`);
  revalidatePath('/browse');
}
