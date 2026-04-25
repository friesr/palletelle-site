import { requireAdmin } from '@/lib/auth/session';
import { AdminSectionShell } from '@/components/admin-section-shell';

export default async function CampaignsPage() {
  await requireAdmin();
  return <AdminSectionShell title="Campaigns / Promotions" description="Launch tracking, campaign planning, and daily promotion monitoring." bullets={['Menu route is wired from dashboard.', 'Daily summary can point here for campaigns starting today.', 'Future home for promotional operations.']} />;
}
