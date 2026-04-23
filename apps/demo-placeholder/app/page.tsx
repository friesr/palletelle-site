export default function Page() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <section style={{ width: '100%', maxWidth: 880, background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(23,20,18,0.08)', borderRadius: 28, padding: 32, boxShadow: '0 20px 60px rgba(23,20,18,0.08)' }}>
        <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(23,20,18,0.55)' }}>Palletelle</p>
        <h1 style={{ margin: '14px 0 0', fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.02 }}>A quieter way to dress well is coming.</h1>
        <p style={{ margin: '18px 0 0', fontSize: 18, lineHeight: 1.7, maxWidth: 640, color: 'rgba(23,20,18,0.78)' }}>
          Palletelle is building a modest, refined style experience around real products, thoughtful curation, and better outfit guidance.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
          <a href="mailto:friesr@yahoo.com?subject=Palletelle%20early%20interest" style={{ textDecoration: 'none', padding: '14px 18px', borderRadius: 999, background: '#171412', color: '#fff', fontWeight: 700 }}>Request early access</a>
          <span style={{ padding: '14px 18px', borderRadius: 999, border: '1px solid rgba(23,20,18,0.12)', color: 'rgba(23,20,18,0.72)' }}>Public launch in preparation</span>
        </div>
        <div style={{ marginTop: 36, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {[
            ['Modest, polished product curation', 'Built for thoughtful wardrobe decisions'],
            ['Color and outfit guidance', 'Meant to feel personal, not noisy'],
            ['Real catalog pipeline in progress', 'Launch catalog and customer flow actively being prepared'],
          ].map(([title, body]) => (
            <div key={title} style={{ borderRadius: 20, background: '#fff', border: '1px solid rgba(23,20,18,0.08)', padding: 18 }}>
              <h2 style={{ margin: 0, fontSize: 16 }}>{title}</h2>
              <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.6, color: 'rgba(23,20,18,0.7)' }}>{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
