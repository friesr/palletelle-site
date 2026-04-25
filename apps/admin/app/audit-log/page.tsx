import { requireAdmin } from '@/lib/auth/session';
import { AdminSectionShell } from '@/components/admin-section-shell';

export default async function AuditLogPage() {
  await requireAdmin();
  return <AdminSectionShell title="Audit / Activity Log" description="Operational history, approval trails, and activity review." bullets={['Dedicated place for review and admin auditability.', 'Linked from escalation-related dashboard modules.', 'Can absorb lifecycle audits and action history next.']} />;
}
