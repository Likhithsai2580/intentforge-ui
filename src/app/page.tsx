import { Suspense } from 'react';
import type { Metadata } from 'next';
import SearchContent from '@/components/SearchContent';

const BASE_URL = 'https://search.oxiverse.com';

type Props = {
  searchParams: Promise<{ q?: string; tab?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;

  if (!q) {
    return {
      alternates: { canonical: BASE_URL },
    };
  }

  const title = `${q} — IntentForge Search`;
  const description = `Search results for "${q}" on IntentForge — AI-powered intent-first search by Oxiverse.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/?q=${encodeURIComponent(q)}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/?q=${encodeURIComponent(q)}`,
    },
    twitter: {
      title,
      description,
    },
    robots: {
      index: false, // don't index search result pages
      follow: true,
    },
  };
}

export default function Home() {
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
