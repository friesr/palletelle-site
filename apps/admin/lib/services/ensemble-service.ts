import type { EnsembleDefinition, ProductRecord } from '@atelier/domain';
import { prisma } from '@/lib/db';
import { mapDbEnsemble, mapDbProductToStorefrontRecord } from '@/lib/services/db-mappers';

export async function listEnsembleDefinitions(): Promise<EnsembleDefinition[]> {
  const records = await prisma.ensemble.findMany({
    include: { items: true },
    orderBy: { createdAt: 'asc' },
  });

  return records.map((record) => mapDbEnsemble(record));
}

export async function listEnsembleProducts(): Promise<ProductRecord[]> {
  const products = await prisma.product.findMany({
    include: {
      normalizedData: true,
      inferredData: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return products.map((product) =>
    mapDbProductToStorefrontRecord({
      product,
      normalizedData: product.normalizedData,
      inferredData: product.inferredData,
    }),
  );
}
