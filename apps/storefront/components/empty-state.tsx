import Link from 'next/link';

export function EmptyState() {
  return (
    <section className="rounded-3xl border border-dashed border-black/15 bg-white p-8 text-center shadow-sm">
      <p className="text-sm uppercase tracking-[0.25em] text-black/45">No matching preview items</p>
      <h3 className="mt-3 text-2xl font-semibold">This shell does not pretend missing items exist.</h3>
      <p className="mt-3 text-black/70">
        If a filter or fixture set yields no results, Atelier should show that plainly instead of manufacturing urgency or filler recommendations.
      </p>
      <Link className="mt-6 inline-block rounded-full border border-black/15 px-5 py-3 text-sm font-medium" href="/browse">
        Return to browse preview
      </Link>
    </section>
  );
}
