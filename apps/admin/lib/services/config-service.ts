import type { AffiliateConnectionConfig } from '@atelier/domain';
import { prisma } from '@/lib/db';
import { mapDbAffiliateConfig } from '@/lib/services/db-mappers';

export async function getAffiliateConfig(): Promise<AffiliateConnectionConfig> {
  const config = await prisma.affiliateConfig.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (!config) {
    throw new Error('Affiliate config record not found in local DB seed.');
  }

  return mapDbAffiliateConfig(config);
}
