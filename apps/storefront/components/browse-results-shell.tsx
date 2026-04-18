'use client';

import { useMemo, useState } from 'react';
import type { ProductRecord } from '@atelier/domain';
import { ProductCard } from '@/components/product-card';
import { EmptyState } from '@/components/empty-state';

const ALL = 'all';

export function BrowseResultsShell({ products }: { products: ProductRecord[] }) {
  const categories = Array.from(new Set(products.map((product) => {
    const categoryFact = product.facts.find((fact) => fact.label === 'Category' && fact.kind === 'fact');
    return categoryFact?.value ?? 'Unspecified';
  })));

  const colors = Array.from(new Set(products.map((product) => product.colorLabel)));

  const [category, setCategory] = useState<string>(ALL);
  const [confidence, setConfidence] = useState<string>(ALL);
  const [color, setColor] = useState<string>(ALL);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const categoryFact = product.facts.find((fact) => fact.label === 'Category' && fact.kind === 'fact');
      const productCategory = categoryFact?.value ?? 'Unspecified';

      if (category !== ALL && productCategory !== category) return false;
      if (confidence !== ALL && product.confidence !== confidence) return false;
      if (color !== ALL && product.colorLabel !== color) return false;

      return true;
    });
  }, [products, category, confidence, color]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:grid-cols-3">
        <label className="space-y-2 text-sm text-black/70">
          <span className="block text-xs uppercase tracking-[0.2em] text-black/45">Category filter</span>
          <select className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value={ALL}>All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-black/70">
          <span className="block text-xs uppercase tracking-[0.2em] text-black/45">Confidence filter</span>
          <select className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3" value={confidence} onChange={(e) => setConfidence(e.target.value)}>
            <option value={ALL}>All confidence levels</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-black/70">
          <span className="block text-xs uppercase tracking-[0.2em] text-black/45">Source color filter</span>
          <select className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3" value={color} onChange={(e) => setColor(e.target.value)}>
            <option value={ALL}>All source colors</option>
            {colors.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
      </section>

      <div className="rounded-2xl bg-mist px-4 py-3 text-sm leading-6 text-black/70">
        These are simple fixture-based filters. They are deterministic UI controls using explicit product fields, not intelligent ranking or personalization.
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
