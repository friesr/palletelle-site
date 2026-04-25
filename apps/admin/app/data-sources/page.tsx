import { requireAdmin } from '@/lib/auth/session';
import { ManualSubmissionPanel } from '@/components/manual-submission-panel';
import { listRecentManualSubmissions } from '@/lib/services/manual-submission-service';

export default async function DataSourcesPage() {
  await requireAdmin();
  const recentSubmissions = await listRecentManualSubmissions();
  return <ManualSubmissionPanel recentSubmissions={recentSubmissions} />;
}
