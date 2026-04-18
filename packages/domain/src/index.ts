export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type FactKind = 'fact' | 'inference' | 'opinion';

export interface ProductFact {
  label: string;
  value: string;
  kind: FactKind;
  source: string;
}

export interface ProductProvenance {
  dataSource: string;
  normalizationState: string;
  confidenceReason: string;
  confidenceImprovement: string;
  missingAttributes: string[];
  uncertainAttributes: string[];
}

export interface RecommendationRationale {
  objectiveMatch: string;
  inferredMatch: string;
  subjectiveSuggestion: string;
}

export interface ProductRecord {
  id: string;
  slug: string;
  name: string;
  brand: string;
  priceLabel: string;
  colorLabel: string;
  summary: string;
  confidence: ConfidenceLevel;
  provenance: ProductProvenance;
  recommendationRationale: RecommendationRationale;
  facts: ProductFact[];
}
