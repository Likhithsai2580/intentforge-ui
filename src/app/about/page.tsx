'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function About() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-8 font-mono">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] mb-10 transition-colors tracking-wider uppercase">
          <span>&lt;</span> back
        </Link>

        <div className="mb-8">
          <p className="text-[10px] text-[var(--muted)] tracking-widest mb-1">// about</p>
          <h1 className="text-2xl font-mono text-[var(--accent)] terminal-glow tracking-wider">OXIVERSE // INTENTFORGE</h1>
        </div>

        <div className="border border-[var(--border)] bg-[var(--card)] p-6 space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-[var(--border)]">
            <Image src="/assets/oxiverse.png" alt="Oxiverse" width={48} height={48} className="rounded-full opacity-90" />
            <div>
              <p className="text-sm text-[var(--foreground)] tracking-wider">OXIVERSE</p>
              <p className="text-[10px] text-[var(--muted)]">// parent company</p>
            </div>
            <span className="text-[var(--border)] mx-2">×</span>
            <Image src="/assets/intentforge.JPG" alt="IntentForge" width={40} height={40} className="rounded-sm opacity-90" />
            <div>
              <p className="text-sm text-[var(--foreground)] tracking-wider">INTENTFORGE</p>
              <p className="text-[10px] text-[var(--muted)]">// search engine</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-[var(--muted)] leading-relaxed">
            <p>
              <span className="text-[var(--accent)]">&gt;</span> Oxiverse is a next-generation intent-first search engine designed for effective discovery.
            </p>
            <p>
              <span className="text-[var(--accent)]">&gt;</span> Powered by IntentForge AI — moving beyond keyword matching to true semantic understanding.
            </p>
            <p>
              <span className="text-[var(--accent)]">&gt;</span> Built for the decentralized era. Open-source. Intent-driven.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
