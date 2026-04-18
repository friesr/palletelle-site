import { describe, expect, it } from 'vitest';
import type { EnsembleDefinition } from './ensembles';

describe('ensemble definition scaffolding', () => {
  it('supports admin-defined ensemble records', () => {
    const ensemble: EnsembleDefinition = {
      id: 'ens-1',
      slug: 'warm-neutral-base',
      name: 'Warm neutral base',
      summary: 'Fixture-backed admin scaffold.',
      confidence: 'medium',
      productSelections: [
        { productId: 'linen-shirt-001', role: 'base' },
        { productId: 'trouser-001', role: 'layer' },
      ],
      rationale: {
        objectiveMatch: 'basic outfit compatibility',
        inferredMatch: 'warm and olive relationship',
        subjectiveSuggestion: 'calm polished direction',
      },
      profileRelevance: {
        paletteFamilies: ['warm-neutral'],
        colorProfileTags: ['soft-contrast'],
        preferenceTags: ['tailored-casual'],
      },
      source: 'admin-scaffold',
      createdAt: '2026-04-18T00:00:00Z',
      updatedAt: '2026-04-18T00:00:00Z',
    };

    expect(ensemble.productSelections).toHaveLength(2);
    expect(ensemble.profileRelevance.paletteFamilies).toContain('warm-neutral');
  });
});
