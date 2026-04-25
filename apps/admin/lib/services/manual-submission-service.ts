import { prisma } from '@/lib/db';
import { requireNonEmpty } from '@/lib/services/validators';
import { enrichQuickAddProduct } from '@/lib/services/quick-add-enrichment';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48) || `product-${Date.now()}`;
}

function getTrimmedValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function createOneManualSubmission(input: {
  sourceUrl: string;
  sourceIdentifier?: string;
  title?: string;
  notes?: string;
  submittedBy: string;
}) {
  requireNonEmpty(input.sourceUrl, 'Source URL');
  requireNonEmpty(input.submittedBy, 'Submitted by');

  const now = Date.now();
  const slugBase = slugify(input.title || input.sourceIdentifier || input.sourceUrl);
  const id = `manual-${now}-${Math.random().toString(36).slice(2, 6)}`;
  const slug = `${slugBase}-${String(now).slice(-6)}`;
  const sourceIdentifier = getTrimmedValue(input.sourceIdentifier) ?? input.sourceUrl;
  const title = getTrimmedValue(input.title) ?? sourceIdentifier;
  const notes = getTrimmedValue(input.notes);

  await prisma.product.create({
    data: {
      id,
      slug,
      sourceData: {
        create: {
          id: `${id}-source`,
          sourcePlatform: 'url_submission',
          ingestMethod: 'manual_url_submission',
          sourceIdentifier,
          canonicalUrl: input.sourceUrl,
          affiliateUrl: input.sourceUrl,
          retrievedAt: new Date(),
          title,
          rawSnapshotJson: JSON.stringify({
            title,
            canonicalUrl: input.sourceUrl,
            sourceNotes: notes,
            submittedBy: input.submittedBy,
            routedTo: 'Ada',
          }),
        },
      },
      normalizedData: {
        create: {
          id: `${id}-normalized`,
          title,
          summary: notes,
        },
      },
      inferredData: {
        create: {
          id: `${id}-inferred`,
          dataConfidence: 'low',
          confidenceReason: 'Quick-add URL submission is queued for Ada ingest and review.',
          confidenceImprovement: 'Capture source facts, normalize attributes, and run validation before approval.',
          missingAttributesJson: JSON.stringify(['brand', 'category', 'price', 'availability', 'images']),
          uncertainAttributesJson: JSON.stringify(['color', 'material', 'style direction']),
        },
      },
      reviewState: {
        create: {
          id: `${id}-review`,
          workflowState: 'discovered',
          reviewedBy: input.submittedBy,
          reviewerNotes: notes ?? 'Created from Ada quick-add URL submission.',
          reviewedAt: new Date(),
        },
      },
      lifecycleState: {
        create: {
          id: `${id}-lifecycle`,
          ingestState: 'manual_seeded',
          reviewState: 'pending',
          previewState: 'none',
          publishState: 'unpublished',
          stateNotes: 'Queued from admin dashboard quick-add.',
          lastChangedAt: new Date(),
          lastChangedBy: input.submittedBy,
        },
      },
      sourceHealth: {
        create: {
          id: `${id}-source-health`,
          sourceStatus: 'unknown',
          needsRevalidation: false,
          sourceCheckResult: 'Awaiting Ada ingest review.',
        },
      },
      visibility: {
        create: {
          id: `${id}-visibility`,
          isPublic: false,
          intendedActive: false,
          visibilityNotes: 'Awaiting review.',
          lastDisplayabilityCheckAt: new Date(),
        },
      },
    },
  });

  await enrichQuickAddProduct(id);

  return { id, slug };
}

export async function createManualSubmission(input: {
  sourceUrl: string;
  sourceIdentifier?: string;
  title?: string;
  notes?: string;
  submittedBy: string;
}) {
  return createOneManualSubmission(input);
}

export async function createManualSubmissions(input: {
  sourceUrls: string[];
  title?: string;
  notes?: string;
  submittedBy: string;
}) {
  const sourceUrls = input.sourceUrls.map((url) => url.trim()).filter(Boolean);
  requireNonEmpty(sourceUrls[0], 'Source URL');

  const created = [] as Array<{ id: string; slug: string }>;
  for (const sourceUrl of sourceUrls) {
    created.push(await createOneManualSubmission({
      sourceUrl,
      title: sourceUrls.length === 1 ? input.title : undefined,
      notes: input.notes,
      submittedBy: input.submittedBy,
    }));
  }
  return created;
}

export async function listRecentManualSubmissions() {
  return prisma.product.findMany({
    where: {
      sourceData: {
        some: {
          ingestMethod: 'manual_url_submission',
        },
      },
    },
    include: {
      sourceData: {
        orderBy: { retrievedAt: 'desc' },
        take: 1,
      },
      reviewState: true,
      normalizedData: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 12,
  });
}
