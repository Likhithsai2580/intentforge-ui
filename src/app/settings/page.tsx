'use client';

import Link from 'next/link';

export default function Settings() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-8 font-mono">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] mb-10 transition-colors tracking-wider uppercase">
          <span>&lt;</span> back
        </Link>

        <div className="mb-8">
          <p className="text-[10px] text-[var(--muted)] tracking-widest mb-1">// config</p>
          <h1 className="text-2xl font-mono text-[var(--accent)] terminal-glow tracking-wider">SETTINGS</h1>
        </div>

        <div className="border border-[var(--border)] bg-[var(--card)]" style={{ boxShadow: '0 0 20px rgba(0,255,157,0.04)' }}>
          <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--background)]">
            <span className="text-[10px] text-[var(--muted)] tracking-widest uppercase">search_preferences.cfg</span>
          </div>
          <div className="p-6 space-y-4">
            {[
              { key: 'SAFE_SEARCH', desc: 'Filter explicit content from results', on: true },
              { key: 'DEEP_SEARCH', desc: 'Use IntentForge for deeper analysis (slower, better)', on: true },
            ].map(({ key, desc, on }) => (
              <div key={key} className="flex items-center justify-between p-4 border border-[var(--border)] bg-[var(--background)]">
                <div>
                  <p className="text-sm text-[var(--foreground)] tracking-wider">{key}</p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">// {desc}</p>
                </div>
                <span className={`text-xs px-2 py-1 border ${on ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--muted)]'}`}>
                  {on ? '[ON]' : '[OFF]'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
