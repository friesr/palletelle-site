import { PrismaClient } from '@prisma/client';
import { parsePriceText } from '@atelier/domain';
import productFixtures from '../data/fixtures/products.json' with { type: 'json' };
import { sampleStagedProducts } from '../apps/admin/lib/sample-staged-products';
import { sampleEnsembleDefinitions } from '../apps/admin/lib/sample-ensemble-definitions';
import { sampleAffiliateConfig } from '../apps/admin/lib/sample-affiliate-config';
import { manualAmazonAsins } from './manual-amazon-seeds';

const prisma = new PrismaClient();
const retrievedAt = new Date('2026-04-18T15:00:00.000Z');

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function createAmazonUrls(asin: string) {
  return {
    canonicalUrl: `https://www.amazon.com/dp/${asin}`,
    affiliateUrl: `https://www.amazon.com/dp/${asin}?tag=palletelle-20`,
  };
}

function buildPriceSnapshot(input: {
  productId: string;
  priceText?: string | null;
  capturedAt: Date;
  captureMethod: string;
  sourceReference: string;
  notes: string;
}) {
  if (!input.priceText) {
    return undefined;
  }

  const parsed = parsePriceText(
    input.captureMethod === 'fixture_seed'
      ? input.priceText.replace(/\s+fixture$/i, '')
      : input.priceText,
  );

  return {
    id: `${input.productId}-price-${input.captureMethod}`,
    capturedAt: input.capturedAt,
    priceText: input.priceText,
    priceAmountCents: parsed.amountCents,
    currencyCode: parsed.currencyCode,
    captureMethod: input.captureMethod,
    sourceReference: input.sourceReference,
    notes: input.notes,
  };
}

async function seedFixtureProducts() {
  for (const fixture of productFixtures) {
    const staged = sampleStagedProducts.find((entry) => slugify(entry.normalized.title) === fixture.slug);
    const seededPriceSnapshot = buildPriceSnapshot({
      productId: fixture.id,
      priceText: staged?.source.rawSnapshot?.price ?? staged?.normalized.priceText ?? fixture.priceLabel ?? undefined,
      capturedAt: staged?.freshness.lastCheckedAt ? new Date(staged.freshness.lastCheckedAt) : retrievedAt,
      captureMethod: 'fixture_seed',
      sourceReference: staged?.source.sourcePlatform ?? 'fixture',
      notes: 'Initial fixture-seeded price snapshot.',
    });

    await prisma.product.create({
      data: {
        id: fixture.id,
        slug: fixture.slug,
        sourceData: staged
          ? {
              create: {
                id: `${fixture.id}-source`,
                sourcePlatform: staged.source.sourcePlatform,
                ingestMethod: 'fixture_seed',
                sourceIdentifier: staged.source.sourceIdentifier,
                canonicalUrl: undefined,
                affiliateUrl: undefined,
                retrievedAt: new Date(staged.source.retrievedAt),
                title: staged.source.rawSnapshot?.title,
                categoryText: staged.source.rawSnapshot?.category,
                colorText: staged.normalized.sourceColor,
                priceText: staged.source.rawSnapshot?.price,
                availabilityText: staged.source.rawSnapshot?.availability,
                rawSnapshotJson: JSON.stringify(staged.source.rawSnapshot ?? {}),
                sourceFieldMapJson: JSON.stringify(staged.source.sourceFieldMap),
              },
            }
          : undefined,
        normalizedData: {
          create: {
            id: `${fixture.id}-normalized`,
            title: fixture.name,
            brand: fixture.brand,
            category: fixture.facts.find((fact) => fact.label === 'Category')?.value,
            sourceColor: fixture.colorLabel,
            material: fixture.facts.find((fact) => fact.label === 'Material')?.value,
            priceText: fixture.priceLabel,
            summary: fixture.summary,
          },
        },
        inferredData: {
          create: {
            id: `${fixture.id}-inferred`,
            paletteFamily: staged?.inferred.paletteFamily,
            colorHarmony: staged?.inferred.colorHarmony,
            styleDirection: staged?.inferred.styleDirection,
            styleOpinion: staged?.inferred.styleOpinion ?? fixture.facts.find((fact) => fact.kind === 'opinion')?.value,
            dataConfidence: fixture.confidence,
            confidenceReason: fixture.provenance.confidenceReason,
            confidenceImprovement: fixture.provenance.confidenceImprovement,
            missingAttributesJson: JSON.stringify(fixture.provenance.missingAttributes),
            uncertainAttributesJson: JSON.stringify(fixture.provenance.uncertainAttributes),
          },
        },
        priceSnapshots: seededPriceSnapshot
          ? {
              create: seededPriceSnapshot,
            }
          : undefined,
        reviewState: {
          create: {
            id: `${fixture.id}-review`,
            workflowState: staged?.stagingStatus === 'stale' ? 'stale' : staged?.stagingStatus ?? 'needs_review',
            reviewedBy: staged?.provenance.reviewedBy,
            reviewedAt: staged?.provenance.reviewedAt ? new Date(staged.provenance.reviewedAt) : undefined,
          },
        },
        visibility: {
          create: {
            id: `${fixture.id}-visibility`,
            isPublic: false,
            intendedActive: false,
            visibilityNotes: 'Fixture product not automatically public. Displayability remains derived from review, health, and trust rules.',
          },
        },
        sourceHealth: {
          create: {
            id: `${fixture.id}-health`,
            sourceStatus: staged ? (staged.stagingStatus === 'stale' ? 'changed' : 'active') : 'unknown',
            lastSourceCheckAt: staged?.freshness.lastCheckedAt ? new Date(staged.freshness.lastCheckedAt) : undefined,
            sourceCheckResult: staged ? 'Fixture-backed seeded source health record.' : 'No staged source record available.',
            needsRevalidation: staged ? staged.stagingStatus === 'stale' : true,
            revalidationReason: staged?.stagingStatus === 'stale' ? 'Seeded staged record is stale and should be revalidated before stronger claims.' : undefined,
          },
        },
        externalSignals: {
          create: {
            id: `${fixture.id}-external`,
            reputationState: 'unknown',
            repeatedComplaintPattern: false,
            lowRatingRisk: false,
            recommendation: 'none',
            notes: 'No external reputation agent is active yet. This record exists only to prepare the monitoring boundary.',
          },
        },
      },
    });
  }
}

async function seedManualAmazonProducts() {
  for (const asin of manualAmazonAsins) {
    const productId = `amazon-manual-${asin.toLowerCase()}`;
    const slug = `amazon-manual-${asin.toLowerCase()}`;
    const urls = createAmazonUrls(asin);

    await prisma.product.create({
      data: {
        id: productId,
        slug,
        sourceData: {
          create: {
            id: `${productId}-source`,
            sourcePlatform: 'amazon_manual',
            ingestMethod: 'manual_seed',
            sourceIdentifier: asin,
            canonicalUrl: urls.canonicalUrl,
            affiliateUrl: urls.affiliateUrl,
            retrievedAt,
            title: null,
            categoryText: null,
            colorText: null,
            priceText: null,
            availabilityText: null,
            rawSnapshotJson: JSON.stringify({
              ingestState: 'manual_seed',
              manualReviewRequired: true,
              canonicalUrl: urls.canonicalUrl,
              affiliateUrl: urls.affiliateUrl,
            }),
            sourceFieldMapJson: JSON.stringify({
              sourceIdentifier: 'ASIN',
              canonicalUrl: 'manual_seed',
              affiliateUrl: 'manual_seed',
            }),
          },
        },
        normalizedData: {
          create: {
            id: `${productId}-normalized`,
            title: `Manual review required (${asin})`,
            brand: null,
            category: null,
            sourceColor: null,
            material: null,
            priceText: null,
            availabilityText: null,
            summary: null,
          },
        },
        inferredData: {
          create: {
            id: `${productId}-inferred`,
            paletteFamily: null,
            colorHarmony: null,
            styleDirection: null,
            styleOpinion: null,
            dataConfidence: 'low',
            confidenceReason: 'Manual Amazon seed imported without fetched source facts. Review and normalization are still required.',
            confidenceImprovement: 'Fetch or manually verify source facts, then complete normalization and inferred review.',
            missingAttributesJson: JSON.stringify(['title', 'brand', 'category', 'sourceColor', 'material', 'priceText', 'availabilityText']),
            uncertainAttributesJson: JSON.stringify([]),
          },
        },
        reviewState: {
          create: {
            id: `${productId}-review`,
            workflowState: 'needs_review',
            reviewerNotes: 'Manual Amazon seed imported. Awaiting factual normalization and review.',
          },
        },
        visibility: {
          create: {
            id: `${productId}-visibility`,
            isPublic: false,
            intendedActive: false,
            visibilityNotes: 'Manual Amazon seed import does not imply public visibility. Displayability remains derived and review-gated.',
          },
        },
        sourceHealth: {
          create: {
            id: `${productId}-health`,
            sourceStatus: 'unknown',
            lastSourceCheckAt: null,
            sourceCheckResult: 'Manual seed only. No source validation has run yet.',
            needsRevalidation: false,
            revalidationReason: null,
          },
        },
        externalSignals: {
          create: {
            id: `${productId}-external`,
            reputationState: 'unknown',
            lastExternalCheckAt: null,
            repeatedComplaintPattern: false,
            lowRatingRisk: false,
            recommendation: 'none',
            notes: 'No external monitoring has run. Imported as a manual seed only.',
          },
        },
      },
    });
  }
}

async function seedEnsembles() {
  for (const ensemble of sampleEnsembleDefinitions) {
    await prisma.ensemble.create({
      data: {
        id: ensemble.id,
        slug: ensemble.slug,
        name: ensemble.name,
        summary: ensemble.summary,
        confidence: ensemble.confidence,
        objectiveMatch: ensemble.rationale.objectiveMatch,
        inferredMatch: ensemble.rationale.inferredMatch,
        subjectiveSuggestion: ensemble.rationale.subjectiveSuggestion,
        paletteFamiliesJson: JSON.stringify(ensemble.profileRelevance.paletteFamilies),
        colorProfileTagsJson: JSON.stringify(ensemble.profileRelevance.colorProfileTags),
        preferenceTagsJson: JSON.stringify(ensemble.profileRelevance.preferenceTags),
        source: ensemble.source,
        items: {
          create: ensemble.productSelections.map((selection, index) => ({
            id: `${ensemble.id}-item-${index + 1}`,
            productId: selection.productId,
            role: selection.role,
            orderIndex: index,
          })),
        },
      },
    });
  }
}

async function seedAffiliateConfig() {
  await prisma.affiliateConfig.create({
    data: {
      id: sampleAffiliateConfig.id,
      platform: sampleAffiliateConfig.affiliatePlatform,
      storeName: sampleAffiliateConfig.storeName,
      associateStoreId: sampleAffiliateConfig.associateTag,
      apiStatus: sampleAffiliateConfig.apiStatus,
      enabled: sampleAffiliateConfig.connectionStatus !== 'not_configured',
      freshnessPriceHours: sampleAffiliateConfig.refreshPolicy.priceThresholdHours,
      freshnessAvailabilityHours: sampleAffiliateConfig.refreshPolicy.availabilityThresholdHours,
      connectionNotes: sampleAffiliateConfig.notes,
    },
  });
}

async function main() {
  await prisma.ensembleItem.deleteMany();
  await prisma.ensemble.deleteMany();
  await prisma.customerReview.deleteMany();
  await prisma.reviewSummary.deleteMany();
  await prisma.externalProductSignals.deleteMany();
  await prisma.productSourceHealth.deleteMany();
  await prisma.productVisibility.deleteMany();
  await prisma.productReviewState.deleteMany();
  await prisma.productPriceSnapshot.deleteMany();
  await prisma.productInferredData.deleteMany();
  await prisma.productNormalizedData.deleteMany();
  await prisma.productSourceData.deleteMany();
  await prisma.product.deleteMany();
  await prisma.affiliateConfig.deleteMany();

  await seedFixtureProducts();
  await seedManualAmazonProducts();
  await seedEnsembles();
  await seedAffiliateConfig();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
