import {
  assessPriceTrackingHistory,
  createInitialLifecycleState,
  deriveProductVisibilityDecision,
  type ExternalProductSignalsRecord,
  type ProductLifecycleStateRecord,
  type ProductRecord,
  type ProductSourceHealthRecord,
} from '@atelier/domain';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { sampleProducts } from '@/lib/sample-products';

type StorefrontDbProduct = Prisma.ProductGetPayload<{
  include: {
    sourceData: true;
    priceSnapshots: true;
    normalizedData: true;
    inferredData: true;
    lifecycleState: true;
    sourceHealth: true;
    externalSignals: true;
  };
}>;

function parseJsonArray(value?: string | null) {
  return value ? JSON.parse(value) : [];
}

function mapLifecycleState(product: StorefrontDbProduct): ProductLifecycleStateRecord {
  if (product.lifecycleState) {
    return {
      productId: product.lifecycleState.productId,
      ingestState: product.lifecycleState.ingestState,
      reviewState: product.lifecycleState.reviewState,
      previewState: product.lifecycleState.previewState,
      publishState: product.lifecycleState.publishState,
      stateNotes: product.lifecycleState.stateNotes ?? undefined,
      lastChangedAt: product.lifecycleState.lastChangedAt?.toISOString(),
      lastChangedBy: product.lifecycleState.lastChangedBy ?? undefined,
    };
  }

  const sourceData = product.sourceData[0];

  return createInitialLifecycleState({
    productId: product.id,
    ingestState: sourceData?.ingestMethod === 'manual_seed' ? 'manual_seeded' : 'normalized',
    reviewState: 'pending',
    previewState: 'none',
    publishState: 'unpublished',
  });
}

function mapSourceHealth(product: StorefrontDbProduct): ProductSourceHealthRecord | null {
  if (!product.sourceHealth) {
    return null;
  }

  return {
    productId: product.sourceHealth.productId,
    sourceStatus: product.sourceHealth.sourceStatus,
    lastSourceCheckAt: product.sourceHealth.lastSourceCheckAt?.toISOString(),
    sourceCheckResult: product.sourceHealth.sourceCheckResult ?? undefined,
    needsRevalidation: product.sourceHealth.needsRevalidation,
    revalidationReason: product.sourceHealth.revalidationReason ?? undefined,
  };
}

function mapExternalSignals(product: StorefrontDbProduct): ExternalProductSignalsRecord | null {
  if (!product.externalSignals) {
    return null;
  }

  return {
    productId: product.externalSignals.productId,
    reputationState: product.externalSignals.reputationState,
    lastExternalCheckAt: product.externalSignals.lastExternalCheckAt?.toISOString(),
    repeatedComplaintPattern: product.externalSignals.repeatedComplaintPattern,
    lowRatingRisk: product.externalSignals.lowRatingRisk,
    recommendation: product.externalSignals.recommendation,
    notes: product.externalSignals.notes ?? undefined,
  };
}

export function getStorefrontVisibilityDecision(product: StorefrontDbProduct, environment = process.env.NODE_ENV === 'production' ? 'production' as const : 'development' as const) {
  return deriveProductVisibilityDecision({
    lifecycle: mapLifecycleState(product),
    sourceHealth: mapSourceHealth(product),
    externalSignals: mapExternalSignals(product),
    environment,
  });
}

export function filterVisibleStorefrontProducts(products: StorefrontDbProduct[], environment = process.env.NODE_ENV === 'production' ? 'production' as const : 'development' as const) {
  return products.filter((product) => getStorefrontVisibilityDecision(product, environment).customerVisible);
}

function mapDbProductToStorefrontRecord(product: StorefrontDbProduct): ProductRecord {
  const sourceData = product.sourceData[0] ?? null;
  const normalizedData = product.normalizedData;
  const inferredData = product.inferredData;
  const lifecycle = mapLifecycleState(product);
  const visibilityDecision = getStorefrontVisibilityDecision(product);
  const category = normalizedData?.category ?? 'Unspecified';
  const sourceColor = normalizedData?.sourceColor ?? 'Unknown color';
  const styleOpinion = inferredData?.styleOpinion ?? 'No editorial suggestion recorded.';
  const priceTracking = assessPriceTrackingHistory(
    product.priceSnapshots
      .filter((snapshot) => !sourceData || snapshot.productSourceDataId === sourceData.id)
      .map((snapshot) => ({
        priceText: snapshot.priceText,
        priceAmountCents: snapshot.priceAmountCents ?? undefined,
        currencyCode: snapshot.currencyCode ?? undefined,
        capturedAt: snapshot.capturedAt.toISOString(),
        captureMethod: snapshot.captureMethod,
      })),
  );

  return {
    id: product.id,
    slug: product.slug,
    name: normalizedData?.title ?? sourceData?.title ?? product.slug,
    brand: normalizedData?.brand ?? 'Unknown brand',
    priceLabel: priceTracking.currentPriceText ?? 'Price not yet observed',
    colorLabel: normalizedData?.sourceColor ?? sourceData?.colorText ?? 'Color pending review',
    summary:
      normalizedData?.summary ??
      `Lifecycle state ${lifecycle.ingestState} / ${lifecycle.reviewState} / ${lifecycle.previewState} / ${lifecycle.publishState}.`,
    confidence: (inferredData?.dataConfidence ?? 'low') as 'low' | 'medium' | 'high',
    buyUrl: sourceData?.affiliateUrl ?? sourceData?.canonicalUrl ?? undefined,
    canonicalUrl: sourceData?.canonicalUrl ?? undefined,
    sourcePlatform: sourceData?.sourcePlatform ?? 'amazon',
    sourceIdentifier: sourceData?.sourceIdentifier ?? product.id,
    priceTracking,
    provenance: {
      dataSource:
        visibilityDecision.mode === 'dev_preview'
          ? 'DB-backed development preview, shown from explicit lifecycle preview state'
          : 'DB-backed published product record',
      normalizationState: `Lifecycle: ${lifecycle.ingestState}; source, normalized, and inferred layers remain separate in the database`,
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
      { label: 'Lifecycle visibility', value: visibilityDecision.mode, kind: 'fact', source: 'lifecycle DB state' },
      ...(priceTracking.currentPriceText
        ? [{ label: 'Tracked price note', value: priceTracking.note, kind: 'fact' as const, source: 'price history DB record' }]
        : []),
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
      priceSnapshots: {
        orderBy: { capturedAt: 'desc' },
        take: 12,
      },
      normalizedData: true,
      inferredData: true,
      lifecycleState: true,
      sourceHealth: true,
      externalSignals: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (products.length === 0) {
    return sampleProducts;
  }

  return filterVisibleStorefrontProducts(products).map(mapDbProductToStorefrontRecord);
}

export async function getStorefrontProductBySlug(slug: string): Promise<ProductRecord | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      sourceData: true,
      priceSnapshots: {
        orderBy: { capturedAt: 'desc' },
        take: 12,
      },
      normalizedData: true,
      inferredData: true,
      lifecycleState: true,
      sourceHealth: true,
      externalSignals: true,
    },
  });

  if (!product) {
    return sampleProducts.find((item) => item.slug === slug) ?? null;
  }

  if (!getStorefrontVisibilityDecision(product).customerVisible) {
    return null;
  }

  return mapDbProductToStorefrontRecord(product);
}
