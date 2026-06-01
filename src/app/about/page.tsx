import type { Metadata } from "next";
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "About IntentForge",
  description:
    "Learn about IntentForge — the AI-powered intent-first search engine built by Oxiverse for semantic web discovery.",
  alternates: { canonical: "https://search.oxiverse.com/about" },
  openGraph: {
    title: "About IntentForge by Oxiverse",
    description: "AI-powered intent-first search engine built for the decentralized era.",
    url: "https://search.oxiverse.com/about",
  },
};

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
            <h2 className="sr-only">What is the Oxiverse Search Engine?</h2>
            <p>
              <span className="text-[var(--accent)]">&gt;</span> <strong>Oxiverse</strong> is a next-generation intent-first search engine designed for effective discovery. Unlike traditional search engines that rely on simple keyword matching, the Oxiverse ecosystem is built to understand exactly what you are looking for.
            </p>
            <p>
              <span className="text-[var(--accent)]">&gt;</span> <strong>IntentForge AI</strong> is the core engine powering our search results. By leveraging advanced semantic AI, IntentForge answers queries directly by analyzing the context and true intent behind your search, delivering unparalleled accuracy across web, news, images, and video search.
            </p>
            <p>
              <span className="text-[var(--accent)]">&gt;</span> We believe the future of discovery relies on a smarter, decentralized, and intent-driven approach. As a modern AI search engine alternative, IntentForge ensures you find the information that matters, cutting through the noise with deep semantic understanding.
            </p>
            <p>
              <span className="text-[var(--accent)]">&gt;</span> Built for the decentralized era. Open-source. Intent-driven. Explore the most advanced semantic search engine on the web today.
            </p>
          </div>

          <div className="pt-4 border-t border-[var(--border)] space-y-2 text-xs text-[var(--muted)] leading-relaxed">
            <h2 className="text-[10px] tracking-widest uppercase text-[var(--foreground)] mb-2">// Disclosure</h2>
            <p>
              <span className="text-[var(--accent)]">&gt;</span> IntentForge aggregates results from multiple third-party search engines. Some outbound links may be affiliate links — we may earn a commission from qualifying purchases at no additional cost to you. This does not influence our search rankings or result ordering, which are determined purely by relevance scoring and intent classification.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
