export function HowResultsWork() {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-sm uppercase tracking-[0.25em] text-black/45">About these results</p>
      <h3 className="mt-2 text-xl font-semibold">How this browse shell works</h3>
      <div className="mt-4 space-y-3 text-sm leading-6 text-black/70">
        <p><span className="font-medium text-black">Real in this shell:</span> fixture-backed fields like product name, source color, category, and confidence.</p>
        <p><span className="font-medium text-black">Inferred in this shell:</span> simple explainable pairing notes, not model-driven certainty.</p>
        <p><span className="font-medium text-black">Placeholder scope:</span> no personalization, no live catalog data, no hidden ranking.</p>
      </div>
    </section>
  );
}
