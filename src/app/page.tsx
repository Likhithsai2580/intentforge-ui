'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import SearchTabs from '@/components/SearchTabs';
import WebResults from '@/components/WebResults';
import NewsResults from '@/components/NewsResults';
import ImageResults from '@/components/ImageResults';
import VideoResults from '@/components/VideoResults';
import ContentModal from '@/components/ContentModal';
import ThemeToggle from '@/components/ThemeToggle';
import Pagination from '@/components/Pagination';
import BackToTop from '@/components/BackToTop';
import { searchWeb, searchNews, searchImages, searchVideos } from '@/lib/api';
import { SearchResult } from '@/types';

const suggestions = [
  'Latest AI breakthroughs',
  'Rust async programming',
  'Quantum computing explained',
  'Space exploration 2026',
  'Web development trends',
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const initialTab = searchParams.get('tab') || 'web';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [webResults, setWebResults] = useState<{ results: SearchResult[]; total: number; latency_ms: number; message?: string | null } | null>(null);
  const [newsResults, setNewsResults] = useState<{ results: any[]; total: number; latency_ms: number; sources: string[] } | null>(null);
  const [imageResults, setImageResults] = useState<{ results: any[]; total: number; latency_ms: number } | null>(null);
  const [videoResults, setVideoResults] = useState<{ results: any[]; total: number; latency_ms: number } | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 15;

  const performSearch = useCallback(async (q: string, tab: string, newOffset = 0) => {
    setLoading(true);
    setOffset(newOffset);
    router.push(`/?q=${encodeURIComponent(q)}&tab=${tab}`, { scroll: false });
    setQuery(q);

    try {
      if (tab === 'web') {
        const res = await searchWeb(q, { limit, offset: newOffset });
        setWebResults({ results: res.results, total: res.total, latency_ms: res.latency_ms, message: res.message });
      } else if (tab === 'news') {
        const res = await searchNews(q);
        setNewsResults({ results: res.results, total: res.total, latency_ms: res.latency_ms, sources: res.sources });
      } else if (tab === 'images') {
        const res = await searchImages(q);
        setImageResults({ results: res.results, total: res.total, latency_ms: res.latency_ms });
      } else if (tab === 'videos') {
        const res = await searchVideos(q);
        setVideoResults({ results: res.results, total: res.total, latency_ms: res.latency_ms });
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * limit;
    performSearch(query, activeTab, newOffset);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (q: string) => {
    setOffset(0);
    performSearch(q, activeTab, 0);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setOffset(0);
    if (query) performSearch(query, tab, 0);
  };

  const hasResults = webResults || newsResults || imageResults || videoResults;

  return (
    <main className={`min-h-screen bg-[var(--background)] relative flex flex-col transition-colors duration-300`}>
      {!hasResults && !loading ? (
        <header className="absolute top-0 right-0 p-4 z-50">
          <ThemeToggle />
        </header>
      ) : (
        <Header
          query={query}
          onSearch={handleSearch}
          isLoading={loading}
        />
      )}

      {/* Background blobs for home page */}
      {!hasResults && !loading && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-accent/20 to-cyan-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-500/20 to-pink-400/20 rounded-full blur-3xl animate-float-delay" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-accent/5 via-cyan-400/5 to-purple-500/5 rounded-full blur-3xl animate-pulse-glow" />
        </div>
      )}

      <div className="relative z-20 flex-1 flex flex-col justify-center py-12 md:py-20">
        <div className={`transition-all duration-500 ease-out w-full`}>
          {/* Home View */}
          {!hasResults && !loading && (
            <div className="text-center animate-fade-in px-4">
              <h1 className="text-6xl sm:text-7xl font-bold mb-4 bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] bg-clip-text text-transparent animate-gradient leading-tight">
                Oxiverse
              </h1>
              <p className="text-[var(--muted)] text-lg mb-12">Intent-first discovery across the web</p>
              
              <SearchBar
                initialQuery={query}
                onSearch={handleSearch}
                isLoading={loading}
                hasResults={false}
              />

              <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto mt-10">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSearch(s)}
                    className="px-4 py-2 text-sm rounded-full border border-[var(--border)] text-[var(--muted)] hover:text-accent hover:border-accent hover:bg-[var(--accent-light)] transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results View */}
          {hasResults && !loading && (
            <div className="max-w-5xl mx-auto px-4 mt-6">
              <div className="border-b border-[var(--border)] mb-6 overflow-x-auto scroller-none">
                <SearchTabs activeTab={activeTab} onTabChange={handleTabChange} />
              </div>
              
              <div className="pb-12">
                {activeTab === 'web' && webResults && (
                  <WebResults
                    results={webResults.results}
                    total={webResults.total}
                    latency_ms={webResults.latency_ms}
                    message={webResults.message}
                    onContentClick={setSelectedContentId}
                  />
                )}
                {activeTab === 'news' && newsResults && (
                  <NewsResults
                    results={newsResults.results}
                    total={newsResults.total}
                    latency_ms={newsResults.latency_ms}
                    sources={newsResults.sources}
                  />
                )}
                {activeTab === 'images' && imageResults && (
                  <ImageResults
                    results={imageResults.results}
                    total={imageResults.total}
                    latency_ms={imageResults.latency_ms}
                  />
                )}
                {activeTab === 'videos' && videoResults && (
                  <VideoResults
                    results={videoResults.results}
                    total={videoResults.total}
                    latency_ms={videoResults.latency_ms}
                  />
                )}
                {((activeTab === 'web' && webResults?.results.length === 0) ||
                  (activeTab === 'news' && newsResults?.results.length === 0) ||
                  (activeTab === 'images' && imageResults?.results.length === 0) ||
                  (activeTab === 'videos' && videoResults?.results.length === 0)) && (
                  <div className="text-center py-24 animate-fade-in">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--accent-light)] flex items-center justify-center mb-4">
                      <svg className="h-8 w-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-[var(--foreground)] text-lg font-medium">No results found</p>
                    <p className="text-[var(--muted)] text-sm mt-1">Try different keywords or check your spelling</p>
                  </div>
                )}
                {activeTab === 'web' && webResults && webResults.total > limit && (
                  <Pagination
                    currentPage={Math.floor(offset / limit) + 1}
                    totalPages={Math.ceil(webResults.total / limit)}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </div>
          )}

          {/* Loading View */}
          {loading && (
            <div className="max-w-5xl mx-auto px-4 py-8">
              <div className="space-y-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-4 rounded-xl border border-[var(--border)] animate-pulse">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full bg-[var(--border)]" />
                      <div className="h-4 bg-[var(--border)] rounded w-32" />
                    </div>
                    <div className="h-6 bg-[var(--border)] rounded w-3/4 mb-3" />
                    <div className="space-y-2">
                      <div className="h-3.5 bg-[var(--border)] rounded w-full" />
                      <div className="h-3.5 bg-[var(--border)] rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="relative z-10 border-t border-[var(--border)] pt-12 pb-8 px-4 bg-[var(--card)]/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-12 gap-10 md:gap-12">
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left">
            <button 
              onClick={() => window.location.href = '/'}
              className="text-2xl font-bold bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] bg-clip-text text-transparent mb-4"
            >
              Oxiverse
            </button>
            <p className="text-sm text-[var(--muted)] leading-relaxed max-w-sm">
              Intent-first discovery across the web. Powered by IntentForge for high-quality, relevant results. Intent-driven discovery built for the decentralized era.
            </p>
          </div>
          <div className="md:col-span-3 flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest mb-6">Discovery</h3>
            <ul className="space-y-4">
              <li><a href="https://oxiverse.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--muted)] hover:text-accent transition-colors">About</a></li>
              <li><Link href="/settings" className="text-sm text-[var(--muted)] hover:text-accent transition-colors">Settings</Link></li>
              <li><a href="https://oxiverse.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--muted)] hover:text-accent transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest mb-6">Connect</h3>
            <p className="text-xs text-[var(--muted)] mb-6 leading-relaxed">
              Developed by <span className="text-[var(--foreground)] font-medium">Likhith Sai Seemala</span>. Follow our open-source journey on GitHub.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/oxiverse-labs" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] hover:border-accent transition-all duration-300"
              >
                <svg className="h-5 w-5 text-[var(--muted)] group-hover:text-accent transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                <span className="text-sm font-medium text-[var(--muted)] group-hover:text-accent transition-colors">GitHub</span>
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[var(--border)] flex flex-col items-center gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => window.location.href = '/'}
              className="text-lg font-bold bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] bg-clip-text text-transparent opacity-80 scale-90"
            >
              Oxiverse
            </button>
            <p className="text-[10px] text-[var(--muted)]">&copy; {new Date().getFullYear()} Oxiverse Search. All rights reserved.</p>
          </div>
          <div className="flex gap-8 text-[11px] font-medium text-[var(--muted)]">
            <a href="https://oxiverse.com/tos" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Terms of Service</a>
            <a href="https://oxiverse.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>


      {selectedContentId && (
        <ContentModal
          id={selectedContentId}
          onClose={() => setSelectedContentId(null)}
        />
      )}
      <BackToTop />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
