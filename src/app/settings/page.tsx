'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { readPrefs, setPref, resolveTheme, DEFAULT_PREFS, type UserPrefs } from '@/lib/prefs';

export const dynamic = 'force-dynamic';

// ── Shared hook ────────────────────────────────────────────────────────────────
function usePrefs() {
  const [prefs, setPrefs] = useState<UserPrefs>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPrefs(readPrefs());
  }, []);

  const update = <K extends keyof UserPrefs>(key: K, value: UserPrefs[K]) => {
    const next = setPref(key, value);
    setPrefs(next);
    // Apply theme immediately if changed
    if (key === 'theme') {
      const resolved = resolveTheme(next);
      document.documentElement.classList.toggle('if-dark-html', resolved === 'dark');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return { prefs, update, saved, mounted };
}

// ── Reusable Toggle ────────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      className={`if-toggle flex-shrink-0 relative inline-flex w-12 h-7 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${on ? 'if-toggle-on' : 'if-toggle-off'}`}
    >
      {/* thumb — 20px inside 28px track = 4px breathing room on each side */}
      <span className={`if-toggle-thumb pointer-events-none absolute top-[3.5px] left-[3.5px] w-5 h-5 rounded-full bg-white transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

// ── Segmented Control ──────────────────────────────────────────────────────────
function SegmentedControl<T extends string>({
  options, value, onChange,
}: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="if-segmented flex rounded-xl p-0.5 gap-0.5">
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={`if-segment px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all duration-150 ${value === opt.value ? 'if-segment-active' : 'if-segment-inactive'}`}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Setting Row ────────────────────────────────────────────────────────────────
function SettingRow({ label, desc, control, last = false }: {
  label: string; desc: string; control: React.ReactNode; last?: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 py-4 ${!last ? 'border-b if-settings-divider' : ''}`}>
      {/* label block — fixed max-width prevents wrapping from pushing the control */}
      <div className="flex-1 min-w-0 max-w-xs">
        <p className="text-sm font-medium if-text leading-snug">{label}</p>
        <p className="text-xs if-muted mt-0.5 leading-relaxed">{desc}</p>
      </div>
      {/* control always right-aligned, never pushed by text */}
      <div className="flex-shrink-0 ml-auto">{control}</div>
    </div>
  );
}

// ── Pro Settings ───────────────────────────────────────────────────────────────
function ProSettings() {
  const { prefs, update, saved, mounted } = usePrefs();
  const dark = mounted ? resolveTheme(prefs) === 'dark' : false;

  return (
    <div className={`if-root min-h-screen${dark ? ' if-dark' : ''}`}>
      <div className="if-glow-tl" aria-hidden />
      <div className="if-glow-br" aria-hidden />

      <div className="relative z-10 max-w-xl mx-auto px-4 py-10">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm if-muted hover:if-text transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Search
        </Link>

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold if-text">Settings</h1>
            <p className="text-xs if-muted mt-1">Saved as cookies · synced across tabs</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-xs font-medium animate-fade-in" style={{ color: 'var(--if-accent)' }}>
                Saved ✓
              </span>
            )}
            <Link href="/settings?mode=classic"
              className="if-chip text-xs px-3 py-1.5 rounded-xl transition-all">
              Classic UI
            </Link>
          </div>
        </div>

        {/* ── Appearance ── */}
        <section className="if-settings-card rounded-2xl px-6 mb-4">
          <h2 className="text-xs font-semibold if-muted uppercase tracking-widest pt-5 pb-3">Appearance</h2>

          <SettingRow
            label="Theme"
            desc="Choose your preferred colour scheme"
            control={
              <SegmentedControl
                options={[{ value: 'light', label: '☀ Light' }, { value: 'system', label: '⊙ System' }, { value: 'dark', label: '☾ Dark' }]}
                value={prefs.theme}
                onChange={v => update('theme', v)}
              />
            }
          />

          <SettingRow
            label="Interface Mode"
            desc="Pro is the default. Classic uses the terminal UI."
            last
            control={
              <SegmentedControl
                options={[{ value: 'pro', label: 'Pro' }, { value: 'classic', label: 'Classic' }]}
                value="pro"
                onChange={v => { if (v === 'classic') window.location.href = '/classic'; }}
              />
            }
          />
        </section>

        {/* ── Search ── */}
        <section className="if-settings-card rounded-2xl px-6 mb-4">
          <h2 className="text-xs font-semibold if-muted uppercase tracking-widest pt-5 pb-3">Search</h2>

          <SettingRow label="Safe Search"     desc="Filter explicit content from results"                    control={<Toggle on={prefs.safe_search}     onToggle={() => update('safe_search',     !prefs.safe_search)} />} />
          <SettingRow label="Deep Search"     desc="Deeper semantic analysis — slower but more accurate"    control={<Toggle on={prefs.deep_search}     onToggle={() => update('deep_search',     !prefs.deep_search)} />} />
          <SettingRow label="Open in New Tab" desc="Result links open in a new browser tab"                 last control={<Toggle on={prefs.open_in_new_tab} onToggle={() => update('open_in_new_tab', !prefs.open_in_new_tab)} />} />
        </section>

        {/* ── Results ── */}
        <section className="if-settings-card rounded-2xl px-6 mb-8">
          <h2 className="text-xs font-semibold if-muted uppercase tracking-widest pt-5 pb-3">Results</h2>

          <SettingRow
            label="Results per page"
            desc="How many results to fetch per query"
            last
            control={
              <SegmentedControl
                options={([10, 15, 20, 30] as const).map(n => ({ value: String(n) as string, label: String(n) }))}
                value={String(prefs.results_per_page)}
                onChange={v => update('results_per_page', Number(v) as UserPrefs['results_per_page'])}
              />
            }
          />
        </section>

        <p className="text-xs if-muted text-center">Preferences stored as cookies · 1-year expiry</p>
      </div>
    </div>
  );
}

// ── Classic Settings ───────────────────────────────────────────────────────────
function ClassicSettings() {
  const { prefs, update, saved } = usePrefs();

  const settingsMeta: { key: keyof UserPrefs; label: string; desc: string; type: 'toggle' | 'select'; options?: { value: number; label: string }[] }[] = [
    { key: 'safe_search',     label: 'SAFE_SEARCH',      desc: 'Filter explicit content from results',                    type: 'toggle' },
    { key: 'deep_search',     label: 'DEEP_SEARCH',      desc: 'Use IntentForge for deeper analysis (slower, better)',    type: 'toggle' },
    { key: 'open_in_new_tab', label: 'OPEN_IN_NEW_TAB',  desc: 'Open result links in a new browser tab',                 type: 'toggle' },
    { key: 'results_per_page',label: 'RESULTS_PER_PAGE', desc: 'Number of results to fetch per query',                   type: 'select',
      options: [{ value: 10, label: '10' }, { value: 15, label: '15' }, { value: 20, label: '20' }, { value: 30, label: '30' }] },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] p-8 font-mono">
      <div className="max-w-2xl mx-auto">
        <Link href="/classic" className="inline-flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] mb-10 transition-colors tracking-wider uppercase">
          &lt; back
        </Link>

        <div className="mb-8">
          <p className="text-[10px] text-[var(--muted)] tracking-widest mb-1">// config</p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-mono text-[var(--accent)] terminal-glow tracking-wider">SETTINGS</h1>
            {saved && <span className="text-[10px] text-[var(--terminal-cyan)] tracking-widest animate-fade-in">[SAVED]</span>}
            <Link href="/settings?mode=pro" className="ml-auto text-[10px] text-[var(--muted)] hover:text-[var(--accent)] border border-[var(--border)] hover:border-[var(--accent)] px-2 py-1 transition-all tracking-widest uppercase">
              [pro settings]
            </Link>
          </div>
        </div>

        <div className="border border-[var(--border)] bg-[var(--card)]" style={{ boxShadow: '0 0 20px rgba(0,255,157,0.04)' }}>
          <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--background)]">
            <span className="text-[10px] text-[var(--muted)] tracking-widest uppercase">search_preferences.cfg</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {settingsMeta.map(({ key, label, desc, type, options }) => (
              <div key={key} className="flex items-center justify-between px-5 py-4 hover:bg-[var(--card-hover)] transition-colors">
                <div className="flex-1 min-w-0 mr-6">
                  <p className="text-xs text-[var(--foreground)] tracking-wider">{label}</p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">// {desc}</p>
                </div>
                {type === 'toggle' && (
                  <button onClick={() => update(key, !prefs[key] as UserPrefs[typeof key])}
                    className={`flex-shrink-0 text-xs px-3 py-1.5 border tracking-widest transition-all duration-150 ${
                      prefs[key] ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)]'
                    }`} aria-pressed={!!prefs[key]}>
                    {prefs[key] ? '[ON]' : '[OFF]'}
                  </button>
                )}
                {type === 'select' && options && (
                  <div className="flex gap-1 flex-shrink-0">
                    {options.map(opt => (
                      <button key={opt.value} onClick={() => update(key, opt.value as UserPrefs[typeof key])}
                        className={`text-xs px-2 py-1.5 border tracking-wider transition-all duration-150 ${
                          prefs[key] === opt.value ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)]'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-[10px] text-[var(--muted)] tracking-wider">// preferences are stored as cookies in your browser</p>
      </div>
    </main>
  );
}

// ── Router ─────────────────────────────────────────────────────────────────────
function SettingsRouter() {
  const searchParams = useSearchParams();
  return searchParams.get('mode') === 'classic' ? <ClassicSettings /> : <ProSettings />;
}

export default function Settings() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <SettingsRouter />
    </Suspense>
  );
}
