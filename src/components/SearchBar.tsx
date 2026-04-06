'use client';

import { useState, FormEvent, useRef, useEffect, useCallback } from 'react';

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  hasResults?: boolean;
}

const RECENT_KEY = 'oxiverse_recent';

export default function SearchBar({ initialQuery = '', onSearch, isLoading, hasResults }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);
  const [showRecents, setShowRecents] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      if (Array.isArray(stored)) setRecents(stored.slice(0, 5));
    } catch {}
  }, []);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setShowRecents(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowRecents(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const saveRecent = useCallback((q: string) => {
    const updated = [q, ...recents.filter(r => r !== q)].slice(0, 5);
    setRecents(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  }, [recents]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecent(query.trim());
      onSearch(query.trim());
      setShowRecents(false);
    }
  };

  const handleRecentClick = (r: string) => {
    setQuery(r);
    saveRecent(r);
    onSearch(r);
    setShowRecents(false);
  };

  const clearRecents = () => {
    setRecents([]);
    localStorage.removeItem(RECENT_KEY);
  };

  return (
    <div ref={wrapperRef} className={`relative w-full transition-all duration-500 ${hasResults ? 'max-w-2xl mx-auto' : 'max-w-3xl mx-auto'}`}>
      <form onSubmit={handleSubmit}>
        <div className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
          focused
            ? 'border-accent ring-4 ring-[var(--ring)] shadow-lg shadow-[var(--ring)]'
            : 'border-[var(--border)] shadow-sm hover:shadow-md'
        } bg-[var(--card)]`}>
          <svg className={`ml-5 h-5 w-5 flex-shrink-0 transition-colors ${focused ? 'text-accent' : 'text-[var(--muted)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { setFocused(true); if (recents.length > 0) setShowRecents(true); }}
            onBlur={() => setFocused(false)}
            placeholder="Search anything..."
            className="w-full px-4 py-4 bg-transparent text-[var(--foreground)] text-base placeholder-[var(--muted)] focus:outline-none"
          />
          {!query && (
            <kbd className="hidden sm:inline-flex mr-2 items-center gap-1 px-2 py-1 text-xs text-[var(--muted)] bg-[var(--background)] rounded-lg border border-[var(--border)]">
              <span className="font-medium">⌘</span>K
            </kbd>
          )}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="mr-2 p-2.5 rounded-xl bg-accent hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {showRecents && recents.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl animate-scale-in overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
            <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Recent searches</span>
            <button
              onClick={clearRecents}
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Clear
            </button>
          </div>
          {recents.map((r, i) => (
            <button
              key={r}
              onMouseDown={() => handleRecentClick(r)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--card-hover)] transition-colors"
            >
              <svg className="h-4 w-4 text-[var(--muted)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-[var(--foreground)] truncate">{r}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
