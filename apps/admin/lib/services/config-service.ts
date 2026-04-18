import type { AffiliateConnectionConfig } from '@atelier/domain';
import { sampleAffiliateConfig } from '@/lib/sample-affiliate-config';

export function getAffiliateConfig(): AffiliateConnectionConfig {
  return sampleAffiliateConfig;
}
