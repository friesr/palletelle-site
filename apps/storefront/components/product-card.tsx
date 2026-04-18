import Link from 'next/link';
import type { ProductRecord } from '@atelier/domain';
import { ConfidenceBadge } from '@/components/confidence-badge';
import { DisclosurePanel } from '@/components/disclosure-panel';
import { LowConfidenceNote } from '@/components/low-confidence-note';
import { ProvenanceSummary } from '@/components/provenance-summary';
import { RecommendationRationale } from '@/components/recommendation-rationale';

export function ProductCard({ product }: { product: ProductRecord }) {
  const lowConfidence = product.confidence === 'low';
  const lowConfidenceReason = product.facts.find((fact) => fact.label === 'Low confidence reason')?.value;

  return (
    <article className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-black/45">{product.brand}</p>
            <h3 className="text-2xl font-semibold">{product.name}</h3>
          </div>
          <ConfidenceBadge confidence={product.confidence} />
        </div>
        <p className="text-black/70">{product.summary}</p>
        <dl className="grid gap-3 rounded-2xl bg-mist p-4 text-sm text-black/75">
          <div className="flex justify-between gap-4">
            <dt>Price</dt>
            <dd>{product.priceLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Source color</dt>
            <dd>{product.colorLabel}</dd>
          </div>
        </dl>
        <div className="rounded-2xl border border-black/10 px-4 py-3 text-sm leading-6 text-black/65">
          <p>
            <span className="font-medium text-black">Source:</span> {product.provenance.dataSource}.{' '}
            <span className="font-medium text-black">Confidence:</span> {product.provenance.confidenceReason}
          </p>
          {product.provenance.uncertainAttributes.length > 0 ? (
            <p className="mt-2 text-black/60">
              <span className="font-medium text-black">Main uncertainty:</span> {product.provenance.uncertainAttributes[0]}.
            </p>
          ) : null}
        </div>
        <DisclosurePanel
          title="Provenance details"
          summary="Source, normalization, and confidence support"
        >
          <ProvenanceSummary provenance={product.provenance} confidence={product.confidence} compact={false} />
        </DisclosurePanel>
        <DisclosurePanel
          title="Why suggested"
          summary="Objective structure, inferred match, and subjective style note"
        >
          <RecommendationRationale rationale={product.recommendationRationale} compact={false} />
        </DisclosurePanel>
        {lowConfidence ? (
          <LowConfidenceNote reason={lowConfidenceReason ?? 'This item has limited supporting evidence in the current fixture set.'} />
        ) : null}
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">Fixture-backed preview</p>
          <Link className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium" href={`/products/${product.slug}`}>
            View product
          </Link>
        </div>
      </div>
    </article>
  );
}
