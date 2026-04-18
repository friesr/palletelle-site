import { confidenceLabel, confidenceTone } from '@atelier/trust';

export function ConfidenceBadge({ confidence }: { confidence: 'low' | 'medium' | 'high' }) {
  const tone = confidenceTone(confidence);

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${tone}`}>
      {confidenceLabel(confidence)}
    </span>
  );
}
