import { requireAdmin } from '@/lib/auth/session';
import { AdminSectionShell } from '@/components/admin-section-shell';

export default async function ContentPagesPage() {
  await requireAdmin();
  return <AdminSectionShell title="Content / Pages" description="Admin-managed editorial and operational content surfaces." bullets={['Ready for storefront copy and page management.', 'Linked cleanly from the command dashboard.', 'Keeps content operations distinct from site config.']} />;
}
