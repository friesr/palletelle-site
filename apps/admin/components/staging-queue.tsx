import type { SourcedProductRecord } from '@atelier/domain';
import { StagingQueueFilters } from '@/components/staging-queue-filters';

export function StagingQueue({ products }: { products: SourcedProductRecord[] }) {
  return <StagingQueueFilters products={products} />;
}
