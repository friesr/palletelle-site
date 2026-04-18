import type { ProductWorkflowState, SourcedProductRecord } from '@atelier/domain';
import { prisma } from '@/lib/db';
import { mapDbProductToSourcedRecord } from '@/lib/services/db-mappers';
import { optionalText, requireEnumValue, requireNonEmpty } from '@/lib/services/validators';

export async function listReviewRecords(): Promise<SourcedProductRecord[]> {
  const products = await prisma.product.findMany({
    include: {
      sourceData: true,
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
    normalizedData: product.normalizedData,
    inferredData: product.inferredData,
    reviewState: product.reviewState,
    sourceHealth: product.sourceHealth,
    visibility: product.visibility,
  });
}

const workflowStates = ['discovered', 'normalized', 'needs_review', 'hold', 'approved', 'rejected', 'stale', 'needs_refresh'] as const;

export async function updateProductReviewWorkflow(input: {
  productId: string;
  workflowState: string;
  reviewerNotes?: string;
  reviewedBy: string;
}) {
  requireNonEmpty(input.productId, 'Product id');
  requireNonEmpty(input.reviewedBy, 'Reviewer');
  const workflowState = requireEnumValue(input.workflowState, workflowStates, 'Workflow state') as ProductWorkflowState;

  await prisma.productReviewState.upsert({
    where: { productId: input.productId },
    update: {
      workflowState,
      reviewerNotes: optionalText(input.reviewerNotes),
      reviewedBy: input.reviewedBy,
      reviewedAt: new Date(),
    },
    create: {
      id: `${input.productId}-review`,
      productId: input.productId,
      workflowState,
      reviewerNotes: optionalText(input.reviewerNotes),
      reviewedBy: input.reviewedBy,
      reviewedAt: new Date(),
    },
  });

  if (workflowState === 'needs_refresh') {
    await prisma.productSourceHealth.upsert({
      where: { productId: input.productId },
      update: {
        needsRevalidation: true,
        revalidationReason: 'Marked needs_refresh by admin workflow.',
      },
      create: {
        id: `${input.productId}-health`,
        productId: input.productId,
        needsRevalidation: true,
        revalidationReason: 'Marked needs_refresh by admin workflow.',
      },
    });
  }
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
