export function TrustLegend() {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-sm uppercase tracking-[0.25em] text-black/45">Trust legend</p>
      <div className="mt-4 space-y-3 text-sm leading-6 text-black/70">
        <p><span className="font-medium text-black">Confidence:</span> high means stronger support in this shell, medium is bounded guidance, low is tentative.</p>
        <p><span className="font-medium text-black">Fact:</span> direct fixture-backed field. <span className="font-medium text-black">Inference:</span> explainable directional guidance. <span className="font-medium text-black">Style opinion:</span> editorial judgment.</p>
      </div>
    </section>
  );
}
