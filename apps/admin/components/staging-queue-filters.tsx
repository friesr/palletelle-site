'use client';

import { useMemo, useState } from 'react';
import type { SourcedProductRecord } from '@atelier/domain';
import { StagingQueueTable } from '@/components/staging-queue-table';

const ALL = 'all';

export function StagingQueueFilters({ products }: { products: SourcedProductRecord[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(ALL);
  const [confidence, setConfidence] = useState(ALL);
  const [freshness, setFreshness] = useState(ALL);
  const [sourcePlatform, setSourcePlatform] = useState(ALL);

  const statuses = Array.from(new Set(products.map((product) => product.stagingStatus)));
  const confidences = Array.from(new Set(products.map((product) => product.provenance.dataConfidence)));
  const sourcePlatforms = Array.from(new Set(products.map((product) => product.source.sourcePlatform)));

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.normalized.title.toLowerCase().includes(normalizedQuery) ||
        product.source.sourceIdentifier.toLowerCase().includes(normalizedQuery) ||
        product.id.toLowerCase().includes(normalizedQuery);

      const matchesStatus = status === ALL || product.stagingStatus === status;
      const matchesConfidence = confidence === ALL || product.provenance.dataConfidence === confidence;
      const matchesSource = sourcePlatform === ALL || product.source.sourcePlatform === sourcePlatform;

      const freshnessSummary = [
        product.freshness.priceFreshness.status,
        product.freshness.availabilityFreshness.status,
      ];
      const matchesFreshness = freshness === ALL || freshnessSummary.includes(freshness as 'fresh' | 'stale' | 'unknown');

      return matchesQuery && matchesStatus && matchesConfidence && matchesSource && matchesFreshness;
    });
  }, [products, query, status, confidence, freshness, sourcePlatform]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section style={filterPanelStyle}>
        <label style={fieldStyle}>
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, record id, or source identifier" style={inputStyle} />
        </label>
        <label style={fieldStyle}>
          <span>Staging status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)} style={inputStyle}>
            <option value={ALL}>All statuses</option>
            {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label style={fieldStyle}>
          <span>Confidence</span>
          <select value={confidence} onChange={(event) => setConfidence(event.target.value)} style={inputStyle}>
            <option value={ALL}>All confidence</option>
            {confidences.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label style={fieldStyle}>
          <span>Freshness</span>
          <select value={freshness} onChange={(event) => setFreshness(event.target.value)} style={inputStyle}>
            <option value={ALL}>All freshness</option>
            <option value="fresh">Fresh</option>
            <option value="stale">Stale</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
        <label style={fieldStyle}>
          <span>Source platform</span>
          <select value={sourcePlatform} onChange={(event) => setSourcePlatform(event.target.value)} style={inputStyle}>
            <option value={ALL}>All platforms</option>
            {sourcePlatforms.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </section>

      <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.72)' }}>
        Showing <strong>{filtered.length}</strong> of <strong>{products.length}</strong> fixture-backed records.
      </div>

      <StagingQueueTable products={filtered} />
    </div>
  );
}

const filterPanelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 20,
  padding: 16,
};

const fieldStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  fontSize: 13,
  color: 'rgba(0,0,0,0.72)',
};

const inputStyle: React.CSSProperties = {
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: 12,
  padding: '10px 12px',
  fontSize: 14,
};
