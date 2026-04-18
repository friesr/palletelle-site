import type { SourcedProductRecord } from '@atelier/domain';
import { sampleEditableProducts } from '@/lib/sample-editable-products';

export function listEditableProducts(): SourcedProductRecord[] {
  return sampleEditableProducts;
}

export function getEditableProductById(id: string): SourcedProductRecord | null {
  return sampleEditableProducts.find((entry) => entry.id === id) ?? null;
}
