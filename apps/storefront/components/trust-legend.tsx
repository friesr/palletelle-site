export function TrustLegend() {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-sm uppercase tracking-[0.25em] text-black/45">Trust legend</p>
      <div className="mt-3 space-y-2 text-sm leading-6 text-black/70">
        <p><span className="font-medium text-black">Confidence:</span> high = stronger support, medium = bounded guidance, low = tentative.</p>
        <p><span className="font-medium text-black">Fact:</span> direct field. <span className="font-medium text-black">Inference:</span> explainable guidance. <span className="font-medium text-black">Opinion:</span> editorial judgment.</p>
      </div>
    </section>
  );
}
