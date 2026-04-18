export function DisclosurePanel({
  title,
  summary,
  children,
  defaultOpen = false,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group rounded-2xl border border-black/10 bg-white" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-3 marker:content-none">
        <div>
          <p className="text-sm font-medium text-black">{title}</p>
          <p className="mt-1 text-sm leading-6 text-black/60">{summary}</p>
        </div>
        <span className="mt-1 text-xs uppercase tracking-[0.2em] text-black/40 group-open:hidden">Open</span>
        <span className="mt-1 hidden text-xs uppercase tracking-[0.2em] text-black/40 group-open:block">Close</span>
      </summary>
      <div className="border-t border-black/8 px-4 py-4">{children}</div>
    </details>
  );
}
