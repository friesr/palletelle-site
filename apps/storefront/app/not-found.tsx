import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm">
      <p className="text-sm uppercase tracking-[0.25em] text-black/45">Not found</p>
      <h2 className="mt-2 text-3xl font-semibold">That product view does not exist in this shell yet.</h2>
      <p className="mt-3 text-black/70">This development shell only includes a small fixture-backed set of routes.</p>
      <Link className="mt-6 inline-block rounded-full bg-ink px-5 py-3 text-sm font-medium text-white" href="/browse">
        Return to browse
      </Link>
    </div>
  );
}
