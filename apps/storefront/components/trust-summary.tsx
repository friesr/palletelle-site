import type { ProductRecord } from '@atelier/domain';
import { ConfidenceBadge } from '@/components/confidence-badge';

export function TrustSummary({ product }: { product: ProductRecord }) {
  const factCount = product.facts.filter((fact) => fact.kind === 'fact').length;
  const inferenceCount = product.facts.filter((fact) => fact.kind === 'inference').length;
  const opinionCount = product.facts.filter((fact) => fact.kind === 'opinion').length;

  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-black/45">Trust summary</p>
          <h3 className="mt-2 text-xl font-semibold">How to read this product view</h3>
        </div>
        <ConfidenceBadge confidence={product.confidence} />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-mist p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">Facts</p>
          <p className="mt-2 text-2xl font-semibold">{factCount}</p>
        </div>
        <div className="rounded-2xl bg-mist p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">Inference</p>
          <p className="mt-2 text-2xl font-semibold">{inferenceCount}</p>
        </div>
        <div className="rounded-2xl bg-mist p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">Style opinion</p>
          <p className="mt-2 text-2xl font-semibold">{opinionCount}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-black/70">
        This shell keeps objective product fields separate from inferred pairing guidance and editorial style opinion.
        Lower-confidence items should be treated as prompts for review, not strong recommendation certainty.
      </p>
    </section>
  );
}
