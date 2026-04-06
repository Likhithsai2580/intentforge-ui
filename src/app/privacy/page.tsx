'use client';

import Link from 'next/link';

export default function Privacy() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:opacity-80 mb-12 transition-opacity">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Search
        </Link>
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">Privacy Policy</h1>
        <div className="space-y-6 text-[var(--muted)] leading-relaxed">
          <p>
            Your privacy is important to us. Oxiverse Search focuses on your intent without compromising your data.
          </p>
          <p>
            We do not sell your personal data. We only collect search queries to improve our ranking models through anonymous feedback loops.
          </p>
          <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8">Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-4">
            <li>Search queries to provides results.</li>
            <li>Interaction data (clicks) to improve our AI intent engine.</li>
            <li>Browser and device information to optimize rendering.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
