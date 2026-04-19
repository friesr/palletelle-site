import { describe, expect, it } from 'vitest';
import { filterVisibleStorefrontProducts, getStorefrontVisibilityDecision, isManualReviewPlaceholder, resolveStorefrontRuntimeEnvironment } from './db-products';

function buildProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'p1',
    slug: 'p1',
    createdAt: new Date('2026-04-18T00:00:00.000Z'),
    updatedAt: new Date('2026-04-18T00:00:00.000Z'),
    sourceData: [{
      id: 'p1-source',
      productId: 'p1',
      sourcePlatform: 'amazon_manual',
      sourceIdentifier: 'ASIN123',
      canonicalUrl: 'https://example.com',
      affiliateUrl: 'https://example.com?tag=test',
      title: 'Test product',
      brand: null,
      category: null,
      colorText: null,
      priceText: null,
      availabilityText: null,
      ingestMethod: 'manual_seed',
      rawSnapshotJson: '{}',
      fieldMapJson: '{}',
      retrievedAt: new Date('2026-04-18T00:00:00.000Z'),
    }],
    priceSnapshots: [],
    normalizedData: {
      id: 'p1-normalized',
      productId: 'p1',
      title: 'Test product',
      brand: null,
      category: 'Top',
      sourceColor: 'Blue',
      material: null,
      priceText: null,
      availabilityText: null,
      summary: null,
    },
    inferredData: {
      id: 'p1-inferred',
      productId: 'p1',
      paletteFamily: null,
      colorHarmony: null,
      styleDirection: null,
      styleOpinion: null,
      dataConfidence: 'medium',
      confidenceReason: 'seeded',
      confidenceImprovement: 'more data',
      missingAttributesJson: '[]',
      uncertainAttributesJson: '[]',
    },
    lifecycleState: {
      id: 'p1-lifecycle',
      productId: 'p1',
      ingestState: 'normalized',
      reviewState: 'approved',
      previewState: 'dev_customer',
      publishState: 'unpublished',
      stateNotes: null,
      lastChangedAt: new Date('2026-04-18T00:00:00.000Z'),
      lastChangedBy: 'tester',
    },
    sourceHealth: {
      id: 'p1-health',
      productId: 'p1',
      sourceStatus: 'active',
      lastSourceCheckAt: new Date('2026-04-18T00:00:00.000Z'),
      sourceCheckResult: null,
      needsRevalidation: false,
      revalidationReason: null,
    },
    externalSignals: {
      id: 'p1-signals',
      productId: 'p1',
      reputationState: 'healthy',
      lastExternalCheckAt: new Date('2026-04-18T00:00:00.000Z'),
      repeatedComplaintPattern: false,
      lowRatingRisk: false,
      recommendation: 'none',
      notes: null,
    },
    ...overrides,
  } as any;
}

describe('storefront lifecycle visibility', () => {
  it('excludes products that are not customer-visible', () => {
    const visible = buildProduct();
    const hidden = buildProduct({
      id: 'p2',
      slug: 'p2',
      lifecycleState: {
        id: 'p2-lifecycle',
        productId: 'p2',
        ingestState: 'normalized',
        reviewState: 'pending',
        previewState: 'none',
        publishState: 'unpublished',
        stateNotes: null,
        lastChangedAt: new Date('2026-04-18T00:00:00.000Z'),
        lastChangedBy: 'tester',
      },
      sourceHealth: {
        id: 'p2-health',
        productId: 'p2',
        sourceStatus: 'unknown',
        lastSourceCheckAt: null,
        sourceCheckResult: null,
        needsRevalidation: false,
        revalidationReason: null,
      },
    });

    const filtered = filterVisibleStorefrontProducts([visible, hidden], 'development');

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('p1');
  });

  it('keeps dev preview visible in development', () => {
    const decision = getStorefrontVisibilityDecision(buildProduct(), 'development');

    expect(decision.customerVisible).toBe(true);
    expect(decision.mode).toBe('dev_preview');
  });

  it('keeps dev preview out of production visibility', () => {
    const decision = getStorefrontVisibilityDecision(buildProduct(), 'production');

    expect(decision.customerVisible).toBe(false);
    expect(decision.mode).toBe('dev_preview');
  });

  it('treats manual-review placeholder titles as non-customer-facing', () => {
    expect(
      isManualReviewPlaceholder(
        buildProduct({
          normalizedData: {
            id: 'p1-normalized',
            productId: 'p1',
            title: 'Manual review required (B0FC6F6DDW)',
            brand: null,
            category: 'Top',
            sourceColor: 'Blue',
            material: null,
            priceText: null,
            availabilityText: null,
            summary: null,
          },
        }),
      ),
    ).toBe(true);
  });

  it('forces private LAN hosts into development mode', () => {
    expect(resolveStorefrontRuntimeEnvironment({ host: '192.168.1.115:3000', publicStoreFlag: 'true', nodeEnv: 'production' })).toBe('development');
    expect(resolveStorefrontRuntimeEnvironment({ host: 'atelier.local', publicStoreFlag: 'true', nodeEnv: 'production' })).toBe('development');
  });

  it('still honors an explicit production config on public hosts', () => {
    expect(resolveStorefrontRuntimeEnvironment({ host: 'store.atelier.com', configured: 'production', nodeEnv: 'production' })).toBe('production');
  });

  it('extracts source gallery images from raw snapshot json for storefront use', async () => {
    const { getStorefrontProductBySlug } = await import('./db-products');
    const { prisma } = await import('@/lib/db');

    const originalFindUnique = prisma.product.findUnique;
    prisma.product.findUnique = (async () => buildProduct({
      slug: 'gallery-product',
      sourceData: [{
        id: 'gallery-source',
        productId: 'p1',
        sourcePlatform: 'amazon_manual',
        sourceIdentifier: 'ASIN123',
        canonicalUrl: 'https://example.com',
        affiliateUrl: 'https://example.com?tag=test',
        title: 'Gallery product',
        categoryText: null,
        colorText: null,
        priceText: null,
        availabilityText: null,
        ingestMethod: 'manual_capture',
        rawSnapshotJson: JSON.stringify({
          image: 'https://images.example.com/main.jpg',
          images: [
            'https://images.example.com/main.jpg',
            'https://images.example.com/detail-2.jpg',
          ],
        }),
        sourceFieldMapJson: '{}',
        retrievedAt: new Date('2026-04-18T00:00:00.000Z'),
      }],
    })) as any;

    try {
      const product = await getStorefrontProductBySlug('gallery-product');
      expect(product?.image?.src).toBe('https://images.example.com/main.jpg');
      expect(product?.images?.map((image) => image.src)).toEqual([
        'https://images.example.com/main.jpg',
        'https://images.example.com/detail-2.jpg',
      ]);
    } finally {
      prisma.product.findUnique = originalFindUnique;
    }
  });
});
