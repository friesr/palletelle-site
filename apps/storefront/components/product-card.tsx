import Link from 'next/link';
import type { ProductRecord } from '@atelier/domain';
import { ProductVisual } from '@/components/product-visual';

export function ProductCard({ product }: { product: ProductRecord }) {
  return (
    <article className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <ProductVisual product={product} size="sm" />
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-black/45">{product.brand}</p>
          <h3 className="text-2xl font-semibold">{product.name}</h3>
        </div>
        <p className="text-black/70">{product.summary}</p>
        <dl className="grid gap-3 rounded-2xl bg-mist p-4 text-sm text-black/75">
          <div className="flex justify-between gap-4">
            <dt>Current price</dt>
            <dd>{product.priceTracking?.currentPriceText ?? product.priceLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Source color</dt>
            <dd>{product.colorLabel}</dd>
          </div>
        </dl>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {product.buyUrl ? (
              <a
                className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
                href={product.buyUrl}
                target="_blank"
                rel="noreferrer"
              >
                Buy now
              </a>
            ) : null}
            <Link className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium" href={`/products/${product.slug}`}>
              View product
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
