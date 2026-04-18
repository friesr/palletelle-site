import Link from 'next/link';
import type { ProductRecord } from '@atelier/domain';
import { ConfidenceBadge } from '@/components/confidence-badge';

export function ProductCard({ product }: { product: ProductRecord }) {
  const lowConfidence = product.confidence === 'low';

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
        <div className="rounded-2xl border border-black/10 p-4 text-sm leading-6 text-black/70">
          <p className="font-medium text-black">Trust note</p>
          <p className="mt-2">
            {lowConfidence
              ? 'This item is shown with lower confidence. Treat pairing guidance as tentative and review the product detail context before making strong assumptions.'
              : 'This item includes fixture-backed facts and bounded recommendation guidance. Inferred pairing notes are directional, not guarantees.'}
          </p>
        </div>
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
