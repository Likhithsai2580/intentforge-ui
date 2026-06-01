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
interface WebData  {
  results: SearchResult[];
  total: number;
  latency_ms: number;
  message?: string | null;
  intent?: string;
  category?: string;
  confidence?: number;
  constraints?: string[];
  structured_constraints?: {
    positive: string[];
    negative: string[];
  };
  expanded_queries?: string[];
}
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
          animate={{ 
            boxShadow: focused 
              ? 'var(--if-shadow-glow)' 
              : 'var(--if-shadow-md)',
            scale: focused ? 1.01 : 1,
            borderColor: focused ? 'var(--if-accent)' : 'var(--if-glass-border)'
          }}
          transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
          className={`if-search-bar flex items-center gap-2 sm:gap-3 border ${large ? 'px-4 sm:px-6 py-3 sm:py-5' : 'px-3 sm:px-4 py-2 sm:py-3'} rounded-2xl`}
        >
          <Search className={`flex-shrink-0 if-search-icon ${large ? 'w-6 h-6' : 'w-4 h-4'}`} />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => { setFocused(true); if (recents.length > 0) setShowRecents(true); }}
            onBlur={() => setFocused(false)}
            placeholder="Search anything..."
            className={`flex-1 min-w-0 bg-transparent if-input focus:outline-none ${large ? 'text-lg' : 'text-sm'}`}
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
              className={`if-search-submit rounded-xl font-bold flex-shrink-0 disabled:opacity-40 transition-all ${large ? 'px-8 py-3 text-base' : 'px-4 py-1.5 text-sm'}`}>
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
function Skeleton({ tab }: { tab: Tab }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const randW = (base: number, range: number) => `${base + Math.floor(Math.random() * range)}%`;

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full"
    >
      {tab === 'web' && (
        <div className="max-w-3xl space-y-4">
          <motion.div variants={item} className="if-ai-panel rounded-2xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 if-skel opacity-20" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="if-skel w-5 h-5 rounded-lg" />
                <div className="if-skel h-3 w-32 rounded-full" />
              </div>
              <div className="space-y-3">
                <div className="if-skel h-3 w-full rounded-full" />
                <div className="if-skel h-3 w-5/6 rounded-full" />
                <div className="if-skel h-3 w-2/3 rounded-full" />
              </div>
            </div>
          </motion.div>
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} variants={item} className="if-result-card p-5 rounded-2xl border border-transparent">
              <div className="flex gap-4">
                <div className="if-skel w-6 h-6 rounded-lg flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-3">
                  <div className="if-skel h-2.5 w-32 rounded-full" />
                  <div className="if-skel h-5 rounded-lg" style={{ width: randW(40, 40) }} />
                  <div className="space-y-2">
                    <div className="if-skel h-3 w-full rounded-full" />
                    <div className="if-skel h-3 rounded-full" style={{ width: randW(60, 30) }} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'news' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} variants={item} className="if-news-card rounded-2xl overflow-hidden h-80">
              <div className="if-skel h-44 w-full" />
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="if-skel h-4 w-16 rounded-full" />
                  <div className="if-skel h-4 w-20 rounded-full" />
                </div>
                <div className="if-skel h-5 w-full rounded-lg" />
                <div className="if-skel h-3 rounded-full" style={{ width: randW(50, 40) }} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'images' && (
        <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
          {[...Array(12)].map((_, i) => (
            <motion.div key={i} variants={item} className="if-image-card rounded-xl overflow-hidden break-inside-avoid">
              <div className="if-skel w-full" style={{ height: [140, 200, 160, 240, 180][i % 5] }} />
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'videos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} variants={item} className="if-video-card rounded-2xl overflow-hidden">
              <div className="if-skel aspect-video w-full" />
              <div className="p-3 space-y-2">
                <div className="if-skel h-4 w-full rounded-lg" />
                <div className="if-skel h-3 rounded-full" style={{ width: randW(40, 50) }} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── AI Insight Panel ───────────────────────────────────────────────────────────
function AIInsightPanel({ data, query }: { data: WebData; query: string }) {
  const {
    results = [],
    intent = 'informational',
    category = 'informational',
    confidence = 1.0,
    structured_constraints = { positive: [], negative: [] },
    expanded_queries = []
  } = data;

  const topDomains = [...new Set(results.slice(0, 5).map(r => {
    try {
      let target = r.url;
      if (r.url.includes('redirect.viglink.com')) {
        const u = new URL(r.url).searchParams.get('u');
        if (u) target = u;
      }
      return new URL(target).hostname.replace('www.', '');
    } catch {
      return '';
    }
  }).filter(Boolean))];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="if-ai-panel rounded-2xl p-6 mb-6 border border-indigo-500/10">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="if-ai-icon p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <span className="text-xs font-bold if-ai-label tracking-wider uppercase text-indigo-400">AI Synthesis & Intent</span>
          <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[10px]">
            <span className="text-[var(--if-accent)] capitalize font-semibold">{intent}</span>
            <span className="text-[10px] if-muted">•</span>
            <span className="text-xs if-muted capitalize">{category} category</span>
            <span className="text-[10px] if-muted">•</span>
            <span className="text-xs text-emerald-400 font-medium">{(confidence * 100).toFixed(0)}% confidence</span>
          </div>
        </div>
        <span className="ml-auto text-[11px] if-muted hidden sm:inline-block">{results.length} sources analyzed</span>
      </div>

      <div className="space-y-4">
        {expanded_queries.length > 0 && (
          <div>
            <span className="text-[10px] font-semibold if-muted tracking-wider uppercase block mb-1.5 font-mono">// Query Expansions:</span>
            <div className="flex flex-wrap gap-1.5">
              {expanded_queries.map(q => (
                <span key={q} className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/5 text-indigo-300 border border-indigo-500/10 font-mono">
                  {q}
                </span>
              ))}
            </div>
          </div>
        )}

        {(structured_constraints.positive.length > 0 || structured_constraints.negative.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[var(--if-glass-border)]">
            {structured_constraints.positive.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold text-emerald-400/80 tracking-wider uppercase block mb-1.5 font-mono">// Required Concepts (+):</span>
                <div className="flex flex-wrap gap-1.5">
                  {structured_constraints.positive.map(p => (
                    <span key={p} className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                      +{p}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {structured_constraints.negative.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold text-rose-400/80 tracking-wider uppercase block mb-1.5 font-mono">// Excluding Concepts (-):</span>
                <div className="flex flex-wrap gap-1.5">
                  {structured_constraints.negative.map(n => (
                    <span key={n} className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono">
                      -{n}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {topDomains.length > 0 && (
          <div className="pt-3 border-t border-[var(--if-glass-border)]">
            <span className="text-[10px] font-semibold if-muted tracking-wider uppercase block mb-1.5 font-mono">// Identified Authorities:</span>
            <div className="flex flex-wrap gap-2">
              {topDomains.slice(0, 4).map(d => (
                <span key={d} className="if-ai-chip text-xs px-2.5 py-1 rounded-full font-mono">{d}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Web Results ────────────────────────────────────────────────────────────────
function WebResults({ results, total, latency_ms }: { results: SearchResult[]; total: number; latency_ms: number }) {
  const getDomain = (url: string) => {
    try {
      let target = url;
      if (url.includes('redirect.viglink.com')) {
        const u = new URL(url).searchParams.get('u');
        if (u) target = u;
      }
      return new URL(target).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };
  const getFavicon = (url: string) => {
    try {
      let target = url;
      if (url.includes('redirect.viglink.com')) {
        const u = new URL(url).searchParams.get('u');
        if (u) target = u;
      }
      return `https://www.google.com/s2/favicons?domain=${new URL(target).hostname}&sz=32`;
    } catch {
      return null;
    }
  };

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
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-xs if-muted truncate">{getDomain(r.url)}</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/5 border border-violet-500/10 text-violet-400 font-mono font-medium tracking-wide uppercase">
                    {r.source}
                  </span>
                  {r.is_local && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 font-mono font-medium tracking-wide uppercase">
                      local index
                    </span>
                  )}
                </div>
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
                      <div className="if-relevance-fill h-full rounded-full" style={{ width: `${Math.min(r.relevance_score * 100, 100)}%` }} />
                    </div>
                    <span className="text-xs font-medium if-muted">{Math.min(r.relevance_score * 100, 100).toFixed(0)}%</span>
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
      className="flex flex-col items-center justify-center py-40 gap-8">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl scale-150 animate-pulse" />
        <div className="relative w-20 h-20">
          <div className="if-retry-ring absolute inset-0 rounded-full border-[3px] opacity-20" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-500"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-8 h-8 if-accent" fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-bold if-text tracking-tight">{labels[Math.min(attempt - 1, 2)]}</p>
        <p className="text-sm if-muted font-medium px-4 py-1 rounded-full if-surface border if-border mx-auto inline-block">
          Query: &ldquo;<span className="if-text">{query}</span>&rdquo;
        </p>
      </div>
      <div className="flex gap-3">
        {[1,2,3].map(n => (
          <div key={n} className="relative h-1.5 w-16 rounded-full overflow-hidden if-surface-2 border if-border">
            <motion.div 
              className={`absolute inset-0 ${n <= attempt ? 'if-retry-active' : 'bg-transparent'}`}
              animate={n === attempt ? { x: ["-100%", "100%"] } : {}}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
          </div>
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
  const [committedQuery, setCommittedQuery] = useState(searchParams.get('q') || '');
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
    if (tab === 'web') {
      const r = await searchWeb(q, { limit: LIMIT, offset: off });
      return {
        results: r.results,
        data: {
          results: r.results,
          total: r.total,
          latency_ms: r.latency_ms,
          message: r.message,
          intent: r.intent,
          category: r.category,
          confidence: r.confidence,
          constraints: r.constraints,
          structured_constraints: r.structured_constraints,
          expanded_queries: r.expanded_queries
        }
      };
    }
    if (tab === 'news')   { const r = await searchNews(q);   return { results: r.results, data: { results: r.results, total: r.total, latency_ms: r.latency_ms, sources: r.sources } }; }
    if (tab === 'images') { const r = await searchImages(q); return { results: r.results, data: { results: r.results, total: r.total, latency_ms: r.latency_ms } }; }
    const r = await searchVideos(q); return { results: r.results, data: { results: r.results, total: r.total, latency_ms: r.latency_ms } };
  }, []);

  const performSearch = useCallback(async (q: string, tab: Tab, newOffset = 0) => {
    setLoading(true); setRetryAttempt(0); setOffset(newOffset);
    router.push(`/?q=${encodeURIComponent(q)}&tab=${tab}`, { scroll: false });
    setQuery(q);
    setCommittedQuery(q);
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
  const handleHome = () => { setQuery(''); setCommittedQuery(''); setWebResults(null); setNewsResults(null); setImageResults(null); setVideoResults(null); setOffset(0); router.push('/'); };

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
                  <div className="space-y-3">
                    <p className="text-xs if-muted font-bold tracking-[0.4em] uppercase opacity-70">Oxiverse Ecosystem</p>
                    <h1 className="text-6xl sm:text-7xl font-extrabold if-text tracking-tight leading-[1.1]">
                      IntentForge <span className="bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-400 bg-clip-text text-transparent">Search</span>
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
                <p className="text-xl if-muted max-w-xl mx-auto leading-relaxed font-medium">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8"><Skeleton tab={activeTab} /></div>
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
                  <AIInsightPanel data={webResults} query={committedQuery} />
                )}

                {/* JSON-LD for search results */}
                {activeTab === 'web' && webResults && webResults.results.length > 0 && (
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                      __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SearchResultsPage",
                        "name": `Search results for "${committedQuery}"`,
                        "url": `https://search.oxiverse.com/?q=${encodeURIComponent(committedQuery)}`,
                        "mainEntity": {
                          "@type": "ItemList",
                          "numberOfItems": webResults.total,
                          "itemListElement": webResults.results.slice(0, 10).map((r, i) => ({
                            "@type": "ListItem",
                            "position": i + 1,
                            "url": r.url,
                            "name": r.title,
                          }))
                        }
                      })
                    }}
                  />
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
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-32 px-4 text-center"
                  >
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150" />
                      <div className="relative if-surface p-6 rounded-full border if-border-strong shadow-lg">
                        <Search className="w-10 h-10 if-muted" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold if-text mb-2">No results found</h3>
                    <p className="text-sm if-muted max-w-sm leading-relaxed">
                      We couldn't find any results for &ldquo;<span className="if-text font-medium">{query}</span>&rdquo;. 
                      Try adjusting your keywords or switching tabs.
                    </p>
                    <button 
                      onClick={() => { setQuery(''); handleHome(); }}
                      className="mt-8 if-pill px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                    >
                      Return Home
                    </button>
                  </motion.div>
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
          <div className="flex flex-col sm:items-start items-center gap-1">
            <div className="flex items-center gap-2">
              <Image src="/assets/intentforge.JPG" alt="" width={16} height={16} className="rounded opacity-60" />
              <span className="text-xs if-muted">© {new Date().getFullYear()} Oxiverse · IntentForge</span>
            </div>
            <p className="text-[10px] if-muted opacity-60 italic">Some links may be affiliate links — <a href="/about" className="underline hover:if-text">disclosure</a>.</p>
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
