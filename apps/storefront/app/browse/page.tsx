import { BrowseResultsShell } from '@/components/browse-results-shell';
import { HowResultsWork } from '@/components/how-results-work';
import { TrustLegend } from '@/components/trust-legend';
import { sampleProducts } from '@/lib/sample-products';

export default function BrowsePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-black/45">Browse</p>
        <h2 className="text-3xl font-semibold">Catalog preview</h2>
        <p className="mt-2 max-w-2xl text-black/70">
          This is a development shell using fixture data. Product facts are shown as fixture-backed examples, not live catalog truth.
        </p>
      </div>

      <HowResultsWork />
      <TrustLegend />
      <BrowseResultsShell products={sampleProducts} />
    </div>
  );
}
