import { BrowseResultsShell } from '@/components/browse-results-shell';
import { EmptyState } from '@/components/empty-state';
import { listStorefrontProducts } from '@/lib/db-products';

export const dynamic = 'force-dynamic';

export default async function BrowsePage() {
  const products = await listStorefrontProducts();

  return (
    <div className="space-y-8 xl:space-y-10">
      <section className="grid gap-5 rounded-[2rem] bg-white p-6 shadow-sm xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] xl:items-end xl:p-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.25em] text-black/45">Browse</p>
          <h2 className="text-3xl font-semibold xl:text-4xl">Catalog</h2>
          <p className="max-w-3xl text-base leading-7 text-black/70 xl:text-lg">
            Browse the current approved product set and narrow quickly by clear, deterministic filters. Desktop now gives the catalog room to breathe instead of reading like a stretched mobile stack.
          </p>
        </div>
        <div className="grid gap-4 rounded-[1.75rem] border border-black/10 bg-mist/80 p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/45">Approved products</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{products.length}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/45">Filter model</p>
            <p className="mt-2 text-base font-medium text-ink">Explicit product fields only</p>
          </div>
        </div>
      </section>

      {products.length > 0 ? (
        <BrowseResultsShell products={products} />
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm leading-6 text-black/70">
            No products are customer-visible in the current storefront runtime yet. Check the DB path, lifecycle preview state, and source visibility gates.
          </div>
          <EmptyState />
        </div>
      )}
    </div>
  );
}
