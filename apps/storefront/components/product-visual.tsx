import Image from 'next/image';
import type { ProductRecord } from '@atelier/domain';

const frameStyles = {
  sm: 'aspect-[4/5] rounded-2xl',
  md: 'aspect-[4/5] rounded-3xl',
  lg: 'aspect-[5/4] rounded-3xl',
} as const;

export function ProductVisual({
  product,
  size = 'md',
}: {
  product: ProductRecord;
  size?: keyof typeof frameStyles;
}) {
  const image = product.image;

  return (
    <figure className={`overflow-hidden border border-black/10 bg-white ${frameStyles[size]}`}>
      <div className="relative h-full w-full">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes={size === 'lg' ? '(min-width: 1024px) 560px, 100vw' : '(min-width: 768px) 360px, 100vw'}
            unoptimized
          />
        ) : (
          <div className="flex h-full items-end bg-mist p-5">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-black/45">Fixture image unavailable</p>
              <p className="max-w-xs text-sm leading-6 text-black/65">{product.name}</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-black/60 backdrop-blur">
          Product image
        </div>
      </div>
      {image?.caption ? (
        <figcaption className="border-t border-black/10 bg-white px-4 py-3 text-xs uppercase tracking-[0.18em] text-black/45">
          {image.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
