import type { SourcedProductRecord } from '@atelier/domain';
import { prisma } from '@/lib/db';
import { mapDbProductToSourcedRecord } from '@/lib/services/db-mappers';
import { optionalText, requireEnumValue, requireNonEmpty } from '@/lib/services/validators';

export async function listEditableProducts(): Promise<SourcedProductRecord[]> {
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

export async function getEditableProductById(id: string): Promise<SourcedProductRecord | null> {
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

const confidenceLevels = ['low', 'medium', 'high'] as const;

export async function updateProductNormalizedFields(input: {
  productId: string;
  title: string;
  brand?: string;
  category?: string;
  sourceColor?: string;
  material?: string;
  priceText?: string;
  availabilityText?: string;
  summary?: string;
}) {
  requireNonEmpty(input.productId, 'Product id');
  requireNonEmpty(input.title, 'Normalized title');

  await prisma.productNormalizedData.upsert({
    where: { productId: input.productId },
    update: {
      title: input.title,
      brand: optionalText(input.brand),
      category: optionalText(input.category),
      sourceColor: optionalText(input.sourceColor),
      material: optionalText(input.material),
      priceText: optionalText(input.priceText),
      availabilityText: optionalText(input.availabilityText),
      summary: optionalText(input.summary),
    },
    create: {
      id: `${input.productId}-normalized`,
      productId: input.productId,
      title: input.title,
      brand: optionalText(input.brand),
      category: optionalText(input.category),
      sourceColor: optionalText(input.sourceColor),
      material: optionalText(input.material),
      priceText: optionalText(input.priceText),
      availabilityText: optionalText(input.availabilityText),
      summary: optionalText(input.summary),
    },
  });
}

export async function updateProductInferredFields(input: {
  productId: string;
  paletteFamily?: string;
  colorHarmony?: string;
  styleDirection?: string;
  styleOpinion?: string;
  dataConfidence: string;
  confidenceReason: string;
  confidenceImprovement: string;
  missingAttributes: string[];
  uncertainAttributes: string[];
}) {
  requireNonEmpty(input.productId, 'Product id');
  requireNonEmpty(input.confidenceReason, 'Confidence reason');
  requireNonEmpty(input.confidenceImprovement, 'Confidence improvement');
  const dataConfidence = requireEnumValue(input.dataConfidence, confidenceLevels, 'Confidence level');

  await prisma.productInferredData.upsert({
    where: { productId: input.productId },
    update: {
      paletteFamily: optionalText(input.paletteFamily),
      colorHarmony: optionalText(input.colorHarmony),
      styleDirection: optionalText(input.styleDirection),
      styleOpinion: optionalText(input.styleOpinion),
      dataConfidence,
      confidenceReason: input.confidenceReason,
      confidenceImprovement: input.confidenceImprovement,
      missingAttributesJson: JSON.stringify(input.missingAttributes),
      uncertainAttributesJson: JSON.stringify(input.uncertainAttributes),
    },
    create: {
      id: `${input.productId}-inferred`,
      productId: input.productId,
      paletteFamily: optionalText(input.paletteFamily),
      colorHarmony: optionalText(input.colorHarmony),
      styleDirection: optionalText(input.styleDirection),
      styleOpinion: optionalText(input.styleOpinion),
      dataConfidence,
      confidenceReason: input.confidenceReason,
      confidenceImprovement: input.confidenceImprovement,
      missingAttributesJson: JSON.stringify(input.missingAttributes),
      uncertainAttributesJson: JSON.stringify(input.uncertainAttributes),
    },
  });
}
