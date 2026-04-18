import type { ProductWorkflowState, SourcedProductRecord } from '@atelier/domain';
import { prisma } from '@/lib/db';
import { mapDbProductToSourcedRecord } from '@/lib/services/db-mappers';
import { optionalText, requireEnumValue, requireNonEmpty } from '@/lib/services/validators';

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
      reviewState: true,
      sourceHealth: true,
      visibility: true,
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
      reviewState: product.reviewState,
      sourceHealth: product.sourceHealth,
      visibility: product.visibility,
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
      reviewState: true,
      sourceHealth: true,
      visibility: true,
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
    reviewState: product.reviewState,
    sourceHealth: product.sourceHealth,
    visibility: product.visibility,
  });
}

const workflowStates = ['discovered', 'normalized', 'needs_review', 'hold', 'approved', 'rejected', 'stale', 'needs_refresh'] as const;

function normalizeProductIds(productIds: string[]) {
  const ids = Array.from(new Set(productIds.map((value) => value.trim()).filter(Boolean)));

  if (ids.length === 0) {
    throw new Error('At least one product id is required.');
  }

  return ids;
}

export async function updateProductReviewWorkflow(input: {
  productId: string;
  workflowState: string;
  reviewerNotes?: string;
  reviewedBy: string;
  enableStorefront?: boolean;
}) {
  requireNonEmpty(input.productId, 'Product id');
  await updateManyProductReviewWorkflows({
    productIds: [input.productId],
    workflowState: input.workflowState,
    reviewerNotes: input.reviewerNotes,
    reviewedBy: input.reviewedBy,
    enableStorefront: input.enableStorefront,
  });
}

export async function updateManyProductReviewWorkflows(input: {
  productIds: string[];
  workflowState: string;
  reviewerNotes?: string;
  reviewedBy: string;
  enableStorefront?: boolean;
}) {
  requireNonEmpty(input.reviewedBy, 'Reviewer');
  const workflowState = requireEnumValue(input.workflowState, workflowStates, 'Workflow state') as ProductWorkflowState;
  const productIds = normalizeProductIds(input.productIds);
  const reviewerNotes = optionalText(input.reviewerNotes);
  const reviewedAt = new Date();

  await prisma.$transaction(async (tx) => {
    for (const productId of productIds) {
      await tx.productReviewState.upsert({
        where: { productId },
        update: {
          workflowState,
          reviewerNotes,
          reviewedBy: input.reviewedBy,
          reviewedAt,
        },
        create: {
          id: `${productId}-review`,
          productId,
          workflowState,
          reviewerNotes,
          reviewedBy: input.reviewedBy,
          reviewedAt,
        },
      });

      if (workflowState === 'needs_refresh') {
        await tx.productSourceHealth.upsert({
          where: { productId },
          update: {
            needsRevalidation: true,
            revalidationReason: 'Marked needs_refresh by admin workflow.',
          },
          create: {
            id: `${productId}-health`,
            productId,
            needsRevalidation: true,
            revalidationReason: 'Marked needs_refresh by admin workflow.',
          },
        });
      }

      if (workflowState === 'approved' && input.enableStorefront) {
        await tx.productVisibility.upsert({
          where: { productId },
          update: {
            isPublic: true,
            intendedActive: true,
            visibilityNotes: 'Approved and enabled from admin review workflow.',
            lastDisplayabilityCheckAt: reviewedAt,
          },
          create: {
            id: `${productId}-visibility`,
            productId,
            isPublic: true,
            intendedActive: true,
            visibilityNotes: 'Approved and enabled from admin review workflow.',
            lastDisplayabilityCheckAt: reviewedAt,
          },
        });
      }
    }
  });
}

export async function updateProductVisibility(input: {
  productId: string;
  isPublic: boolean;
  intendedActive: boolean;
  visibilityNotes?: string;
}) {
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
