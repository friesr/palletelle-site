import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { listStorefrontProducts } from '@/lib/db-products';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await listStorefrontProducts();
  const featured = products[0];
  const secondary = products[1] ?? featured;

  if (!featured) {
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

  return (
    <div className="space-y-12">
      <section className="grid gap-6 rounded-3xl bg-white p-8 shadow-sm md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-black/45">Palletelle</p>
          <h2 className="text-4xl font-semibold leading-tight">Thoughtful product picks, with clear pricing and a calm buying experience.</h2>
          <p className="max-w-2xl text-base leading-7 text-black/70">
            Browse approved products, see straightforward details, and jump to the source when you’re ready.
          </p>
          <div className="flex gap-3">
            <Link className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white" href="/browse">
              Browse catalog
            </Link>
          </div>
        </div>
        <ProductCard product={featured} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-black/45">Featured</p>
            <h3 className="text-2xl font-semibold">Products on the shelf</h3>
          </div>
          <ProductCard product={secondary} />
        </div>
      </section>
    </div>
  );
}
