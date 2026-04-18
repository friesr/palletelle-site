import { describe, expect, it } from 'vitest';
import type { AffiliateConnectionConfig } from './admin-config';

describe('admin affiliate config scaffolding', () => {
  it('supports local placeholder affiliate configuration', () => {
    const config: AffiliateConnectionConfig = {
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
        note: 'Fixture-only policy until live integration is approved.',
      },
    };

    expect(config.affiliatePlatform).toBe('amazon');
    expect(config.refreshPolicy.priceThresholdHours).toBe(24);
  });
});
