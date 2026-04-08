import type { Metadata } from "next";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "IntentForge by Oxiverse privacy policy. We do not sell your data. Learn how we handle search queries and interaction data.",
  alternates: { canonical: "https://search.oxiverse.com/privacy" },
  openGraph: {
    title: "Privacy Policy — IntentForge by Oxiverse",
    description: "We do not sell your data. Learn how IntentForge handles your search queries.",
    url: "https://search.oxiverse.com/privacy",
  },
};

export default function Privacy() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-8 font-mono">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] mb-10 transition-colors tracking-wider uppercase"
        >
          &lt; back
        </Link>

        <div className="mb-8">
          <p className="text-[10px] text-[var(--muted)] tracking-widest mb-1">// legal</p>
          <h1 className="text-2xl font-mono text-[var(--accent)] terminal-glow tracking-wider">PRIVACY_POLICY</h1>
        </div>

        <div className="border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)]">
          <div className="px-4 py-2 bg-[var(--background)]">
            <span className="text-[10px] text-[var(--muted)] tracking-widest uppercase">privacy.md</span>
          </div>
          <div className="p-6 space-y-5 text-xs text-[var(--muted)] leading-relaxed">
            <p>
              <span className="text-[var(--accent)]">&gt;</span> Your privacy is important to us. IntentForge focuses on your intent without compromising your data.
            </p>
            <p>
              <span className="text-[var(--accent)]">&gt;</span> We do not sell your personal data. Search queries are only used to improve ranking models via anonymous feedback loops.
            </p>

            <div className="pt-2">
              <h2 className="text-xs text-[var(--foreground)] tracking-widest uppercase mb-3">// information we collect</h2>
              <ul className="space-y-2 pl-4">
                {[
                  'Search queries — to provide results.',
                  'Interaction data (clicks) — to improve our AI intent engine.',
                  'Browser and device info — to optimize rendering.',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-[var(--accent)] flex-shrink-0">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
