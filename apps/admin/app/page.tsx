import { requireAdmin } from '@/lib/auth/session';
import { LaunchControlBoard } from '@/components/launch-control-board';

export const dynamic = 'force-dynamic';

export default async function AdminHomePage() {
  await requireAdmin();
  return <LaunchControlBoard />;
}
