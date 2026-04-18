import { BrowseResultsShell } from '@/components/browse-results-shell';
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

      <BrowseResultsShell products={products} />
    </div>
  );
}
