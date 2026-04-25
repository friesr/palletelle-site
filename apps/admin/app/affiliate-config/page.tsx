import { requireAdmin } from '@/lib/auth/session';
import { AffiliateConfigPanel } from '@/components/affiliate-config-panel';
import { getAffiliateConfig } from '@/lib/services/config-service';

export default async function AffiliateConfigSectionPage() {
  await requireAdmin();
  const config = await getAffiliateConfig();
  return <AffiliateConfigPanel config={config} />;
}
