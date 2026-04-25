'use client';

import { TrendPanel } from '@/components/trend-panel';
import { DistributionPanel } from '@/components/distribution-panel';
import type { AdminDashboardData } from '@/lib/services/dashboard-service';

export function AdminDashboardCharts({ dashboard }: { dashboard: AdminDashboardData }) {
  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
      {dashboard.trendPanels.map((panel) => (
        <TrendPanel key={panel.id} panel={panel} />
      ))}
      <DistributionPanel panel={dashboard.distributionPanel} />
    </div>
  );
}
