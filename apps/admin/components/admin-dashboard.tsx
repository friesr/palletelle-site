import { AdminCommandCenter } from '@/components/admin-command-center';
import type { AdminDashboardData } from '@/lib/services/dashboard-service';

export function AdminDashboard({ dashboard }: { dashboard: AdminDashboardData }) {
  return <AdminCommandCenter dashboard={dashboard} />;
}
