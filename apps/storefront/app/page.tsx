import { StorefrontHomeShell } from '@/components/storefront-home-shell';

const storefrontBuildMarker = '3579c25-2026-04-24T22:52Z';
import { listStorefrontProducts } from '@/lib/db-products';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await listStorefrontProducts();
  if (products.length === 0) {
    return (
      <div className="space-y-8 rounded-3xl bg-white p-8 shadow-sm">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-black/45">Palletelle</p>
          <h2 className="mt-2 text-3xl font-semibold">No storefront products are visible yet</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-black/70">
            The catalog is currently empty for this runtime. This usually means the current database has no visible records yet, or the lifecycle state does not allow customer preview.
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-mist p-5 text-sm leading-6 text-black/70">
          For the LAN testbed, approved products should normally appear here. If they do not, check the storefront database path and product lifecycle preview state.
        </div>
      </div>
    );
  }

  return <><div data-build-marker={storefrontBuildMarker} style={{ display: 'none' }}>{storefrontBuildMarker}</div><StorefrontHomeShell products={products} /></>;
}
