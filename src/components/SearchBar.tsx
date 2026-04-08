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

  useEffect(() => { setQuery(initialQuery); }, [initialQuery]);

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
    <div ref={wrapperRef} className={`relative w-full ${hasResults ? 'max-w-2xl mx-auto' : 'max-w-3xl mx-auto'}`}>
      <form onSubmit={handleSubmit}>
        <div className={`relative flex items-center transition-all duration-200 ${
          focused ? 'terminal-border-active' : 'terminal-border'
        } bg-[var(--card)]`}>
          {/* Prompt prefix */}
          <span className="ml-3 text-[var(--accent)] font-mono text-sm terminal-glow select-none flex-shrink-0">
            {isLoading ? '~$' : 'C:\\&gt;'}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { setFocused(true); if (recents.length > 0) setShowRecents(true); }}
            onBlur={() => setFocused(false)}
            placeholder="query --intent-first..."
            className="w-full px-3 py-3.5 bg-transparent text-[var(--foreground)] text-sm font-mono placeholder-[var(--muted)] focus:outline-none tracking-wide"
          />
          {!query && !hasResults && (
            <kbd className="hidden sm:inline-flex mr-2 items-center gap-1 px-2 py-1 text-[10px] text-[var(--muted)] bg-[var(--background)] font-mono border border-[var(--border)]">
              ^K
            </kbd>
          )}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="mr-2 px-3 py-2 font-mono text-xs tracking-widest border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 uppercase"
          >
            {isLoading ? (
              <span className="flex items-center gap-1">
                <span className="cursor-blink">_</span>
                <span>EXEC</span>
              </span>
            ) : (
              'RUN'
            )}
          </button>
        </div>
      </form>

      {showRecents && recents.length > 0 && (
        <div className="absolute z-50 w-full mt-0 bg-[var(--card)] border border-[var(--accent)] animate-scale-in overflow-hidden" style={{ boxShadow: '0 0 20px rgba(0,255,157,0.1)' }}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
            <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-widest">// recent queries</span>
            <button onClick={clearRecents} className="text-[10px] font-mono text-[var(--muted)] hover:text-[var(--terminal-red)] transition-colors uppercase">
              [clear]
            </button>
          </div>
          {recents.map((r) => (
            <button
              key={r}
              onMouseDown={() => handleRecentClick(r)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[var(--card-hover)] transition-colors border-b border-[var(--border)] last:border-0"
            >
              <span className="text-[var(--muted)] font-mono text-xs flex-shrink-0">↑</span>
              <span className="text-sm font-mono text-[var(--foreground)] truncate">{r}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
