'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { DashboardTrendPanel, Tone } from '@/lib/services/dashboard-service';

export function TrendPanel({ panel }: { panel: DashboardTrendPanel }) {
  return (
    <section style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div>
          <p style={eyebrowStyle}>Trend</p>
          <h3 style={{ margin: '6px 0 2px', fontSize: 18 }}>{panel.title}</h3>
          <p style={mutedStyle}>{panel.description}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <strong>{panel.currentValue}</strong>
          <p style={mutedStyle}>{panel.delta}</p>
        </div>
      </div>
      <div style={{ width: '100%', height: 150 }}>
        <ResponsiveContainer>
          <LineChart data={panel.points7d}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} width={24} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.18)', background: '#020617', color: '#e2e8f0' }} />
            <Line dataKey="value" type="monotone" stroke={toneStroke[panel.tone]} strokeWidth={3} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {panel.annotations?.length ? <p style={mutedStyle}>{panel.annotations[0]}</p> : null}
    </section>
  );
}

const cardStyle: React.CSSProperties = { background: 'var(--panel-strong)', border: '1px solid var(--border)', borderRadius: 18, padding: 14, display: 'grid', gap: 10 };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' };
const mutedStyle: React.CSSProperties = { margin: 0, color: 'var(--muted)', fontSize: 13, lineHeight: 1.4 };
const toneStroke: Record<Tone, string> = { healthy: '#22c55e', watch: '#f59e0b', critical: '#ef4444', neutral: '#94a3b8' };
