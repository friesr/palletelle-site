import { PrismaClient } from '@prisma/client';
import productFixtures from '../data/fixtures/products.json' with { type: 'json' };
import { sampleStagedProducts } from '../apps/admin/lib/sample-staged-products';
import { sampleEnsembleDefinitions } from '../apps/admin/lib/sample-ensemble-definitions';
import { sampleAffiliateConfig } from '../apps/admin/lib/sample-affiliate-config';

const prisma = new PrismaClient();

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
  await prisma.productInferredData.deleteMany();
  await prisma.productNormalizedData.deleteMany();
  await prisma.productSourceData.deleteMany();
  await prisma.product.deleteMany();
  await prisma.affiliateConfig.deleteMany();

  for (const fixture of productFixtures) {
    const staged = sampleStagedProducts.find((entry) => slugify(entry.normalized.title) === fixture.slug);

    await prisma.product.create({
      data: {
        id: fixture.id,
        slug: fixture.slug,
        sourceData: staged
          ? {
              create: {
                id: `${fixture.id}-source`,
                sourcePlatform: staged.source.sourcePlatform,
                sourceIdentifier: staged.source.sourceIdentifier,
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

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
