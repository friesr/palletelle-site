export function HowResultsWork() {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <p className="text-sm uppercase tracking-[0.25em] text-black/45">About these results</p>
      <h3 className="mt-2 text-2xl font-semibold">How this browse shell works</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-mist p-4">
          <p className="text-sm font-medium text-black">Real in this shell</p>
          <p className="mt-2 text-sm leading-6 text-black/70">
            The displayed fixture fields, such as product name, source color label, category, and confidence label.
          </p>
        </div>
        <div className="rounded-2xl bg-mist p-4">
          <p className="text-sm font-medium text-black">Inferred in this shell</p>
          <p className="mt-2 text-sm leading-6 text-black/70">
            Pairing and palette notes are simple fixture-backed inferences. They are directional guidance, not model-driven certainty.
          </p>
        </div>
        <div className="rounded-2xl bg-mist p-4">
          <p className="text-sm font-medium text-black">Placeholder scope</p>
          <p className="mt-2 text-sm leading-6 text-black/70">
            This browse experience is not personalized and not backed by a live catalog. Filters are transparent, deterministic UI controls.
          </p>
        </div>
      </div>
    </section>
  );
}
