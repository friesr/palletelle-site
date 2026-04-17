import { notFound } from 'next/navigation';
import { sampleProducts } from '@/lib/sample-products';
import { ProductFactList } from '@/components/product-fact-list';
import { RecommendationExplanation } from '@/components/recommendation-explanation';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = sampleProducts.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-6 rounded-3xl bg-white p-8 shadow-sm">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-black/45">Product detail placeholder</p>
          <h2 className="mt-2 text-3xl font-semibold">{product.name}</h2>
          <p className="mt-3 max-w-2xl text-black/70">{product.summary}</p>
        </div>
        <ProductFactList product={product} />
      </section>
      <RecommendationExplanation productName={product.name} />
    </div>
  );
}
