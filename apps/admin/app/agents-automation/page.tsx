import { requireAdmin } from '@/lib/auth/session';
import { AdminSectionShell } from '@/components/admin-section-shell';

export default async function AgentsAutomationPage() {
  await requireAdmin();
  return <AdminSectionShell title="Agents / Automation" description="Agent ownership, automation queues, and operational delegation." bullets={['Natural drilldown from the dashboard agent health panel.', 'Supports future agent-specific activity logs and controls.', 'Keeps Titus, Hank, Ada, and others grouped coherently.']} />;
}
