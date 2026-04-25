export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center justify-center rounded-full border border-black/10 bg-white ${compact ? 'h-9 w-9' : 'h-12 w-12'}`}>
        <svg viewBox="0 0 64 64" className={`${compact ? 'h-5 w-5' : 'h-7 w-7'}`} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="4" className="text-rosewood" />
          <path d="M23 38C28 30 36 24 44 22C40 29 34 37 26 42" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-olive" />
          <path d="M25 25C29 28 33 34 34 41" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-ink/70" />
        </svg>
      </div>
      <div>
        <p className={`${compact ? 'text-lg' : 'text-xl'} font-semibold tracking-[0.08em]`}>Palletelle</p>
        {!compact ? <p className="text-xs uppercase tracking-[0.22em] text-black/45">Curated color-led affiliate storefront</p> : null}
      </div>
    </div>
  );
}
