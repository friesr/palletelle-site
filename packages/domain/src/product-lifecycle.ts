import type { ExternalProductSignalsRecord, ProductSourceHealthRecord } from './product-db';

export type ProductIngestState = 'manual_seeded' | 'source_captured' | 'normalized' | 'refresh_required';
export type ProductReviewStatus = 'pending' | 'approved' | 'hold' | 'rejected';
export type ProductPreviewStatus = 'none' | 'admin_only' | 'dev_customer';
export type ProductPublishStatus = 'unpublished' | 'published' | 'withdrawn';
export type ProductLifecycleAction =
  | 'seed_initialize'
  | 'mark_source_captured'
  | 'mark_normalized'
  | 'approve_review'
  | 'hold_review'
  | 'reject_review'
  | 'reset_review'
  | 'enable_admin_preview'
  | 'enable_dev_preview'
  | 'disable_preview'
  | 'publish'
  | 'withdraw';

export interface ProductLifecycleStateRecord {
  productId: string;
  ingestState: ProductIngestState;
  reviewState: ProductReviewStatus;
  previewState: ProductPreviewStatus;
  publishState: ProductPublishStatus;
  stateNotes?: string;
  lastChangedAt?: string;
  lastChangedBy?: string;
}

export interface ProductLifecycleAuditRecord {
  productId: string;
  changedAt: string;
  changedBy: string;
  action: ProductLifecycleAction;
  fromIngestState: ProductIngestState;
  toIngestState: ProductIngestState;
  fromReviewState: ProductReviewStatus;
  toReviewState: ProductReviewStatus;
  fromPreviewState: ProductPreviewStatus;
  toPreviewState: ProductPreviewStatus;
  fromPublishState: ProductPublishStatus;
  toPublishState: ProductPublishStatus;
  reason?: string;
}

export interface ProductVisibilityDecision {
  mode: 'not_visible' | 'dev_preview' | 'published';
  adminPreviewVisible: boolean;
  devCustomerVisible: boolean;
  customerVisible: boolean;
  prodCustomerVisible: boolean;
  reasons: string[];
}

export interface LifecycleTransitionResult {
  valid: boolean;
  nextState?: ProductLifecycleStateRecord;
  reason?: string;
}

export interface LifecycleBatchTransitionResult {
  productId: string;
  ok: boolean;
  message: string;
  before: ProductLifecycleStateRecord;
  after?: ProductLifecycleStateRecord;
}

export function createInitialLifecycleState(input: {
  productId: string;
  ingestState?: ProductIngestState;
  reviewState?: ProductReviewStatus;
  previewState?: ProductPreviewStatus;
  publishState?: ProductPublishStatus;
  stateNotes?: string;
  lastChangedAt?: string;
  lastChangedBy?: string;
}): ProductLifecycleStateRecord {
  return {
    productId: input.productId,
    ingestState: input.ingestState ?? 'manual_seeded',
    reviewState: input.reviewState ?? 'pending',
    previewState: input.previewState ?? 'none',
    publishState: input.publishState ?? 'unpublished',
    stateNotes: input.stateNotes,
    lastChangedAt: input.lastChangedAt,
    lastChangedBy: input.lastChangedBy,
  };
}

export function deriveProductVisibilityDecision(input: {
  lifecycle: ProductLifecycleStateRecord;
  sourceHealth?: ProductSourceHealthRecord | null;
  externalSignals?: ExternalProductSignalsRecord | null;
  environment: 'development' | 'production';
}): ProductVisibilityDecision {
  const reasons: string[] = [];
  const adminPreviewVisible =
    input.lifecycle.previewState === 'admin_only' ||
    input.lifecycle.previewState === 'dev_customer' ||
    input.lifecycle.publishState === 'published';

  const devCustomerVisible =
    input.lifecycle.reviewState === 'approved' &&
    input.lifecycle.previewState === 'dev_customer' &&
    input.lifecycle.publishState !== 'withdrawn';

  const sourceHealth = input.sourceHealth;
  const externalSignals = input.externalSignals;

  const prodCustomerVisible =
    input.lifecycle.publishState === 'published' &&
    input.lifecycle.reviewState === 'approved' &&
    sourceHealth?.sourceStatus === 'active' &&
    !sourceHealth?.needsRevalidation &&
    externalSignals?.recommendation !== 'deactivate';

  const customerVisible = input.environment === 'production'
    ? prodCustomerVisible
    : prodCustomerVisible || devCustomerVisible;

  if (input.lifecycle.reviewState !== 'approved') {
    reasons.push('reviewNotApproved');
  }

  if (input.lifecycle.publishState === 'withdrawn') {
    reasons.push('publishWithdrawn');
  }

  if (input.environment === 'development' && !prodCustomerVisible && !devCustomerVisible) {
    reasons.push('devPreviewNotEnabled');
  }

  if (input.lifecycle.publishState !== 'published' && input.environment === 'production') {
    reasons.push('notPublished');
  }

  if (input.lifecycle.publishState === 'published' && sourceHealth?.sourceStatus !== 'active') {
    reasons.push('sourceNotActive');
  }

  if (input.lifecycle.publishState === 'published' && sourceHealth?.needsRevalidation) {
    reasons.push('needsRevalidation');
  }

  if (input.lifecycle.publishState === 'published' && externalSignals?.recommendation === 'deactivate') {
    reasons.push('externalDeactivateRecommendation');
  }

  return {
    mode: prodCustomerVisible ? 'published' : devCustomerVisible ? 'dev_preview' : 'not_visible',
    adminPreviewVisible,
    devCustomerVisible,
    customerVisible,
    prodCustomerVisible,
    reasons: Array.from(new Set(reasons)),
  };
}

export function applyLifecycleAction(input: {
  current: ProductLifecycleStateRecord;
  action: ProductLifecycleAction;
  changedAt: string;
  changedBy: string;
  reason?: string;
}): LifecycleTransitionResult {
  const next: ProductLifecycleStateRecord = {
    ...input.current,
    lastChangedAt: input.changedAt,
    lastChangedBy: input.changedBy,
    stateNotes: input.reason ?? input.current.stateNotes,
  };

  switch (input.action) {
    case 'mark_source_captured': {
      if (input.current.ingestState !== 'manual_seeded' && input.current.ingestState !== 'refresh_required') {
        return { valid: false, reason: 'Source capture is only valid from manual_seeded or refresh_required.' };
      }
      next.ingestState = 'source_captured';
      return { valid: true, nextState: next };
    }
    case 'mark_normalized': {
      if (input.current.ingestState !== 'source_captured' && input.current.ingestState !== 'refresh_required' && input.current.ingestState !== 'manual_seeded') {
        return { valid: false, reason: 'Normalization requires a captured or refresh-required product.' };
      }
      next.ingestState = 'normalized';
      return { valid: true, nextState: next };
    }
    case 'approve_review': {
      if (input.current.reviewState === 'rejected') {
        return { valid: false, reason: 'Rejected products must be reset before approval.' };
      }
      next.reviewState = 'approved';
      return { valid: true, nextState: next };
    }
    case 'hold_review': {
      if (input.current.reviewState === 'rejected') {
        return { valid: false, reason: 'Rejected products cannot move directly to hold.' };
      }
      next.reviewState = 'hold';
      next.previewState = 'none';
      if (next.publishState === 'published') next.publishState = 'withdrawn';
      return { valid: true, nextState: next };
    }
    case 'reject_review': {
      next.reviewState = 'rejected';
      next.previewState = 'none';
      if (next.publishState === 'published') next.publishState = 'withdrawn';
      return { valid: true, nextState: next };
    }
    case 'reset_review': {
      if (input.current.reviewState !== 'hold' && input.current.reviewState !== 'rejected') {
        return { valid: false, reason: 'Only held or rejected products can be reset to pending.' };
      }
      next.reviewState = 'pending';
      return { valid: true, nextState: next };
    }
    case 'enable_admin_preview': {
      if (input.current.reviewState === 'rejected') {
        return { valid: false, reason: 'Rejected products cannot enter admin preview.' };
      }
      next.previewState = 'admin_only';
      return { valid: true, nextState: next };
    }
    case 'enable_dev_preview': {
      if (input.current.reviewState !== 'approved') {
        return { valid: false, reason: 'Dev customer preview requires approved review state.' };
      }
      if (input.current.publishState === 'withdrawn') {
        return { valid: false, reason: 'Withdrawn products cannot enter dev customer preview.' };
      }
      next.previewState = 'dev_customer';
      return { valid: true, nextState: next };
    }
    case 'disable_preview': {
      next.previewState = 'none';
      return { valid: true, nextState: next };
    }
    case 'publish': {
      if (input.current.reviewState !== 'approved') {
        return { valid: false, reason: 'Publishing requires approved review state.' };
      }
      if (input.current.ingestState !== 'normalized') {
        return { valid: false, reason: 'Publishing requires normalized ingest state.' };
      }
      next.publishState = 'published';
      return { valid: true, nextState: next };
    }
    case 'withdraw': {
      if (input.current.publishState !== 'published') {
        return { valid: false, reason: 'Only published products can be withdrawn.' };
      }
      next.publishState = 'withdrawn';
      next.previewState = 'none';
      return { valid: true, nextState: next };
    }
    default:
      return { valid: false, reason: 'Unknown lifecycle action.' };
  }
}

export function buildLifecycleAuditRecord(input: {
  current: ProductLifecycleStateRecord;
  next: ProductLifecycleStateRecord;
  action: ProductLifecycleAction;
  changedAt: string;
  changedBy: string;
  reason?: string;
}): ProductLifecycleAuditRecord {
  return {
    productId: input.current.productId,
    changedAt: input.changedAt,
    changedBy: input.changedBy,
    action: input.action,
    fromIngestState: input.current.ingestState,
    toIngestState: input.next.ingestState,
    fromReviewState: input.current.reviewState,
    toReviewState: input.next.reviewState,
    fromPreviewState: input.current.previewState,
    toPreviewState: input.next.previewState,
    fromPublishState: input.current.publishState,
    toPublishState: input.next.publishState,
    reason: input.reason,
  };
}

export function applyLifecycleActionBatch(input: {
  items: ProductLifecycleStateRecord[];
  action: ProductLifecycleAction;
  changedAt: string;
  changedBy: string;
  reason?: string;
}): LifecycleBatchTransitionResult[] {
  return input.items.map((current) => {
    const result = applyLifecycleAction({
      current,
      action: input.action,
      changedAt: input.changedAt,
      changedBy: input.changedBy,
      reason: input.reason,
    });

    return result.valid && result.nextState
      ? {
          productId: current.productId,
          ok: true,
          message: 'Lifecycle updated.',
          before: current,
          after: result.nextState,
        }
      : {
          productId: current.productId,
          ok: false,
          message: result.reason ?? 'Invalid lifecycle transition.',
          before: current,
        };
  });
}
