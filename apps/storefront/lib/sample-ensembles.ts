import type { EnsembleRecord } from '@/components/ensemble-card';

export const sampleEnsembles: EnsembleRecord[] = [
  {
    id: 'ensemble-001',
    name: 'Warm neutral base with muted accent',
    summary: 'A simple fixture-backed ensemble suggestion pairing a warm ivory shirt with soft olive trousers.',
    confidence: 'medium',
    itemSlugs: ['linen-shirt', 'tailored-trouser'],
    provenance: {
      dataSource: 'Fixture ensemble example',
      normalizationState: 'Derived from explicit product fixture fields and simple pairing notes',
      confidenceReason: 'The ensemble uses explicit fixture items with compatible source categories, but cross-item harmony remains heuristic.',
      confidenceImprovement: 'Confidence would improve with validated imagery, stronger product attribute support, and more real ensemble evidence.',
      missingAttributes: ['validated outfit imagery'],
      uncertainAttributes: ['strength of cross-item harmony']
    },
    recommendationRationale: {
      objectiveMatch: 'The shirt and trouser categories are compatible in a basic outfit structure.',
      inferredMatch: 'Warm ivory and soft olive are paired through simple fixture heuristics rather than measured color scoring.',
      subjectiveSuggestion: 'This combination may feel calm and polished if you want a muted, modern direction.'
    }
  },
  {
    id: 'ensemble-002',
    name: 'Muted warmth with caution',
    summary: 'A lower-confidence ensemble example combining the rosewood knit layer with softer neutrals.',
    confidence: 'low',
    itemSlugs: ['rosewood-knit', 'linen-shirt'],
    provenance: {
      dataSource: 'Fixture ensemble example',
      normalizationState: 'Derived from explicit product fixture fields with limited support for cross-item confidence',
      confidenceReason: 'One included item is already low confidence, so the ensemble inherits a more cautious explanation boundary.',
      confidenceImprovement: 'Confidence would improve with better color reference support and validated examples of the combination.',
      missingAttributes: ['validated pairing examples', 'stronger color evidence'],
      uncertainAttributes: ['cross-garment color mapping', 'strength of recommendation']
    },
    recommendationRationale: {
      objectiveMatch: 'The ensemble uses explicit fixture items with complementary layering roles.',
      inferredMatch: 'The muted rosewood and warm ivory relationship is only lightly supported by fixture heuristics.',
      subjectiveSuggestion: 'This may suit a softer, warmer outfit direction, but the shell treats it as tentative rather than strong guidance.'
    },
    lowConfidenceReason: 'This ensemble is low confidence because one item already has limited evidence and the cross-item color relationship is not strongly supported.'
  }
];
