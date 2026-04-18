'use client';

import { useMemo, useState } from 'react';
import type { SourcedProductRecord } from '@atelier/domain';
import { StagingQueueTable } from '@/components/staging-queue-table';

const ALL = 'all';

type BulkReviewAction = (formData: FormData) => void | Promise<void>;

export function StagingQueueFilters({
  products,
  bulkReviewAction,
}: {
  products: SourcedProductRecord[];
  bulkReviewAction: BulkReviewAction;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(ALL);
  const [confidence, setConfidence] = useState(ALL);
  const [freshness, setFreshness] = useState(ALL);
  const [sourcePlatform, setSourcePlatform] = useState(ALL);
  const [ingestMethod, setIngestMethod] = useState(ALL);
  const [publicState, setPublicState] = useState(ALL);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const statuses = Array.from(new Set(products.map((product) => product.stagingStatus)));
  const confidences = Array.from(new Set(products.map((product) => product.provenance.dataConfidence)));
  const sourcePlatforms = Array.from(new Set(products.map((product) => product.source.sourcePlatform)));
  const ingestMethods = Array.from(new Set(products.map((product) => product.source.ingestMethod).filter(Boolean))) as string[];

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
      const matchesIngestMethod = ingestMethod === ALL || product.source.ingestMethod === ingestMethod;
      const matchesPublicState =
        publicState === ALL ||
        (publicState === 'enabled' ? product.visibility.isPublic && product.visibility.intendedActive : !product.visibility.isPublic || !product.visibility.intendedActive);

      const freshnessSummary = [
        product.freshness.priceFreshness.status,
        product.freshness.availabilityFreshness.status,
      ];
      const matchesFreshness = freshness === ALL || freshnessSummary.includes(freshness as 'fresh' | 'stale' | 'unknown');

      return matchesQuery && matchesStatus && matchesConfidence && matchesSource && matchesFreshness && matchesIngestMethod && matchesPublicState;
    });
  }, [products, query, status, confidence, freshness, sourcePlatform, ingestMethod, publicState]);

  const filteredIds = filtered.map((product) => product.id);
  const selectedFilteredIds = selectedIds.filter((id) => filteredIds.includes(id));

  function toggleSelection(productId: string) {
    setSelectedIds((current) => (current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]));
  }

  function toggleSelectAll() {
    setSelectedIds((current) => {
      const allSelected = filteredIds.length > 0 && filteredIds.every((id) => current.includes(id));
      if (allSelected) {
        return current.filter((id) => !filteredIds.includes(id));
      }

      return Array.from(new Set([...current, ...filteredIds]));
    });
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section style={filterPanelStyle}>
        <label style={fieldStyle}>
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, ASIN, or product id" style={inputStyle} />
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
          <span>Customer preview</span>
          <select value={publicState} onChange={(event) => setPublicState(event.target.value)} style={inputStyle}>
            <option value={ALL}>Any preview state</option>
            <option value="enabled">Preview enabled</option>
            <option value="disabled">Preview disabled</option>
          </select>
        </label>
        <label style={fieldStyle}>
          <span>Ingest method</span>
          <select value={ingestMethod} onChange={(event) => setIngestMethod(event.target.value)} style={inputStyle}>
            <option value={ALL}>All ingest methods</option>
            {ingestMethods.map((value) => <option key={value} value={value}>{value}</option>)}
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

      <section style={bulkPanelStyle}>
        <div>
          <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.55 }}>Bulk review</p>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'rgba(0,0,0,0.72)' }}>
            Selected <strong>{selectedFilteredIds.length}</strong> of <strong>{filtered.length}</strong> filtered records.
          </p>
        </div>
        <form action={bulkReviewAction} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input type="hidden" name="productIds" value={selectedFilteredIds.join(',')} />
          <input type="hidden" name="workflowState" value="approved" />
          <input type="hidden" name="reviewerNotes" value="Bulk approved and enabled for customer preview from admin queue" />
          <input type="hidden" name="enableStorefront" value="true" />
          <button type="submit" style={primaryButtonStyle} disabled={selectedFilteredIds.length === 0}>Bulk approve + enable preview</button>
        </form>
        <button type="button" style={buttonStyle} onClick={toggleSelectAll}>
          {filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id)) ? 'Clear filtered selection' : 'Select filtered rows'}
        </button>
      </section>

      <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.72)' }}>
        Showing <strong>{filtered.length}</strong> of <strong>{products.length}</strong> DB-backed review records.
      </div>

      <StagingQueueTable
        products={filtered}
        selectedIds={selectedIds}
        onToggleSelection={toggleSelection}
      />
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

const bulkPanelStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'center',
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

const buttonStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 999,
  border: '1px solid rgba(0,0,0,0.12)',
  background: '#fff',
  cursor: 'pointer',
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: '#111111',
  color: '#ffffff',
};
