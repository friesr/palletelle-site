'use client';

import Link from 'next/link';
import type { ProductRecord } from '@atelier/domain';
import { useMemo, useState } from 'react';
import { ProductCard } from '@/components/product-card';

const ALL = 'all';

const journeyMoments = [
  {
    eyebrow: 'Begin with identity',
    title: 'Create your private atelier',
    description:
      'Register once so your palette, saved pieces, and future outfit ideas can live in one elegant place instead of disappearing between visits.',
  },
  {
    eyebrow: 'Shape your palette',
    title: 'Describe the colors that love you back',
    description:
      'Add undertone, contrast, and palette cues so Palletelle can filter toward shades that brighten you, not just fill a grid.',
  },
  {
    eyebrow: 'Step into suggestions',
    title: 'See outfits with a point of view',
    description:
      'Once your profile exists, recommendations can feel composed, flattering, and intentional instead of generic.',
  },
] as const;

const proofPoints = [
  {
    label: 'Profile-led browse',
    detail: 'The homepage now leads with the color journey first, catalog second.',
  },
  {
    label: 'Gentle personalization',
    detail: 'Registration is framed as the start of better guidance, not a hard sell.',
  },
  {
    label: 'Aspirational payoff',
    detail: 'The copy emphasizes feeling polished, coherent, and more like yourself.',
  },
] as const;

export function StorefrontHomeShell({ products }: { products: ProductRecord[] }) {
  const [category, setCategory] = useState<string>(ALL);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          products.map((product) => {
            const categoryFact = product.facts.find((fact) => fact.label === 'Category' && fact.kind === 'fact');
            return categoryFact?.value ?? 'Unspecified';
          }),
        ),
      ),
    [products],
  );

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const categoryFact = product.facts.find((fact) => fact.label === 'Category' && fact.kind === 'fact');
        const productCategory = categoryFact?.value ?? 'Unspecified';
        if (category !== ALL && productCategory !== category) return false;
        return true;
      }),
    [products, category],
  );

  const featured = filtered[0] ?? products[0];
  const supporting = filtered.slice(1, 5);
  const featuredCategory = featured?.facts.find((fact) => fact.label === 'Category' && fact.kind === 'fact')?.value ?? 'Signature piece';

  return (
    <div className="space-y-12 xl:space-y-20">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-black/10 bg-white shadow-sm">
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_left,_rgba(216,207,196,0.75),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(110,74,69,0.18),_transparent_38%),linear-gradient(180deg,_rgba(247,245,241,0.95),_rgba(255,255,255,0))]" />
        <div className="relative grid gap-8 p-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(22rem,0.8fr)] xl:gap-10 xl:p-10 2xl:p-12">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.28em] text-black/45">Palletelle, color with a point of view</p>
              <div className="space-y-4">
                <h1 className="max-w-5xl text-4xl font-semibold leading-[0.98] sm:text-5xl xl:text-[4.6rem] xl:tracking-[-0.05em] 2xl:text-[5.1rem]">
                  Build your color profile, then shop as though the store already understands you.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-black/70 xl:text-lg xl:leading-8">
                  Palletelle is not meant to feel like another endless catalog. Register, map your palette, and step into a calmer kind of discovery, one that points you toward pieces that feel polished, coherent, and distinctly yours.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <Link className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white" href="/profile">
                  Start the color journey
                </Link>
                <a className="rounded-full border border-black/15 px-6 py-3 text-sm font-medium" href="#journey">
                  Why register first
                </a>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
              <div className="rounded-[2rem] border border-black/10 bg-mist/70 p-5 xl:p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-black/45">The emotional payoff</p>
                <p className="mt-3 max-w-2xl text-2xl font-semibold leading-tight text-ink xl:text-[2rem]">
                  Less second-guessing, more pieces that sit naturally inside your palette and your life.
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-black/68">
                  Registration is the doorway to better curation. Your profile gives future suggestions context, so the storefront can move from showing products to composing a feeling.
                </p>
              </div>
              <div className="grid gap-3 rounded-[2rem] border border-black/10 bg-white/80 p-5 xl:p-6">
                {proofPoints.map((point) => (
                  <div key={point.label} className="rounded-[1.5rem] border border-black/8 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-black/45">{point.label}</p>
                    <p className="mt-2 text-sm leading-6 text-black/70">{point.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-5 rounded-[2rem] bg-ink p-5 text-white xl:p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Your first minutes here</p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight">A more intentional way in</h2>
              <p className="mt-3 text-sm leading-6 text-white/78">
                You can still browse, but the richer experience begins when Palletelle knows your color language. That is how the storefront becomes memorable instead of merely functional.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">Visible pieces</p>
                <p className="mt-2 text-3xl font-semibold">{products.length}</p>
                <p className="mt-2 text-sm leading-6 text-white/72">Curated pieces already ready to explore.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">Style lanes</p>
                <p className="mt-2 text-3xl font-semibold">{categories.length}</p>
                <p className="mt-2 text-sm leading-6 text-white/72">Categories to sample while your profile takes shape.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">Best next step</p>
                <p className="mt-2 text-base font-medium text-white">Register, then capture palette cues</p>
                <p className="mt-2 text-sm leading-6 text-white/72">That is what unlocks more relevant styling guidance.</p>
              </div>
            </div>

            <label className="space-y-2 text-sm text-white/85">
              <span className="block text-xs uppercase tracking-[0.2em] text-white/55">Preview the collection</span>
              <select className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-ink" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value={ALL}>All categories</option>
                {categories.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/76">
              Today, registration and profile entry are a working onboarding draft. The message here now makes that journey feel worth beginning instead of sounding like a prerequisite banner.
            </div>

            <div className="flex flex-wrap gap-3">
              <Link className="rounded-full bg-white px-5 py-3 text-sm font-medium text-ink" href="/profile">
                Create my profile
              </Link>
              <Link className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white" href="/browse">
                Browse the collection
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section id="journey" className="grid gap-5 lg:grid-cols-3">
        {journeyMoments.map((step, index) => (
          <div key={step.title} className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm xl:min-h-[16rem] xl:p-7">
            <p className="text-[11px] uppercase tracking-[0.22em] text-black/45">0{index + 1} · {step.eyebrow}</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-ink">{step.title}</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-black/70">{step.description}</p>
          </div>
        ))}
      </section>

      {featured ? (
        <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(24rem,0.8fr)] 2xl:items-start">
          <div className="space-y-5 rounded-[2rem] bg-white p-6 shadow-sm xl:p-8">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-black/45">Featured starting point</p>
                <h2 className="mt-2 text-3xl font-semibold xl:text-4xl">One piece can set the tone, your profile makes the rest feel inevitable</h2>
                <p className="mt-3 max-w-3xl text-base leading-7 text-black/70">
                  Consider this a glimpse of the wardrobe mood Palletelle can help build. The homepage now invites customers into a color-led relationship first, then uses the catalog as supporting evidence.
                </p>
              </div>
              <Link className="hidden rounded-full border border-black/15 px-4 py-2 text-sm font-medium xl:inline-flex" href="/browse">
                View full catalog
              </Link>
            </div>
            <ProductCard product={featured} />
          </div>

          <div className="space-y-5 rounded-[2rem] bg-white p-6 shadow-sm xl:p-7">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-black/45">Why this journey matters</p>
              <h3 className="mt-2 text-2xl font-semibold">Registration becomes a benefit when the promise feels tangible</h3>
            </div>
            <div className="rounded-[1.75rem] bg-mist p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-black/45">Featured lens</p>
              <p className="mt-2 text-xl font-semibold text-ink">{featuredCategory}</p>
              <p className="mt-3 text-sm leading-6 text-black/70">
                Use your color profile to decide whether this piece belongs in your palette, how it pairs with what you already own, and what should come next.
              </p>
            </div>
            <ol className="space-y-4 text-sm leading-6 text-black/72">
              <li><span className="font-medium text-ink">1.</span> Register so Palletelle can keep your progress and evolving taste in one place.</li>
              <li><span className="font-medium text-ink">2.</span> Enter your undertone, contrast, and palette family to give recommendations real context.</li>
              <li><span className="font-medium text-ink">3.</span> Return to the collection with a stronger point of view and a shortlist that feels more flattering.</li>
              <li><span className="font-medium text-ink">4.</span> Browse individual pieces with transparent details whenever you want a closer look.</li>
            </ol>
            <div className="rounded-[1.75rem] border border-black/10 p-4 text-sm leading-6 text-black/68">
              This still respects manual browsing. The difference is that the homepage now gives registration an emotional reward, not just a procedural instruction.
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white" href="/profile">
                Begin profile setup
              </Link>
              <Link className="rounded-full border border-black/15 px-5 py-3 text-sm font-medium" href="/browse">
                Explore all pieces
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {supporting.length > 0 ? (
        <section className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-black/45">Browse the moodboard</p>
              <h2 className="text-3xl font-semibold">A preview of what the collection can become once your palette is in the room</h2>
            </div>
            <Link className="text-sm font-medium text-black/70" href="/browse">
              View full catalog
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-4">
            {supporting.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
