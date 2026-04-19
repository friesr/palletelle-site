'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { transitionManyProductLifecycles, transitionProductLifecycle } from '@/lib/services/review-service';

function getTrimmedString(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? '';
}

function revalidateReviewSurfaces(productId?: string) {
  revalidatePath('/');
  revalidatePath('/browse');
  revalidatePath('/products');
  revalidatePath('/review');

  if (productId) {
    revalidatePath(`/review/${productId}`);
    revalidatePath(`/products/${productId}`);
  }
}

export async function lifecycleTransitionAction(formData: FormData) {
  const session = await requireAdmin();
  const productId = getTrimmedString(formData, 'productId');
  const action = getTrimmedString(formData, 'action');
  const reason = getTrimmedString(formData, 'reason');

  await transitionProductLifecycle({
    productId,
    action,
    reason,
    changedBy: session.user?.email ?? session.user?.name ?? 'admin',
  });

  revalidateReviewSurfaces(productId);
}

export async function approveAndEnableDevPreviewAction(formData: FormData) {
  const session = await requireAdmin();
  const productId = getTrimmedString(formData, 'productId');
  const changedBy = session.user?.email ?? session.user?.name ?? 'admin';

  await transitionProductLifecycle({
    productId,
    action: 'approve_review',
    reason: 'Approved from admin quick action.',
    changedBy,
  });

  await transitionProductLifecycle({
    productId,
    action: 'enable_dev_preview',
    reason: 'Enabled for development customer preview from admin quick action.',
    changedBy,
  });

  revalidateReviewSurfaces(productId);
}

export async function bulkLifecycleTransitionAction(
  _previousState: { summary?: string; results?: Array<{ productId: string; ok: boolean; message: string }> } | undefined,
  formData: FormData,
) {
  const session = await requireAdmin();
  const productIds = getTrimmedString(formData, 'productIds')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const action = getTrimmedString(formData, 'action');
  const reason = getTrimmedString(formData, 'reason');

  const results = await transitionManyProductLifecycles({
    productIds,
    action,
    reason,
    changedBy: session.user?.email ?? session.user?.name ?? 'admin',
  });

  revalidateReviewSurfaces();

  const successCount = results.filter((result) => result.ok).length;
  const failureCount = results.length - successCount;

  return {
    summary: `Processed ${results.length} rows, ${successCount} succeeded, ${failureCount} failed.`,
    results: results.map((result) => ({
      productId: result.productId,
      ok: result.ok,
      message: result.message,
    })),
  };
}
