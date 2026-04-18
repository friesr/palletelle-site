import { AffiliateConfigPanel } from '@/components/affiliate-config-panel';
import { requireAdmin } from '@/lib/auth/session';
import { getAffiliateConfig } from '@/lib/services/config-service';

export default async function AdminConfigPage() {
  await requireAdmin();
  const config = await getAffiliateConfig();

  return <AffiliateConfigPanel config={config} />;
}
