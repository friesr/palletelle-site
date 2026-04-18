import type { AffiliateConnectionConfig } from '@atelier/domain';

export const sampleAffiliateConfig: AffiliateConnectionConfig = {
  id: 'cfg-1',
  storeName: 'Palletelle',
  affiliatePlatform: 'amazon',
  associateTag: 'palletelle-20',
  apiStatus: 'placeholder_only',
  connectionStatus: 'configured_locally',
  credentialsState: 'placeholder_local_only',
  refreshPolicy: {
    priceThresholdHours: 24,
    availabilityThresholdHours: 12,
    note: 'Local placeholder policy only. No live affiliate API connection is active.',
  },
  lastReviewedAt: '2026-04-18T12:00:00Z',
  notes: 'Use local-only configuration scaffolding until a reviewed integration path is approved.',
};
