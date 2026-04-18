import { notFound } from 'next/navigation';
import { sampleProducts } from '@/lib/sample-products';
import { ProductFactList } from '@/components/product-fact-list';
import { RecommendationExplanation } from '@/components/recommendation-explanation';
import { TrustSummary } from '@/components/trust-summary';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = sampleProducts.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const lowConfidence = product.confidence === 'low';

  return (
    <div className="space-y-8">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6 rounded-3xl bg-white p-8 shadow-sm">
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
          {lowConfidence ? (
            <div className="rounded-2xl border border-rosewood/20 bg-rosewood/5 p-4 text-sm leading-6 text-black/75">
              <p className="font-medium text-black">Low-confidence caution</p>
              <p className="mt-2">
                This item is shown with lower confidence, so any pairing or ensemble guidance should be read as tentative. The shell is intentionally avoiding stronger claims than the evidence supports.
              </p>
            </div>
          ) : null}
        </div>
        <RecommendationExplanation productName={product.name} confidence={product.confidence} />
      </section>

      <TrustSummary product={product} />
      <ProductFactList product={product} />
    </div>
  );
}
