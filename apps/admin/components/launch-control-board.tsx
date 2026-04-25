'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

type PipelinePayload = {
  generatedAt: string;
  kpis: {
    totalProducts: number;
    publishedProducts: number;
    ingested24h: number;
    published24h: number;
    errorCount: number;
    stuckCount: number;
  };
  trends: {
    newProducts24h: number;
    newProducts30d: Array<{ label: string; value: number }>;
  };
  pipeline: Array<{ status: string; count: number; oldestAge: string }>;
  hankBrief: { summary: string; blockers: string[]; nextActions: string[] };
  quickAddState: {
    recentSubmissions: Array<{ id: string; title: string; url: string; status: string; submittedAt: string }>;
    recentResults: Array<{ id: string; title: string; status: string; note: string; href: string }>;
  };
  lastPublishedAt: string | null;
};

type AgentCard = {
  name: string;
  role: string;
  model: string;
  module: string;
  status: 'running' | 'stopped' | 'degraded';
  lastHeartbeat: string | null;
  lastAction: string;
  timeoutState: string;
  errorState?: string;
};

type AgentsPayload = {
  generatedAt: string;
  agents: AgentCard[];
};

type HealthPayload = {
  checkedAt: string;
  system: { cpuUsagePercent: number; memoryUsagePercent: number; uptime: string; loadAverage: string };
  database: { connectionStatus: string; queryLatencyMs: number | null; lastWriteTimestamp: string | null; status: string; errorState?: string };
};

function formatTime(value: string | null) {
  if (!value) return 'n/a';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }) + ' UTC';
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 18, padding: 14, minWidth: 0 }}>
      <div style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{value}</div>
    </div>
  );
}

function statusTone(status: 'running' | 'stopped' | 'degraded') {
  if (status === 'running') return '#86efac';
  if (status === 'degraded') return '#fcd34d';
  return '#fca5a5';
}

export function LaunchControlBoard() {
  const [pipeline, setPipeline] = useState<PipelinePayload | null>(null);
  const [agents, setAgents] = useState<AgentsPayload | null>(null);
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [sourceUrlsText, setSourceUrlsText] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const [pipelineRes, healthRes, agentsRes] = await Promise.all([
      fetch('/api/commerce/pipeline_status', { cache: 'no-store' }),
      fetch('/api/system/health', { cache: 'no-store' }),
      fetch('/api/agents/status', { cache: 'no-store' }),
    ]);

    if (!pipelineRes.ok || !healthRes.ok || !agentsRes.ok) {
      throw new Error('Failed to load dashboard data.');
    }

    const [pipelineJson, healthJson, agentsJson] = await Promise.all([pipelineRes.json(), healthRes.json(), agentsRes.json()]);
    setPipeline(pipelineJson);
    setHealth(healthJson);
    setAgents(agentsJson);
  }, []);

  useEffect(() => {
    load().catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Load failed'));
    const timer = window.setInterval(() => {
      load().catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Load failed'));
    }, 60000);
    return () => window.clearInterval(timer);
  }, [load]);

  const generatedAt = useMemo(() => pipeline?.generatedAt ?? agents?.generatedAt ?? health?.checkedAt ?? null, [agents?.generatedAt, health?.checkedAt, pipeline?.generatedAt]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sourceUrlsText.trim()) return;
    setBusy(true);
    setSubmitState(null);
    setError(null);

    try {
      const response = await fetch('/api/commerce/quick_add', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sourceUrlsText, title, notes }),
      });

      if (!response.ok) {
        throw new Error('Quick add failed.');
      }

      const payload = await response.json();
      setSourceUrlsText('');
      setTitle('');
      setNotes('');
      setSubmitState(`${payload.createdCount ?? 1} URL${payload.createdCount === 1 ? '' : 's'} queued for Ada.`);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Quick add failed');
    } finally {
      setBusy(false);
    }
  }

  const realAgents = agents?.agents ?? [];
  const runningAgents = realAgents.filter((agent) => agent.status === 'running').length;
  const degradedAgents = realAgents.filter((agent) => agent.status === 'degraded').length;
  const stoppedAgents = realAgents.filter((agent) => agent.status === 'stopped').length;

  return (
    <section className="launch-board" style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin root</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>KPI and system health dashboard</div>
          <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>Updated {generatedAt ? formatTime(generatedAt) : 'loading...'}</div>
        </div>
        {error ? <div style={{ color: '#fca5a5', fontSize: 13 }}>{error}</div> : null}
      </div>

      <div className="launch-board-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 12 }}>
        <MetricCard label="Total products" value={pipeline?.kpis.totalProducts ?? 0} />
        <MetricCard label="Published products" value={pipeline?.kpis.publishedProducts ?? 0} />
        <MetricCard label="Ingested 24h" value={pipeline?.kpis.ingested24h ?? 0} />
        <MetricCard label="Published 24h" value={pipeline?.kpis.published24h ?? 0} />
        <MetricCard label="Error count" value={pipeline?.kpis.errorCount ?? 0} />
        <MetricCard label="Stuck count" value={pipeline?.kpis.stuckCount ?? 0} />
      </div>

      <div className="launch-board-main" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(360px, 1fr)', gap: 14, minHeight: 0 }}>
        <div style={{ display: 'grid', gap: 14, minHeight: 0 }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 20, padding: 16, minHeight: 0, overflow: 'auto' }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Real pipeline health</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ color: 'var(--muted)', textAlign: 'left' }}>
                  <th style={{ padding: '0 0 10px' }}>Workflow state</th>
                  <th style={{ padding: '0 0 10px' }}>Count</th>
                  <th style={{ padding: '0 0 10px' }}>Oldest age</th>
                </tr>
              </thead>
              <tbody>
                {(pipeline?.pipeline ?? []).map((row) => (
                  <tr key={row.status} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 0' }}>{row.status}</td>
                    <td style={{ padding: '12px 0' }}>{row.count}</td>
                    <td style={{ padding: '12px 0' }}>{row.oldestAge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>New products</div>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{pipeline?.trends.newProducts24h ?? 0}</div>
                <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Last 24 hours</div>
              </div>
              <div style={{ textAlign: 'right', color: 'var(--muted)', fontSize: 13 }}>30 day history trend</div>
            </div>
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer>
                <LineChart data={pipeline?.trends.newProducts30d ?? []}>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} minTickGap={16} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} width={24} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.18)', background: '#020617', color: '#e2e8f0' }} />
                  <Line dataKey="value" type="monotone" stroke="#60a5fa" strokeWidth={3} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Database health</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{health?.database.connectionStatus ?? 'loading...'}</div>
              <div style={{ marginTop: 8, color: 'var(--muted)', fontSize: 13 }}>
                Latency {health?.database.queryLatencyMs !== null && health?.database.queryLatencyMs !== undefined ? `${health.database.queryLatencyMs}ms` : 'n/a'}
              </div>
              <div style={{ marginTop: 8, color: 'var(--muted)', fontSize: 13 }}>Last write {formatTime(health?.database.lastWriteTimestamp ?? null)}</div>
              {health?.database.errorState ? <div style={{ marginTop: 10, color: '#fca5a5', fontSize: 13 }}>{health.database.errorState}</div> : null}
            </div>

            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>System health</div>
              <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
                <div>CPU {health ? `${health.system.cpuUsagePercent.toFixed(0)}%` : 'loading...'}</div>
                <div>Memory {health ? `${health.system.memoryUsagePercent.toFixed(0)}%` : 'loading...'}</div>
                <div>Load {health?.system.loadAverage ?? 'loading...'}</div>
                <div>Uptime {health?.system.uptime ?? 'loading...'}</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 20, padding: 16, overflow: 'auto' }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Backlog blockers and next actions</div>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>{pipeline?.hankBrief.summary ?? 'Loading summary...'}</div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Blockers</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {(pipeline?.hankBrief.blockers?.length ? pipeline.hankBrief.blockers : ['No active blockers detected.']).map((item) => <li key={item} style={{ marginBottom: 6 }}>{item}</li>)}
              </ul>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Next actions</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {(pipeline?.hankBrief.nextActions ?? []).map((item) => <li key={item} style={{ marginBottom: 6 }}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 14, minHeight: 0 }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Real agent status</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, fontSize: 12, color: 'var(--muted)' }}>
              <span>{runningAgents} running</span>
              <span>{degradedAgents} degraded</span>
              <span>{stoppedAgents} stopped</span>
            </div>
            <div style={{ display: 'grid', gap: 10, maxHeight: 420, overflow: 'auto' }}>
              {realAgents.map((agent) => (
                <div key={agent.name} style={{ display: 'grid', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{agent.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>{agent.role}</div>
                    </div>
                    <div style={{ color: statusTone(agent.status), textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.08em' }}>{agent.status}</div>
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: 12 }}>Last heartbeat {formatTime(agent.lastHeartbeat)}</div>
                  <div style={{ fontSize: 13 }}>{agent.lastAction}</div>
                  {agent.errorState ? <div style={{ color: '#fca5a5', fontSize: 12 }}>{agent.errorState}</div> : null}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Ada quick-add product URL intake</div>
            <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
              <textarea value={sourceUrlsText} onChange={(event) => setSourceUrlsText(event.target.value)} rows={6} placeholder="Paste one product URL per line" style={{ width: '100%', borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(15,23,42,0.9)', color: 'var(--text)', padding: '12px 14px', resize: 'vertical' }} />
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Working title for a single URL submission" style={{ width: '100%', borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(15,23,42,0.9)', color: 'var(--text)', padding: '12px 14px' }} />
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Notes for Ada" style={{ width: '100%', borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(15,23,42,0.9)', color: 'var(--text)', padding: '12px 14px', resize: 'vertical' }} />
              <button type="submit" disabled={busy} style={{ border: 0, borderRadius: 12, padding: '12px 14px', background: '#2563eb', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: busy ? 0.7 : 1 }}>
                {busy ? 'Queueing...' : 'Queue URLs for Ada'}
              </button>
              {submitState ? <div style={{ color: '#86efac', fontSize: 13 }}>{submitState}</div> : null}
            </form>
          </div>

          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 20, padding: 16, overflow: 'auto' }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Recent Ada intake</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {(pipeline?.quickAddState.recentSubmissions ?? []).map((item) => (
                <div key={item.id} style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.title}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12, wordBreak: 'break-all' }}>{item.url}</div>
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase' }}>{item.status}</div>
                  </div>
                  <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: 12 }}>Submitted {formatTime(item.submittedAt)}</div>
                </div>
              ))}
              {pipeline?.quickAddState.recentSubmissions?.length ? null : <div style={{ color: 'var(--muted)', fontSize: 13 }}>No recent Ada URL intake yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
