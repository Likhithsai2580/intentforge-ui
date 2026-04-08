'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';


const SETTINGS_KEY = 'intentforge_settings';

const defaultSettings = {
  safe_search: true,
  deep_search: true,
  results_per_page: 15,
  open_in_new_tab: true,
};

type Settings = typeof defaultSettings;

const settingsMeta: { key: keyof Settings; label: string; desc: string; type: 'toggle' | 'select'; options?: { value: number; label: string }[] }[] = [
  { key: 'safe_search', label: 'SAFE_SEARCH', desc: 'Filter explicit content from results', type: 'toggle' },
  { key: 'deep_search', label: 'DEEP_SEARCH', desc: 'Use IntentForge for deeper analysis (slower, better)', type: 'toggle' },
  { key: 'open_in_new_tab', label: 'OPEN_IN_NEW_TAB', desc: 'Open result links in a new browser tab', type: 'toggle' },
  {
    key: 'results_per_page',
    label: 'RESULTS_PER_PAGE',
    desc: 'Number of results to fetch per query',
    type: 'select',
    options: [
      { value: 10, label: '10' },
      { value: 15, label: '15' },
      { value: 20, label: '20' },
      { value: 30, label: '30' },
    ],
  },
];

export default function Settings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      setSettings({ ...defaultSettings, ...stored });
    } catch {}
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] p-8 font-mono">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] mb-10 transition-colors tracking-wider uppercase"
        >
          &lt; back
        </Link>

        <div className="mb-8">
          <p className="text-[10px] text-[var(--muted)] tracking-widest mb-1">// config</p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-mono text-[var(--accent)] terminal-glow tracking-wider">SETTINGS</h1>
            {saved && (
              <span className="text-[10px] text-[var(--terminal-cyan)] tracking-widest animate-fade-in">
                [SAVED]
              </span>
            )}
          </div>
        </div>

        <div
          className="border border-[var(--border)] bg-[var(--card)]"
          style={{ boxShadow: '0 0 20px rgba(0,255,157,0.04)' }}
        >
          <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--background)]">
            <span className="text-[10px] text-[var(--muted)] tracking-widest uppercase">
              search_preferences.cfg
            </span>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {settingsMeta.map(({ key, label, desc, type, options }) => (
              <div
                key={key}
                className="flex items-center justify-between px-5 py-4 hover:bg-[var(--card-hover)] transition-colors"
              >
                <div className="flex-1 min-w-0 mr-6">
                  <p className="text-xs text-[var(--foreground)] tracking-wider">{label}</p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">// {desc}</p>
                </div>

                {type === 'toggle' && (
                  <button
                    onClick={() => update(key, !settings[key] as Settings[typeof key])}
                    className={`flex-shrink-0 text-xs px-3 py-1.5 border tracking-widest transition-all duration-150 ${
                      settings[key]
                        ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-light)]'
                        : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)]'
                    }`}
                    aria-pressed={!!settings[key]}
                  >
                    {settings[key] ? '[ON]' : '[OFF]'}
                  </button>
                )}

                {type === 'select' && options && (
                  <div className="flex gap-1 flex-shrink-0">
                    {options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => update(key, opt.value as Settings[typeof key])}
                        className={`text-xs px-2 py-1.5 border tracking-wider transition-all duration-150 ${
                          settings[key] === opt.value
                            ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-light)]'
                            : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-[10px] text-[var(--muted)] tracking-wider">
          // settings are saved locally to your browser
        </p>
      </div>
    </main>
  );
}
