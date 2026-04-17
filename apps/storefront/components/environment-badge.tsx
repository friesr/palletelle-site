const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? 'development';

export function EnvironmentBadge() {
  return (
    <div className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-black/55">
      {appEnv}
    </div>
  );
}
