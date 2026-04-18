import type { ProductRecord } from '@atelier/domain';
import { FactSection } from '@/components/fact-section';

export function ProductFactList({ product }: { product: ProductRecord }) {
  const facts = product.facts.filter((fact) => fact.kind === 'fact');
  const inferences = product.facts.filter((fact) => fact.kind === 'inference');
  const opinions = product.facts.filter((fact) => fact.kind === 'opinion');

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-black/45">Fact map</p>
        <h3 className="mt-2 text-xl font-semibold">What is stated, inferred, and subjective</h3>
      </div>
      <FactSection
        title="Objective facts"
        description="These fields are represented as direct fixture-backed product data in this shell."
        facts={facts}
      />
      <FactSection
        title="Inferred guidance"
        description="These notes are directional guidance, not guaranteed outcomes."
        facts={inferences}
      />
      <FactSection
        title="Editorial style opinion"
        description="These statements reflect taste-oriented judgment and should not be mistaken for product fact."
        facts={opinions}
      />
    </div>
  );
}
