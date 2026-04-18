import { describe, expect, it } from 'vitest';
import { assessProductDisplayability } from './product-db';

describe('product db displayability rules', () => {
  it('keeps public visibility as a derived decision, not a single flag', () => {
    const result = assessProductDisplayability({
      visibility: {
        productId: 'p1',
        isPublic: true,
        intendedActive: true,
      },
      reviewState: {
        productId: 'p1',
        workflowState: 'approved',
      },
      sourceHealth: {
        productId: 'p1',
        sourceStatus: 'active',
        needsRevalidation: false,
      },
      externalSignals: {
        productId: 'p1',
        reputationState: 'healthy',
        repeatedComplaintPattern: false,
        lowRatingRisk: false,
        recommendation: 'none',
      },
    });

    expect(result.isDisplayable).toBe(true);
  });

  it('blocks displayability when revalidation or external deactivation risk exists', () => {
    const result = assessProductDisplayability({
      visibility: {
        productId: 'p1',
        isPublic: true,
        intendedActive: true,
      },
      reviewState: {
        productId: 'p1',
        workflowState: 'approved',
      },
      sourceHealth: {
        productId: 'p1',
        sourceStatus: 'changed',
        needsRevalidation: true,
      },
      externalSignals: {
        productId: 'p1',
        reputationState: 'at_risk',
        repeatedComplaintPattern: true,
        lowRatingRisk: true,
        recommendation: 'deactivate',
      },
    });

    expect(result.isDisplayable).toBe(false);
    expect(result.reasons).toContain('needsRevalidation');
    expect(result.reasons).toContain('externalDeactivateRecommendation');
  });
});
