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

const TESTBED_EMPTY_DB_FALLBACK = process.env.ATELIER_ENABLE_SAMPLE_FALLBACK !== 'false';

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

function isPrivateTestbedHost(host?: string | null) {
  if (!host) return false;

  const normalizedHost = host.split(',')[0]?.trim().toLowerCase();
  if (!normalizedHost) return false;

  const hostname = normalizedHost.split(':')[0];

  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.local') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  );
}

export function resolveStorefrontRuntimeEnvironment(input: {
  host?: string | null;
  configured?: string | null;
  nextPublicStoreEnv?: string | null;
  appEnv?: string | null;
  publicStoreFlag?: string | null;
  nodeEnv?: string | null;
} = {}): 'development' | 'production' {
  if (isPrivateTestbedHost(input.host)) {
    return 'development';
  }

  const configured = input.configured ?? input.nextPublicStoreEnv;

  if (configured === 'production' || configured === 'development') {
    return configured;
  }

  if (input.appEnv === 'production' || input.appEnv === 'development') {
    return input.appEnv;
  }

  if (input.nodeEnv && input.nodeEnv !== 'production') {
    return 'development';
  }

  return input.publicStoreFlag === 'true' ? 'production' : 'development';
}

function getStorefrontRuntimeEnvironment(): 'development' | 'production' {
  return resolveStorefrontRuntimeEnvironment({
    configured: process.env.ATELIER_STORE_ENV,
    nextPublicStoreEnv: process.env.NEXT_PUBLIC_STORE_ENV,
    appEnv: process.env.NEXT_PUBLIC_APP_ENV,
    publicStoreFlag: process.env.ATELIER_PUBLIC_STORE,
    nodeEnv: process.env.NODE_ENV,
  });
}

function getRawSnapshotString(rawSnapshot: unknown, ...keys: string[]) {
  if (!rawSnapshot || typeof rawSnapshot !== 'object') {
    return undefined;
  }

  for (const key of keys) {
    const value = (rawSnapshot as Record<string, unknown>)[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function getRawSnapshotStringArray(rawSnapshot: unknown, ...keys: string[]) {
  if (!rawSnapshot || typeof rawSnapshot !== 'object') {
    return [] as string[];
  }

  const results: string[] = [];

  for (const key of keys) {
    const value = (rawSnapshot as Record<string, unknown>)[key];

    if (typeof value === 'string' && value.trim().length > 0) {
      results.push(value.trim());
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string' && item.trim().length > 0) {
          results.push(item.trim());
        } else if (item && typeof item === 'object') {
          const nested = getRawSnapshotString(item, 'url', 'src', 'image', 'imageUrl', 'mainImage', 'mainImageUrl');
          if (nested) {
            results.push(nested);
          }
        }
      }
    }
  }

  return [...new Set(results)];
}

function normalizePriceLabel(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.replace(/^\$\$+/, '$');
}

function getDisplayName(product: StorefrontDbProduct, sourceData: StorefrontDbProduct['sourceData'][number] | null) {
  const normalizedTitle = product.normalizedData?.title?.trim();
  const sourceTitle = sourceData?.title?.trim() ?? getRawSnapshotString(sourceData?.rawSnapshotJson ? JSON.parse(sourceData.rawSnapshotJson) : null, 'title', 'name', 'productTitle');

  if (normalizedTitle && !/^Manual review required \(.+\)$/i.test(normalizedTitle)) {
    return normalizedTitle;
  }

  if (sourceTitle) {
    return sourceTitle;
  }

  return normalizedTitle ?? sourceData?.sourceIdentifier ?? product.slug;
}

function makeFallbackProductImage(title: string, subtitle: string, seed: string) {
  const hue = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(${hue} 32% 92%)" />
          <stop offset="100%" stop-color="hsl(${(hue + 28) % 360} 30% 84%)" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1500" fill="url(#bg)" />
      <circle cx="980" cy="220" r="210" fill="hsla(${(hue + 18) % 360}, 40%, 70%, 0.22)" />
      <circle cx="260" cy="1240" r="280" fill="hsla(${(hue + 8) % 360}, 30%, 55%, 0.16)" />
      <text x="90" y="1380" fill="#1f1a17" font-family="Inter, Arial, sans-serif" font-size="88" font-weight="700">${title}</text>
      <text x="90" y="1450" fill="#4b4038" font-family="Inter, Arial, sans-serif" font-size="40">${subtitle}</text>
    </svg>
  `.trim();

  return {
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    alt: `${title} fixture image`,
  };
}

function getStorefrontSourcePriority(sourcePlatform?: string | null) {
  if (sourcePlatform?.startsWith('amazon')) return 0;
  if (sourcePlatform?.startsWith('fixture')) return 1;
  return 2;
}

export function isManualReviewPlaceholder(product: StorefrontDbProduct) {
  return /^Manual review required \(.+\)$/i.test(product.normalizedData?.title?.trim() ?? '');
}

export function prioritizeStorefrontProducts<T extends { createdAt: Date; sourceData: Array<{ sourcePlatform: string } | null> }>(products: T[]) {
  return [...products].sort((left, right) => {
    const leftPriority = getStorefrontSourcePriority(left.sourceData[0]?.sourcePlatform);
    const rightPriority = getStorefrontSourcePriority(right.sourceData[0]?.sourcePlatform);

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return left.createdAt.getTime() - right.createdAt.getTime();
  });
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

export function getStorefrontVisibilityDecision(product: StorefrontDbProduct, environment = getStorefrontRuntimeEnvironment()) {
  return deriveProductVisibilityDecision({
    lifecycle: mapLifecycleState(product),
    sourceHealth: mapSourceHealth(product),
    externalSignals: mapExternalSignals(product),
    environment,
  });
}

export function filterVisibleStorefrontProducts(products: StorefrontDbProduct[], environment = getStorefrontRuntimeEnvironment()) {
  return products.filter((product) => getStorefrontVisibilityDecision(product, environment).customerVisible);
}

function mapDbProductToStorefrontRecord(product: StorefrontDbProduct): ProductRecord {
  const sourceData = product.sourceData[0] ?? null;
  const normalizedData = product.normalizedData;
  const inferredData = product.inferredData;
  const lifecycle = mapLifecycleState(product);
  const visibilityDecision = getStorefrontVisibilityDecision(product);
  const category = normalizedData?.category ?? 'Unspecified';
  const sourceColor = normalizedData?.sourceColor ?? sourceData?.colorText ?? 'Unknown color';
  const styleOpinion = inferredData?.styleOpinion ?? 'No editorial suggestion recorded.';
  const rawSnapshot = sourceData?.rawSnapshotJson ? JSON.parse(sourceData.rawSnapshotJson) : null;
  const sourceImageUrls = getRawSnapshotStringArray(
    rawSnapshot,
    'image',
    'imageUrl',
    'mainImage',
    'mainImageUrl',
    'images',
    'additionalImages',
    'alternateImages',
    'gallery',
    'media',
  );
  const fixtureProduct = sampleProducts.find((item) => item.slug === product.slug);
  const fixtureImage = fixtureProduct?.image;
  const fixtureImages = fixtureProduct?.images ?? (fixtureImage ? [fixtureImage] : []);
  const displayName = getDisplayName(product, sourceData);
  const sourceImages = sourceImageUrls.map((src, index) => ({
    src,
    alt: `${displayName} source image ${index + 1}`,
    caption: sourceData?.sourcePlatform?.startsWith('amazon')
      ? 'Source listing image captured for development review'
      : 'Source image captured for development review',
  }));
  const fallbackImage = sourceData?.sourcePlatform?.startsWith('amazon')
    ? undefined
    : fixtureImage ?? makeFallbackProductImage(
        displayName,
        sourceColor,
        product.slug,
      );
  const images = sourceImages.length > 0
    ? sourceImages
    : fixtureImages.length > 0
      ? fixtureImages
      : fallbackImage
        ? [fallbackImage]
        : [];
  const image = images[0];
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
    name: displayName,
    brand: normalizedData?.brand ?? getRawSnapshotString(rawSnapshot, 'brand') ?? 'Unknown brand',
    priceLabel: normalizePriceLabel(priceTracking.currentPriceText) ?? normalizePriceLabel(normalizedData?.priceText) ?? 'Price not yet observed',
    colorLabel: sourceColor,
    summary:
      normalizedData?.summary ??
      (sourceData?.sourcePlatform?.startsWith('amazon')
        ? 'Amazon-sourced development preview. Core source links are present, but catalog enrichment is still in progress.'
        : `Lifecycle state ${lifecycle.ingestState} / ${lifecycle.reviewState} / ${lifecycle.previewState} / ${lifecycle.publishState}.`),
    confidence: (inferredData?.dataConfidence ?? 'low') as 'low' | 'medium' | 'high',
    buyUrl: sourceData?.affiliateUrl ?? sourceData?.canonicalUrl ?? undefined,
    canonicalUrl: sourceData?.canonicalUrl ?? undefined,
    sourcePlatform: sourceData?.sourcePlatform ?? 'amazon',
    sourceIdentifier: sourceData?.sourceIdentifier ?? product.id,
    image,
    images,
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
  const runtimeEnvironment = getStorefrontRuntimeEnvironment();
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
    return TESTBED_EMPTY_DB_FALLBACK ? sampleProducts : [];
  }

  const visibleProducts = prioritizeStorefrontProducts(filterVisibleStorefrontProducts(products, runtimeEnvironment));
  const customerFacingProducts = runtimeEnvironment === 'production'
    ? visibleProducts.filter((product) => !isManualReviewPlaceholder(product))
    : visibleProducts;

  if (customerFacingProducts.length === 0) {
    if (runtimeEnvironment === 'development' && TESTBED_EMPTY_DB_FALLBACK) {
      return sampleProducts;
    }

    return [];
  }

  return customerFacingProducts.map(mapDbProductToStorefrontRecord);
}

export async function getStorefrontProductBySlug(slug: string): Promise<ProductRecord | null> {
  const runtimeEnvironment = getStorefrontRuntimeEnvironment();
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

  if (!getStorefrontVisibilityDecision(product, runtimeEnvironment).customerVisible) {
    return null;
  }

  if (runtimeEnvironment === 'production' && isManualReviewPlaceholder(product)) {
    return null;
  }

  return mapDbProductToStorefrontRecord(product);
}
