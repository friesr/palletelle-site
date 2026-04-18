export type ProductWorkflowState =
  | 'discovered'
  | 'normalized'
  | 'needs_review'
  | 'hold'
  | 'approved'
  | 'rejected'
  | 'stale'
  | 'needs_refresh';

export type SourceStatus = 'unknown' | 'active' | 'inactive' | 'unavailable' | 'changed';
export type ExternalReputationState = 'unknown' | 'healthy' | 'caution' | 'at_risk';
export type ExternalRecommendation = 'none' | 'hold' | 'deactivate' | 'needs_review';

export interface ProductIdentityRecord {
  id: string;
  slug: string;
}

export interface ProductSourceDataRecord {
  productId: string;
  sourcePlatform: string;
  sourceIdentifier: string;
  canonicalUrl?: string;
  retrievedAt: string;
  title?: string;
  categoryText?: string;
  colorText?: string;
  priceText?: string;
  availabilityText?: string;
  rawSnapshotJson?: string;
  sourceFieldMapJson?: string;
}

export interface ProductNormalizedDataRecord {
  productId: string;
  title: string;
  brand?: string;
  category?: string;
  sourceColor?: string;
  material?: string;
  priceText?: string;
  availabilityText?: string;
  summary?: string;
}

export interface ProductInferredDataRecord {
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
}

export interface ProductReviewStateRecord {
  productId: string;
  workflowState: ProductWorkflowState;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerNotes?: string;
}

export interface ProductVisibilityRecord {
  productId: string;
  isPublic: boolean;
  intendedActive: boolean;
  visibilityNotes?: string;
  lastDisplayabilityCheckAt?: string;
}

export interface ProductSourceHealthRecord {
  productId: string;
  sourceStatus: SourceStatus;
  lastSourceCheckAt?: string;
  sourceCheckResult?: string;
  needsRevalidation: boolean;
  revalidationReason?: string;
}

export interface ExternalProductSignalsRecord {
  productId: string;
  reputationState: ExternalReputationState;
  lastExternalCheckAt?: string;
  repeatedComplaintPattern: boolean;
  lowRatingRisk: boolean;
  recommendation: ExternalRecommendation;
  notes?: string;
}

export interface ProductDisplayabilityAssessment {
  isDisplayable: boolean;
  reasons: string[];
}

export function assessProductDisplayability(input: {
  visibility: ProductVisibilityRecord;
  reviewState: ProductReviewStateRecord;
  sourceHealth: ProductSourceHealthRecord;
  externalSignals: ExternalProductSignalsRecord;
}): ProductDisplayabilityAssessment {
  const reasons: string[] = [];

  if (!input.visibility.isPublic || !input.visibility.intendedActive) {
    reasons.push('notPubliclyEnabled');
  }

  if (input.reviewState.workflowState !== 'approved') {
    reasons.push('reviewNotApproved');
  }

  if (input.sourceHealth.sourceStatus !== 'active') {
    reasons.push('sourceNotActive');
  }

  if (input.sourceHealth.needsRevalidation) {
    reasons.push('needsRevalidation');
  }

  if (input.externalSignals.recommendation === 'deactivate') {
    reasons.push('externalDeactivateRecommendation');
  }

  return {
    isDisplayable: reasons.length === 0,
    reasons,
  };
}
