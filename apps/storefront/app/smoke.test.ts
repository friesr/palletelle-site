import { describe, expect, it } from 'vitest';
import { sampleProducts } from '@/lib/sample-products';

describe('storefront shell fixtures', () => {
  it('loads fixture products for the shell', () => {
    expect(sampleProducts.length).toBeGreaterThan(0);
    expect(sampleProducts[0]?.facts.length).toBeGreaterThan(0);
  });
});
