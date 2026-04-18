import type { EnsembleDefinition, ProductRecord } from '@atelier/domain';
import { sampleEnsembleDefinitions } from '@/lib/sample-ensemble-definitions';
import { sampleProducts } from '@/lib/sample-products';

export function listEnsembleDefinitions(): EnsembleDefinition[] {
  return sampleEnsembleDefinitions;
}

export function listEnsembleProducts(): ProductRecord[] {
  return sampleProducts;
}
