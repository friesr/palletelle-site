import type { ProductFact, FactKind } from '@atelier/domain';
import { factKindLabel } from '@atelier/trust';

const toneMap: Record<FactKind, string> = {
  fact: 'bg-olive/10 text-olive',
  inference: 'bg-rosewood/10 text-rosewood',
  opinion: 'bg-black/5 text-black/65',
};

export function FactSection({
  title,
  description,
  facts,
}: {
  title: string;
  description: string;
  facts: ProductFact[];
}) {
  if (facts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-black/65">{description}</p>
      </div>
      <ul className="space-y-3">
        {facts.map((fact) => (
          <li key={`${fact.label}-${fact.value}`} className="rounded-2xl bg-mist p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="font-medium">{fact.label}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${toneMap[fact.kind]}`}>
                {factKindLabel(fact.kind)}
              </span>
            </div>
            <p className="text-black/80">{fact.value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-black/45">Source: {fact.source}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
