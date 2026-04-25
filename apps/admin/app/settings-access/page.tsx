import { requireAdmin } from '@/lib/auth/session';
import { AdminSectionShell } from '@/components/admin-section-shell';

export default async function SettingsAccessPage() {
  await requireAdmin();
  return <AdminSectionShell title="Settings / Access Control" description="Admin preferences, access policy, and future role controls." bullets={['Wired into the admin structure now.', 'Natural destination for role and policy work.', 'Back-to-dashboard pattern is preserved.']} />;
}
