import { notFound } from 'next/navigation';
import { sampleProducts } from '@/lib/sample-products';
import { LowConfidenceNote } from '@/components/low-confidence-note';
import { ProductVisual } from '@/components/product-visual';
import { ProductFactList } from '@/components/product-fact-list';
import { ProvenanceSummary } from '@/components/provenance-summary';
import { RecommendationExplanation } from '@/components/recommendation-explanation';
import { TrustSummary } from '@/components/trust-summary';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = sampleProducts.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const lowConfidence = product.confidence === 'low';
  const lowConfidenceReason = product.facts.find((fact) => fact.label === 'Low confidence reason')?.value;

  return (
    <div className="space-y-8">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6 rounded-3xl bg-white p-8 shadow-sm">
          <ProductVisual product={product} size="lg" />
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-black/45">Product detail placeholder</p>
            <h2 className="mt-2 text-3xl font-semibold">{product.name}</h2>
            <p className="mt-3 max-w-2xl text-black/70">{product.summary}</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-mist p-4 text-sm leading-6 text-black/70">
            <p className="font-medium text-black">Product view boundary</p>
            <p className="mt-2">
              This page shows fixture-backed product structure only. It does not claim live availability, verified fit certainty, or validated color matching outcomes.
            </p>
          </div>
          {lowConfidence ? <LowConfidenceNote reason={lowConfidenceReason ?? 'This item has limited supporting evidence in the current fixture set.'} /> : null}
        </div>
        <RecommendationExplanation
          productName={product.name}
          confidence={product.confidence}
          lowConfidenceReason={lowConfidenceReason}
          rationale={product.recommendationRationale}
        />
      </section>

      <TrustSummary product={product} />
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <ProductFactList product={product} />
        <div className="space-y-4">
          <div className="rounded-2xl border border-black/10 bg-mist p-4 text-sm leading-6 text-black/70">
            <p className="font-medium text-black">Always-visible limitation</p>
            <p className="mt-2">
              The main trust limit for this product is <span className="font-medium text-black">{product.provenance.uncertainAttributes[0] ?? 'limited supporting evidence'}</span>. Deeper provenance detail is available below without changing that limitation.
            </p>
          </div>
          <ProvenanceSummary provenance={product.provenance} confidence={product.confidence} />
        </div>
      </section>
    </div>
  );
}
