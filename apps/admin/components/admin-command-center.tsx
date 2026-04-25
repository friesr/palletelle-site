'use client';

import Link from 'next/link';
import { QuickAddProductCard } from '@/components/quick-add-product-card';
import { StatusTiles } from '@/components/status-tiles';
import { TrendPanel } from '@/components/trend-panel';
import { DistributionPanel } from '@/components/distribution-panel';
import { AlertsList } from '@/components/alerts-list';
import { AgentInboxPanel } from '@/components/agent-inbox-panel';
import { TeamApprovalOverview } from '@/components/team-approval-overview';
import { HankDailySummary } from '@/components/hank-daily-summary';
import type { AdminDashboardData } from '@/lib/services/dashboard-service';

export function AdminCommandCenter({ dashboard }: { dashboard: AdminDashboardData }) {
  return (
    <div style={shellStyle}>
      <section style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Admin command dashboard</p>
          <h2 style={{ margin: '6px 0 8px', fontSize: 34 }}>Operational command center</h2>
          <p style={mutedStyle}>Last refresh {dashboard.lastUpdatedAt}</p>
        </div>
        <div style={ctaRowStyle}>
          <Link href="#ada-quick-add" style={primaryActionStyle}>Quick Add Product</Link>
          <Link href="/products" style={secondaryActionStyle}>Open Reviews</Link>
        </div>
      </section>

      <StatusTiles tiles={dashboard.tiles} />

      <section style={kpiGridStyle}>
        {dashboard.kpis.map((kpi) => (
          <article key={kpi.label} style={kpiCardStyle}>
            <p style={eyebrowStyle}>{kpi.label}</p>
            <h3 style={{ margin: '6px 0', fontSize: 24 }}>{kpi.value}</h3>
            <p style={mutedStyle}>{kpi.delta}</p>
          </article>
        ))}
      </section>

      <section style={desktopGridStyle}>
        <div style={mainColumnStyle}>
          <div style={trendGridStyle}>
            {dashboard.trendPanels.map((panel) => (
              <TrendPanel key={panel.id} panel={panel} />
            ))}
            <DistributionPanel panel={dashboard.distributionPanel} />
          </div>

          <div style={lowerGridStyle}>
            <AlertsList alerts={dashboard.alerts} />
            <AgentInboxPanel items={dashboard.agentInbox} />
            <TeamApprovalOverview overview={dashboard.teamApprovalOverview} />
          </div>
        </div>

        <aside style={railStyle}>
          <HankDailySummary summary={dashboard.hankDailySummary} />
          <QuickAddProductCard quickAddState={dashboard.quickAddState} />
          <section style={panelStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <p style={eyebrowStyle}>Health snapshot</p>
                <h3 style={{ margin: '6px 0 0', fontSize: 18 }}>Systems and agents</h3>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={miniStatStyle}><strong>Server</strong><span>{dashboard.healthSummary.server}</span></div>
              <div style={miniStatStyle}><strong>Database</strong><span>{dashboard.healthSummary.database}</span></div>
              <div style={miniStatStyle}><strong>API</strong><span>{dashboard.healthSummary.api}</span></div>
              <div style={miniStatStyle}><strong>Queue</strong><span>{dashboard.healthSummary.queue}</span></div>
            </div>
          </section>
          <section style={panelStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <p style={eyebrowStyle}>Menu</p>
                <h3 style={{ margin: '6px 0 0', fontSize: 18 }}>Admin sections</h3>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {dashboard.destinations.map((destination) => (
                <Link key={destination.href} href={destination.href} style={destinationStyle}>
                  <div>
                    <strong>{destination.label}</strong>
                    <p style={{ ...mutedStyle, marginTop: 4 }}>{destination.detail}</p>
                  </div>
                  {destination.badge ? <span style={badgeStyle}>{destination.badge}</span> : null}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

const shellStyle: React.CSSProperties = { display: 'grid', gap: 16 };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap', background: 'linear-gradient(135deg, #081120 0%, #0f2748 100%)', color: '#f8fafc', borderRadius: 24, padding: 20, border: '1px solid rgba(148,163,184,0.18)' };
const ctaRowStyle: React.CSSProperties = { display: 'flex', gap: 10, flexWrap: 'wrap' };
const primaryActionStyle: React.CSSProperties = { padding: '11px 14px', borderRadius: 999, background: '#f8fafc', color: '#0f172a', fontWeight: 700 };
const secondaryActionStyle: React.CSSProperties = { padding: '11px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' };
const desktopGridStyle: React.CSSProperties = { display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 2.2fr) minmax(320px, 1fr)', alignItems: 'start' };
const mainColumnStyle: React.CSSProperties = { display: 'grid', gap: 16 };
const trendGridStyle: React.CSSProperties = { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' };
const lowerGridStyle: React.CSSProperties = { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' };
const railStyle: React.CSSProperties = { display: 'grid', gap: 12 };
const panelStyle: React.CSSProperties = { background: 'var(--panel-strong)', border: '1px solid var(--border)', borderRadius: 20, padding: 16, display: 'grid', gap: 14, minHeight: 0 };
const sectionHeaderStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' };
const kpiGridStyle: React.CSSProperties = { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' };
const kpiCardStyle: React.CSSProperties = { background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 18, padding: 14 };
const miniStatStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, color: 'var(--muted)' };
const destinationStyle: React.CSSProperties = { border: '1px solid var(--border)', borderRadius: 14, padding: 12, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', background: 'var(--subtle-panel)' };
const badgeStyle: React.CSSProperties = { fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', borderRadius: 999, padding: '4px 8px', background: 'rgba(245,158,11,0.14)', color: '#f59e0b', whiteSpace: 'nowrap' };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' };
const mutedStyle: React.CSSProperties = { margin: 0, color: 'var(--muted)', fontSize: 13, lineHeight: 1.4 };
