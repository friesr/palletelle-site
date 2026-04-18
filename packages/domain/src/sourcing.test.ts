import { describe, expect, it } from 'vitest';
import {
  canDisplayAvailability,
  canDisplayPrice,
  isPublishable,
  requiresReview,
  type SourcedProductRecord,
  validateForReview,
} from './sourcing';

const baseProduct: SourcedProductRecord = {
  id: 'sp-1',
  source: {
    sourcePlatform: 'amazon',
    sourceIdentifier: 'ASIN123',
    retrievedAt: '2026-04-18T00:00:00Z',
    sourceFieldMap: {
      title: 'raw.title',
      priceText: 'raw.price',
    },
    rawSnapshot: {
      title: 'Soft Linen Shirt on Amazon',
      price: '$148',
      availability: 'In stock',
    },
  },
  normalized: {
    title: 'Soft Linen Shirt',
    brand: 'Amazon Example',
    category: 'Shirt',
    sourceColor: 'Warm ivory',
    priceText: '$148',
    availabilityText: 'In stock',
  },
  inferred: {
    paletteFamily: 'warm-neutral',
    colorHarmony: 'olive-compatible',
  },
  provenance: {
    normalizedAt: '2026-04-18T00:05:00Z',
    reviewedAt: '2026-04-18T00:10:00Z',
    reviewedBy: 'tester',
    dataConfidence: 'medium',
    confidenceReason: 'explicit source fields are present',
    confidenceImprovement: 'refresh source and enrich attributes',
    missingAttributes: [],
    uncertainAttributes: [],
  },
  freshness: {
    priceFreshness: {
      status: 'fresh',
      checkedAt: '2026-04-18T00:10:00Z',
      thresholdHours: 24,
      reason: 'recent source retrieval',
    },
    availabilityFreshness: {
      status: 'fresh',
      checkedAt: '2026-04-18T00:10:00Z',
      thresholdHours: 12,
      reason: 'recent source retrieval',
    },
    lastCheckedAt: '2026-04-18T00:10:00Z',
  },
  visibility: {
    isPublic: true,
    intendedActive: true,
    visibilityNotes: 'Approved for storefront preview.',
  },
  stagingStatus: 'approved',
};

describe('sourcing guards', () => {
  it('allows display of fresh price and availability', () => {
    expect(canDisplayPrice(baseProduct)).toBe(true);
    expect(canDisplayAvailability(baseProduct)).toBe(true);
  });

  it('requires review for non-fresh or low-confidence records', () => {
    const staleProduct: SourcedProductRecord = {
      ...baseProduct,
      freshness: {
        ...baseProduct.freshness,
        priceFreshness: {
          ...baseProduct.freshness.priceFreshness,
          status: 'stale',
        },
      },
    };

    expect(requiresReview(staleProduct)).toBe(true);
  });

  it('only marks approved records as publishable', () => {
    expect(isPublishable(baseProduct)).toBe(true);
    expect(isPublishable({ ...baseProduct, stagingStatus: 'needs_review' })).toBe(false);
  });

  it('fails validation when critical uncertainty exists', () => {
    const invalid = validateForReview({
      ...baseProduct,
      provenance: {
        ...baseProduct.provenance,
        uncertainAttributes: ['critical'],
      },
    });

    expect(invalid.valid).toBe(false);
    expect(invalid.reasons).toContain('hasCriticalUncertainty');
  });
});
