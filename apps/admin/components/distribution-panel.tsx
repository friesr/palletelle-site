'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { AdminDashboardData } from '@/lib/services/dashboard-service';

export function DistributionPanel({ panel }: { panel: AdminDashboardData['distributionPanel'] }) {
  return (
    <section style={cardStyle}>
      <p style={eyebrowStyle}>Distribution</p>
      <h3 style={{ margin: '4px 0', fontSize: 18 }}>{panel.title}</h3>
      <p style={mutedStyle}>{panel.description}</p>
      <div style={{ width: '100%', height: 150 }}>
        <ResponsiveContainer>
          <BarChart data={panel.buckets}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} width={24} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.18)', background: '#020617', color: '#e2e8f0' }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {panel.buckets.map((bucket) => <Cell key={bucket.label} fill={bucket.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

const cardStyle: React.CSSProperties = { background: 'var(--panel-strong)', border: '1px solid var(--border)', borderRadius: 18, padding: 14, display: 'grid', gap: 10 };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' };
const mutedStyle: React.CSSProperties = { margin: 0, color: 'var(--muted)', fontSize: 13 };
