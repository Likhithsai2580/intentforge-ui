import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProSearchContent from '@/components/ProSearchContent';

const BASE_URL = 'https://search.oxiverse.com';

type Props = { searchParams: Promise<{ q?: string; tab?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q ? `${q} — IntentForge Search` : 'IntentForge — Intent-First Search by Oxiverse';
  const description = q
    ? `Search results for "${q}" on IntentForge — AI-powered intent-first search by Oxiverse.`
    : 'IntentForge: AI-powered, intent-first search engine by Oxiverse. Search the web, news, images, and videos.';

  return {
    title,
    description,
    alternates: { canonical: q ? `${BASE_URL}/?q=${encodeURIComponent(q)}` : BASE_URL },
    openGraph: { title, description, url: q ? `${BASE_URL}/?q=${encodeURIComponent(q)}` : BASE_URL },
    twitter: { title, description },
    robots: { index: !q, follow: true },
  };
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="pro-root min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="pro-spinner w-8 h-8 rounded-full border-2" />
          <span className="text-sm pro-muted">Loading...</span>
        </div>
      </div>
    }>
      <ProSearchContent mode="default" />
    </Suspense>
  );
}
