export function RecommendationExplanation({
  productName,
  confidence = 'medium',
  lowConfidenceReason,
}: {
  productName: string;
  confidence?: 'low' | 'medium' | 'high';
  lowConfidenceReason?: string;
}) {
  const lowConfidence = confidence === 'low';

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
        <div className="rounded-2xl bg-white p-4">
          <p className="font-medium text-black">Current confidence boundary</p>
          <p className="mt-2">
            {lowConfidence
              ? 'This product is currently shown with low confidence. The shell intentionally avoids strong matching claims and treats guidance as tentative.'
              : 'This product is shown with bounded confidence. Guidance may still change as better evidence or real product data becomes available.'}
          </p>
          {lowConfidence && lowConfidenceReason ? <p className="mt-2 text-black/70">Reason: {lowConfidenceReason}</p> : null}
        </div>
      </div>
    </aside>
  );
}
