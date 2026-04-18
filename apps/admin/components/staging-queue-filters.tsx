'use client';

import { useActionState, useMemo, useState } from 'react';
import type { ProductLifecycleAction, SourcedProductRecord } from '@atelier/domain';
import { bulkLifecycleTransitionAction } from '@/app/review/actions';
import { StagingQueueTable } from '@/components/staging-queue-table';

const ALL = 'all';
const initialBulkState = { summary: '', results: [] as Array<{ productId: string; ok: boolean; message: string }> };
const bulkActions: Array<{ value: ProductLifecycleAction; label: string }> = [
  { value: 'approve_review', label: 'Approve review' },
  { value: 'hold_review', label: 'Hold review' },
  { value: 'reject_review', label: 'Reject review' },
  { value: 'enable_dev_preview', label: 'Enable dev customer preview' },
  { value: 'disable_preview', label: 'Disable preview' },
];

export function StagingQueueFilters({ products }: { products: SourcedProductRecord[] }) {
  const [query, setQuery] = useState('');
  const [reviewState, setReviewState] = useState(ALL);
  const [previewState, setPreviewState] = useState(ALL);
  const [publishState, setPublishState] = useState(ALL);
  const [confidence, setConfidence] = useState(ALL);
  const [freshness, setFreshness] = useState(ALL);
  const [sourcePlatform, setSourcePlatform] = useState(ALL);
  const [ingestMethod, setIngestMethod] = useState(ALL);
  const [customerVisibility, setCustomerVisibility] = useState(ALL);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedBulkAction, setSelectedBulkAction] = useState<ProductLifecycleAction>('approve_review');
  const [bulkReason, setBulkReason] = useState('Bulk review transition from admin queue');
  const [bulkState, bulkAction, bulkPending] = useActionState(bulkLifecycleTransitionAction, initialBulkState);

  const reviewStates = Array.from(new Set(products.map((product) => product.lifecycle?.reviewState).filter(Boolean))) as string[];
  const previewStates = Array.from(new Set(products.map((product) => product.lifecycle?.previewState).filter(Boolean))) as string[];
  const publishStates = Array.from(new Set(products.map((product) => product.lifecycle?.publishState).filter(Boolean))) as string[];
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

      const matchesReviewState = reviewState === ALL || product.lifecycle?.reviewState === reviewState;
      const matchesPreviewState = previewState === ALL || product.lifecycle?.previewState === previewState;
      const matchesPublishState = publishState === ALL || product.lifecycle?.publishState === publishState;
      const matchesConfidence = confidence === ALL || product.provenance.dataConfidence === confidence;
      const matchesSource = sourcePlatform === ALL || product.source.sourcePlatform === sourcePlatform;
      const matchesIngestMethod = ingestMethod === ALL || product.source.ingestMethod === ingestMethod;
      const matchesCustomerVisibility =
        customerVisibility === ALL ||
        (customerVisibility === 'visible' ? product.visibilityDecision?.customerVisible : !product.visibilityDecision?.customerVisible);

      const freshnessSummary = [
        product.freshness.priceFreshness.status,
        product.freshness.availabilityFreshness.status,
      ];
      const matchesFreshness = freshness === ALL || freshnessSummary.includes(freshness as 'fresh' | 'stale' | 'unknown');

      return (
        matchesQuery &&
        matchesReviewState &&
        matchesPreviewState &&
        matchesPublishState &&
        matchesConfidence &&
        matchesSource &&
        matchesFreshness &&
        matchesIngestMethod &&
        matchesCustomerVisibility
      );
    });
  }, [products, query, reviewState, previewState, publishState, confidence, freshness, sourcePlatform, ingestMethod, customerVisibility]);

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
          <span>Review state</span>
          <select value={reviewState} onChange={(event) => setReviewState(event.target.value)} style={inputStyle}>
            <option value={ALL}>All review states</option>
            {reviewStates.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label style={fieldStyle}>
          <span>Preview state</span>
          <select value={previewState} onChange={(event) => setPreviewState(event.target.value)} style={inputStyle}>
            <option value={ALL}>All preview states</option>
            {previewStates.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label style={fieldStyle}>
          <span>Publish state</span>
          <select value={publishState} onChange={(event) => setPublishState(event.target.value)} style={inputStyle}>
            <option value={ALL}>All publish states</option>
            {publishStates.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label style={fieldStyle}>
          <span>Customer visibility</span>
          <select value={customerVisibility} onChange={(event) => setCustomerVisibility(event.target.value)} style={inputStyle}>
            <option value={ALL}>Any customer visibility</option>
            <option value="visible">Customer-visible</option>
            <option value="hidden">Not customer-visible</option>
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
          <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.55 }}>Bulk lifecycle transition</p>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'rgba(0,0,0,0.72)' }}>
            Selected <strong>{selectedFilteredIds.length}</strong> of <strong>{filtered.length}</strong> filtered records.
          </p>
        </div>
        <form action={bulkAction} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'end' }}>
          <input type="hidden" name="productIds" value={selectedFilteredIds.join(',')} />
          <label style={fieldStyle}>
            <span>Bulk action</span>
            <select name="action" value={selectedBulkAction} onChange={(event) => setSelectedBulkAction(event.target.value as ProductLifecycleAction)} style={inputStyle}>
              {bulkActions.map((action) => <option key={action.value} value={action.value}>{action.label}</option>)}
            </select>
          </label>
          <label style={fieldStyle}>
            <span>Reason</span>
            <input name="reason" value={bulkReason} onChange={(event) => setBulkReason(event.target.value)} style={inputStyle} />
          </label>
          <button type="submit" style={primaryButtonStyle} disabled={selectedFilteredIds.length === 0 || bulkPending}>Run bulk action</button>
        </form>
        <button type="button" style={buttonStyle} onClick={toggleSelectAll}>
          {filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id)) ? 'Clear filtered selection' : 'Select filtered rows'}
        </button>
      </section>

      {bulkState.summary ? (
        <section style={resultPanelStyle}>
          <p style={{ margin: 0, fontWeight: 600 }}>{bulkState.summary}</p>
          <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
            {bulkState.results.map((result) => (
              <p key={`${result.productId}-${result.message}`} style={{ margin: 0, color: result.ok ? '#166534' : '#991b1b' }}>
                <strong>{result.productId}</strong>: {result.message}
              </p>
            ))}
          </div>
        </section>
      ) : null}

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

const resultPanelStyle: React.CSSProperties = {
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
