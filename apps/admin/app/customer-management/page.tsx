import { requireAdmin } from '@/lib/auth/session';
import { AdminSectionShell } from '@/components/admin-section-shell';

export default async function CustomerManagementPage() {
  await requireAdmin();
  return <AdminSectionShell title="Customer Management" description="Customer counts, new registrations, and support issues." bullets={['Customer list and issue triage anchor.', 'Connected from dashboard menu today.', 'Ready for customer detail and support tooling next.']} />;
}
