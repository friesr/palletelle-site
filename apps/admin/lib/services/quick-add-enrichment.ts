import { prisma } from '@/lib/db';
import { acquireProductPage } from '@/lib/services/acquisition-service';

function firstMatch(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const value = decodeHtml(match[1]).trim();
      if (value) return value;
    }
  }
  return null;
}

function extractPriceText(html: string) {
  const direct = firstMatch(html, [
    /<meta\s+property="product:price:amount"\s+content="([^"]+)"/i,
    /<meta\s+name="twitter:data1"\s+content="([^"]+)"/i,
    /"priceToPay"[^\}]*"displayString":"([^"]+)"/i,
    /"price"\s*:\s*"(\$[^\"]+)"/i,
    /class="a-offscreen">(\$[^<]+)<\/span>/i,
  ]);

  if (direct) {
    return direct.startsWith('$') ? direct : `$${direct}`;
  }

  const whole = firstMatch(html, [
    /a-price-whole">([0-9,]+)</i,
    /priceblock_ourprice[^>]*>\s*\$?([0-9,]+(?:\.[0-9]{2})?)/i,
  ]);
  const fraction = firstMatch(html, [
    /a-price-fraction">([0-9]{2})</i,
  ]);

  if (whole) {
    const normalizedWhole = whole.replace(/,/g, '');
    if (fraction) return `$${normalizedWhole}.${fraction}`;
    return `$${normalizedWhole}`;
  }

  return null;
}

function extractBrand(html: string) {
  return firstMatch(html, [
    /<meta\s+name="brand"\s+content="([^"]+)"/i,
    /"brand"\s*:\s*"([^"]+)"/i,
    /id="bylineInfo"[^>]*>\s*(?:<a[^>]*>)?([^<]+)/i,
  ]);
}

function decodeHtml(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function normalizeImageUrl(value: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  return trimmed;
}

function buildAffiliateUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('tag', 'palletelle-20');
    return parsed.toString();
  } catch {
    return url;
  }
}

function parsePriceAmountCents(priceText: string | null) {
  if (!priceText) return null;
  const match = priceText.replace(/,/g, '').match(/\$\s*(\d+(?:\.\d{1,2})?)/);
  if (!match) return null;
  return Math.round(Number.parseFloat(match[1]) * 100);
}

export interface QuickAddEnrichmentResult {
  productId: string;
  ok: boolean;
  imageUrl: string | null;
  priceText: string | null;
  brand: string | null;
  title: string | null;
  sourceCheckResult: string;
}

export async function enrichQuickAddProduct(productId: string): Promise<QuickAddEnrichmentResult> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      sourceData: { orderBy: { retrievedAt: 'desc' }, take: 1 },
      normalizedData: true,
    },
  });

  if (!product) {
    throw new Error('Product not found.');
  }

  const sourceData = product.sourceData[0];
  const canonicalUrl = sourceData?.canonicalUrl ?? null;
  if (!sourceData || !canonicalUrl) {
    throw new Error('Canonical URL missing for quick-add enrichment.');
  }

  const acquisition = await acquireProductPage(canonicalUrl);
  const html = acquisition.html;
  if (!acquisition.success || !html.trim()) {
    const failedResult = acquisition.failureReason ?? 'acquisition_failed';
    await prisma.productSourceHealth.upsert({
      where: { productId },
      update: {
        sourceStatus: 'unavailable',
        lastSourceCheckAt: new Date(),
        sourceCheckResult: failedResult,
        needsRevalidation: true,
        revalidationReason: 'Tiered acquisition did not return usable HTML.',
      },
      create: {
        id: `${productId}-source-health`,
        productId,
        sourceStatus: 'unavailable',
        lastSourceCheckAt: new Date(),
        sourceCheckResult: failedResult,
        needsRevalidation: true,
        revalidationReason: 'Tiered acquisition did not return usable HTML.',
      },
    });
    return { productId, ok: false, imageUrl: null, priceText: null, brand: null, title: null, sourceCheckResult: failedResult };
  }

  const title = firstMatch(html, [
    /<meta\s+property="og:title"\s+content="([^"]+)"/i,
    /<meta\s+name="title"\s+content="([^"]+)"/i,
    /<title>([^<]+)<\/title>/i,
  ]) ?? sourceData.title ?? product.normalizedData?.title ?? product.slug;

  const imageUrl = normalizeImageUrl(firstMatch(html, [
    /<meta\s+property="og:image"\s+content="([^"]+)"/i,
    /"hiRes":"([^"]+)"/i,
    /"large":"([^"]+)"/i,
    /"mainUrl":"([^"]+)"/i,
  ]));

  const priceText = extractPriceText(html);

  const brand = extractBrand(html);

  const rawSnapshot = sourceData.rawSnapshotJson ? JSON.parse(sourceData.rawSnapshotJson) as Record<string, unknown> : {};
  const mergedSnapshot = {
    ...rawSnapshot,
    title,
    canonicalUrl: sourceData.canonicalUrl,
    affiliateUrl: buildAffiliateUrl(canonicalUrl),
    image: imageUrl,
    imageUrl,
    mainImage: imageUrl,
    mainImageUrl: imageUrl,
    images: imageUrl ? [imageUrl] : [],
    additionalImages: imageUrl ? [imageUrl] : [],
    brand,
    priceText,
  };

  const sourceCheckResult = imageUrl || priceText ? `ok:${acquisition.acquisitionMethod}` : `fetched_no_structured_fields:${acquisition.acquisitionMethod}`;

  await prisma.$transaction(async (tx) => {
    await tx.productSourceData.update({
      where: { id: sourceData.id },
      data: {
        affiliateUrl: buildAffiliateUrl(canonicalUrl),
        title,
        priceText,
        rawSnapshotJson: JSON.stringify(mergedSnapshot),
      },
    });

    await tx.productNormalizedData.upsert({
      where: { productId },
      update: {
        title,
        brand,
        priceText,
      },
      create: {
        id: `${productId}-normalized`,
        productId,
        title,
        brand,
        priceText,
      },
    });

    if (priceText) {
      await tx.productPriceSnapshot.create({
        data: {
          id: `${productId}-price-${Date.now()}`,
          productId,
          productSourceDataId: sourceData.id,
          priceText,
          priceAmountCents: parsePriceAmountCents(priceText),
          currencyCode: priceText.includes('$') ? 'USD' : null,
          captureMethod: `quick_add_${acquisition.acquisitionMethod}`,
          notes: 'Inline quick-add enrichment capture.',
        },
      });
    }

    await tx.productSourceHealth.upsert({
      where: { productId },
      update: {
        sourceStatus: 'active',
        lastSourceCheckAt: new Date(),
        sourceCheckResult,
        needsRevalidation: false,
        revalidationReason: null,
      },
      create: {
        id: `${productId}-source-health`,
        productId,
        sourceStatus: 'active',
        lastSourceCheckAt: new Date(),
        sourceCheckResult,
        needsRevalidation: false,
      },
    });
  });

  return {
    productId,
    ok: Boolean(imageUrl || priceText),
    imageUrl,
    priceText,
    brand,
    title,
    sourceCheckResult,
  };
}
