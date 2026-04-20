import { prisma } from '@/lib/db';

export type EzraValidationOutcome =
  | 'validated_active'
  | 'validated_changed'
  | 'validated_unavailable'
  | 'partial_observation_only'
  | 'manual_capture_only'
  | 'check_failed'
  | 'revalidation_required';

export interface EzraValidationResult {
  productId: string;
  outcome: EzraValidationOutcome;
  sourceStatus: 'unknown' | 'active' | 'inactive' | 'unavailable' | 'changed';
  needsRevalidation: boolean;
  sourceCheckResult: string;
  revalidationReason?: string;
  evidence: {
    canonicalUrl: boolean;
    affiliateUrl: boolean;
    sourceTitle: boolean;
    primaryImage: boolean;
    gallery: boolean;
    sourcePriceText: boolean;
    sourceAvailabilityText: boolean;
  };
}

function parseRawSnapshot(rawSnapshotJson?: string | null): Record<string, unknown> {
  if (!rawSnapshotJson) return {};

  try {
    return JSON.parse(rawSnapshotJson) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function hasNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasStringArray(values: unknown): boolean {
  return Array.isArray(values) && values.some((entry) => hasNonEmptyString(entry));
}

export async function evaluateEzraValidation(productId: string): Promise<EzraValidationResult> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      sourceData: {
        orderBy: { retrievedAt: 'desc' },
        take: 1,
      },
      sourceHealth: true,
    },
  });

  if (!product) {
    throw new Error('Product not found.');
  }

  const sourceData = product.sourceData[0] ?? null;
  if (!sourceData) {
    return {
      productId,
      outcome: 'check_failed',
      sourceStatus: 'unknown',
      needsRevalidation: true,
      sourceCheckResult: 'No source record exists for this product.',
      revalidationReason: 'Source record missing.',
      evidence: {
        canonicalUrl: false,
        affiliateUrl: false,
        sourceTitle: false,
        primaryImage: false,
        gallery: false,
        sourcePriceText: false,
        sourceAvailabilityText: false,
      },
    };
  }

  const rawSnapshot = parseRawSnapshot(sourceData.rawSnapshotJson);
  const evidence = {
    canonicalUrl: hasNonEmptyString(sourceData.canonicalUrl),
    affiliateUrl: hasNonEmptyString(sourceData.affiliateUrl),
    sourceTitle: hasNonEmptyString(sourceData.title),
    primaryImage: [rawSnapshot.image, rawSnapshot.imageUrl, rawSnapshot.mainImage, rawSnapshot.mainImageUrl].some(hasNonEmptyString),
    gallery: [rawSnapshot.images, rawSnapshot.additionalImages, rawSnapshot.gallery].some(hasStringArray),
    sourcePriceText: hasNonEmptyString(sourceData.priceText),
    sourceAvailabilityText: hasNonEmptyString(sourceData.availabilityText),
  };

  const hasCoreObservation = evidence.canonicalUrl && (evidence.sourceTitle || evidence.primaryImage || evidence.gallery);
  const hasTimeSensitiveFields = evidence.sourcePriceText || evidence.sourceAvailabilityText;

  if (!evidence.canonicalUrl) {
    return {
      productId,
      outcome: 'check_failed',
      sourceStatus: 'unknown',
      needsRevalidation: true,
      sourceCheckResult: 'No canonical URL is recorded, so the listing cannot be treated as checkable.',
      revalidationReason: 'Canonical URL missing.',
      evidence,
    };
  }

  if (hasCoreObservation && hasTimeSensitiveFields) {
    return {
      productId,
      outcome: 'validated_active',
      sourceStatus: 'active',
      needsRevalidation: false,
      sourceCheckResult: 'Canonical URL, core listing evidence, and time-sensitive fields are present.',
      evidence,
    };
  }

  if (hasCoreObservation) {
    return {
      productId,
      outcome: 'partial_observation_only',
      sourceStatus: 'active',
      needsRevalidation: true,
      sourceCheckResult: 'Core listing evidence is present, but price and availability freshness are not established.',
      revalidationReason: 'Time-sensitive fields have not been captured.',
      evidence,
    };
  }

  return {
    productId,
    outcome: 'manual_capture_only',
    sourceStatus: 'unknown',
    needsRevalidation: true,
    sourceCheckResult: 'A source record exists, but not enough listing evidence has been captured yet.',
    revalidationReason: 'Additional source evidence required.',
    evidence,
  };
}

export async function applyEzraValidationResult(result: EzraValidationResult) {
  await prisma.productSourceHealth.upsert({
    where: { productId: result.productId },
    update: {
      sourceStatus: result.sourceStatus,
      lastSourceCheckAt: new Date(),
      sourceCheckResult: result.sourceCheckResult,
      needsRevalidation: result.needsRevalidation,
      revalidationReason: result.revalidationReason,
    },
    create: {
      id: `${result.productId}-source-health`,
      productId: result.productId,
      sourceStatus: result.sourceStatus,
      lastSourceCheckAt: new Date(),
      sourceCheckResult: result.sourceCheckResult,
      needsRevalidation: result.needsRevalidation,
      revalidationReason: result.revalidationReason,
    },
  });

  return result;
}

export async function runEzraValidation(productId: string) {
  const result = await evaluateEzraValidation(productId);
  await applyEzraValidationResult(result);
  return result;
}
