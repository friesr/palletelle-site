import { notFound } from 'next/navigation';
import { ReviewDetail } from '@/components/review-detail';
import { requireAdmin } from '@/lib/auth/session';
import { sampleStagedProducts } from '@/lib/sample-staged-products';

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;
  const product = sampleStagedProducts.find((entry) => entry.id === id);

  if (!product) {
    notFound();
  }

  return <ReviewDetail product={product} />;
}
