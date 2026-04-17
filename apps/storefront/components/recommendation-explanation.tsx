export function RecommendationExplanation({ productName }: { productName: string }) {
  return (
    <aside className="rounded-3xl border border-black/10 bg-mist p-6">
      <p className="text-sm uppercase tracking-[0.25em] text-black/45">Recommendation framing</p>
      <h3 className="mt-2 text-2xl font-semibold">How this shell explains uncertainty</h3>
      <div className="mt-5 space-y-4 text-sm leading-6 text-black/75">
        <div>
          <p className="font-medium text-black">Known facts</p>
          <p>{productName} is shown using fixture-backed source fields such as product name, source color label, and price label.</p>
        </div>
        <div>
          <p className="font-medium text-black">Inference</p>
          <p>Potential color harmony and pairing notes are shown as inference, not certainty, because early logic is heuristic and fixture-based.</p>
        </div>
        <div>
          <p className="font-medium text-black">Style opinion</p>
          <p>Taste-driven commentary is presented as editorial judgment rather than objective product truth.</p>
        </div>
      </div>
    </aside>
  );
}
