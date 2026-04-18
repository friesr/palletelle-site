export interface RecommendationRationaleData {
  objectiveMatch: string;
  inferredMatch: string;
  subjectiveSuggestion: string;
}

export function RecommendationRationale({
  rationale,
  compact = false,
}: {
  rationale: RecommendationRationaleData;
  compact?: boolean;
}) {
  return (
    <section className={`rounded-3xl border border-black/10 bg-white ${compact ? 'p-4' : 'p-6'} shadow-sm`}>
      <p className="text-sm uppercase tracking-[0.25em] text-black/45">Recommendation rationale</p>
      <h3 className={`${compact ? 'mt-1 text-base' : 'mt-2 text-xl'} font-semibold`}>Why this was suggested</h3>
      {compact ? (
        <p className="mt-2 text-sm leading-6 text-black/60">
          Objective structure is explicit, inferred compatibility is labeled, and style suggestion remains subjective.
        </p>
      ) : (
        <div className="mt-4 space-y-4 text-sm leading-6 text-black/70">
          <div>
            <p className="font-medium text-black">Objective match</p>
            <p className="mt-1">{rationale.objectiveMatch}</p>
          </div>
          <div>
            <p className="font-medium text-black">Inferred match</p>
            <p className="mt-1">{rationale.inferredMatch}</p>
          </div>
          <div>
            <p className="font-medium text-black">Subjective style suggestion</p>
            <p className="mt-1">{rationale.subjectiveSuggestion}</p>
          </div>
        </div>
      )}
    </section>
  );
}
