import Link from 'next/link';
import type { ProductRecord } from '@atelier/domain';
import { ConfidenceBadge } from '@/components/confidence-badge';
import { ProvenanceSummary, type ProvenanceData } from '@/components/provenance-summary';
import { RecommendationRationale, type RecommendationRationaleData } from '@/components/recommendation-rationale';
import { ProductVisual } from '@/components/product-visual';

export interface EnsembleRecord {
  id: string;
  name: string;
  summary: string;
  confidence: 'low' | 'medium' | 'high';
  itemSlugs: string[];
  provenance: ProvenanceData;
  recommendationRationale: RecommendationRationaleData;
  lowConfidenceReason?: string;
}

export function EnsembleCard({
  ensemble,
  products,
}: {
  ensemble: EnsembleRecord;
  products: ProductRecord[];
}) {
  const includedProducts = ensemble.itemSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is ProductRecord => Boolean(product));

  return (
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-black/45">Ensemble example</p>
          <h3 className="mt-2 text-2xl font-semibold">{ensemble.name}</h3>
        </div>
        <ConfidenceBadge confidence={ensemble.confidence} />
      </div>
      <p className="text-black/70">{ensemble.summary}</p>
      <div className="space-y-3 rounded-3xl border border-black/10 bg-mist p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-black">Look board</p>
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">Fixture ensemble</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {includedProducts.map((product) => (
            <ProductVisual key={product.id} product={product} size="sm" />
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-mist p-4 text-sm text-black/70">
        <p className="font-medium text-black">Included fixture items</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ensemble.itemSlugs.map((slug) => (
            <Link key={slug} className="rounded-full border border-black/10 px-3 py-1 text-xs uppercase tracking-[0.15em] text-black/60" href={`/products/${slug}`}>
              {slug}
            </Link>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-black/10 px-4 py-3 text-sm leading-6 text-black/65">
        <p>
          <span className="font-medium text-black">Source:</span> {ensemble.provenance.dataSource}.{' '}
          <span className="font-medium text-black">Main uncertainty:</span> {ensemble.provenance.uncertainAttributes[0] ?? 'limited supporting evidence'}.
        </p>
      </div>
      <ProvenanceSummary provenance={ensemble.provenance} confidence={ensemble.confidence} compact />
      <RecommendationRationale rationale={ensemble.recommendationRationale} compact />
      {ensemble.lowConfidenceReason ? (
        <div className="rounded-2xl border border-rosewood/20 bg-rosewood/5 p-4 text-sm leading-6 text-black/75">
          <p className="font-medium text-black">Confidence caution</p>
          <p className="mt-2">{ensemble.lowConfidenceReason}</p>
        </div>
      ) : null}
    </section>
  );
}
