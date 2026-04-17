import Link from 'next/link';
import { sampleProducts } from '@/lib/sample-products';
import { ProductCard } from '@/components/product-card';
import { RecommendationExplanation } from '@/components/recommendation-explanation';

export default function HomePage() {
  const featured = sampleProducts[0];

  return (
    <div className="space-y-12">
      <section className="grid gap-6 rounded-3xl bg-white p-8 shadow-sm md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-black/45">Elegant, modern, clear</p>
          <h2 className="text-4xl font-semibold leading-tight">A refined storefront that separates facts from style judgment.</h2>
          <p className="max-w-2xl text-base leading-7 text-black/70">
            Atelier is being built to help customers evaluate garments and outfit ideas without hype, fake certainty, or manipulative pressure.
          </p>
          <div className="flex gap-3">
            <Link className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white" href="/browse">
              Browse the shell
            </Link>
            <Link className="rounded-full border border-black/15 px-5 py-3 text-sm font-medium" href="/products/linen-shirt">
              Inspect a product view
            </Link>
          </div>
        </div>
        <RecommendationExplanation productName={featured.name} />
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-black/45">Fixture-backed sample</p>
            <h3 className="text-2xl font-semibold">Featured product card</h3>
          </div>
        </div>
        <ProductCard product={featured} />
      </section>
    </div>
  );
}
