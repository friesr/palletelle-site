import Link from 'next/link';
import { ConfidenceBadge } from '@/components/confidence-badge';
import { ProvenanceSummary, type ProvenanceData } from '@/components/provenance-summary';
import { RecommendationRationale, type RecommendationRationaleData } from '@/components/recommendation-rationale';

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

export function EnsembleCard({ ensemble }: { ensemble: EnsembleRecord }) {
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
