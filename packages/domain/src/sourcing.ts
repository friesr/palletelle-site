export type SourcePlatform = 'amazon';

export type FreshnessStatus = 'fresh' | 'stale' | 'unknown';

export type StagingStatus =
  | 'discovered'
  | 'normalized'
  | 'needs_review'
  | 'hold'
  | 'approved'
  | 'rejected'
  | 'stale'
  | 'needs_refresh';

export type ReviewDecision = 'approve' | 'reject' | 'hold' | 'needs_refresh';

export interface ProductSource {
  sourcePlatform: SourcePlatform;
  sourceIdentifier: string;
  ingestMethod?: string;
  canonicalUrl?: string;
  affiliateUrl?: string;
  retrievedAt: string;
  sourceFieldMap: Record<string, string>;
  rawSnapshot?: Record<string, string | undefined>;
}

export interface ProductVisibilityState {
  isPublic: boolean;
  intendedActive: boolean;
  visibilityNotes?: string;
}

export interface ProductProvenance {
  normalizedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  dataConfidence: 'low' | 'medium' | 'high';
  confidenceReason: string;
  confidenceImprovement: string;
  missingAttributes: string[];
  uncertainAttributes: string[];
}

export interface FreshnessEntry {
  status: FreshnessStatus;
  checkedAt?: string;
  thresholdHours: number;
  reason: string;
}

export interface FreshnessState {
  priceFreshness: FreshnessEntry;
  availabilityFreshness: FreshnessEntry;
  lastCheckedAt?: string;
}

export interface NormalizedProductFields {
  title: string;
  brand?: string;
  category?: string;
  sourceColor?: string;
  material?: string;
  priceText?: string;
  availabilityText?: string;
}

export interface InferredProductFields {
  paletteFamily?: string;
  colorHarmony?: string;
  styleDirection?: string;
  styleOpinion?: string;
}

export interface SourcedProductRecord {
  id: string;
  source: ProductSource;
  normalized: NormalizedProductFields;
  inferred: InferredProductFields;
  provenance: ProductProvenance;
  freshness: FreshnessState;
  visibility: ProductVisibilityState;
  stagingStatus: StagingStatus;
}

export interface ReviewChecklist {
  hasSourceIdentifier: boolean;
  hasRetrievalTimestamp: boolean;
  hasFreshnessState: boolean;
  hasFactInferenceSeparation: boolean;
  hasConfidenceReason: boolean;
  hasMissingAttributesListed: boolean;
  hasUncertainAttributesListed: boolean;
  hasCriticalUncertainty: boolean;
}

export interface ReviewDecisionPayload {
  decision: ReviewDecision;
  reviewer: string;
  notes?: string;
  reviewedAt: string;
}

export interface ReviewValidationResult {
  valid: boolean;
  reasons: string[];
}

export function canDisplayPrice(product: SourcedProductRecord): boolean {
  return product.freshness.priceFreshness.status === 'fresh' && Boolean(product.normalized.priceText);
}

export function canDisplayAvailability(product: SourcedProductRecord): boolean {
  return product.freshness.availabilityFreshness.status === 'fresh' && Boolean(product.normalized.availabilityText);
}

export function requiresReview(product: SourcedProductRecord): boolean {
  return (
    product.stagingStatus !== 'approved' ||
    product.provenance.dataConfidence === 'low' ||
    product.provenance.uncertainAttributes.length > 0 ||
    product.freshness.priceFreshness.status !== 'fresh' ||
    product.freshness.availabilityFreshness.status !== 'fresh'
  );
}

export function isPublishable(product: SourcedProductRecord): boolean {
  return Boolean(
    product.source.sourceIdentifier &&
      product.source.retrievedAt &&
      product.provenance.confidenceReason &&
      product.freshness.priceFreshness.status &&
      product.freshness.availabilityFreshness.status &&
      !product.provenance.uncertainAttributes.includes('critical') &&
      product.stagingStatus === 'approved'
  );
}

export function validateReviewChecklist(product: SourcedProductRecord): ReviewChecklist {
  return {
    hasSourceIdentifier: Boolean(product.source.sourceIdentifier),
    hasRetrievalTimestamp: Boolean(product.source.retrievedAt),
    hasFreshnessState: Boolean(product.freshness.priceFreshness && product.freshness.availabilityFreshness),
    hasFactInferenceSeparation: true,
    hasConfidenceReason: Boolean(product.provenance.confidenceReason),
    hasMissingAttributesListed: Array.isArray(product.provenance.missingAttributes),
    hasUncertainAttributesListed: Array.isArray(product.provenance.uncertainAttributes),
    hasCriticalUncertainty: product.provenance.uncertainAttributes.includes('critical'),
  };
}

export function validateForReview(product: SourcedProductRecord): ReviewValidationResult {
  const checklist = validateReviewChecklist(product);
  const reasons = Object.entries(checklist)
    .filter(([key, value]) => key !== 'hasCriticalUncertainty' && value === false)
    .map(([key]) => key);

  if (checklist.hasCriticalUncertainty) {
    reasons.push('hasCriticalUncertainty');
  }

  return {
    valid: reasons.length === 0,
    reasons,
  };
}
