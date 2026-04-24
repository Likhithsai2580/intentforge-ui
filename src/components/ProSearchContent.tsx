'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Clock, X, Sun, Moon, Settings, Globe, Newspaper,
  ImageIcon, Play, ExternalLink, Zap, ChevronLeft, ChevronRight,
  Sparkles, TrendingUp,
} from 'lucide-react';
import { searchWeb, searchNews, searchImages, searchVideos } from '@/lib/api';
import { SearchResult, NewsResult, ImageResult, VideoResult } from '@/types';
import { readPrefs, setPref, resolveTheme } from '@/lib/prefs';

// ── Types ──────────────────────────────────────────────────────────────────────
type Tab = 'web' | 'news' | 'images' | 'videos';
interface WebData  { results: SearchResult[]; total: number; latency_ms: number; message?: string | null }
interface NewsData { results: NewsResult[];   total: number; latency_ms: number; sources: string[] }
interface ImageData{ results: ImageResult[];  total: number; latency_ms: number }
interface VideoData{ results: VideoResult[];  total: number; latency_ms: number }

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'web',    label: 'All',    Icon: Globe },
  { id: 'news',   label: 'News',   Icon: Newspaper },
  { id: 'images', label: 'Images', Icon: ImageIcon },
  { id: 'videos', label: 'Videos', Icon: Play },
];

const SUGGESTIONS = [
  'Latest AI breakthroughs', 'Rust async programming',
  'Quantum computing explained', 'Space exploration 2026',
  'Web development trends', 'Open source LLMs',
];

const RECENT_KEY = 'oxiverse_recent';
const LIMIT = 15;

// ── Dark Mode ──────────────────────────────────────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setDark(resolveTheme(readPrefs()) === 'dark');
  }, []);
  const toggle = () => {
    const prefs = readPrefs();
    const next = resolveTheme(prefs) === 'dark' ? 'light' : 'dark';
    setPref('theme', next);
    setDark(next === 'dark');
    // keep the html-level class in sync so CSS vars update immediately
    document.documentElement.classList.toggle('if-dark-html', next === 'dark');
  };
  return { dark, toggle, mounted };
}

// ── Search Bar ─────────────────────────────────────────────────────────────────
function SearchBar({ value, onChange, onSubmit, isLoading, large = false }: {
  value: string; onChange: (v: string) => void; onSubmit: () => void;
  isLoading: boolean; large?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);
  const [showRecents, setShowRecents] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); if (Array.isArray(s)) setRecents(s.slice(0, 5)); } catch {}
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); inputRef.current?.focus(); }
      if (e.key === 'Escape') { inputRef.current?.blur(); setShowRecents(false); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowRecents(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const saveRecent = (q: string) => {
    const u = [q, ...recents.filter(r => r !== q)].slice(0, 5);
    setRecents(u); localStorage.setItem(RECENT_KEY, JSON.stringify(u));
  };

  const submit = (q: string) => { if (q.trim()) { saveRecent(q.trim()); onChange(q.trim()); onSubmit(); setShowRecents(false); } };

  return (
    <div ref={wrapperRef} className={`relative w-full ${large ? 'max-w-2xl' : 'max-w-xl'}`}>
      <form onSubmit={e => { e.preventDefault(); submit(value); }}>
        <motion.div
          animate={{ boxShadow: focused ? '0 0 0 2px rgba(139,92,246,0.5), 0 8px 32px rgba(139,92,246,0.15)' : '0 2px 12px rgba(0,0,0,0.12)' }}
          transition={{ duration: 0.2 }}
          className={`if-search-bar flex items-center gap-2 sm:gap-3 ${large ? 'px-4 sm:px-5 py-3 sm:py-4' : 'px-3 sm:px-4 py-2 sm:py-3'} rounded-2xl`}
        >
          <Search className={`flex-shrink-0 if-search-icon ${large ? 'w-5 h-5' : 'w-4 h-4'}`} />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => { setFocused(true); if (recents.length > 0) setShowRecents(true); }}
            onBlur={() => setFocused(false)}
            placeholder="Search anything..."
            className={`flex-1 min-w-0 bg-transparent if-input focus:outline-none ${large ? 'text-base' : 'text-sm'}`}
          />
          {!value && (
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md if-kbd text-xs flex-shrink-0">
              <span>⌘</span><span>K</span>
            </kbd>
          )}
          {value && !isLoading && (
            <button type="button" onClick={() => onChange('')} className="if-icon-btn p-1 rounded-lg flex-shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {isLoading ? (
            <div className="if-spinner w-5 h-5 rounded-full border-2 flex-shrink-0" />
          ) : (
            <button type="submit" disabled={!value.trim()}
              className="if-search-submit px-4 py-1.5 rounded-xl text-sm font-semibold flex-shrink-0 disabled:opacity-40 transition-all">
              Search
            </button>
          )}
        </motion.div>
      </form>

      <AnimatePresence>
        {showRecents && recents.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 if-dropdown rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 if-dropdown-header">
              <span className="text-xs font-medium if-muted flex items-center gap-1.5"><Clock className="w-3 h-3" />Recent</span>
              <button onClick={() => { setRecents([]); localStorage.removeItem(RECENT_KEY); }} className="text-xs if-muted hover:if-danger transition-colors">Clear</button>
            </div>
            {recents.map(r => (
              <button key={r} onMouseDown={() => submit(r)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left if-dropdown-item transition-colors">
                <Clock className="w-3.5 h-3.5 if-muted flex-shrink-0" />
                <span className="text-sm if-text truncate">{r}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-2 mt-6">
      {/* AI panel skeleton */}
      <div className="if-ai-panel rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="if-skel w-4 h-4 rounded-full" />
          <div className="if-skel h-3 w-24 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="if-skel h-3 w-full rounded-full" />
          <div className="if-skel h-3 w-4/5 rounded-full" />
          <div className="if-skel h-3 w-3/5 rounded-full" />
        </div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="if-result-card p-5 rounded-2xl">
          <div className="flex gap-3">
            <div className="if-skel w-5 h-5 rounded-lg flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2.5">
              <div className="if-skel h-3 w-28 rounded-full" />
              <div className="if-skel h-5 w-3/4 rounded-lg" />
              <div className="if-skel h-3 w-full rounded-full" />
              <div className="if-skel h-3 w-2/3 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── AI Insight Panel ───────────────────────────────────────────────────────────
function AIInsightPanel({ query, results }: { query: string; results: SearchResult[] }) {
  const topDomains = [...new Set(results.slice(0, 5).map(r => { try { return new URL(r.url).hostname.replace('www.', ''); } catch { return ''; } }).filter(Boolean))];
  const avgRelevance = results.length ? (results.reduce((s, r) => s + r.relevance_score, 0) / results.length * 100).toFixed(0) : '0';
  const topCategory = results.length ? results.reduce((acc, r) => { acc[r.category] = (acc[r.category] || 0) + 1; return acc; }, {} as Record<string, number>) : {};
  const primaryCategory = Object.entries(topCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="if-ai-panel rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="if-ai-icon p-1.5 rounded-lg">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold if-ai-label tracking-wide uppercase">AI Synthesis</span>
        <span className="ml-auto text-xs if-muted">{results.length} sources analyzed</span>
      </div>
      <p className="text-sm if-ai-text leading-relaxed mb-3">
        Results for <span className="if-ai-highlight font-medium">&ldquo;{query}&rdquo;</span> span{' '}
        <span className="if-ai-highlight font-medium">{primaryCategory || 'general'}</span> content with an average relevance of{' '}
        <span className="if-ai-highlight font-medium">{avgRelevance}%</span>.
        {topDomains.length > 0 && <> Top sources include {topDomains.slice(0, 3).join(', ')}.</>}
      </p>
      <div className="flex flex-wrap gap-2">
        {topDomains.slice(0, 4).map(d => (
          <span key={d} className="if-ai-chip text-xs px-2.5 py-1 rounded-full">{d}</span>
        ))}
      </div>
    </motion.div>
  );
}

// ── Web Results ────────────────────────────────────────────────────────────────
function WebResults({ results, total, latency_ms }: { results: SearchResult[]; total: number; latency_ms: number }) {
  const getDomain = (url: string) => { try { return new URL(url).hostname.replace('www.', ''); } catch { return url; } };
  const getFavicon = (url: string) => { try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`; } catch { return null; } };

  return (
    <div>
      <p className="text-xs if-muted mb-4 flex items-center gap-2">
        <TrendingUp className="w-3.5 h-3.5" />
        About <span className="if-text font-medium mx-1">{total.toLocaleString()}</span> results
        <span className="if-muted-dim">· {latency_ms}ms</span>
      </p>
      <div className="space-y-2">
        {results.map((r, idx) => (
          <motion.article key={r.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.03 }}
            whileHover={{ y: -2 }}
            className="if-result-card group p-5 rounded-2xl cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1 w-5 h-5 rounded-lg if-favicon-bg flex items-center justify-center overflow-hidden">
                {getFavicon(r.url) ? (
                  <img src={getFavicon(r.url)!} alt="" width={14} height={14}
                    onError={e => { (e.currentTarget.parentElement!).innerHTML = `<svg class="w-3 h-3 if-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`; }} />
                ) : <Globe className="w-3 h-3 if-muted" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs if-muted mb-1 truncate">{getDomain(r.url)}</p>
                <a href={r.url} target="_blank" rel="noopener noreferrer"
                  className="if-link text-base font-semibold leading-snug block mb-1.5 hover:underline underline-offset-2">
                  {r.title}
                </a>
                {r.description && (
                  <p className="text-sm if-muted leading-relaxed line-clamp-2">{r.description}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <span className="if-badge text-xs px-2 py-0.5 rounded-full">{r.category}</span>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <div className="if-relevance-track w-12 h-1 rounded-full overflow-hidden">
                      <div className="if-relevance-fill h-full rounded-full" style={{ width: `${r.relevance_score * 100}%` }} />
                    </div>
                    <span className="text-xs if-muted-dim">{(r.relevance_score * 100).toFixed(0)}%</span>
                  </div>
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 if-ext-btn p-1 rounded-lg transition-all ml-1">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

// ── News Results ───────────────────────────────────────────────────────────────
function NewsResults({ results, total, latency_ms }: { results: NewsResult[]; total: number; latency_ms: number }) {
  const fmtTime = (d: string) => { try { const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000); return h < 1 ? 'Just now' : h < 24 ? `${h}h ago` : `${Math.floor(h/24)}d ago`; } catch { return ''; } };
  const strip = (s: string) => s.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\|/g, '').trim();

  return (
    <div>
      <p className="text-xs if-muted mb-4 flex items-center gap-2">
        <Newspaper className="w-3.5 h-3.5" />
        <span className="if-text font-medium">{total.toLocaleString()}</span> articles
        <span className="if-muted-dim">· {latency_ms}ms</span>
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {results.map((r, idx) => (
          <motion.a key={idx} href={r.url} target="_blank" rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.04 }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className="if-news-card group flex flex-col rounded-2xl overflow-hidden">
            {r.thumbnail_url && (
              <div className="relative h-44 overflow-hidden">
                <img src={r.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 if-news-overlay" />
              </div>
            )}
            <div className="flex-1 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="if-source-chip text-xs px-2 py-0.5 rounded-full font-medium">{r.source.replace(/_/g, '.')}</span>
                {r.published_at && <span className="text-xs if-muted">{fmtTime(r.published_at)}</span>}
              </div>
              <h3 className="text-sm font-semibold if-text leading-snug line-clamp-2 mb-1.5">{strip(r.title)}</h3>
              <p className="text-xs if-muted line-clamp-2 leading-relaxed">{strip(r.description)}</p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}

// ── Image Results ──────────────────────────────────────────────────────────────
function ImageResults({ results, total, latency_ms }: { results: ImageResult[]; total: number; latency_ms: number }) {
  return (
    <div>
      <p className="text-xs if-muted mb-4 flex items-center gap-2">
        <ImageIcon className="w-3.5 h-3.5" />
        <span className="if-text font-medium">{total.toLocaleString()}</span> images
        <span className="if-muted-dim">· {latency_ms}ms</span>
      </p>
      <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
        {results.map((r, idx) => (
          <motion.a key={r.id || idx} href={r.url} target="_blank" rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: idx * 0.03 }}
            className="if-image-card group relative block rounded-xl overflow-hidden break-inside-avoid">
            {r.thumbnail_url ? (
              <img src={r.thumbnail_url} alt={r.alt_text || r.title} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            ) : (
              <div className="w-full h-32 if-image-placeholder flex items-center justify-center">
                <ImageIcon className="w-8 h-8 if-muted" />
              </div>
            )}
            <div className="absolute inset-0 if-image-hover-overlay opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <p className="text-xs text-white font-medium line-clamp-2 leading-snug drop-shadow">{r.title}</p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}

// ── Video Results ──────────────────────────────────────────────────────────────
function VideoResults({ results, total, latency_ms }: { results: VideoResult[]; total: number; latency_ms: number }) {
  const fmtDur = (s: number | null) => { if (!s) return null; return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; };
  const fmtViews = (n: number | null) => { if (!n) return null; return n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(0)}K` : `${n}`; };

  return (
    <div>
      <p className="text-xs if-muted mb-4 flex items-center gap-2">
        <Play className="w-3.5 h-3.5" />
        <span className="if-text font-medium">{total.toLocaleString()}</span> videos
        <span className="if-muted-dim">· {latency_ms}ms</span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {results.map((r, idx) => (
          <motion.a key={r.id || idx} href={r.url} target="_blank" rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.04 }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className="if-video-card group flex flex-col rounded-2xl overflow-hidden">
            <div className="relative aspect-video overflow-hidden if-video-thumb">
              {r.thumbnail_url ? (
                <img src={r.thumbnail_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              ) : (
                <div className="w-full h-full if-video-placeholder flex items-center justify-center">
                  <Play className="w-10 h-10 if-muted" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
                  <Play className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" />
                </div>
              </div>
              {fmtDur(r.duration_secs) && (
                <span className="absolute bottom-2 right-2 text-xs text-white bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-md font-medium">
                  {fmtDur(r.duration_secs)}
                </span>
              )}
            </div>
            <div className="p-3 flex-1">
              <h3 className="text-sm font-semibold if-text leading-snug line-clamp-2 mb-1">{r.title}</h3>
              <div className="flex items-center gap-2 text-xs if-muted">
                {r.channel && <span className="truncate">{r.channel}</span>}
                {fmtViews(r.view_count) && <span className="flex-shrink-0 if-muted-dim">{fmtViews(r.view_count)} views</span>}
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}

// ── Retry ──────────────────────────────────────────────────────────────────────
function RetryIndicator({ attempt, query }: { attempt: number; query: string }) {
  const labels = ['Expanding search scope...', 'Trying semantic fallback...', 'Last resort — deep search...'];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-32 gap-6">
      <div className="relative w-16 h-16">
        <div className="if-retry-ring absolute inset-0 rounded-full border-4" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="w-6 h-6 if-accent" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-base font-semibold if-text mb-1">{labels[Math.min(attempt - 1, 2)]}</p>
        <p className="text-sm if-muted">Searching for &ldquo;<span className="if-text">{query}</span>&rdquo;</p>
      </div>
      <div className="flex gap-2">
        {[1,2,3].map(n => (
          <motion.div key={n} className={`h-1.5 w-12 rounded-full ${n <= attempt ? 'if-retry-active' : 'if-retry-pending'}`}
            animate={n === attempt ? { opacity: [0.5, 1, 0.5] } : {}}
            transition={{ repeat: Infinity, duration: 1 }} />
        ))}
      </div>
    </motion.div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────────
function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  const pages = Array.from({ length: Math.min(total, 5) }, (_, i) => {
    if (total <= 5) return i + 1;
    if (current <= 3) return i + 1;
    if (current >= total - 2) return total - 4 + i;
    return current - 2 + i;
  });
  return (
    <div className="flex items-center justify-center gap-1 mt-12">
      <button onClick={() => onChange(current - 1)} disabled={current === 1}
        className="if-page-btn p-2 rounded-xl disabled:opacity-30 transition-all">
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map(p => (
        <button key={p} onClick={() => onChange(p)}
          className={`if-page-btn w-9 h-9 rounded-xl text-sm font-medium transition-all ${p === current ? 'if-page-active' : ''}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(current + 1)} disabled={current === total}
        className="if-page-btn p-2 rounded-xl disabled:opacity-30 transition-all">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function ProSearchContent({ mode = 'default' }: { mode?: 'default' | 'pro' }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { dark, toggle: toggleDark, mounted: themeMounted } = useDarkMode();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'web');
  const [loading, setLoading] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [retryQuery, setRetryQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [webResults,   setWebResults]   = useState<WebData   | null>(null);
  const [newsResults,  setNewsResults]  = useState<NewsData  | null>(null);
  const [imageResults, setImageResults] = useState<ImageData | null>(null);
  const [videoResults, setVideoResults] = useState<VideoData | null>(null);

  const fetchOnce = useCallback(async (q: string, tab: Tab, off: number) => {
    if (tab === 'web')    { const r = await searchWeb(q, { limit: LIMIT, offset: off }); return { results: r.results, data: { results: r.results, total: r.total, latency_ms: r.latency_ms, message: r.message } }; }
    if (tab === 'news')   { const r = await searchNews(q);   return { results: r.results, data: { results: r.results, total: r.total, latency_ms: r.latency_ms, sources: r.sources } }; }
    if (tab === 'images') { const r = await searchImages(q); return { results: r.results, data: { results: r.results, total: r.total, latency_ms: r.latency_ms } }; }
    const r = await searchVideos(q); return { results: r.results, data: { results: r.results, total: r.total, latency_ms: r.latency_ms } };
  }, []);

  const performSearch = useCallback(async (q: string, tab: Tab, newOffset = 0) => {
    setLoading(true); setRetryAttempt(0); setOffset(newOffset);
    router.push(`/?q=${encodeURIComponent(q)}&tab=${tab}`, { scroll: false });
    setQuery(q);
    try {
      let attempt = 0;
      while (attempt < 3) {
        if (attempt > 0) {
          setLoading(false); setRetryAttempt(attempt); setRetryQuery(q);
          await new Promise(r => setTimeout(r, 2200));
          setRetryAttempt(0); setLoading(true);
        }
        const { results, data } = await fetchOnce(q, tab, newOffset);
        if (results.length > 0) {
          if (tab === 'web')    setWebResults(data as WebData);
          else if (tab === 'news')   setNewsResults(data as NewsData);
          else if (tab === 'images') setImageResults(data as ImageData);
          else setVideoResults(data as VideoData);
          return;
        }
        attempt++;
      }
      const { data } = await fetchOnce(q, tab, newOffset);
      if (tab === 'web')    setWebResults(data as WebData);
      else if (tab === 'news')   setNewsResults(data as NewsData);
      else if (tab === 'images') setImageResults(data as ImageData);
      else setVideoResults(data as VideoData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRetryAttempt(0); }
  }, [router, fetchOnce]);

  useEffect(() => {
    const q = searchParams.get('q');
    const tab = (searchParams.get('tab') as Tab) || 'web';
    if (q) performSearch(q, tab, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch   = () => { if (query.trim()) { setOffset(0); performSearch(query.trim(), activeTab, 0); } };
  const handleTabChange = (tab: Tab) => { setActiveTab(tab); setOffset(0); if (query) performSearch(query, tab, 0); };
  const handlePageChange = (p: number) => { performSearch(query, activeTab, (p-1)*LIMIT); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleHome = () => { setQuery(''); setWebResults(null); setNewsResults(null); setImageResults(null); setVideoResults(null); setOffset(0); router.push('/'); };

  const hasResults = webResults || newsResults || imageResults || videoResults;
  const currentPage = Math.floor(offset / LIMIT) + 1;

  return (
    <div className={`if-root min-h-screen flex flex-col${dark ? ' if-dark' : ''}`}>

      {/* Mesh background and glows */}
      <div className="if-mesh-bg" aria-hidden />
      <div className="if-glow-tl" aria-hidden />
      <div className="if-glow-br" aria-hidden />

      {/* ── Header ── */}
      <header className="if-header sticky top-0 z-30 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <button onClick={handleHome} className="flex items-center gap-2.5 flex-shrink-0 group">
            <Image src="/assets/intentforge.JPG" alt="IntentForge" width={32} height={32}
              className="rounded-xl opacity-90 group-hover:opacity-100 transition-opacity shadow-sm" />
            <div className="hidden sm:block">
              <p className="text-[10px] if-muted font-medium tracking-widest uppercase leading-none">IntentForge</p>
              <p className="text-sm font-bold if-accent leading-none mt-0.5">Search</p>
            </div>
          </button>

          {(hasResults || loading) && (
            <div className="flex-1">
              <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch} isLoading={loading || retryAttempt > 0} />
            </div>
          )}

          <nav className="hidden md:flex items-center gap-1 ml-auto flex-shrink-0">
            <Link href="/classic" className="if-nav-btn px-3 py-1.5 rounded-xl text-sm transition-all">Classic</Link>
            <Link href="/settings?mode=pro" className="if-nav-btn p-2 rounded-xl transition-all" aria-label="Settings">
              <Settings className="w-4 h-4" />
            </Link>
            {themeMounted && (
              <button onClick={toggleDark} className="if-nav-btn p-2 rounded-xl transition-all" aria-label="Toggle theme">
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 relative z-10">

        {/* ── Landing ── */}
        <AnimatePresence>
          {!hasResults && !loading && retryAttempt === 0 && (
            <motion.div key="landing"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center min-h-[82vh] px-4 py-16">

              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-12">
                <div className="flex flex-col items-center justify-center gap-6 mb-8">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-violet-500 blur-2xl opacity-20 scale-150" />
                    <Image src="/assets/intentforge.JPG" alt="IntentForge" width={80} height={80}
                      className="rounded-3xl shadow-2xl relative z-10 border-2 border-white/10" />
                  </motion.div>
                  <div className="space-y-2">
                    <p className="text-sm if-muted font-semibold tracking-[0.3em] uppercase opacity-80">Oxiverse Ecosystem</p>
                    <h1 className="text-5xl sm:text-6xl font-extrabold if-text tracking-tight">
                      IntentForge <span className="bg-gradient-to-r from-violet-500 to-sky-400 bg-clip-text text-transparent">Search</span>
                    </h1>
                  </div>
                </div>
                
                {/* SEO Invisible Microcopy for Search Engines */}
                <div className="sr-only pb-4">
                  <h2>The IntentForge Search Engine by Oxiverse</h2>
                  <p>
                    IntentForge is a next-generation AI-powered search engine built by Oxiverse. We specialize in intent-first web search, news search, and image discovery using advanced semantic AI to move beyond traditional keyword matching. Experience the smartest search engine alternative designed for modern discovery.
                  </p>
                </div>
                <p className="text-lg if-muted max-w-lg mx-auto leading-relaxed font-medium">
                  The future of discovery. Experience intent-first search powered by state-of-the-art semantic AI.
                </p>
              </motion.div>

              <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch} isLoading={loading} large />

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center justify-center gap-3 mt-10 max-w-2xl">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button key={s}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
                    whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setQuery(s); performSearch(s, activeTab, 0); }}
                    className="if-pill px-5 py-2.5 rounded-2xl text-sm font-medium transition-all">
                    {s}
                  </motion.button>
                ))}
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="flex items-center gap-2.5 mt-14">
                <Image src="/assets/intentforge.JPG" alt="IntentForge" width={20} height={20} className="rounded-lg shadow-sm" />
                <span className="text-xs if-muted">Powered by <span className="if-text font-medium">IntentForge</span></span>
                <span className="if-muted text-xs">·</span>
                <span className="text-xs if-muted">An</span>
                <Image src="/assets/oxiverse.png" alt="Oxiverse" width={20} height={20} className="rounded-full shadow-sm" />
                <span className="text-xs if-muted"><span className="if-text font-medium">Oxiverse</span> product</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Retry ── */}
        {retryAttempt > 0 && <RetryIndicator attempt={retryAttempt} query={retryQuery} />}

        {/* ── Loading ── */}
        {loading && retryAttempt === 0 && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8"><Skeleton /></div>
        )}

        {/* ── Results ── */}
        {hasResults && !loading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 border-b if-tabs-border">
              {TABS.map(({ id, label, Icon }) => (
                <button key={id} onClick={() => handleTabChange(id)}
                  className={`if-tab flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                    activeTab === id ? 'if-tab-active' : 'if-tab-inactive'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}>

                {/* AI panel for web results */}
                {activeTab === 'web' && webResults && webResults.results.length > 0 && (
                  <AIInsightPanel query={query} results={webResults.results} />
                )}

                <div className={activeTab === 'web' ? 'max-w-3xl' : 'w-full'}>
                  {activeTab === 'web'    && webResults    && <WebResults    results={webResults.results}    total={webResults.total}    latency_ms={webResults.latency_ms} />}
                  {activeTab === 'news'   && newsResults   && <NewsResults   results={newsResults.results}   total={newsResults.total}   latency_ms={newsResults.latency_ms} />}
                  {activeTab === 'images' && imageResults  && <ImageResults  results={imageResults.results}  total={imageResults.total}  latency_ms={imageResults.latency_ms} />}
                  {activeTab === 'videos' && videoResults  && <VideoResults  results={videoResults.results}  total={videoResults.total}  latency_ms={videoResults.latency_ms} />}
                </div>

                {/* Empty */}
                {((activeTab === 'web'    && webResults?.results.length    === 0) ||
                  (activeTab === 'news'   && newsResults?.results.length   === 0) ||
                  (activeTab === 'images' && imageResults?.results.length  === 0) ||
                  (activeTab === 'videos' && videoResults?.results.length  === 0)) && (
                  <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <div className="text-5xl">🔍</div>
                    <p className="text-lg font-semibold if-text">No results found</p>
                    <p className="text-sm if-muted">Try different keywords or broaden your search</p>
                  </div>
                )}

                {activeTab === 'web' && webResults && webResults.total > LIMIT && (
                  <Pagination current={currentPage} total={Math.ceil(webResults.total / LIMIT)} onChange={handlePageChange} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="if-footer border-t mt-auto py-6 px-4 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Image src="/assets/intentforge.JPG" alt="" width={16} height={16} className="rounded opacity-60" />
            <span className="text-xs if-muted">© {new Date().getFullYear()} Oxiverse · IntentForge</span>
          </div>
          <div className="flex items-center gap-5 text-xs if-muted">
            <a href="https://oxiverse.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:if-text transition-colors">Privacy</a>
            <a href="https://oxiverse.com/tos" target="_blank" rel="noopener noreferrer" className="hover:if-text transition-colors">Terms</a>
            <Link href="/classic" className="hover:if-text transition-colors">Classic Mode</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
