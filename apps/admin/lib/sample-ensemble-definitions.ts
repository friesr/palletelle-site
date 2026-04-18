import type { EnsembleDefinition } from '@atelier/domain';

export const sampleEnsembleDefinitions: EnsembleDefinition[] = [
  {
    id: 'ens-001',
    slug: 'warm-neutral-base',
    name: 'Warm neutral base with muted accent',
    summary: 'Fixture-backed ensemble scaffold using a shirt and trouser pairing.',
    confidence: 'medium',
    productSelections: [
      { productId: 'linen-shirt-001', role: 'base' },
      { productId: 'trouser-001', role: 'layer' },
    ],
    rationale: {
      objectiveMatch: 'The selected shirt and trouser create a basic outfit structure.',
      inferredMatch: 'Warm ivory and soft olive remain a heuristic pairing rather than validated color scoring.',
      subjectiveSuggestion: 'This points toward a calm, polished outfit direction.',
    },
    profileRelevance: {
      paletteFamilies: ['warm-neutral'],
      colorProfileTags: ['soft-contrast'],
      preferenceTags: ['tailored-casual'],
    },
    source: 'fixture',
    createdAt: '2026-04-18T00:00:00Z',
    updatedAt: '2026-04-18T00:00:00Z',
  },
  {
    id: 'ens-002',
    slug: 'muted-warm-layer',
    name: 'Muted warm layer with caution',
    summary: 'Fixture-backed ensemble scaffold using a low-confidence knit layer.',
    confidence: 'low',
    productSelections: [
      { productId: 'knit-001', role: 'layer' },
      { productId: 'linen-shirt-001', role: 'base' },
    ],
    rationale: {
      objectiveMatch: 'The knit layer and shirt have complementary layering roles.',
      inferredMatch: 'Color compatibility remains tentative and should not be treated as validated.',
      subjectiveSuggestion: 'This suggests a softer, warmer outfit direction with caution.',
    },
    profileRelevance: {
      paletteFamilies: ['muted-warm'],
      colorProfileTags: ['warm-undertone'],
      preferenceTags: ['soft-layering'],
    },
    source: 'fixture',
    createdAt: '2026-04-18T00:00:00Z',
    updatedAt: '2026-04-18T00:00:00Z',
  },
];
