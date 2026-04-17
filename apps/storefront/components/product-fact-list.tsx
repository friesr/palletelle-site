import type { ProductRecord } from '@atelier/domain';
import { factKindLabel } from '@atelier/trust';

export function ProductFactList({ product }: { product: ProductRecord }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-black/45">Fact map</p>
        <h3 className="mt-2 text-xl font-semibold">What is stated, inferred, and subjective</h3>
      </div>
      <ul className="space-y-3">
        {product.facts.map((fact) => (
          <li key={`${fact.label}-${fact.value}`} className="rounded-2xl border border-black/10 bg-mist p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h4 className="font-medium">{fact.label}</h4>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-black/60">{factKindLabel(fact.kind)}</span>
            </div>
            <p className="text-black/80">{fact.value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-black/45">Source: {fact.source}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
