export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type FactKind = 'fact' | 'inference' | 'opinion';

export interface ProductFact {
  label: string;
  value: string;
  kind: FactKind;
  source: string;
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
  facts: ProductFact[];
}
