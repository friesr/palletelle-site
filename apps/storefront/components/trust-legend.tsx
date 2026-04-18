export function TrustLegend() {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <p className="text-sm uppercase tracking-[0.25em] text-black/45">Trust legend</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl bg-mist p-4">
          <p className="font-medium text-black">Confidence levels</p>
          <ul className="space-y-2 text-sm text-black/70">
            <li><span className="font-medium text-black">High</span>, stronger supporting evidence in this shell</li>
            <li><span className="font-medium text-black">Medium</span>, useful but bounded guidance</li>
            <li><span className="font-medium text-black">Low</span>, limited evidence, treat as tentative</li>
          </ul>
        </div>
        <div className="space-y-3 rounded-2xl bg-mist p-4">
          <p className="font-medium text-black">Information types</p>
          <ul className="space-y-2 text-sm text-black/70">
            <li><span className="font-medium text-black">Fact</span>, direct fixture-backed field</li>
            <li><span className="font-medium text-black">Inference</span>, explainable directional guidance</li>
            <li><span className="font-medium text-black">Style opinion</span>, editorial judgment</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
