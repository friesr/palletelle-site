export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type FactKind = 'fact' | 'inference' | 'opinion';

export function confidenceLabel(level: ConfidenceLevel): string {
  if (level === 'high') return 'High confidence';
  if (level === 'medium') return 'Medium confidence';
  return 'Low confidence';
}

export function confidenceTone(level: ConfidenceLevel): string {
  if (level === 'high') return 'bg-olive/10 text-olive';
  if (level === 'medium') return 'bg-rosewood/10 text-rosewood';
  return 'bg-black/5 text-black/60';
}

export function factKindLabel(kind: FactKind): string {
  if (kind === 'fact') return 'Fact';
  if (kind === 'inference') return 'Inference';
  return 'Style opinion';
}
