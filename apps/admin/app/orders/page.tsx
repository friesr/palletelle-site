import { requireAdmin } from '@/lib/auth/session';
import { AdminSectionShell } from '@/components/admin-section-shell';

export default async function OrdersPage() {
  await requireAdmin();
  return <AdminSectionShell title="Orders" description="Order operations section, wired now with placeholders until live order data exists." bullets={['Route is live in admin navigation.', 'Explicit placeholder for future live revenue and conversion data.', 'Keeps operational IA coherent without fake metrics.']} />;
}
