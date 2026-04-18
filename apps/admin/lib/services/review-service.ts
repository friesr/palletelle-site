import type { SourcedProductRecord } from '@atelier/domain';
import { prisma } from '@/lib/db';
import { mapDbProductToSourcedRecord } from '@/lib/services/db-mappers';

export async function listReviewRecords(): Promise<SourcedProductRecord[]> {
  const products = await prisma.product.findMany({
    include: {
      sourceData: true,
      normalizedData: true,
      inferredData: true,
      reviewState: true,
      sourceHealth: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return products.map((product) =>
    mapDbProductToSourcedRecord({
      product,
      sourceData: product.sourceData[0] ?? null,
      normalizedData: product.normalizedData,
      inferredData: product.inferredData,
      reviewState: product.reviewState,
      sourceHealth: product.sourceHealth,
    }),
  );
}

export async function getReviewRecordById(id: string): Promise<SourcedProductRecord | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      sourceData: true,
      normalizedData: true,
      inferredData: true,
      reviewState: true,
      sourceHealth: true,
    },
  });

  if (!product) {
    return null;
  }

  return mapDbProductToSourcedRecord({
    product,
    sourceData: product.sourceData[0] ?? null,
    normalizedData: product.normalizedData,
    inferredData: product.inferredData,
    reviewState: product.reviewState,
    sourceHealth: product.sourceHealth,
  });
}
