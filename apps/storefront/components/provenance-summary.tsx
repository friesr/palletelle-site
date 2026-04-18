import { ConfidenceBadge } from '@/components/confidence-badge';

export interface ProvenanceData {
  dataSource: string;
  normalizationState: string;
  confidenceReason: string;
  confidenceImprovement: string;
  missingAttributes: string[];
  uncertainAttributes: string[];
}

export function ProvenanceSummary({
  provenance,
  confidence,
  compact = false,
}: {
  provenance: ProvenanceData;
  confidence: 'low' | 'medium' | 'high';
  compact?: boolean;
}) {
  return (
    <section className={`rounded-3xl border border-black/10 bg-white ${compact ? 'p-4' : 'p-6'} shadow-sm`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-black/45">Provenance</p>
          <h3 className={`${compact ? 'mt-1 text-lg' : 'mt-2 text-xl'} font-semibold`}>What supports this view</h3>
        </div>
        <ConfidenceBadge confidence={confidence} />
      </div>
      <div className={`mt-4 grid gap-3 ${compact ? '' : 'sm:grid-cols-2'}`}>
        <div className="rounded-2xl bg-mist p-4 text-sm text-black/70">
          <p className="font-medium text-black">Source</p>
          <p className="mt-2">{provenance.dataSource}</p>
        </div>
        <div className="rounded-2xl bg-mist p-4 text-sm text-black/70">
          <p className="font-medium text-black">Normalization</p>
          <p className="mt-2">{provenance.normalizationState}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-6 text-black/70">
        <div>
          <p className="font-medium text-black">Why this confidence level</p>
          <p className="mt-1">{provenance.confidenceReason}</p>
        </div>
        <div>
          <p className="font-medium text-black">What would improve confidence</p>
          <p className="mt-1">{provenance.confidenceImprovement}</p>
        </div>
        {provenance.missingAttributes.length > 0 ? (
          <div>
            <p className="font-medium text-black">Missing attributes</p>
            <p className="mt-1">{provenance.missingAttributes.join(', ')}</p>
          </div>
        ) : null}
        {provenance.uncertainAttributes.length > 0 ? (
          <div>
            <p className="font-medium text-black">Uncertain attributes</p>
            <p className="mt-1">{provenance.uncertainAttributes.join(', ')}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
