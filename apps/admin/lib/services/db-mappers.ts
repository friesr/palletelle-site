import {
  assessPriceTrackingHistory,
} from '@atelier/domain';
import type {
  AffiliateConnectionConfig,
  EnsembleDefinition,
  ProductRecord,
  SourcedProductRecord,
} from '@atelier/domain';
import type {
  AffiliateConfig,
  Ensemble,
  EnsembleItem,
  ExternalProductSignals,
  Product,
  ProductInferredData,
  ProductNormalizedData,
  ProductPriceSnapshot,
  ProductReviewState,
  ProductSourceData,
  ProductSourceHealth,
  ProductVisibility,
} from '@prisma/client';

export function mapDbProductToSourcedRecord(input: {
  product: Product;
  sourceData: ProductSourceData | null;
  priceSnapshots?: ProductPriceSnapshot[];
  normalizedData: ProductNormalizedData | null;
  inferredData: ProductInferredData | null;
  reviewState: ProductReviewState | null;
  sourceHealth: ProductSourceHealth | null;
  visibility?: ProductVisibility | null;
}): SourcedProductRecord {
  const { product, sourceData, normalizedData, inferredData, reviewState, sourceHealth } = input;
  const priceHistorySnapshots = (input.priceSnapshots ?? [])
    .filter((snapshot) => !sourceData || snapshot.productSourceDataId === sourceData.id)
    .map((snapshot) => ({
      id: snapshot.id,
      productSourceDataId: snapshot.productSourceDataId,
      sourceIdentifier: sourceData?.sourceIdentifier ?? undefined,
      priceText: snapshot.priceText,
      priceAmountCents: snapshot.priceAmountCents ?? undefined,
      currencyCode: snapshot.currencyCode ?? undefined,
      capturedAt: snapshot.capturedAt.toISOString(),
      captureMethod: snapshot.captureMethod,
    }));

  return {
    id: product.id,
    source: {
      sourcePlatform: ((sourceData?.sourcePlatform ?? 'amazon').startsWith('amazon') ? 'amazon' : sourceData?.sourcePlatform ?? 'fixture') as 'amazon' | 'fixture',
      sourceIdentifier: sourceData?.sourceIdentifier ?? 'unknown',
      ingestMethod: sourceData?.ingestMethod ?? undefined,
      canonicalUrl: sourceData?.canonicalUrl ?? undefined,
      affiliateUrl: sourceData?.affiliateUrl ?? undefined,
      retrievedAt: sourceData?.retrievedAt.toISOString() ?? product.createdAt.toISOString(),
      sourceFieldMap: sourceData?.sourceFieldMapJson ? JSON.parse(sourceData.sourceFieldMapJson) : {},
      rawSnapshot: {
        ...(sourceData?.rawSnapshotJson ? JSON.parse(sourceData.rawSnapshotJson) : {}),
        canonicalUrl: sourceData?.canonicalUrl,
        affiliateUrl: sourceData?.affiliateUrl,
        ingestMethod: sourceData?.ingestMethod,
      },
    },
    normalized: {
      title: normalizedData?.title ?? product.slug,
      brand: normalizedData?.brand ?? undefined,
      category: normalizedData?.category ?? undefined,
      sourceColor: normalizedData?.sourceColor ?? undefined,
      material: normalizedData?.material ?? undefined,
      priceText: normalizedData?.priceText ?? undefined,
      availabilityText: normalizedData?.availabilityText ?? undefined,
    },
    inferred: {
      paletteFamily: inferredData?.paletteFamily ?? undefined,
      colorHarmony: inferredData?.colorHarmony ?? undefined,
      styleDirection: inferredData?.styleDirection ?? undefined,
      styleOpinion: inferredData?.styleOpinion ?? undefined,
    },
    provenance: {
      normalizedAt: product.updatedAt.toISOString(),
      reviewedAt: reviewState?.reviewedAt?.toISOString(),
      reviewedBy: reviewState?.reviewedBy ?? undefined,
      dataConfidence: (inferredData?.dataConfidence ?? 'low') as 'low' | 'medium' | 'high',
      confidenceReason: inferredData?.confidenceReason ?? 'No inferred confidence record available.',
      confidenceImprovement: inferredData?.confidenceImprovement ?? 'Add stronger source and review support.',
      missingAttributes: inferredData?.missingAttributesJson ? JSON.parse(inferredData.missingAttributesJson) : [],
      uncertainAttributes: inferredData?.uncertainAttributesJson ? JSON.parse(inferredData.uncertainAttributesJson) : [],
    },
    freshness: {
      priceFreshness: {
        status: sourceHealth?.needsRevalidation ? 'stale' : 'fresh',
        checkedAt: sourceHealth?.lastSourceCheckAt?.toISOString(),
        thresholdHours: 24,
        reason: sourceHealth?.sourceCheckResult ?? 'Derived from local DB scaffold.',
      },
      availabilityFreshness: {
        status: sourceHealth?.needsRevalidation ? 'stale' : 'fresh',
        checkedAt: sourceHealth?.lastSourceCheckAt?.toISOString(),
        thresholdHours: 12,
        reason: sourceHealth?.sourceCheckResult ?? 'Derived from local DB scaffold.',
      },
      lastCheckedAt: sourceHealth?.lastSourceCheckAt?.toISOString(),
    },
    visibility: {
      isPublic: input.visibility?.isPublic ?? false,
      intendedActive: input.visibility?.intendedActive ?? false,
      visibilityNotes: input.visibility?.visibilityNotes ?? undefined,
    },
    priceHistory: priceHistorySnapshots.length > 0
      ? {
          summary: assessPriceTrackingHistory(priceHistorySnapshots),
          snapshots: priceHistorySnapshots,
        }
      : undefined,
    stagingStatus: (reviewState?.workflowState ?? 'needs_review') as SourcedProductRecord['stagingStatus'],
  };
}

export function mapDbProductToStorefrontRecord(input: {
  product: Product;
  sourceData?: ProductSourceData | null;
  normalizedData: ProductNormalizedData | null;
  inferredData: ProductInferredData | null;
}): ProductRecord {
  const { product, sourceData, normalizedData, inferredData } = input;

  const material = normalizedData?.material ?? 'Unknown';
  const sourceColor = normalizedData?.sourceColor ?? 'Unknown';
  const category = normalizedData?.category ?? 'Unspecified';
  const styleOpinion = inferredData?.styleOpinion ?? 'No editorial style opinion recorded.';

  return {
    id: product.id,
    slug: product.slug,
    name: normalizedData?.title ?? product.slug,
    brand: normalizedData?.brand ?? 'Unknown brand',
    priceLabel: normalizedData?.priceText ?? 'Unavailable in DB scaffold',
    colorLabel: sourceColor,
    summary: normalizedData?.summary ?? 'DB-backed local scaffold record.',
    confidence: (inferredData?.dataConfidence ?? 'low') as 'low' | 'medium' | 'high',
    buyUrl: sourceData?.affiliateUrl ?? sourceData?.canonicalUrl ?? undefined,
    canonicalUrl: sourceData?.canonicalUrl ?? undefined,
    sourcePlatform: sourceData?.sourcePlatform ?? 'amazon',
    sourceIdentifier: sourceData?.sourceIdentifier ?? product.id,
    provenance: {
      dataSource: 'DB-backed local scaffold record',
      normalizationState: 'Read from normalized and inferred tables with separated trust boundaries',
      confidenceReason: inferredData?.confidenceReason ?? 'No inferred confidence reason recorded.',
      confidenceImprovement: inferredData?.confidenceImprovement ?? 'Add stronger validation, health checks, and review evidence.',
      missingAttributes: inferredData?.missingAttributesJson ? JSON.parse(inferredData.missingAttributesJson) : [],
      uncertainAttributes: inferredData?.uncertainAttributesJson ? JSON.parse(inferredData.uncertainAttributesJson) : [],
    },
    recommendationRationale: {
      objectiveMatch: `The product is represented as ${category} in ${sourceColor}.`,
      inferredMatch: inferredData?.colorHarmony ?? 'No inferred harmony guidance recorded.',
      subjectiveSuggestion: styleOpinion,
    },
    facts: [
      { label: 'Material', value: material, kind: 'fact', source: 'normalized DB record' },
      { label: 'Source color', value: sourceColor, kind: 'fact', source: 'normalized DB record' },
      { label: 'Category', value: category, kind: 'fact', source: 'normalized DB record' },
      { label: 'Source identifier', value: sourceData?.sourceIdentifier ?? product.id, kind: 'fact', source: 'source DB record' },
      { label: 'Style note', value: styleOpinion, kind: 'opinion', source: 'inferred DB record' },
      ...(inferredData?.dataConfidence === 'low'
        ? [{ label: 'Low confidence reason', value: inferredData?.confidenceReason ?? 'Limited support recorded.', kind: 'fact' as const, source: 'inferred DB record' }]
        : []),
    ],
  };
}

export function mapDbAffiliateConfig(record: AffiliateConfig): AffiliateConnectionConfig {
  return {
    id: record.id,
    storeName: record.storeName,
    affiliatePlatform: record.platform as 'amazon',
    associateTag: record.associateStoreId ?? undefined,
    apiStatus: record.apiStatus as 'not_connected' | 'placeholder_only' | 'future_api',
    connectionStatus: record.enabled ? 'configured_locally' : 'not_configured',
    credentialsState: 'placeholder_local_only',
    refreshPolicy: {
      priceThresholdHours: record.freshnessPriceHours,
      availabilityThresholdHours: record.freshnessAvailabilityHours,
      note: 'Read from local DB-backed affiliate configuration scaffold.',
    },
    lastReviewedAt: record.updatedAt.toISOString(),
    notes: record.connectionNotes ?? undefined,
  };
}

export function mapDbEnsemble(record: Ensemble & { items: EnsembleItem[] }): EnsembleDefinition {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    summary: record.summary,
    confidence: record.confidence as 'low' | 'medium' | 'high',
    productSelections: record.items
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((item) => ({ productId: item.productId, role: item.role as 'base' | 'layer' | 'accent' | 'accessory' })),
    rationale: {
      objectiveMatch: record.objectiveMatch,
      inferredMatch: record.inferredMatch,
      subjectiveSuggestion: record.subjectiveSuggestion,
    },
    profileRelevance: {
      paletteFamilies: JSON.parse(record.paletteFamiliesJson),
      colorProfileTags: JSON.parse(record.colorProfileTagsJson),
      preferenceTags: JSON.parse(record.preferenceTagsJson),
    },
    source: record.source as 'fixture' | 'admin-scaffold',
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function mapVisibilityAssessment(input: {
  visibility: ProductVisibility | null;
  reviewState: ProductReviewState | null;
  sourceHealth: ProductSourceHealth | null;
  externalSignals: ExternalProductSignals | null;
}) {
  return {
    visibility: input.visibility,
    reviewState: input.reviewState,
    sourceHealth: input.sourceHealth,
    externalSignals: input.externalSignals,
  };
}
