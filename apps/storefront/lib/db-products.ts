import type { ProductRecord } from '@atelier/domain';
import { prisma } from '@/lib/db';
import { sampleProducts } from '@/lib/sample-products';

export async function listStorefrontProducts(): Promise<ProductRecord[]> {
  const products = await prisma.product.findMany({
    include: {
      normalizedData: true,
      inferredData: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (products.length === 0) {
    return sampleProducts;
  }

  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.normalizedData?.title ?? product.slug,
    brand: product.normalizedData?.brand ?? 'Unknown brand',
    priceLabel: product.normalizedData?.priceText ?? 'Unavailable in DB scaffold',
    colorLabel: product.normalizedData?.sourceColor ?? 'Unknown color',
    summary: product.normalizedData?.summary ?? 'DB-backed local scaffold record.',
    confidence: (product.inferredData?.dataConfidence ?? 'low') as 'low' | 'medium' | 'high',
    provenance: {
      dataSource: 'DB-backed local scaffold record',
      normalizationState: 'Read from separate normalized and inferred DB tables',
      confidenceReason: product.inferredData?.confidenceReason ?? 'No inferred confidence reason recorded.',
      confidenceImprovement: product.inferredData?.confidenceImprovement ?? 'Add stronger source and review evidence.',
      missingAttributes: product.inferredData?.missingAttributesJson ? JSON.parse(product.inferredData.missingAttributesJson) : [],
      uncertainAttributes: product.inferredData?.uncertainAttributesJson ? JSON.parse(product.inferredData.uncertainAttributesJson) : [],
    },
    recommendationRationale: {
      objectiveMatch: `The product is represented as ${product.normalizedData?.category ?? 'product'} in ${product.normalizedData?.sourceColor ?? 'its stored source color'}.`,
      inferredMatch: product.inferredData?.colorHarmony ?? 'No inferred harmony guidance recorded.',
      subjectiveSuggestion: product.inferredData?.styleOpinion ?? 'No editorial suggestion recorded.',
    },
    facts: [
      { label: 'Material', value: product.normalizedData?.material ?? 'Unknown', kind: 'fact', source: 'normalized DB record' },
      { label: 'Source color', value: product.normalizedData?.sourceColor ?? 'Unknown', kind: 'fact', source: 'normalized DB record' },
      { label: 'Category', value: product.normalizedData?.category ?? 'Unspecified', kind: 'fact', source: 'normalized DB record' },
      { label: 'Style note', value: product.inferredData?.styleOpinion ?? 'No style opinion recorded', kind: 'opinion', source: 'inferred DB record' },
    ],
  }));
}
