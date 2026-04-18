import { describe, expect, it } from 'vitest';
import type { ProductRecord } from './index';

describe('domain types', () => {
  it('supports product records with explicit fact kinds', () => {
    const product: ProductRecord = {
      id: 'p1',
      slug: 'linen-shirt',
      name: 'Soft Linen Shirt',
      brand: 'Atelier Sample',
      priceLabel: '$148 fixture',
      colorLabel: 'Warm ivory',
      summary: 'Fixture-backed product summary.',
      confidence: 'medium',
      provenance: {
        dataSource: 'fixture',
        normalizationState: 'normalized',
        confidenceReason: 'core fields are present',
        confidenceImprovement: 'more real evidence',
        missingAttributes: ['inventory'],
        uncertainAttributes: ['pairing strength'],
      },
      recommendationRationale: {
        objectiveMatch: 'neutral shirt category and source color',
        inferredMatch: 'soft olive pairing from fixture heuristic',
        subjectiveSuggestion: 'polished relaxed direction',
      },
      facts: [
        { label: 'Material', value: '100% linen', kind: 'fact', source: 'fixture' },
        { label: 'Pairing note', value: 'Works with soft olive tones', kind: 'inference', source: 'fixture heuristic' },
      ],
    };

    expect(product.facts[0].kind).toBe('fact');
    expect(product.facts[1].kind).toBe('inference');
  });
});
