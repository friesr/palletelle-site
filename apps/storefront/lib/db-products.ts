import {
  assessProductDisplayability,
  type ExternalProductSignalsRecord,
  type ProductRecord,
  type ProductReviewStateRecord,
  type ProductSourceHealthRecord,
  type ProductVisibilityRecord,
} from '@atelier/domain';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { sampleProducts } from '@/lib/sample-products';

type StorefrontDbProduct = Prisma.ProductGetPayload<{
  include: {
    sourceData: true;
    normalizedData: true;
    inferredData: true;
    reviewState: true;
    visibility: true;
    sourceHealth: true;
    externalSignals: true;
  };
}>;

function parseJsonArray(value?: string | null) {
  return value ? JSON.parse(value) : [];
}

function isAdminEnabledPreview(input: {
  reviewState: { workflowState: string } | null;
  visibility: { isPublic: boolean; intendedActive: boolean } | null;
}) {
  return Boolean(
    input.reviewState?.workflowState === 'approved' &&
      input.visibility?.isPublic &&
      input.visibility?.intendedActive,
  );
}

function isStorefrontVisible(input: {
  reviewState: ProductReviewStateRecord | null;
  visibility: ProductVisibilityRecord | null;
  sourceHealth: ProductSourceHealthRecord | null;
  externalSignals: ExternalProductSignalsRecord | null;
}) {
  const previewEnabled = isAdminEnabledPreview({
    reviewState: input.reviewState,
    visibility: input.visibility,
  });

  if (!previewEnabled) {
    return false;
  }

  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  return assessProductDisplayability({
    visibility: input.visibility ?? {
      productId: 'unknown',
      isPublic: false,
      intendedActive: false,
    },
    reviewState: input.reviewState ?? {
      productId: 'unknown',
      workflowState: 'needs_review',
    },
    sourceHealth: input.sourceHealth ?? {
      productId: 'unknown',
      sourceStatus: 'unknown',
      needsRevalidation: true,
    },
    externalSignals: input.externalSignals ?? {
      productId: 'unknown',
      reputationState: 'unknown',
      repeatedComplaintPattern: false,
      lowRatingRisk: false,
      recommendation: 'none',
    },
  }).isDisplayable;
}

function mapDbProductToStorefrontRecord(product: StorefrontDbProduct): ProductRecord {
  const sourceData = product.sourceData[0] ?? null;
  const normalizedData = product.normalizedData;
  const inferredData = product.inferredData;
  const category = normalizedData?.category ?? 'Unspecified';
  const sourceColor = normalizedData?.sourceColor ?? 'Unknown color';
  const styleOpinion = inferredData?.styleOpinion ?? 'No editorial suggestion recorded.';

  return {
    id: product.id,
    slug: product.slug,
    name: normalizedData?.title ?? sourceData?.title ?? product.slug,
    brand: normalizedData?.brand ?? 'Unknown brand',
    priceLabel: normalizedData?.priceText ?? sourceData?.priceText ?? 'Price pending review',
    colorLabel: normalizedData?.sourceColor ?? sourceData?.colorText ?? 'Color pending review',
    summary:
      normalizedData?.summary ??
      'This is an admin-enabled development preview. Core product facts may still be under review.',
    confidence: (inferredData?.dataConfidence ?? 'low') as 'low' | 'medium' | 'high',
    buyUrl: sourceData?.affiliateUrl ?? sourceData?.canonicalUrl ?? undefined,
    canonicalUrl: sourceData?.canonicalUrl ?? undefined,
    sourcePlatform: sourceData?.sourcePlatform ?? 'amazon',
    sourceIdentifier: sourceData?.sourceIdentifier ?? product.id,
    provenance: {
      dataSource:
        process.env.NODE_ENV !== 'production'
          ? 'DB-backed development preview, shown only after admin approval plus storefront enablement'
          : 'DB-backed reviewed product record',
      normalizationState: 'Source, normalized, and inferred layers remain separate in the database',
      confidenceReason: inferredData?.confidenceReason ?? 'No inferred confidence reason recorded.',
      confidenceImprovement: inferredData?.confidenceImprovement ?? 'Add stronger source and review evidence.',
      missingAttributes: parseJsonArray(inferredData?.missingAttributesJson),
      uncertainAttributes: parseJsonArray(inferredData?.uncertainAttributesJson),
    },
    recommendationRationale: {
      objectiveMatch: `The product is represented as ${category} in ${sourceColor}.`,
      inferredMatch: inferredData?.colorHarmony ?? 'No inferred harmony guidance recorded.',
      subjectiveSuggestion: styleOpinion,
    },
    facts: [
      { label: 'Material', value: normalizedData?.material ?? 'Unknown', kind: 'fact', source: 'normalized DB record' },
      { label: 'Source color', value: normalizedData?.sourceColor ?? sourceData?.colorText ?? 'Unknown', kind: 'fact', source: 'normalized/source DB record' },
      { label: 'Category', value: category, kind: 'fact', source: 'normalized DB record' },
      { label: 'Source identifier', value: sourceData?.sourceIdentifier ?? product.id, kind: 'fact', source: 'source DB record' },
      { label: 'Style note', value: styleOpinion, kind: 'opinion', source: 'inferred DB record' },
      ...(inferredData?.dataConfidence === 'low'
        ? [{ label: 'Low confidence reason', value: inferredData?.confidenceReason ?? 'Limited support recorded.', kind: 'fact' as const, source: 'inferred DB record' }]
        : []),
    ],
  };
}

export async function listStorefrontProducts(): Promise<ProductRecord[]> {
  const products = await prisma.product.findMany({
    include: {
      sourceData: true,
      normalizedData: true,
      inferredData: true,
      reviewState: true,
      visibility: true,
      sourceHealth: true,
      externalSignals: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (products.length === 0) {
    return sampleProducts;
  }

  return products
    .filter((product) =>
      isStorefrontVisible({
        reviewState: product.reviewState
          ? {
              productId: product.reviewState.productId,
              workflowState: product.reviewState.workflowState,
              reviewedAt: product.reviewState.reviewedAt?.toISOString(),
              reviewedBy: product.reviewState.reviewedBy ?? undefined,
              reviewerNotes: product.reviewState.reviewerNotes ?? undefined,
            }
          : null,
        visibility: product.visibility
          ? {
              productId: product.visibility.productId,
              isPublic: product.visibility.isPublic,
              intendedActive: product.visibility.intendedActive,
              visibilityNotes: product.visibility.visibilityNotes ?? undefined,
              lastDisplayabilityCheckAt: product.visibility.lastDisplayabilityCheckAt?.toISOString(),
            }
          : null,
        sourceHealth: product.sourceHealth
          ? {
              productId: product.sourceHealth.productId,
              sourceStatus: product.sourceHealth.sourceStatus,
              lastSourceCheckAt: product.sourceHealth.lastSourceCheckAt?.toISOString(),
              sourceCheckResult: product.sourceHealth.sourceCheckResult ?? undefined,
              needsRevalidation: product.sourceHealth.needsRevalidation,
              revalidationReason: product.sourceHealth.revalidationReason ?? undefined,
            }
          : null,
        externalSignals: product.externalSignals
          ? {
              productId: product.externalSignals.productId,
              reputationState: product.externalSignals.reputationState,
              lastExternalCheckAt: product.externalSignals.lastExternalCheckAt?.toISOString(),
              repeatedComplaintPattern: product.externalSignals.repeatedComplaintPattern,
              lowRatingRisk: product.externalSignals.lowRatingRisk,
              recommendation: product.externalSignals.recommendation,
              notes: product.externalSignals.notes ?? undefined,
            }
          : null,
      }),
    )
    .map(mapDbProductToStorefrontRecord);
}

export async function getStorefrontProductBySlug(slug: string): Promise<ProductRecord | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      sourceData: true,
      normalizedData: true,
      inferredData: true,
      reviewState: true,
      visibility: true,
      sourceHealth: true,
      externalSignals: true,
    },
  });

  if (!product) {
    return sampleProducts.find((item) => item.slug === slug) ?? null;
  }

  const visible = isStorefrontVisible({
    reviewState: product.reviewState
      ? {
          productId: product.reviewState.productId,
          workflowState: product.reviewState.workflowState,
          reviewedAt: product.reviewState.reviewedAt?.toISOString(),
          reviewedBy: product.reviewState.reviewedBy ?? undefined,
          reviewerNotes: product.reviewState.reviewerNotes ?? undefined,
        }
      : null,
    visibility: product.visibility
      ? {
          productId: product.visibility.productId,
          isPublic: product.visibility.isPublic,
          intendedActive: product.visibility.intendedActive,
          visibilityNotes: product.visibility.visibilityNotes ?? undefined,
          lastDisplayabilityCheckAt: product.visibility.lastDisplayabilityCheckAt?.toISOString(),
        }
      : null,
    sourceHealth: product.sourceHealth
      ? {
          productId: product.sourceHealth.productId,
          sourceStatus: product.sourceHealth.sourceStatus,
          lastSourceCheckAt: product.sourceHealth.lastSourceCheckAt?.toISOString(),
          sourceCheckResult: product.sourceHealth.sourceCheckResult ?? undefined,
          needsRevalidation: product.sourceHealth.needsRevalidation,
          revalidationReason: product.sourceHealth.revalidationReason ?? undefined,
        }
      : null,
    externalSignals: product.externalSignals
      ? {
          productId: product.externalSignals.productId,
          reputationState: product.externalSignals.reputationState,
          lastExternalCheckAt: product.externalSignals.lastExternalCheckAt?.toISOString(),
          repeatedComplaintPattern: product.externalSignals.repeatedComplaintPattern,
          lowRatingRisk: product.externalSignals.lowRatingRisk,
          recommendation: product.externalSignals.recommendation,
          notes: product.externalSignals.notes ?? undefined,
        }
      : null,
  });

  if (!visible) {
    return null;
  }

  return mapDbProductToStorefrontRecord(product);
}
