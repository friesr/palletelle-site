'use client';

import Link from 'next/link';
import type { ProductRecord } from '@atelier/domain';
import { useMemo, useState } from 'react';
import { ProductCard } from '@/components/product-card';

const ALL = 'all';

export function StorefrontHomeShell({ products }: { products: ProductRecord[] }) {
  const [category, setCategory] = useState<string>(ALL);

  const categories = useMemo(() => Array.from(new Set(products.map((product) => {
    const categoryFact = product.facts.find((fact) => fact.label === 'Category' && fact.kind === 'fact');
    return categoryFact?.value ?? 'Unspecified';
  }))), [products]);

  const filtered = useMemo(() => products.filter((product) => {
    const categoryFact = product.facts.find((fact) => fact.label === 'Category' && fact.kind === 'fact');
    const productCategory = categoryFact?.value ?? 'Unspecified';
    if (category !== ALL && productCategory !== category) return false;
    return true;
  }), [products, category]);

  const featured = filtered[0] ?? products[0];
  const supporting = filtered.slice(1, 5);

  return (
    <div className="space-y-12">
      <section className="grid gap-6 rounded-[2rem] bg-white p-8 shadow-sm lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <p className="text-sm uppercase tracking-[0.28em] text-black/45">Palletelle</p>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Find a polished outfit faster, with calm guidance and honest product details.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-black/70">
              Browse vetted pieces, narrow by category, and explore wardrobe-ready combinations built from products that have already passed review.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white" href="/browse">
              Shop the catalog
            </Link>
            <a className="rounded-full border border-black/15 px-5 py-3 text-sm font-medium" href="#how-it-works">
              How it works
            </a>
          </div>
          <dl className="grid gap-4 rounded-3xl bg-mist p-5 text-sm text-black/75 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-[0.22em] text-black/45">Visible products</dt>
              <dd className="mt-2 text-2xl font-semibold text-ink">{products.length}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.22em] text-black/45">Reviewed flow</dt>
              <dd className="mt-2 text-base font-medium text-ink">Ada → Ruth → Ezra</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.22em] text-black/45">Styling layer</dt>
              <dd className="mt-2 text-base font-medium text-ink">Color-season grouping</dd>
            </div>
          </dl>
        </div>
        <div className="space-y-4 rounded-[1.75rem] border border-black/10 bg-mist/70 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-black/45">Quick start</p>
              <h2 className="mt-2 text-2xl font-semibold">Start with the right section</h2>
            </div>
          </div>
          <label className="space-y-2 text-sm text-black/70">
            <span className="block text-xs uppercase tracking-[0.2em] text-black/45">Filter by category</span>
            <select className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value={ALL}>All categories</option>
              {categories.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <div className="rounded-2xl bg-white p-4 text-sm leading-6 text-black/70">
            Browse intentionally. Each product card shows clear price, source color, and a direct path to details before you leave for the source listing.
          </div>
        </div>
      </section>

      {featured ? (
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-black/45">Featured pick</p>
              <h2 className="text-3xl font-semibold">Start with a strong anchor piece</h2>
            </div>
            <ProductCard product={featured} />
          </div>
          <div id="how-it-works" className="space-y-4 rounded-[2rem] bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-black/45">How shopping works</p>
              <h3 className="mt-2 text-2xl font-semibold">A clearer path to the right outfit</h3>
            </div>
            <ol className="space-y-4 text-sm leading-6 text-black/70">
              <li><span className="font-medium text-ink">1.</span> Products are sourced and normalized before they appear.</li>
              <li><span className="font-medium text-ink">2.</span> Trust and quality checks remove weak or disqualifying items.</li>
              <li><span className="font-medium text-ink">3.</span> Enrichment improves the details you use to compare options.</li>
              <li><span className="font-medium text-ink">4.</span> Grouping logic helps connect pieces into wardrobe-ready combinations.</li>
            </ol>
            <Link className="inline-flex rounded-full border border-black/15 px-4 py-2 text-sm font-medium" href="/browse">
              See all available pieces
            </Link>
          </div>
        </section>
      ) : null}

      {supporting.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-black/45">Shop by piece</p>
              <h2 className="text-3xl font-semibold">More options to build around</h2>
            </div>
            <Link className="text-sm font-medium text-black/70" href="/browse">
              View full catalog
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {supporting.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
