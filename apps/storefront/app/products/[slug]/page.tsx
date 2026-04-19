import { notFound } from 'next/navigation';
import { ProductVisual } from '@/components/product-visual';
import { getStorefrontProductBySlug } from '@/lib/db-products';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const details = [
    { label: 'Brand', value: product.brand },
    { label: 'Material', value: product.facts.find((fact) => fact.label === 'Material')?.value ?? 'Not specified' },
    { label: 'Color', value: product.colorLabel },
    { label: 'Category', value: product.facts.find((fact) => fact.label === 'Category')?.value ?? 'Not specified' },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6 rounded-3xl bg-white p-8 shadow-sm">
          <ProductVisual product={product} size="lg" />
          {product.images && product.images.length > 1 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {product.images.map((image, index) => (
                <figure key={`${image.src}-${index}`} className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                  <div className="aspect-[4/5]">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </figure>
              ))}
            </div>
          ) : null}
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-black/45">Product detail</p>
            <h2 className="mt-2 text-3xl font-semibold">{product.name}</h2>
            <p className="mt-3 max-w-2xl text-black/70">{product.summary}</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-mist p-5 text-sm leading-6 text-black/70">
            <p className="font-medium text-black">Price</p>
            <p className="mt-2 text-base text-black">{product.priceTracking?.currentPriceText ?? product.priceLabel}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {product.buyUrl ? (
                <a
                  className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white"
                  href={product.buyUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Buy now
                </a>
              ) : null}
              {product.canonicalUrl ? (
                <a
                  className="rounded-full border border-black/15 px-5 py-3 text-sm font-medium text-black"
                  href={product.canonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View source listing
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.25em] text-black/45">Quick details</p>
          <dl className="space-y-4 text-sm text-black/70">
            {details.map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-4 border-b border-black/5 pb-3 last:border-b-0 last:pb-0">
                <dt className="font-medium text-black">{item.label}</dt>
                <dd className="text-right">{item.value}</dd>
              </div>
            ))}
          </dl>
          {product.sourcePlatform ? (
            <p className="text-sm leading-6 text-black/60">
              Source platform: <span className="font-medium text-black">{product.sourcePlatform}</span>
            </p>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
