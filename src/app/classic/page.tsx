import { Suspense } from 'react';
import type { Metadata } from 'next';
import SearchContent from '@/components/SearchContent';

const BASE_URL = 'https://search.oxiverse.com';

type Props = { searchParams: Promise<{ q?: string; tab?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q ? `${q} — IntentForge Classic` : 'IntentForge Classic — Terminal Search by Oxiverse';
  const description = q
    ? `Classic terminal search results for "${q}" on IntentForge.`
    : 'IntentForge Classic: the original terminal-style search experience by Oxiverse.';

  return {
    title,
    description,
    alternates: { canonical: q ? `${BASE_URL}/classic?q=${encodeURIComponent(q)}` : `${BASE_URL}/classic` },
    robots: { index: !q, follow: true },
  };
}

export default function ClassicPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center font-mono">
        <span className="text-[var(--accent)] text-sm terminal-glow">BOOTING<span className="cursor-blink">_</span></span>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
