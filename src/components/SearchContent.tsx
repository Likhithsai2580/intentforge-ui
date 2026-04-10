'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import SearchTabs from '@/components/SearchTabs';
import WebResults from '@/components/WebResults';
import NewsResults from '@/components/NewsResults';
import ImageResults from '@/components/ImageResults';
import VideoResults from '@/components/VideoResults';
import ContentModal from '@/components/ContentModal';
import Pagination from '@/components/Pagination';
import BackToTop from '@/components/BackToTop';
import RetryTerminal from '@/components/RetryTerminal';
import EasterEggOverlay from '@/components/EasterEggOverlay';
import { searchWeb, searchNews, searchImages, searchVideos } from '@/lib/api';
import { matchEasterEgg, EasterEgg } from '@/lib/easter_eggs';
import { SearchResult } from '@/types';

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

const suggestions = [
  'Latest AI breakthroughs',
  'Rust async programming',
  'Quantum computing explained',
  'Space exploration 2026',
  'Web development trends',
];

export default function SearchContent() {
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
  const [retryAttempt, setRetryAttempt] = useState(0); // 0 = not retrying, 1-3 = retry in progress
  const [retryQuery, setRetryQuery] = useState('');
  const [activeEgg, setActiveEgg] = useState<{ egg: EasterEgg; query: string } | null>(null);
  const limit = 15;

  // Konami code listener
  useEffect(() => {
    let seq: string[] = [];
    const handler = (e: KeyboardEvent) => {
      seq = [...seq, e.key].slice(-KONAMI.length);
      if (seq.join(',') === KONAMI.join(',')) {
        setActiveEgg({ egg: { id: 'konami', pattern: /^__konami__$/, type: 'konami', response: '' }, query: '↑↑↓↓←→←→BA' });
      }
      if (e.key === 'Escape') setActiveEgg(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const fetchOnce = useCallback(async (q: string, tab: string, newOffset: number) => {
    if (tab === 'web') {
      const res = await searchWeb(q, { limit, offset: newOffset });
      return { results: res.results, data: { results: res.results, total: res.total, latency_ms: res.latency_ms, message: res.message } };
    } else if (tab === 'news') {
      const res = await searchNews(q);
      return { results: res.results, data: { results: res.results, total: res.total, latency_ms: res.latency_ms, sources: res.sources } };
    } else if (tab === 'images') {
      const res = await searchImages(q);
      return { results: res.results, data: { results: res.results, total: res.total, latency_ms: res.latency_ms } };
    } else {
      const res = await searchVideos(q);
      return { results: res.results, data: { results: res.results, total: res.total, latency_ms: res.latency_ms } };
    }
  }, [limit]);

  const performSearch = useCallback(async (q: string, tab: string, newOffset = 0) => {
    setLoading(true);
    setRetryAttempt(0);
    setOffset(newOffset);
    router.push(`/?q=${encodeURIComponent(q)}&tab=${tab}`, { scroll: false });
    setQuery(q);

    const MAX_RETRIES = 3;
    let attempt = 0;

    try {
      while (attempt < MAX_RETRIES) {
        if (attempt > 0) {
          // show retry terminal animation
          setLoading(false);
          setRetryAttempt(attempt);
          setRetryQuery(q);
          // wait for the terminal lines to animate before re-fetching
          await new Promise((r) => setTimeout(r, 2200));
          setRetryAttempt(0);
          setLoading(true);
        }

        const { results, data } = await fetchOnce(q, tab, newOffset);

        if (results.length > 0) {
          if (tab === 'web') setWebResults(data as typeof webResults);
          else if (tab === 'news') setNewsResults(data as typeof newsResults);
          else if (tab === 'images') setImageResults(data as typeof imageResults);
          else setVideoResults(data as typeof videoResults);
          return;
        }

        attempt++;
      }

      // all 3 attempts exhausted — commit empty results
      const { data } = await fetchOnce(q, tab, newOffset);
      if (tab === 'web') setWebResults(data as typeof webResults);
      else if (tab === 'news') setNewsResults(data as typeof newsResults);
      else if (tab === 'images') setImageResults(data as typeof imageResults);
      else setVideoResults(data as typeof videoResults);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
      setRetryAttempt(0);
    }
  }, [router, fetchOnce]);

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * limit;
    performSearch(query, activeTab, newOffset);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (q: string) => {
    const egg = matchEasterEgg(q);
    if (egg) {
      setActiveEgg({ egg, query: q });
      return;
    }
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
    <main className="min-h-screen bg-[var(--background)] relative flex flex-col">
      {hasResults || loading || retryAttempt > 0 ? (
        <Header query={query} onSearch={handleSearch} isLoading={loading || retryAttempt > 0} />
      ) : null}

      <div className="relative z-20 flex-1 flex flex-col justify-center py-12 md:py-20">
        <div className="transition-all duration-500 ease-out w-full">

          {/* Home / Landing */}
          {!hasResults && !loading && (
            <div className="text-center animate-fade-in px-4">
              <div className="max-w-2xl mx-auto mb-10">
                <div className="border border-[var(--border)] bg-[var(--card)]" style={{ boxShadow: '0 0 40px rgba(0,255,157,0.05)' }}>
                  <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--background)]">
                    <span className="text-[10px] font-mono text-[var(--muted)] tracking-widest uppercase">INTENTFORGE_TERMINAL v2.0</span>
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 bg-[var(--terminal-red)] opacity-60" />
                      <span className="w-2.5 h-2.5 bg-[var(--terminal-amber)] opacity-60" />
                      <span className="w-2.5 h-2.5 bg-[var(--accent)] opacity-60" />
                    </div>
                  </div>
                  <div className="px-6 pt-6 pb-4 text-left space-y-1 font-mono text-xs">
                    <p className="text-[var(--muted)]">
                      <span className="text-[var(--accent)]">OXIVERSE</span> MAINFRAME INITIALIZE...
                    </p>
                    <p className="text-[var(--muted)]">
                      LOADING INTENTFORGE PROTOCOL...{' '}
                      <span className="text-[var(--terminal-cyan)]">OK</span>
                    </p>
                    <p className="text-[var(--muted)]">INTENT-FIRST DISCOVERY ENGINE READY.</p>
                  </div>
                  <div className="flex items-center justify-center gap-6 py-4 border-t border-b border-[var(--border)] mx-6 mb-4">
                    <div className="flex flex-col items-center gap-1">
                      <Image src="/assets/intentforge.JPG" alt="IntentForge" width={40} height={40} className="rounded-sm opacity-90" />
                      <span className="text-[9px] font-mono text-[var(--muted)] tracking-widest uppercase">IntentForge</span>
                    </div>
                    <span className="text-[var(--border)] font-mono text-xl">×</span>
                    <div className="flex flex-col items-center gap-1">
                      <Image src="/assets/oxiverse.png" alt="Oxiverse" width={40} height={40} className="rounded-full opacity-90" />
                      <span className="text-[9px] font-mono text-[var(--muted)] tracking-widest uppercase">Oxiverse</span>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <SearchBar initialQuery={query} onSearch={handleSearch} isLoading={loading} hasResults={false} />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSearch(s)}
                    className="px-3 py-1.5 text-xs font-mono border border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)] transition-all duration-150 tracking-wide"
                  >
                    &gt; {s}
                  </button>
                ))}
              </div>
              <p className="mt-8 text-[10px] font-mono text-[var(--muted)] tracking-widest uppercase">
                powered by <span className="text-[var(--accent)]">IntentForge</span> // an <span className="text-[var(--terminal-cyan)]">Oxiverse</span> product
              </p>
            </div>
          )}

          {/* Results */}
          {hasResults && !loading && (
            <div className="max-w-5xl mx-auto px-4 mt-6">
              <div className="border-b border-[var(--border)] mb-6 overflow-x-auto">
                <SearchTabs activeTab={activeTab} onTabChange={handleTabChange} />
              </div>
              <div className="pb-12">
                {activeTab === 'web' && webResults && (
                  <WebResults results={webResults.results} total={webResults.total} latency_ms={webResults.latency_ms} message={webResults.message} onContentClick={setSelectedContentId} />
                )}
                {activeTab === 'news' && newsResults && (
                  <NewsResults results={newsResults.results} total={newsResults.total} latency_ms={newsResults.latency_ms} sources={newsResults.sources} />
                )}
                {activeTab === 'images' && imageResults && (
                  <ImageResults results={imageResults.results} total={imageResults.total} latency_ms={imageResults.latency_ms} />
                )}
                {activeTab === 'videos' && videoResults && (
                  <VideoResults results={videoResults.results} total={videoResults.total} latency_ms={videoResults.latency_ms} />
                )}
                {((activeTab === 'web' && webResults?.results.length === 0) ||
                  (activeTab === 'news' && newsResults?.results.length === 0) ||
                  (activeTab === 'images' && imageResults?.results.length === 0) ||
                  (activeTab === 'videos' && videoResults?.results.length === 0)) && (
                  <div className="text-center py-24 animate-fade-in font-mono">
                    <p className="text-[var(--terminal-red)] text-sm">ERR: NO_RESULTS_FOUND</p>
                    <p className="text-[var(--muted)] text-xs mt-2">// try different keywords or check your query syntax</p>
                  </div>
                )}
                {activeTab === 'web' && webResults && webResults.total > limit && (
                  <Pagination currentPage={Math.floor(offset / limit) + 1} totalPages={Math.ceil(webResults.total / limit)} onPageChange={handlePageChange} />
                )}
              </div>
            </div>
          )}

          {/* Retry terminal animation */}
          {retryAttempt > 0 && (
            <RetryTerminal attempt={retryAttempt} query={retryQuery} />
          )}

          {/* Loading skeleton */}
          {loading && retryAttempt === 0 && (
            <div className="max-w-5xl mx-auto px-4 py-8 font-mono">
              <p className="text-[var(--muted)] text-xs mb-6 animate-pulse">
                <span className="text-[var(--accent)]">C:\&gt;</span> executing query... <span className="cursor-blink">_</span>
              </p>
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-4 border border-[var(--border)] animate-pulse bg-[var(--card)]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 bg-[var(--border)]" />
                      <div className="h-3 bg-[var(--border)] rounded w-32" />
                    </div>
                    <div className="h-4 bg-[var(--border)] rounded w-3/4 mb-3" />
                    <div className="space-y-2">
                      <div className="h-3 bg-[var(--border)] rounded w-full" />
                      <div className="h-3 bg-[var(--border)] rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border)] pt-8 pb-6 px-4 bg-[var(--card)]/50 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-12 gap-8">
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-3 mb-3">
              <Image src="/assets/intentforge.JPG" alt="IntentForge" width={24} height={24} className="rounded-sm opacity-80" />
              <span className="text-sm font-mono text-[var(--accent)] terminal-glow tracking-wider">INTENTFORGE</span>
              <span className="text-[10px] text-[var(--muted)]">by</span>
              <Image src="/assets/oxiverse.png" alt="Oxiverse" width={18} height={18} className="rounded-full opacity-80" />
              <span className="text-xs font-mono text-[var(--terminal-cyan)]">OXIVERSE</span>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed max-w-sm">
              // Intent-first discovery across the web.<br />
              // Powered by IntentForge for high-quality results.
            </p>
          </div>
          <div className="md:col-span-3 flex flex-col items-center md:items-start">
            <h3 className="text-[10px] text-[var(--accent)] uppercase tracking-widest mb-4">// nav</h3>
            <ul className="space-y-3">
              <li><a href="https://oxiverse.com" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors">&gt; about</a></li>
              <li><Link href="/settings" className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors">&gt; settings</Link></li>
              <li><a href="https://oxiverse.com/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors">&gt; privacy</a></li>
            </ul>
          </div>
          <div className="md:col-span-4 flex flex-col items-center md:items-start">
            <h3 className="text-[10px] text-[var(--accent)] uppercase tracking-widest mb-4">// connect</h3>
            <p className="text-xs text-[var(--muted)] mb-4 leading-relaxed">
              dev: <span className="text-[var(--foreground)]">Likhith Sai Seemala</span>
            </p>
            <a
              href="https://github.com/oxiverse-labs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all text-xs"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              [github]
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-[var(--muted)] tracking-widest">
            &copy; {new Date().getFullYear()} OXIVERSE // INTENTFORGE. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6 text-[10px] text-[var(--muted)]">
            <a href="https://oxiverse.com/tos" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">[tos]</a>
            <a href="https://oxiverse.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">[privacy]</a>
          </div>
        </div>
      </footer>

      {selectedContentId && (
        <ContentModal id={selectedContentId} onClose={() => setSelectedContentId(null)} />
      )}
      <BackToTop />

      {activeEgg && (
        <EasterEggOverlay
          egg={activeEgg.egg}
          query={activeEgg.query}
          onDismiss={() => setActiveEgg(null)}
        />
      )}
    </main>
  );
}
