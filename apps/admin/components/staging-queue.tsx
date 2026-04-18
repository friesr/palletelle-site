import type { SourcedProductRecord } from '@atelier/domain';
import { bulkReviewWorkflowAction } from '@/app/review/actions';
import { StagingQueueFilters } from '@/components/staging-queue-filters';

export function StagingQueue({ products }: { products: SourcedProductRecord[] }) {
  return <StagingQueueFilters products={products} bulkReviewAction={bulkReviewWorkflowAction} />;
}
