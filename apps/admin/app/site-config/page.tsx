import { requireAdmin } from '@/lib/auth/session';
import { AdminSectionShell } from '@/components/admin-section-shell';

export default async function SiteConfigSectionPage() {
  await requireAdmin();
  return <AdminSectionShell title="Site Config" description="Storefront presentation, content, and merchandising configuration." bullets={[
    'Landing place for storefront settings separate from affiliate wiring.',
    'Keeps the admin IA aligned with the command dashboard menu.',
    'Can absorb existing /config/site forms next without changing dashboard navigation.'
  ]} />;
}
