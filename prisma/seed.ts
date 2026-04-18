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

function mapLegacyWorkflowToLifecycleReviewState(workflowState?: string | null) {
  if (workflowState === 'approved') return 'approved' as const;
  if (workflowState === 'hold') return 'hold' as const;
  if (workflowState === 'rejected') return 'rejected' as const;
  return 'pending' as const;
}

function mapLegacyWorkflowToLifecycleIngestState(workflowState?: string | null) {
  if (workflowState === 'stale' || workflowState === 'needs_refresh') return 'refresh_required' as const;
  return 'normalized' as const;
}

function buildPriceSnapshot(input: {
  productId: string;
  productSourceDataId: string;
  priceText?: string | null;
  capturedAt: Date;
  captureMethod: string;
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
    productSourceDataId: input.productSourceDataId,
    capturedAt: input.capturedAt,
    priceText: input.priceText,
    priceAmountCents: parsed.amountCents,
    currencyCode: parsed.currencyCode,
    captureMethod: input.captureMethod,
    notes: input.notes,
  };
}

async function seedFixtureProducts() {
  for (const fixture of productFixtures) {
    const staged = sampleStagedProducts.find((entry) => slugify(entry.normalized.title) === fixture.slug);
    const sourceDataId = `${fixture.id}-source`;

    await prisma.product.create({
      data: {
        id: fixture.id,
        slug: fixture.slug,
        sourceData: {
          create: {
            id: sourceDataId,
            sourcePlatform: staged?.source.sourcePlatform ?? 'fixture',
            ingestMethod: 'fixture_seed',
            sourceIdentifier: staged?.source.sourceIdentifier ?? fixture.id,
            canonicalUrl: undefined,
            affiliateUrl: undefined,
            retrievedAt: staged?.source.retrievedAt ? new Date(staged.source.retrievedAt) : retrievedAt,
            title: staged?.source.rawSnapshot?.title ?? fixture.name,
            categoryText: staged?.source.rawSnapshot?.category ?? fixture.facts.find((fact) => fact.label === 'Category')?.value,
            colorText: staged?.normalized.sourceColor ?? fixture.colorLabel,
            priceText: staged?.source.rawSnapshot?.price ?? fixture.priceLabel,
            availabilityText: staged?.source.rawSnapshot?.availability,
            rawSnapshotJson: JSON.stringify(staged?.source.rawSnapshot ?? { title: fixture.name, price: fixture.priceLabel }),
            sourceFieldMapJson: JSON.stringify(staged?.source.sourceFieldMap ?? { title: 'fixture.name', priceText: 'fixture.priceLabel' }),
          },
        },
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
        lifecycleState: {
          create: {
            id: `${fixture.id}-lifecycle`,
            ingestState: mapLegacyWorkflowToLifecycleIngestState(staged?.stagingStatus),
            reviewState: mapLegacyWorkflowToLifecycleReviewState(staged?.stagingStatus),
            previewState: 'none',
            publishState: 'unpublished',
            stateNotes: 'Fixture-seeded lifecycle state.',
            lastChangedAt: staged?.provenance.reviewedAt ? new Date(staged.provenance.reviewedAt) : retrievedAt,
            lastChangedBy: staged?.provenance.reviewedBy ?? 'seed',
          },
        },
        lifecycleAudits: {
          create: {
            id: `${fixture.id}-audit-seed`,
            action: 'seed_initialize',
            changedAt: staged?.provenance.reviewedAt ? new Date(staged.provenance.reviewedAt) : retrievedAt,
            changedBy: staged?.provenance.reviewedBy ?? 'seed',
            fromIngestState: mapLegacyWorkflowToLifecycleIngestState(staged?.stagingStatus),
            toIngestState: mapLegacyWorkflowToLifecycleIngestState(staged?.stagingStatus),
            fromReviewState: mapLegacyWorkflowToLifecycleReviewState(staged?.stagingStatus),
            toReviewState: mapLegacyWorkflowToLifecycleReviewState(staged?.stagingStatus),
            fromPreviewState: 'none',
            toPreviewState: 'none',
            fromPublishState: 'unpublished',
            toPublishState: 'unpublished',
            reason: 'Initial lifecycle state created by seed.',
          },
        },
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

    const seededPriceSnapshot = buildPriceSnapshot({
      productId: fixture.id,
      productSourceDataId: sourceDataId,
      priceText: staged?.source.rawSnapshot?.price ?? staged?.normalized.priceText ?? fixture.priceLabel ?? undefined,
      capturedAt: staged?.freshness.lastCheckedAt ? new Date(staged.freshness.lastCheckedAt) : retrievedAt,
      captureMethod: 'fixture_seed',
      notes: 'Initial fixture-seeded source price snapshot.',
    });

    if (seededPriceSnapshot) {
      await prisma.productPriceSnapshot.create({
        data: {
          ...seededPriceSnapshot,
          productId: fixture.id,
        },
      });
    }
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
        lifecycleState: {
          create: {
            id: `${productId}-lifecycle`,
            ingestState: 'manual_seeded',
            reviewState: 'pending',
            previewState: 'none',
            publishState: 'unpublished',
            stateNotes: 'Manual Amazon seed awaiting normalization and review.',
            lastChangedAt: retrievedAt,
            lastChangedBy: 'seed',
          },
        },
        lifecycleAudits: {
          create: {
            id: `${productId}-audit-seed`,
            action: 'seed_initialize',
            changedAt: retrievedAt,
            changedBy: 'seed',
            fromIngestState: 'manual_seeded',
            toIngestState: 'manual_seeded',
            fromReviewState: 'pending',
            toReviewState: 'pending',
            fromPreviewState: 'none',
            toPreviewState: 'none',
            fromPublishState: 'unpublished',
            toPublishState: 'unpublished',
            reason: 'Initial lifecycle state created by manual Amazon seed import.',
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
