import { requireAdmin } from '@/lib/auth/session';
import { AdminSectionShell } from '@/components/admin-section-shell';

export default async function ReportsAnalyticsPage() {
  await requireAdmin();
  return <AdminSectionShell title="Reports / Analytics" description="Deeper reporting beyond the dashboard's summary trends." bullets={['Dashboard stays summary-first while this route handles drilldowns.', 'Destination is wired now for coherent navigation.', 'Future exports and date-range analytics belong here.']} />;
}
