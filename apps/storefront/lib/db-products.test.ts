import { describe, expect, it } from 'vitest';
import { filterVisibleStorefrontProducts, getStorefrontVisibilityDecision, prioritizeStorefrontProducts } from './db-products';

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

  it('prioritizes Amazon-seeded products ahead of fixtures', () => {
    const ordered = prioritizeStorefrontProducts([
      buildProduct({
        id: 'fixture-1',
        slug: 'fixture-1',
        createdAt: new Date('2026-04-17T00:00:00.000Z'),
        sourceData: [{
          id: 'fixture-1-source',
          productId: 'fixture-1',
          sourcePlatform: 'fixture',
          sourceIdentifier: 'fixture-1',
          canonicalUrl: 'https://example.com/fixture',
          affiliateUrl: 'https://example.com/fixture?tag=test',
          title: 'Fixture product',
          brand: null,
          category: null,
          colorText: null,
          priceText: null,
          availabilityText: null,
          ingestMethod: 'fixture_seed',
          rawSnapshotJson: '{}',
          fieldMapJson: '{}',
          retrievedAt: new Date('2026-04-17T00:00:00.000Z'),
        }],
      }),
      buildProduct({
        id: 'amazon-1',
        slug: 'amazon-1',
        createdAt: new Date('2026-04-18T00:00:00.000Z'),
        sourceData: [{
          id: 'amazon-1-source',
          productId: 'amazon-1',
          sourcePlatform: 'amazon_manual',
          sourceIdentifier: 'B000000001',
          canonicalUrl: 'https://example.com/amazon',
          affiliateUrl: 'https://example.com/amazon?tag=test',
          title: 'Amazon product',
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
      }),
    ]);

    expect(ordered.map((product) => product.id)).toEqual(['amazon-1', 'fixture-1']);
  });
});
