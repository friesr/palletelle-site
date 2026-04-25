'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type ProfileDraft = {
  fullName: string;
  email: string;
  paletteFamily: string;
  undertone: string;
  contrastLevel: string;
  notes: string;
};

const STORAGE_KEY = 'palletelle-profile-draft';

const emptyDraft: ProfileDraft = {
  fullName: '',
  email: '',
  paletteFamily: '',
  undertone: '',
  contrastLevel: '',
  notes: '',
};

export function ProfileOnboardingShell() {
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setIsLoaded(true);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Partial<ProfileDraft>;
      setDraft({ ...emptyDraft, ...parsed });
      setIsSaved(true);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const completionCount = useMemo(() => Object.values(draft).filter((value) => value.trim().length > 0).length, [draft]);

  const updateField = <Key extends keyof ProfileDraft>(key: Key, value: ProfileDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setIsSaved(true);
  };

  const handleReset = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setDraft(emptyDraft);
    setIsSaved(false);
  };

  if (!isLoaded) {
    return <div className="rounded-[2rem] bg-white p-8 text-sm text-black/60 shadow-sm">Loading your profile workspace…</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:gap-8">
      <section className="space-y-6 rounded-[2rem] bg-white p-6 shadow-sm lg:p-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.25em] text-black/45">Profile setup</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Start your Palletelle profile for real</h1>
          <p className="max-w-2xl text-base leading-7 text-black/70">
            This is a working onboarding draft, not a dead placeholder. It saves your profile in this browser so you can come back, refine your color guidance, and continue into the catalog with context.
          </p>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm text-black/75">
              <span className="font-medium text-ink">Full name</span>
              <input className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 outline-none transition focus:border-black/25" value={draft.fullName} onChange={(event) => updateField('fullName', event.target.value)} placeholder="Avery Stone" required />
            </label>
            <label className="space-y-2 text-sm text-black/75">
              <span className="font-medium text-ink">Email</span>
              <input className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 outline-none transition focus:border-black/25" type="email" value={draft.email} onChange={(event) => updateField('email', event.target.value)} placeholder="avery@example.com" required />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="space-y-2 text-sm text-black/75">
              <span className="font-medium text-ink">Palette family</span>
              <select className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 outline-none transition focus:border-black/25" value={draft.paletteFamily} onChange={(event) => updateField('paletteFamily', event.target.value)} required>
                <option value="">Select one</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Autumn">Autumn</option>
                <option value="Winter">Winter</option>
                <option value="Not sure yet">Not sure yet</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-black/75">
              <span className="font-medium text-ink">Undertone</span>
              <select className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 outline-none transition focus:border-black/25" value={draft.undertone} onChange={(event) => updateField('undertone', event.target.value)} required>
                <option value="">Select one</option>
                <option value="Warm">Warm</option>
                <option value="Cool">Cool</option>
                <option value="Neutral">Neutral</option>
                <option value="Unsure">Unsure</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-black/75">
              <span className="font-medium text-ink">Contrast level</span>
              <select className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 outline-none transition focus:border-black/25" value={draft.contrastLevel} onChange={(event) => updateField('contrastLevel', event.target.value)} required>
                <option value="">Select one</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Unsure">Unsure</option>
              </select>
            </label>
          </div>

          <label className="space-y-2 text-sm text-black/75">
            <span className="font-medium text-ink">Style notes or fit reminders</span>
            <textarea className="min-h-32 w-full rounded-3xl border border-black/10 bg-mist px-4 py-3 outline-none transition focus:border-black/25" value={draft.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Colors you already know you love, outfit constraints, occasion notes, modesty preferences, or anything else future suggestions should respect." />
          </label>

          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white" type="submit">Save profile draft</button>
            <Link className="rounded-full border border-black/15 px-5 py-3 text-sm font-medium" href="/browse">Continue to browse</Link>
            <button className="rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-black/70" type="button" onClick={handleReset}>Clear this device draft</button>
          </div>
        </form>
      </section>

      <aside className="space-y-5 rounded-[2rem] border border-black/10 bg-ink p-6 text-white shadow-sm lg:p-7">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/55">What works today</p>
          <h2 className="mt-2 text-2xl font-semibold">A functional stopgap, honestly labeled</h2>
          <p className="mt-3 text-sm leading-6 text-white/75">
            Live accounts and server-backed customer records are not wired into the storefront yet. Until they are, this page gives the CTA a truthful job: collect profile details and keep them locally in your current browser.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/55">Draft status</p>
          <p className="mt-2 text-3xl font-semibold">{completionCount}/6 fields</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            {isSaved ? 'Saved on this device. You can come back and keep editing.' : 'Not saved yet. Submit the form to store this draft in your browser.'}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/80">
          <p className="text-xs uppercase tracking-[0.2em] text-white/55">Current profile snapshot</p>
          <ul className="mt-3 space-y-2">
            <li><span className="text-white/55">Name:</span> {draft.fullName || 'Not set'}</li>
            <li><span className="text-white/55">Email:</span> {draft.email || 'Not set'}</li>
            <li><span className="text-white/55">Palette family:</span> {draft.paletteFamily || 'Not set'}</li>
            <li><span className="text-white/55">Undertone:</span> {draft.undertone || 'Not set'}</li>
            <li><span className="text-white/55">Contrast:</span> {draft.contrastLevel || 'Not set'}</li>
          </ul>
        </div>

        <div className="rounded-3xl bg-white px-5 py-4 text-sm leading-6 text-ink">
          Next honest step: connect this draft to a real customer identity and use it to steer saved recommendations server-side.
        </div>
      </aside>
    </div>
  );
}
