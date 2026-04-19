import { BrowseResultsShell } from '@/components/browse-results-shell';
import { EmptyState } from '@/components/empty-state';
import { listStorefrontProducts } from '@/lib/db-products';

export const dynamic = 'force-dynamic';

export default async function BrowsePage() {
  const products = await listStorefrontProducts();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-black/45">Browse</p>
        <h2 className="text-3xl font-semibold">Catalog</h2>
        <p className="mt-2 max-w-2xl text-black/70">Browse the current approved product set.</p>
      </div>

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
