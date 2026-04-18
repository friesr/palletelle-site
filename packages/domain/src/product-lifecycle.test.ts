import { describe, expect, it } from 'vitest';
import {
  applyLifecycleActionBatch,
  applyLifecycleAction,
  createInitialLifecycleState,
  deriveProductVisibilityDecision,
} from './product-lifecycle';

describe('product lifecycle', () => {
  it('allows dev preview after approval without making a product published', () => {
    const base = createInitialLifecycleState({
      productId: 'p1',
      ingestState: 'normalized',
      reviewState: 'approved',
    });

    const result = applyLifecycleAction({
      current: base,
      action: 'enable_dev_preview',
      changedAt: '2026-04-18T00:00:00.000Z',
      changedBy: 'tester',
    });

    expect(result.valid).toBe(true);
    expect(result.nextState?.previewState).toBe('dev_customer');
    expect(result.nextState?.publishState).toBe('unpublished');
  });

  it('blocks publish before normalized approved state', () => {
    const result = applyLifecycleAction({
      current: createInitialLifecycleState({ productId: 'p1' }),
      action: 'publish',
      changedAt: '2026-04-18T00:00:00.000Z',
      changedBy: 'tester',
    });

    expect(result.valid).toBe(false);
  });

  it('distinguishes dev preview from prod customer visibility', () => {
    const lifecycle = createInitialLifecycleState({
      productId: 'p1',
      ingestState: 'normalized',
      reviewState: 'approved',
      previewState: 'dev_customer',
      publishState: 'unpublished',
    });

    const development = deriveProductVisibilityDecision({
      lifecycle,
      sourceHealth: {
        productId: 'p1',
        sourceStatus: 'unknown',
        needsRevalidation: false,
      },
      externalSignals: {
        productId: 'p1',
        reputationState: 'unknown',
        repeatedComplaintPattern: false,
        lowRatingRisk: false,
        recommendation: 'none',
      },
      environment: 'development',
    });

    const production = deriveProductVisibilityDecision({
      lifecycle,
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
      environment: 'production',
    });

    expect(development.customerVisible).toBe(true);
    expect(development.mode).toBe('dev_preview');
    expect(production.customerVisible).toBe(false);
  });

  it('returns per-row bulk results for mixed valid and invalid transitions', () => {
    const results = applyLifecycleActionBatch({
      items: [
        createInitialLifecycleState({
          productId: 'valid',
          ingestState: 'normalized',
          reviewState: 'approved',
        }),
        createInitialLifecycleState({
          productId: 'invalid',
          ingestState: 'manual_seeded',
          reviewState: 'pending',
        }),
      ],
      action: 'enable_dev_preview',
      changedAt: '2026-04-18T00:00:00.000Z',
      changedBy: 'tester',
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ productId: 'valid', ok: true });
    expect(results[1]).toMatchObject({ productId: 'invalid', ok: false });
  });
});
