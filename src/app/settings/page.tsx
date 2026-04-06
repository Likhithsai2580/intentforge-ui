'use client';

import Link from 'next/link';

export default function Settings() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:opacity-80 mb-12 transition-opacity">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Search
        </Link>
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">Settings</h1>
        
        <div className="space-y-8 bg-[var(--card)] p-8 rounded-2xl border border-[var(--border)] shadow-sm">
          <div>
            <h2 className="text-xl font-semibold mb-2">Search Preferences</h2>
            <p className="text-sm text-[var(--muted)] mb-4">Customize your search experience.</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                <div>
                  <h3 className="font-medium">Safe Search</h3>
                  <p className="text-xs text-[var(--muted)]">Filter explicit content from your results.</p>
                </div>
                <div className="w-12 h-6 bg-accent/20 rounded-full flex items-center px-1">
                  <div className="w-4 h-4 bg-accent rounded-full translate-x-6" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                <div>
                  <h3 className="font-medium">Deep Search</h3>
                  <p className="text-xs text-[var(--muted)]">Use IntentForge for deeper analysis (slower but better results).</p>
                </div>
                <div className="w-12 h-6 bg-accent/20 rounded-full flex items-center px-1">
                  <div className="w-4 h-4 bg-accent rounded-full translate-x-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
