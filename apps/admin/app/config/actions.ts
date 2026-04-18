'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { updateAffiliateConfig } from '@/lib/services/config-service';

function getTrimmedString(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? '';
}

export async function updateAffiliateConfigAction(formData: FormData) {
  await requireAdmin();

  await updateAffiliateConfig({
    id: getTrimmedString(formData, 'id'),
    storeName: getTrimmedString(formData, 'storeName'),
    associateStoreId: getTrimmedString(formData, 'associateStoreId') || undefined,
    platform: getTrimmedString(formData, 'platform'),
    apiStatus: getTrimmedString(formData, 'apiStatus'),
    enabled: formData.get('enabled')?.toString() === 'true',
    freshnessPriceHours: Number(getTrimmedString(formData, 'freshnessPriceHours')),
    freshnessAvailabilityHours: Number(getTrimmedString(formData, 'freshnessAvailabilityHours')),
    connectionNotes: getTrimmedString(formData, 'connectionNotes') || undefined,
  });

  revalidatePath('/config');
}
