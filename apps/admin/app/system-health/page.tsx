import { requireAdmin } from '@/lib/auth/session';
import { SystemStatusPanel } from '@/components/system-status-panel';
import { getOperationalControlSurface } from '@/lib/services/system-status-service';

export default async function SystemHealthPage() {
  await requireAdmin();
  const status = await getOperationalControlSurface();
  return <SystemStatusPanel status={status} />;
}
