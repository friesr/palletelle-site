export type AffiliatePlatform = 'amazon';
export type ConnectionStatus = 'not_configured' | 'configured_locally' | 'needs_review' | 'disconnected';

export interface FreshnessPolicyConfig {
  priceThresholdHours: number;
  availabilityThresholdHours: number;
  note: string;
}

export interface AffiliateConnectionConfig {
  id: string;
  storeName: string;
  affiliatePlatform: AffiliatePlatform;
  associateTag?: string;
  apiStatus: 'not_connected' | 'placeholder_only' | 'future_api';
  connectionStatus: ConnectionStatus;
  credentialsState: 'not_stored' | 'placeholder_local_only';
  refreshPolicy: FreshnessPolicyConfig;
  lastReviewedAt?: string;
  notes?: string;
}
