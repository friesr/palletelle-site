export function LowConfidenceNote({ reason }: { reason: string }) {
  return (
    <div className="rounded-2xl border border-rosewood/20 bg-rosewood/5 p-4 text-sm leading-6 text-black/75">
      <p className="font-medium text-black">Low-confidence note</p>
      <p className="mt-2">{reason}</p>
    </div>
  );
}
