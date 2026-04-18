import { StagingQueue } from '@/components/staging-queue';
import { requireAdmin } from '@/lib/auth/session';
import { listReviewRecords } from '@/lib/services/review-service';

export default async function AdminHomePage() {
  await requireAdmin();
  const products = listReviewRecords();

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: 20 }}>
        <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.55 }}>Admin review queue</p>
        <h2 style={{ margin: '8px 0 0', fontSize: 30 }}>Staged affiliate listings</h2>
        <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(0,0,0,0.72)' }}>
          This fixture-backed admin surface exposes provenance, freshness, confidence, and review state before any listing is eligible for storefront visibility.
        </p>
      </section>
      <StagingQueue products={products} />
    </div>
  );
}
