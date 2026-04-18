import Link from 'next/link';
import { EnsembleCard } from '@/components/ensemble-card';
import { ProductCard } from '@/components/product-card';
import { RecommendationExplanation } from '@/components/recommendation-explanation';
import { TrustSummary } from '@/components/trust-summary';
import { sampleEnsembles } from '@/lib/sample-ensembles';
import { sampleProducts } from '@/lib/sample-products';

export default function HomePage() {
  const featured = sampleProducts[0];
  const lowConfidenceExample = sampleProducts.find((product) => product.confidence === 'low') ?? featured;
  const featuredEnsemble = sampleEnsembles[0];
  const lowConfidenceEnsemble = sampleEnsembles.find((ensemble) => ensemble.confidence === 'low') ?? featuredEnsemble;

  return (
    <div className="space-y-12">
      <section className="grid gap-6 rounded-3xl bg-white p-8 shadow-sm md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-black/45">Elegant, modern, clear</p>
          <h2 className="text-4xl font-semibold leading-tight">Palletelle separates sourced product facts from clearly labeled style guidance.</h2>
          <p className="max-w-2xl text-base leading-7 text-black/70">
            Palletelle is being built to help customers evaluate garments and outfit ideas without hype, fake certainty, manipulative urgency, or invented confidence.
          </p>
          <div className="rounded-2xl border border-black/10 bg-mist p-4 text-sm leading-6 text-black/70">
            <p className="font-medium text-black">Current shell boundary</p>
            <p className="mt-2">
              This milestone uses fixture-backed products and ensemble examples only. The intended next sourcing direction is Amazon affiliate listings, with Palletelle adding clearly labeled inferred style guidance and human-reviewed merchandising.
            </p>
          </div>
          <div className="flex gap-3">
            <Link className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white" href="/browse">
              Browse the shell
            </Link>
            <Link className="rounded-full border border-black/15 px-5 py-3 text-sm font-medium" href="/products/linen-shirt">
              Inspect a product view
            </Link>
          </div>
        </div>
        <RecommendationExplanation
          productName={featured.name}
          confidence={featured.confidence}
          rationale={featured.recommendationRationale}
        />
      </section>

      <TrustSummary product={featured} />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-black/45">Fixture-backed sample</p>
            <h3 className="text-2xl font-semibold">Featured product card</h3>
          </div>
          <ProductCard product={featured} />
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-black/45">Low-confidence example</p>
            <h3 className="text-2xl font-semibold">Cautious guidance state</h3>
          </div>
          <ProductCard product={lowConfidenceExample} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-black/45">Ensemble example</p>
            <h3 className="text-2xl font-semibold">Simple explained pairing</h3>
          </div>
          <EnsembleCard ensemble={featuredEnsemble} products={sampleProducts} />
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-black/45">Low-confidence ensemble</p>
            <h3 className="text-2xl font-semibold">Tentative ensemble state</h3>
          </div>
          <EnsembleCard ensemble={lowConfidenceEnsemble} products={sampleProducts} />
        </div>
      </section>
    </div>
  );
}
