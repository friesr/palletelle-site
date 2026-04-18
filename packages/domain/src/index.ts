export * from './sourcing';
export * from './customer';
export * from './ensembles';
export * from './admin-config';
export * from './visualizer';
export * from './product-db';
export * from './price-tracking';

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

export interface ProductImage {
  src: string;
  alt: string;
  caption?: string;
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
  buyUrl?: string;
  canonicalUrl?: string;
  sourcePlatform?: string;
  sourceIdentifier?: string;
  priceTracking?: import('./price-tracking').PriceTrackingSummary;
  provenance: ProductProvenance;
  recommendationRationale: RecommendationRationale;
  image?: ProductImage;
  facts: ProductFact[];
}
