import { AdminMissingRecord } from '@/components/admin-missing-record';
import { ReviewDetail } from '@/components/review-detail';
import { requireAdmin } from '@/lib/auth/session';
import { getReviewRecordById } from '@/lib/services/review-service';

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;
  const product = getReviewRecordById(id);

  if (!product) {
    return <AdminMissingRecord title="Review record" backHref="/" backLabel="Back to queue overview" />;
  }

  return <ReviewDetail product={product} />;
}
