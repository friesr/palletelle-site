import type { AffiliateConnectionConfig } from '@atelier/domain';
import { prisma } from '@/lib/db';
import { mapDbAffiliateConfig } from '@/lib/services/db-mappers';
import { optionalText, requireEnumValue, requireNonEmpty, requireNonNegativeInteger } from '@/lib/services/validators';

export async function getAffiliateConfig(): Promise<AffiliateConnectionConfig> {
  const config = await prisma.affiliateConfig.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (!config) {
    throw new Error('Affiliate config record not found in local DB seed.');
  }

  return mapDbAffiliateConfig(config);
}

const apiStatuses = ['not_connected', 'placeholder_only', 'future_api'] as const;
const platforms = ['amazon'] as const;

export async function updateAffiliateConfig(input: {
  id: string;
  storeName: string;
  associateStoreId?: string;
  platform: string;
  apiStatus: string;
  enabled: boolean;
  freshnessPriceHours: number;
  freshnessAvailabilityHours: number;
  connectionNotes?: string;
}) {
  requireNonEmpty(input.id, 'Affiliate config id');
  requireNonEmpty(input.storeName, 'Store name');
  const platform = requireEnumValue(input.platform, platforms, 'Platform');
  const apiStatus = requireEnumValue(input.apiStatus, apiStatuses, 'API status');
  requireNonNegativeInteger(input.freshnessPriceHours, 'Price freshness threshold');
  requireNonNegativeInteger(input.freshnessAvailabilityHours, 'Availability freshness threshold');

  await prisma.affiliateConfig.update({
    where: { id: input.id },
    data: {
      storeName: input.storeName,
      associateStoreId: optionalText(input.associateStoreId),
      platform,
      apiStatus,
      enabled: input.enabled,
      freshnessPriceHours: input.freshnessPriceHours,
      freshnessAvailabilityHours: input.freshnessAvailabilityHours,
      connectionNotes: optionalText(input.connectionNotes),
    },
  });
}
