import {
  applyLifecycleAction,
  buildLifecycleAuditRecord,
  createInitialLifecycleState,
  type LifecycleTransitionContext,
  type ProductLifecycleAction,
  type ProductLifecycleStateRecord,
  type SourcedProductRecord,
} from '@atelier/domain';
import type { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { mapDbProductToSourcedRecord } from '@/lib/services/db-mappers';
import { optionalText, requireEnumValue, requireNonEmpty } from '@/lib/services/validators';

const lifecycleActions = [
  'mark_source_captured',
  'mark_normalized',
  'approve_review',
  'hold_review',
  'reject_review',
  'reset_review',
  'enable_admin_preview',
  'enable_dev_preview',
  'disable_preview',
  'publish',
  'withdraw',
] as const;

export interface ProductLifecycleTransitionResult {
  productId: string;
  ok: boolean;
  action: ProductLifecycleAction;
  message: string;
  before?: ProductLifecycleStateRecord;
  after?: ProductLifecycleStateRecord;
}

export async function listReviewRecords(): Promise<SourcedProductRecord[]> {
  const products = await prisma.product.findMany({
    include: {
      sourceData: true,
      priceSnapshots: {
        orderBy: { capturedAt: 'desc' },
        take: 12,
      },
      normalizedData: true,
      inferredData: true,
      lifecycleState: true,
      lifecycleAudits: {
        orderBy: { changedAt: 'desc' },
        take: 5,
      },
      reviewState: true,
      sourceHealth: true,
      visibility: true,
      externalSignals: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return products.map((product) =>
    mapDbProductToSourcedRecord({
      product,
      sourceData: product.sourceData[0] ?? null,
      priceSnapshots: product.priceSnapshots,
      normalizedData: product.normalizedData,
      inferredData: product.inferredData,
      lifecycleState: product.lifecycleState,
      lifecycleAudits: product.lifecycleAudits,
      reviewState: product.reviewState,
      sourceHealth: product.sourceHealth,
      visibility: product.visibility,
      externalSignals: product.externalSignals,
    }),
  );
}

export async function getReviewRecordById(id: string): Promise<SourcedProductRecord | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      sourceData: true,
      priceSnapshots: {
        orderBy: { capturedAt: 'desc' },
        take: 24,
      },
      normalizedData: true,
      inferredData: true,
      lifecycleState: true,
      lifecycleAudits: {
        orderBy: { changedAt: 'desc' },
        take: 25,
      },
      reviewState: true,
      sourceHealth: true,
      visibility: true,
      externalSignals: true,
    },
  });

  if (!product) {
    return null;
  }

  return mapDbProductToSourcedRecord({
    product,
    sourceData: product.sourceData[0] ?? null,
    priceSnapshots: product.priceSnapshots,
    normalizedData: product.normalizedData,
    inferredData: product.inferredData,
    lifecycleState: product.lifecycleState,
    lifecycleAudits: product.lifecycleAudits,
    reviewState: product.reviewState,
    sourceHealth: product.sourceHealth,
    visibility: product.visibility,
    externalSignals: product.externalSignals,
  });
}

function normalizeProductIds(productIds: string[]) {
  const ids = Array.from(new Set(productIds.map((value) => value.trim()).filter(Boolean)));

  if (ids.length === 0) {
    throw new Error('At least one product id is required.');
  }

  return ids;
}

function mapLegacyWorkflowToLifecycleReviewState(workflowState?: string | null): ProductLifecycleStateRecord['reviewState'] {
  if (workflowState === 'approved') return 'approved';
  if (workflowState === 'hold') return 'hold';
  if (workflowState === 'rejected') return 'rejected';
  return 'pending';
}

function mapLegacyWorkflowToLifecycleIngestState(workflowState?: string | null): ProductLifecycleStateRecord['ingestState'] {
  if (workflowState === 'stale' || workflowState === 'needs_refresh') return 'refresh_required';
  if (workflowState === 'discovered') return 'manual_seeded';
  return 'normalized';
}

function buildLifecycleFromLegacy(product: {
  id: string;
  reviewState?: { workflowState: string | null } | null;
  visibility?: { isPublic: boolean; intendedActive: boolean } | null;
  sourceData?: Array<{ ingestMethod?: string | null }>;
}): ProductLifecycleStateRecord {
  const sourceData = product.sourceData?.[0];
  const ingestState = sourceData?.ingestMethod === 'manual_seed'
    ? 'manual_seeded'
    : mapLegacyWorkflowToLifecycleIngestState(product.reviewState?.workflowState);

  return createInitialLifecycleState({
    productId: product.id,
    ingestState,
    reviewState: mapLegacyWorkflowToLifecycleReviewState(product.reviewState?.workflowState),
    previewState: product.visibility?.isPublic && product.visibility?.intendedActive ? 'dev_customer' : 'none',
    publishState: 'unpublished',
  });
}

function hasSourceCapture(product: {
  sourceData?: Array<{ rawSnapshotJson?: string | null; title?: string | null; canonicalUrl?: string | null }>;
}): boolean {
  const sourceData = product.sourceData?.[0];
  if (!sourceData) return false;

  let rawSnapshot: Record<string, unknown> = {};
  if (sourceData.rawSnapshotJson) {
    try {
      rawSnapshot = JSON.parse(sourceData.rawSnapshotJson) as Record<string, unknown>;
    } catch {
      rawSnapshot = {};
    }
  }

  const primaryImage = [rawSnapshot.image, rawSnapshot.imageUrl, rawSnapshot.mainImage, rawSnapshot.mainImageUrl]
    .find((value) => typeof value === 'string' && value.trim().length > 0);

  const gallery = [rawSnapshot.images, rawSnapshot.additionalImages, rawSnapshot.gallery]
    .find((value) => Array.isArray(value) && value.some((entry) => typeof entry === 'string' && entry.trim().length > 0));

  const hasTitle = Boolean(sourceData.title?.trim());
  const hasCanonicalUrl = Boolean(sourceData.canonicalUrl?.trim());

  return Boolean(hasCanonicalUrl && (hasTitle || primaryImage || gallery));
}

function mapLifecycleToLegacyWorkflowState(state: ProductLifecycleStateRecord) {
  if (state.reviewState === 'approved') return 'approved';
  if (state.reviewState === 'hold') return 'hold';
  if (state.reviewState === 'rejected') return 'rejected';
  if (state.ingestState === 'refresh_required') return 'needs_refresh';
  if (state.ingestState === 'manual_seeded') return 'discovered';
  if (state.ingestState === 'source_captured') return 'normalized';
  return 'needs_review';
}

async function syncLegacyReviewAndVisibilityState(tx: Prisma.TransactionClient, input: {
  productId: string;
  lifecycle: ProductLifecycleStateRecord;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}) {
  const workflowState = mapLifecycleToLegacyWorkflowState(input.lifecycle);
  const customerVisible = input.lifecycle.previewState === 'dev_customer' || input.lifecycle.publishState === 'published';

  await tx.productReviewState.upsert({
    where: { productId: input.productId },
    update: {
      workflowState,
      reviewerNotes: input.reason,
      reviewedBy: input.changedBy,
      reviewedAt: input.changedAt,
    },
    create: {
      id: `${input.productId}-review`,
      productId: input.productId,
      workflowState,
      reviewerNotes: input.reason,
      reviewedBy: input.changedBy,
      reviewedAt: input.changedAt,
    },
  });

  await tx.productVisibility.upsert({
    where: { productId: input.productId },
    update: {
      isPublic: customerVisible,
      intendedActive: customerVisible,
      visibilityNotes: input.reason,
      lastDisplayabilityCheckAt: input.changedAt,
    },
    create: {
      id: `${input.productId}-visibility`,
      productId: input.productId,
      isPublic: customerVisible,
      intendedActive: customerVisible,
      visibilityNotes: input.reason,
      lastDisplayabilityCheckAt: input.changedAt,
    },
  });

  if (input.lifecycle.ingestState === 'refresh_required') {
    await tx.productSourceHealth.upsert({
      where: { productId: input.productId },
      update: {
        needsRevalidation: true,
        revalidationReason: input.reason ?? 'Lifecycle state requires refresh.',
      },
      create: {
        id: `${input.productId}-health`,
        productId: input.productId,
        needsRevalidation: true,
        revalidationReason: input.reason ?? 'Lifecycle state requires refresh.',
      },
    });
  }
}

export async function transitionProductLifecycle(input: {
  productId: string;
  action: string;
  reason?: string;
  changedBy: string;
}) {
  const [result] = await transitionManyProductLifecycles({
    productIds: [input.productId],
    action: input.action,
    reason: input.reason,
    changedBy: input.changedBy,
  });

  if (!result?.ok) {
    throw new Error(result?.message ?? 'Lifecycle transition failed.');
  }

  return result;
}

export async function transitionManyProductLifecycles(input: {
  productIds: string[];
  action: string;
  reason?: string;
  changedBy: string;
}): Promise<ProductLifecycleTransitionResult[]> {
  requireNonEmpty(input.changedBy, 'Changed by');
  const action = requireEnumValue(input.action, lifecycleActions, 'Lifecycle action') as ProductLifecycleAction;
  const productIds = normalizeProductIds(input.productIds);
  const reason = optionalText(input.reason);
  const changedAt = new Date();

  return prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
      include: {
        sourceData: true,
        lifecycleState: true,
        reviewState: true,
        visibility: true,
      },
    });

    const productMap = new Map(products.map((product) => [product.id, product]));
    const results: ProductLifecycleTransitionResult[] = [];

    for (const productId of productIds) {
      const product = productMap.get(productId);

      if (!product) {
        results.push({
          productId,
          ok: false,
          action,
          message: 'Product not found.',
        });
        continue;
      }

      const current = product.lifecycleState
        ? {
            productId: product.lifecycleState.productId,
            ingestState: product.lifecycleState.ingestState,
            reviewState: product.lifecycleState.reviewState,
            previewState: product.lifecycleState.previewState,
            publishState: product.lifecycleState.publishState,
            stateNotes: product.lifecycleState.stateNotes ?? undefined,
            lastChangedAt: product.lifecycleState.lastChangedAt?.toISOString(),
            lastChangedBy: product.lifecycleState.lastChangedBy ?? undefined,
          }
        : buildLifecycleFromLegacy(product);

      const context: LifecycleTransitionContext = {
        hasSourceCapture: hasSourceCapture(product),
      };

      const transition = applyLifecycleAction({
        current,
        action,
        changedAt: changedAt.toISOString(),
        changedBy: input.changedBy,
        reason,
        context,
      });

      if (!transition.valid || !transition.nextState) {
        results.push({
          productId,
          ok: false,
          action,
          message: transition.reason ?? 'Invalid lifecycle transition.',
          before: current,
        });
        continue;
      }

      await tx.productLifecycleState.upsert({
        where: { productId },
        update: {
          ingestState: transition.nextState.ingestState,
          reviewState: transition.nextState.reviewState,
          previewState: transition.nextState.previewState,
          publishState: transition.nextState.publishState,
          stateNotes: transition.nextState.stateNotes,
          lastChangedAt: changedAt,
          lastChangedBy: input.changedBy,
        },
        create: {
          id: `${productId}-lifecycle`,
          productId,
          ingestState: transition.nextState.ingestState,
          reviewState: transition.nextState.reviewState,
          previewState: transition.nextState.previewState,
          publishState: transition.nextState.publishState,
          stateNotes: transition.nextState.stateNotes,
          lastChangedAt: changedAt,
          lastChangedBy: input.changedBy,
        },
      });

      const audit = buildLifecycleAuditRecord({
        current,
        next: transition.nextState,
        action,
        changedAt: changedAt.toISOString(),
        changedBy: input.changedBy,
        reason,
      });

      await tx.productLifecycleAudit.create({
        data: {
          id: `${productId}-audit-${changedAt.getTime()}-${results.length}`,
          productId,
          action: audit.action,
          changedAt,
          changedBy: audit.changedBy,
          fromIngestState: audit.fromIngestState,
          toIngestState: audit.toIngestState,
          fromReviewState: audit.fromReviewState,
          toReviewState: audit.toReviewState,
          fromPreviewState: audit.fromPreviewState,
          toPreviewState: audit.toPreviewState,
          fromPublishState: audit.fromPublishState,
          toPublishState: audit.toPublishState,
          reason: audit.reason,
        },
      });

      await syncLegacyReviewAndVisibilityState(tx, {
        productId,
        lifecycle: transition.nextState,
        changedBy: input.changedBy,
        changedAt,
        reason,
      });

      results.push({
        productId,
        ok: true,
        action,
        message: 'Lifecycle updated.',
        before: current,
        after: transition.nextState,
      });
    }

    return results;
  });
}

function mapWorkflowStateToLifecycleAction(workflowState: string, enableStorefront: boolean) {
  if (workflowState === 'approved') {
    return enableStorefront ? 'publish' : 'approve_review';
  }

  if (workflowState === 'hold') {
    return 'hold_review';
  }

  if (workflowState === 'rejected') {
    return 'reject_review';
  }

  return 'reset_review';
}

export async function updateProductReviewWorkflow(input: {
  productId: string;
  workflowState: string;
  reviewerNotes?: string;
  reviewedBy: string;
  enableStorefront?: boolean;
}) {
  return transitionProductLifecycle({
    productId: input.productId,
    action: mapWorkflowStateToLifecycleAction(input.workflowState, Boolean(input.enableStorefront)),
    reason: optionalText(input.reviewerNotes),
    changedBy: input.reviewedBy,
  });
}

export async function updateManyProductReviewWorkflows(input: {
  productIds: string[];
  workflowState: string;
  reviewerNotes?: string;
  reviewedBy: string;
  enableStorefront?: boolean;
}) {
  return transitionManyProductLifecycles({
    productIds: input.productIds,
    action: mapWorkflowStateToLifecycleAction(input.workflowState, Boolean(input.enableStorefront)),
    reason: optionalText(input.reviewerNotes),
    changedBy: input.reviewedBy,
  });
}

export async function updateProductVisibility(input: {
  productId: string;
  isPublic: boolean;
  intendedActive: boolean;
  visibilityNotes?: string;
}) {
  await requireAdmin();
  requireNonEmpty(input.productId, 'Product id');

  await prisma.productVisibility.upsert({
    where: { productId: input.productId },
    update: {
      isPublic: input.isPublic,
      intendedActive: input.intendedActive,
      visibilityNotes: optionalText(input.visibilityNotes),
      lastDisplayabilityCheckAt: new Date(),
    },
    create: {
      id: `${input.productId}-visibility`,
      productId: input.productId,
      isPublic: input.isPublic,
      intendedActive: input.intendedActive,
      visibilityNotes: optionalText(input.visibilityNotes),
      lastDisplayabilityCheckAt: new Date(),
    },
  });
}
