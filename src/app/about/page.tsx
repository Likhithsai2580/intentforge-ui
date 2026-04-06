'use client';

import Link from 'next/link';

export default function About() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:opacity-80 mb-12 transition-opacity">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Search
        </Link>
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">About Oxiverse</h1>
        <div className="space-y-6 text-[var(--muted)] leading-relaxed">
          <p>
            Oxiverse is a next-generation intent-first search engine designed to help you discover information more effectively. 
            By leveraging advanced AI techniques from IntentForge, we provide deeply relevant results that understand the underlying context of your queries.
          </p>
          <p>
            Our mission is to make the web more accessible and intuitive, moving beyond simple keyword matching to true semantic discovery.
          </p>
        </div>
      </div>
    </main>
  );
}
