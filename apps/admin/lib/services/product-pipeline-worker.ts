import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/db';
import type { ProductPipelineCandidate, ProductPipelineStage, ProductPipelineEventType } from '@prisma/client';
import { chromium } from 'playwright';

const DEFAULT_SUBMITTED_BY = 'Ada';
const DEFAULT_RETRY_MINUTES = 30;

function now() {
  return new Date();
}

function buildHeaders(hardened = false) {
  return {
    'user-agent': hardened
      ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
      : 'Mozilla/5.0',
    'accept-language': 'en-US,en;q=0.9',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    ...(hardened
      ? {
          'upgrade-insecure-requests': '1',
          'cache-control': 'no-cache',
          pragma: 'no-cache',
        }
      : {}),
  };
}

function hasUsableAmazonDom(html: string) {
  return /id="productTitle"/i.test(html) || /"hiRes":"https?:/i.test(html) || /class="a-price/i.test(html);
}

async function tierFetch(url: string, hardened: boolean) {
  try {
    const response = await fetch(url, {
      headers: buildHeaders(hardened),
      redirect: 'follow',
      cache: 'no-store',
    });
    const html = await response.text();
    const success = response.ok && hasUsableAmazonDom(html);
    return {
      success,
      html,
      finalUrl: response.url,
      statusCode: response.status,
      failureReason: success ? undefined : `${hardened ? 'http_hardened' : 'fetch'}_${response.status}_${hasUsableAmazonDom(html) ? 'incomplete_dom' : 'bad_dom'}`,
      method: hardened ? 'http_hardened' : 'fetch',
    };
  } catch (error) {
    return {
      success: false,
      html: '',
      finalUrl: url,
      statusCode: null,
      failureReason: `${hardened ? 'http_hardened' : 'fetch'}_exception:${error instanceof Error ? error.message : 'unknown'}`,
      method: hardened ? 'http_hardened' : 'fetch',
    };
  }
}

async function tierBrowser(url: string) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: buildHeaders(true)['user-agent'],
      locale: 'en-US',
    });
    const page = await context.newPage();
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    const html = await page.content();
    const finalUrl = page.url();
    const statusCode = response?.status() ?? null;
    const success = (statusCode === null || (statusCode >= 200 && statusCode < 400)) && hasUsableAmazonDom(html);
    await context.close();
    await browser.close();
    return {
      success,
      html,
      finalUrl,
      statusCode,
      failureReason: success ? undefined : `browser_${statusCode ?? 'no_status'}_${hasUsableAmazonDom(html) ? 'incomplete_dom' : 'bad_dom'}`,
      method: 'browser',
    };
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    return {
      success: false,
      html: '',
      finalUrl: url,
      statusCode: null,
      failureReason: `browser_exception:${error instanceof Error ? error.message : 'unknown'}`,
      method: 'browser',
    };
  }
}

async function acquireProductPage(url: string) {
  const tier1 = await tierFetch(url, false);
  if (tier1.success) return tier1;
  const tier2 = await tierFetch(url, true);
  if (tier2.success) return tier2;
  const tier3 = await tierBrowser(url);
  if (tier3.success) return tier3;
  return tier3.failureReason ? tier3 : tier2.failureReason ? tier2 : tier1;
}

function firstMatch(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return decodeHtml(match[1]).trim();
  }
  return null;
}

function decodeHtml(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractTitle(html: string) {
  return firstMatch(html, [
    /<meta\s+property="og:title"\s+content="([^"]+)"/i,
    /<meta\s+name="title"\s+content="([^"]+)"/i,
    /<title>([^<]+)<\/title>/i,
  ]);
}

function extractImage(html: string) {
  return firstMatch(html, [
    /<meta\s+property="og:image"\s+content="([^"]+)"/i,
    /"hiRes":"([^"]+)"/i,
    /"large":"([^"]+)"/i,
    /"mainUrl":"([^"]+)"/i,
  ]);
}

function extractPriceText(html: string) {
  const direct = firstMatch(html, [
    /<meta\s+property="product:price:amount"\s+content="([^"]+)"/i,
    /<meta\s+name="twitter:data1"\s+content="([^"]+)"/i,
    /"priceToPay"[^\}]*"displayString":"([^"]+)"/i,
    /"price"\s*:\s*"(\$[^\"]+)"/i,
    /class="a-offscreen">(\$[^<]+)<\/span>/i,
  ]);
  if (direct) return direct.startsWith('$') ? direct : `$${direct}`;
  const whole = firstMatch(html, [
    /a-price-whole">([0-9,]+)</i,
    /priceblock_ourprice[^>]*>\s*\$?([0-9,]+(?:\.[0-9]{2})?)/i,
  ]);
  const fraction = firstMatch(html, [/a-price-fraction">([0-9]{2})</i]);
  if (whole) return `$${whole.replace(/,/g, '')}${fraction ? `.${fraction}` : ''}`;
  return null;
}

function extractAsin(url: string) {
  const match = url.match(/\/dp\/([A-Z0-9]{10})/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function assignCategory(title: string | null) {
  if (!title) return null;
  const t = title.toLowerCase();
  if (/(dress|gown|shirtdress)/.test(t)) return 'Dress';
  if (/(skirt)/.test(t)) return 'Skirt';
  if (/(shirt|blouse|top|tee|t-shirt)/.test(t)) return 'Top';
  if (/(pants|trouser|jean|leggings)/.test(t)) return 'Bottom';
  if (/(shoe|sandal|boot|loafer|heel|sneaker)/.test(t)) return 'Shoes';
  if (/(bag|purse|belt|scarf|earring|necklace|bracelet|hat)/.test(t)) return 'Accessory';
  return null;
}

function inferVetting(title: string | null) {
  if (!title) return 'pending';
  const t = title.toLowerCase();
  if (/(mini skirt|mini-skirt|short shorts|cheeky|crop top|bralette|bikini|swimsuit)/.test(t)) return 'rejected';
  return 'approved';
}

function parsePriceAmountCents(priceText: string | null) {
  if (!priceText) return null;
  const match = priceText.replace(/,/g, '').match(/\$\s*(\d+(?:\.\d{1,2})?)/);
  if (!match) return null;
  return Math.round(Number.parseFloat(match[1]) * 100);
}

function slugify(value: string) {
  return value.toLowerCase().replace(/https?:\/\//g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48);
}

async function writeEvent(input: {
  candidateId: string;
  eventType: ProductPipelineEventType;
  fromStage?: ProductPipelineStage;
  toStage: ProductPipelineStage;
  reason?: string;
  httpStatus?: number | null;
  finalResolvedUrl?: string | null;
  errorPayloadJson?: string | null;
}) {
  await prisma.productPipelineEvent.create({
    data: {
      id: randomUUID(),
      candidateId: input.candidateId,
      eventType: input.eventType,
      fromStage: input.fromStage,
      toStage: input.toStage,
      reason: input.reason,
      httpStatus: input.httpStatus ?? null,
      finalResolvedUrl: input.finalResolvedUrl ?? null,
      errorPayloadJson: input.errorPayloadJson ?? null,
    },
  });
}

async function setStage(candidate: ProductPipelineCandidate, toStage: ProductPipelineStage, eventType: ProductPipelineEventType, reason?: string, extra?: Partial<ProductPipelineCandidate>) {
  await prisma.productPipelineCandidate.update({
    where: { id: candidate.id },
    data: {
      currentStage: toStage,
      ...extra,
    },
  });
  await writeEvent({
    candidateId: candidate.id,
    eventType,
    fromStage: candidate.currentStage,
    toStage,
    reason,
    httpStatus: extra?.latestHttpStatus ?? candidate.latestHttpStatus,
    finalResolvedUrl: extra?.finalResolvedUrl ?? candidate.finalResolvedUrl,
    errorPayloadJson: extra?.metadataJson ?? null,
  });
}

async function rejectCandidate(candidate: ProductPipelineCandidate, reason: string, httpStatus?: number | null, payload?: unknown) {
  await setStage(candidate, 'rejected', 'rejected', reason, {
    rejectionReason: reason,
    lastError: reason,
    latestHttpStatus: httpStatus ?? candidate.latestHttpStatus,
    metadataJson: payload ? JSON.stringify(payload) : candidate.metadataJson,
    nextAttemptAt: null,
  });
}

async function scheduleRetry(candidate: ProductPipelineCandidate, reason: string, payload?: unknown) {
  const retryAt = new Date(Date.now() + DEFAULT_RETRY_MINUTES * 60 * 1000);
  await prisma.productPipelineCandidate.update({
    where: { id: candidate.id },
    data: {
      lastError: reason,
      nextAttemptAt: retryAt,
      metadataJson: payload ? JSON.stringify(payload) : candidate.metadataJson,
    },
  });
  await writeEvent({
    candidateId: candidate.id,
    eventType: 'retry_scheduled',
    fromStage: candidate.currentStage,
    toStage: candidate.currentStage,
    reason,
    httpStatus: candidate.latestHttpStatus,
    finalResolvedUrl: candidate.finalResolvedUrl,
    errorPayloadJson: payload ? JSON.stringify(payload) : null,
  });
}

async function stageProduct(candidate: ProductPipelineCandidate) {
  const asin = candidate.asin ?? extractAsin(candidate.sourceUrl) ?? candidate.id.slice(0, 10);
  const productId = `pipeline-${asin.toLowerCase()}`;
  const sourceId = `${productId}-source`;
  const lifecycleId = `${productId}-lifecycle`;
  const reviewId = `${productId}-review`;
  const normalizedId = `${productId}-normalized`;
  const inferredId = `${productId}-inferred`;
  const visibilityId = `${productId}-visibility`;
  const sourceHealthId = `${productId}-source-health`;

  await prisma.$transaction(async (tx) => {
    await tx.product.upsert({
      where: { id: productId },
      update: {
        slug: slugify(candidate.title ?? asin) || `product-${asin.toLowerCase()}`,
      },
      create: {
        id: productId,
        slug: slugify(candidate.title ?? asin) || `product-${asin.toLowerCase()}`,
      },
    });

    await tx.productSourceData.upsert({
      where: { id: sourceId },
      update: {
        sourcePlatform: 'amazon',
        ingestMethod: 'product_pipeline_worker',
        sourceIdentifier: asin,
        canonicalUrl: candidate.finalResolvedUrl ?? candidate.sourceUrl,
        affiliateUrl: candidate.finalResolvedUrl ?? candidate.sourceUrl,
        retrievedAt: now(),
        title: candidate.title,
        priceText: candidate.priceText,
        rawSnapshotJson: JSON.stringify({ imageUrl: candidate.imageUrl, category: candidate.category }),
      },
      create: {
        id: sourceId,
        productId,
        sourcePlatform: 'amazon',
        ingestMethod: 'product_pipeline_worker',
        sourceIdentifier: asin,
        canonicalUrl: candidate.finalResolvedUrl ?? candidate.sourceUrl,
        affiliateUrl: candidate.finalResolvedUrl ?? candidate.sourceUrl,
        retrievedAt: now(),
        title: candidate.title,
        priceText: candidate.priceText,
        rawSnapshotJson: JSON.stringify({ imageUrl: candidate.imageUrl, category: candidate.category }),
      },
    });

    await tx.productNormalizedData.upsert({
      where: { productId },
      update: {
        title: candidate.title!,
        category: candidate.category!,
        priceText: candidate.priceText!,
        sourceColor: 'Unknown color',
        summary: 'Pipeline worker staged candidate for store review.',
      },
      create: {
        id: normalizedId,
        productId,
        title: candidate.title!,
        category: candidate.category!,
        priceText: candidate.priceText!,
        sourceColor: 'Unknown color',
        summary: 'Pipeline worker staged candidate for store review.',
      },
    });

    await tx.productInferredData.upsert({
      where: { productId },
      update: {
        dataConfidence: 'medium',
        confidenceReason: 'Deterministic worker extracted required storefront fields.',
        confidenceImprovement: 'Add brand, material, and stronger scoring rules.',
        missingAttributesJson: JSON.stringify(['brand']),
        uncertainAttributesJson: JSON.stringify(['color']),
      },
      create: {
        id: inferredId,
        productId,
        dataConfidence: 'medium',
        confidenceReason: 'Deterministic worker extracted required storefront fields.',
        confidenceImprovement: 'Add brand, material, and stronger scoring rules.',
        missingAttributesJson: JSON.stringify(['brand']),
        uncertainAttributesJson: JSON.stringify(['color']),
      },
    });

    await tx.productPriceSnapshot.create({
      data: {
        id: `${productId}-price-${Date.now()}`,
        productId,
        productSourceDataId: sourceId,
        priceText: candidate.priceText!,
        priceAmountCents: parsePriceAmountCents(candidate.priceText),
        currencyCode: 'USD',
        captureMethod: 'product_pipeline_worker',
        notes: 'Deterministic worker capture.',
      },
    });

    await tx.productReviewState.upsert({
      where: { productId },
      update: {
        workflowState: 'approved',
        reviewedAt: now(),
        reviewedBy: DEFAULT_SUBMITTED_BY,
        reviewerNotes: 'Deterministic worker scored candidate for store staging.',
      },
      create: {
        id: reviewId,
        productId,
        workflowState: 'approved',
        reviewedAt: now(),
        reviewedBy: DEFAULT_SUBMITTED_BY,
        reviewerNotes: 'Deterministic worker scored candidate for store staging.',
      },
    });

    await tx.productLifecycleState.upsert({
      where: { productId },
      update: {
        ingestState: 'normalized',
        reviewState: 'approved',
        previewState: 'dev_customer',
        publishState: 'published',
        stateNotes: 'Promoted by deterministic product pipeline worker.',
        lastChangedAt: now(),
        lastChangedBy: DEFAULT_SUBMITTED_BY,
      },
      create: {
        id: lifecycleId,
        productId,
        ingestState: 'normalized',
        reviewState: 'approved',
        previewState: 'dev_customer',
        publishState: 'published',
        stateNotes: 'Promoted by deterministic product pipeline worker.',
        lastChangedAt: now(),
        lastChangedBy: DEFAULT_SUBMITTED_BY,
      },
    });

    await tx.productVisibility.upsert({
      where: { productId },
      update: {
        isPublic: true,
        intendedActive: true,
        visibilityNotes: 'Published by deterministic worker.',
        lastDisplayabilityCheckAt: now(),
      },
      create: {
        id: visibilityId,
        productId,
        isPublic: true,
        intendedActive: true,
        visibilityNotes: 'Published by deterministic worker.',
        lastDisplayabilityCheckAt: now(),
      },
    });

    await tx.productSourceHealth.upsert({
      where: { productId },
      update: {
        sourceStatus: 'active',
        lastSourceCheckAt: now(),
        sourceCheckResult: 'ok:product_pipeline_worker',
        needsRevalidation: false,
      },
      create: {
        id: sourceHealthId,
        productId,
        sourceStatus: 'active',
        lastSourceCheckAt: now(),
        sourceCheckResult: 'ok:product_pipeline_worker',
        needsRevalidation: false,
      },
    });
  });

  await prisma.productPipelineCandidate.update({
    where: { id: candidate.id },
    data: {
      stagedProductId: productId,
      nextAttemptAt: null,
      lastError: null,
    },
  });
}

export async function seedDiagnosticCandidates(urls: string[]) {
  const seeded = [] as ProductPipelineCandidate[];
  for (const sourceUrl of urls) {
    const asin = extractAsin(sourceUrl);
    const existing = asin
      ? await prisma.productPipelineCandidate.findFirst({ where: { asin } })
      : null;
    if (existing) {
      await writeEvent({
        candidateId: existing.id,
        eventType: 'merged_duplicate',
        fromStage: existing.currentStage,
        toStage: 'rejected',
        reason: `duplicate_asin:${asin}`,
        finalResolvedUrl: existing.finalResolvedUrl,
      });
      continue;
    }
    const candidate = await prisma.productPipelineCandidate.upsert({
      where: { sourceUrl },
      update: {
        nextAttemptAt: now(),
        lastError: null,
      },
      create: {
        id: randomUUID(),
        sourceUrl,
        asin,
        currentStage: 'discovery_candidate',
        attemptCount: 0,
        nextAttemptAt: now(),
      },
    });
    seeded.push(candidate);
    await writeEvent({
      candidateId: candidate.id,
      eventType: 'advanced',
      toStage: 'discovery_candidate',
      reason: 'seeded_for_diagnostic_run',
      finalResolvedUrl: sourceUrl,
    });
  }
  return seeded;
}

export async function processCandidate(candidate: ProductPipelineCandidate) {
  const attemptAt = now();
  const attemptCount = candidate.attemptCount + 1;
  await prisma.productPipelineCandidate.update({
    where: { id: candidate.id },
    data: {
      attemptCount,
      lastAttemptAt: attemptAt,
      nextAttemptAt: null,
    },
  });

  const asin = candidate.asin ?? extractAsin(candidate.sourceUrl);
  if (!asin) {
    await rejectCandidate(candidate, 'rejected_invalid_url', null, { sourceUrl: candidate.sourceUrl });
    return 'rejected';
  }

  const duplicate = await prisma.productPipelineCandidate.findFirst({
    where: {
      asin,
      id: { not: candidate.id },
      currentStage: { not: 'rejected' },
    },
  });
  if (duplicate) {
    await rejectCandidate(candidate, `duplicate_asin:${asin}`, null, { duplicateOfId: duplicate.id });
    return 'rejected';
  }

  await setStage(candidate, 'url_verified', 'advanced', 'url_verified', { asin });
  const refreshedAfterVerify = await prisma.productPipelineCandidate.findUniqueOrThrow({ where: { id: candidate.id } });

  const acquisition = await acquireProductPage(candidate.sourceUrl);
  const acquisitionPayload = {
    failureReason: acquisition.failureReason,
    method: acquisition.method,
  };

  if (!acquisition.success) {
    if (acquisition.statusCode === 404 || acquisition.failureReason?.includes('_404_')) {
      await rejectCandidate(refreshedAfterVerify, 'rejected_invalid_url', acquisition.statusCode, acquisitionPayload);
      return 'rejected';
    }
    await scheduleRetry(refreshedAfterVerify, acquisition.failureReason ?? 'acquisition_failed', acquisitionPayload);
    return 'retry_scheduled';
  }

  await setStage(refreshedAfterVerify, 'page_sampled', 'advanced', 'page_sampled', {
    finalResolvedUrl: acquisition.finalUrl,
    latestHttpStatus: acquisition.statusCode,
    metadataJson: JSON.stringify(acquisitionPayload),
  });
  const refreshedAfterSample = await prisma.productPipelineCandidate.findUniqueOrThrow({ where: { id: candidate.id } });

  const title = extractTitle(acquisition.html);
  const imageUrl = extractImage(acquisition.html);
  const priceText = extractPriceText(acquisition.html);

  if (!title || !imageUrl || !priceText) {
    await rejectCandidate(refreshedAfterSample, `structured_failure:${[!title ? 'missing_title' : null, !imageUrl ? 'missing_image' : null, !priceText ? 'missing_price' : null].filter(Boolean).join(',')}`, acquisition.statusCode, {
      titleExtracted: Boolean(title),
      imageExtracted: Boolean(imageUrl),
      priceExtracted: Boolean(priceText),
    });
    return 'rejected';
  }

  const category = assignCategory(title);
  if (!category) {
    await rejectCandidate(refreshedAfterSample, 'structured_failure:missing_category', acquisition.statusCode, { title });
    return 'rejected';
  }

  await setStage(refreshedAfterSample, 'extracted', 'advanced', 'extracted', {
    title,
    imageUrl,
    priceText,
    category,
    finalResolvedUrl: acquisition.finalUrl,
    latestHttpStatus: acquisition.statusCode,
  });
  const refreshedAfterExtract = await prisma.productPipelineCandidate.findUniqueOrThrow({ where: { id: candidate.id } });

  const vettingStatus = inferVetting(title);
  if (vettingStatus === 'rejected') {
    await rejectCandidate(refreshedAfterExtract, 'rejected_modesty_standard', acquisition.statusCode, { title });
    return 'rejected';
  }

  await setStage(refreshedAfterExtract, 'scored', 'advanced', 'scored', {
    vettingStatus,
    scoredAt: now(),
  });
  const refreshedAfterScore = await prisma.productPipelineCandidate.findUniqueOrThrow({ where: { id: candidate.id } });

  await stageProduct({
    ...refreshedAfterScore,
    title,
    imageUrl,
    priceText,
    category,
    vettingStatus,
    finalResolvedUrl: acquisition.finalUrl,
    latestHttpStatus: acquisition.statusCode,
  });
  const refreshedAfterStage = await prisma.productPipelineCandidate.findUniqueOrThrow({ where: { id: candidate.id } });
  await setStage(refreshedAfterStage, 'staged_for_store', 'advanced', 'staged_for_store', {
    stagedProductId: refreshedAfterStage.stagedProductId,
    nextAttemptAt: null,
  });
  return 'advanced_to_staged_for_store';
}

export async function runProductPipelineBatch(limit = 5) {
  const candidates = await prisma.productPipelineCandidate.findMany({
    where: {
      currentStage: { not: 'staged_for_store' },
      OR: [
        { nextAttemptAt: null },
        { nextAttemptAt: { lte: now() } },
      ],
    },
    orderBy: [{ nextAttemptAt: 'asc' }, { createdAt: 'asc' }],
    take: limit,
  });

  const results = [] as Array<{ candidateId: string; url: string; outcome: string }>;
  for (const candidate of candidates) {
    const outcome = await processCandidate(candidate);
    results.push({ candidateId: candidate.id, url: candidate.sourceUrl, outcome });
  }
  return results;
}

export async function getProductPipelineMetrics() {
  const [stageCounts, retries, lastEvent, lastRejection, promoted24h, failureReasonGroups] = await Promise.all([
    prisma.productPipelineCandidate.groupBy({ by: ['currentStage'], _count: { currentStage: true } }),
    prisma.productPipelineCandidate.count({ where: { nextAttemptAt: { not: null } } }),
    prisma.productPipelineEvent.findFirst({ orderBy: { createdAt: 'desc' } }),
    prisma.productPipelineEvent.findFirst({ where: { eventType: 'rejected' }, orderBy: { createdAt: 'desc' } }),
    prisma.productPipelineEvent.count({ where: { toStage: 'staged_for_store', createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    prisma.productPipelineCandidate.groupBy({ by: ['lastError'], _count: { lastError: true }, where: { lastError: { not: null } } }),
  ]);

  const oldestItems = await Promise.all(
    ['discovery_candidate', 'url_verified', 'page_sampled', 'extracted', 'scored', 'staged_for_store', 'rejected'].map(async (stage) => {
      const item = await prisma.productPipelineCandidate.findFirst({ where: { currentStage: stage as ProductPipelineStage }, orderBy: { createdAt: 'asc' } });
      return { stage, oldestCreatedAt: item?.createdAt ?? null, candidateId: item?.id ?? null };
    }),
  );

  const stuckItemCount = await prisma.productPipelineCandidate.count({
    where: {
      currentStage: 'discovery_candidate',
      OR: [
        { nextAttemptAt: null },
        { lastError: null },
      ],
    },
  });

  return {
    stageCounts,
    oldestItems,
    lastSuccessfulTransition: lastEvent,
    lastRejection,
    retryBacklog: retries,
    stuckItemCount,
    failureReasonsByCount: failureReasonGroups,
    productsPromotedLast24h: promoted24h,
  };
}
