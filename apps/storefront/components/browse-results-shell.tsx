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
    <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)] 2xl:grid-cols-[20rem_minmax(0,1fr)] 2xl:gap-8">
      <aside className="space-y-4 xl:sticky xl:top-8 xl:self-start">
        <section className="grid gap-4 rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/45">Browse controls</p>
            <h3 className="mt-2 text-2xl font-semibold text-ink">Filter the catalog with clear rules</h3>
            <p className="mt-3 text-sm leading-6 text-black/70">These controls are deterministic. They use explicit product fields, not hidden ranking or personalization.</p>
          </div>
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

        <div className="rounded-[1.75rem] bg-mist px-5 py-4 text-sm leading-6 text-black/70">
          Desktop now uses a dedicated filter rail instead of compressing everything into a shallow top row, while mobile still collapses back to stacked controls.
        </div>
      </aside>

      <div className="space-y-6">
        <section className="grid gap-4 rounded-[2rem] bg-white p-6 shadow-sm sm:grid-cols-2 2xl:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/45">Showing</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{filtered.length}</p>
            <p className="mt-2 text-sm leading-6 text-black/65">Products matching the current filters.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/45">Category scope</p>
            <p className="mt-2 text-base font-medium text-ink">{category === ALL ? 'All categories' : category}</p>
            <p className="mt-2 text-sm leading-6 text-black/65">A direct match against the recorded category fact.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/45">Confidence scope</p>
            <p className="mt-2 text-base font-medium text-ink">{confidence === ALL ? 'All confidence levels' : confidence}</p>
            <p className="mt-2 text-sm leading-6 text-black/65">Useful when the customer wants only stronger sourcing confidence.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/45">Color scope</p>
            <p className="mt-2 text-base font-medium text-ink">{color === ALL ? 'All source colors' : color}</p>
            <p className="mt-2 text-sm leading-6 text-black/65">Another explicit filter, not inferred taste matching.</p>
          </div>
        </section>

        {filtered.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
