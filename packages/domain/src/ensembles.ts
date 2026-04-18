import type { ConfidenceLevel, RecommendationRationale } from './index';

export interface EnsembleProductSelection {
  productId: string;
  role: 'base' | 'layer' | 'accent' | 'accessory';
}

export interface EnsembleProfileRelevance {
  paletteFamilies: string[];
  colorProfileTags: string[];
  preferenceTags: string[];
}

export interface EnsembleDefinition {
  id: string;
  slug: string;
  name: string;
  summary: string;
  confidence: ConfidenceLevel;
  productSelections: EnsembleProductSelection[];
  rationale: RecommendationRationale;
  profileRelevance: EnsembleProfileRelevance;
  source: 'fixture' | 'admin-scaffold';
  createdAt: string;
  updatedAt: string;
}
