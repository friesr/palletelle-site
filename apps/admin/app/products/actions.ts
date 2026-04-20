'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { runEzraValidation } from '@/lib/services/ezra-service';
import { updateProductInferredFields, updateProductNormalizedFields, updateProductSourceFields, updateProductSourceHealthFields } from '@/lib/services/product-service';

function getTrimmedString(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? '';
}

function parseList(value: string) {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export async function updateNormalizedProductAction(formData: FormData) {
  await requireAdmin();
  const productId = getTrimmedString(formData, 'productId');

  await updateProductNormalizedFields({
    productId,
    title: getTrimmedString(formData, 'title'),
    brand: getTrimmedString(formData, 'brand') || undefined,
    category: getTrimmedString(formData, 'category') || undefined,
    sourceColor: getTrimmedString(formData, 'sourceColor') || undefined,
    material: getTrimmedString(formData, 'material') || undefined,
    priceText: getTrimmedString(formData, 'priceText') || undefined,
    availabilityText: getTrimmedString(formData, 'availabilityText') || undefined,
    summary: getTrimmedString(formData, 'summary') || undefined,
  });

  revalidatePath('/products');
  revalidatePath(`/products/${productId}`);
  revalidatePath(`/review/${productId}`);
  revalidatePath('/browse');
}

export async function updateInferredProductAction(formData: FormData) {
  await requireAdmin();
  const productId = getTrimmedString(formData, 'productId');

  await updateProductInferredFields({
    productId,
    paletteFamily: getTrimmedString(formData, 'paletteFamily') || undefined,
    colorHarmony: getTrimmedString(formData, 'colorHarmony') || undefined,
    styleDirection: getTrimmedString(formData, 'styleDirection') || undefined,
    styleOpinion: getTrimmedString(formData, 'styleOpinion') || undefined,
    dataConfidence: getTrimmedString(formData, 'dataConfidence'),
    confidenceReason: getTrimmedString(formData, 'confidenceReason'),
    confidenceImprovement: getTrimmedString(formData, 'confidenceImprovement'),
    missingAttributes: parseList(getTrimmedString(formData, 'missingAttributes')),
    uncertainAttributes: parseList(getTrimmedString(formData, 'uncertainAttributes')),
  });

  revalidatePath('/products');
  revalidatePath(`/products/${productId}`);
  revalidatePath(`/review/${productId}`);
  revalidatePath('/browse');
}

export async function updateSourceProductAction(formData: FormData) {
  await requireAdmin();
  const productId = getTrimmedString(formData, 'productId');

  await updateProductSourceFields({
    productId,
    sourcePlatform: getTrimmedString(formData, 'sourcePlatform'),
    ingestMethod: getTrimmedString(formData, 'ingestMethod') || undefined,
    sourceIdentifier: getTrimmedString(formData, 'sourceIdentifier'),
    canonicalUrl: getTrimmedString(formData, 'canonicalUrl') || undefined,
    affiliateUrl: getTrimmedString(formData, 'affiliateUrl') || undefined,
    imageUrl: getTrimmedString(formData, 'imageUrl') || undefined,
    galleryImageUrls: parseLines(getTrimmedString(formData, 'galleryImageUrls')),
    title: getTrimmedString(formData, 'sourceTitle') || undefined,
    categoryText: getTrimmedString(formData, 'categoryText') || undefined,
    colorText: getTrimmedString(formData, 'colorText') || undefined,
    priceText: getTrimmedString(formData, 'sourcePriceText') || undefined,
    availabilityText: getTrimmedString(formData, 'sourceAvailabilityText') || undefined,
    summary: getTrimmedString(formData, 'sourceSummary') || undefined,
    sourceNotes: getTrimmedString(formData, 'sourceNotes') || undefined,
  });

  revalidatePath('/products');
  revalidatePath(`/products/${productId}`);
  revalidatePath(`/review/${productId}`);
  revalidatePath('/browse');
}

export async function updateSourceHealthAction(formData: FormData) {
  await requireAdmin();
  const productId = getTrimmedString(formData, 'productId');

  await updateProductSourceHealthFields({
    productId,
    sourceStatus: getTrimmedString(formData, 'sourceStatus'),
    sourceCheckResult: getTrimmedString(formData, 'sourceCheckResult') || undefined,
    revalidationReason: getTrimmedString(formData, 'revalidationReason') || undefined,
    needsRevalidation: getTrimmedString(formData, 'needsRevalidation') === 'true',
  });

  revalidatePath('/products');
  revalidatePath(`/products/${productId}`);
  revalidatePath(`/review/${productId}`);
  revalidatePath('/browse');
}

export async function runEzraValidationAction(formData: FormData) {
  await requireAdmin();
  const productId = getTrimmedString(formData, 'productId');

  await runEzraValidation(productId);

  revalidatePath('/products');
  revalidatePath(`/products/${productId}`);
  revalidatePath(`/review/${productId}`);
  revalidatePath('/browse');
}
