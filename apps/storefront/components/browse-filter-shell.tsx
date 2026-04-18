export function BrowseFilterShell() {
  return (
    <section className="grid gap-4 rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:grid-cols-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-black/45">Color family</p>
        <div className="mt-2 rounded-2xl bg-mist px-4 py-3 text-sm text-black/65">Warm neutrals, olive, muted rosewood</div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-black/45">Confidence</p>
        <div className="mt-2 rounded-2xl bg-mist px-4 py-3 text-sm text-black/65">All, medium, low</div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-black/45">Category</p>
        <div className="mt-2 rounded-2xl bg-mist px-4 py-3 text-sm text-black/65">Shirts, trousers, outer layers</div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-black/45">Status</p>
        <div className="mt-2 rounded-2xl bg-mist px-4 py-3 text-sm text-black/65">Fixture-backed shell, not live catalog data</div>
      </div>
    </section>
  );
}
