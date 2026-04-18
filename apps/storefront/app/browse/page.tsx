import { BrowseFilterShell } from '@/components/browse-filter-shell';
import { EmptyState } from '@/components/empty-state';
import { ProductCard } from '@/components/product-card';
import { sampleProducts } from '@/lib/sample-products';

export default function BrowsePage() {
  const lowConfidenceProducts = sampleProducts.filter((product) => product.confidence === 'low');

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-black/45">Browse</p>
        <h2 className="text-3xl font-semibold">Catalog preview</h2>
        <p className="mt-2 max-w-2xl text-black/70">
          This is a development shell using fixture data. Product facts are shown as fixture-backed examples, not live catalog truth.
        </p>
      </div>

      <BrowseFilterShell />

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-black/45">All preview items</p>
            <h3 className="text-2xl font-semibold">Browse the current shell</h3>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sampleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-black/45">Low-confidence examples</p>
          <h3 className="text-2xl font-semibold">Items that need extra caution</h3>
          <p className="mt-2 max-w-2xl text-black/70">
            The shell should make lower-confidence guidance visibly distinct rather than hiding uncertainty behind polished copy.
          </p>
        </div>
        {lowConfidenceProducts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {lowConfidenceProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
    </div>
  );
}
