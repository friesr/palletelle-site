import type { SourcedProductRecord } from '@atelier/domain';
import { sampleStagedProducts } from '@/lib/sample-staged-products';

export function listReviewRecords(): SourcedProductRecord[] {
  return sampleStagedProducts;
}

export function getReviewRecordById(id: string): SourcedProductRecord | null {
  return sampleStagedProducts.find((entry) => entry.id === id) ?? null;
}
