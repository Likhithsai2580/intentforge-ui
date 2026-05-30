'use client';

import { SearchResult } from '@/types';

interface WebResultsProps {
  results: SearchResult[];
  total: number;
  latency_ms: number;
  message?: string | null;
  onContentClick?: (id: string) => void;
}

export default function WebResults({ results, total, latency_ms, message, onContentClick }: WebResultsProps) {
  const getDomain = (url: string) => {
    try {
      let target = url;
      if (url.includes('redirect.viglink.com')) {
        const urlObj = new URL(url);
        const u = urlObj.searchParams.get('u');
        if (u) target = u;
      }
      return new URL(target).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="font-mono">
      <div className="flex items-center gap-3 mb-6 px-1 text-xs text-[var(--muted)]">
        <span className="text-[var(--accent)]">$</span>
        <span>found <span className="text-[var(--foreground)]">{total.toLocaleString()}</span> results</span>
        <span className="text-[var(--border)]">//</span>
        <span className="text-[var(--terminal-cyan)]">{latency_ms}ms</span>
      </div>

      <div className="space-y-2">
        {results.map((result, idx) => (
          <article
            key={result.id}
            className="group p-4 border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--card)] hover:bg-[var(--card-hover)] transition-all duration-150 animate-slide-up"
            style={{ animationDelay: `${idx * 0.04}s` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-[var(--muted)] text-xs mt-1 flex-shrink-0 w-5 text-right">{idx + 1}.</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-[var(--muted)] truncate max-w-[200px]">{getDomain(result.url)}</span>
                  <span className="text-[9px] px-1.5 py-0.5 border border-[var(--border)] text-[var(--muted)] uppercase tracking-wider">
                    {result.source}
                  </span>
                </div>

                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors leading-snug block mb-1.5 terminal-glow-dim hover:terminal-glow"
                >
                  &gt; {result.title}
                </a>

                {result.description && (
                  <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
                    {result.description}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 uppercase tracking-wider">
                    {result.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1 bg-[var(--border)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] transition-all"
                        style={{ width: `${result.relevance_score * 100}%`, boxShadow: '0 0 4px var(--accent)' }}
                      />
                    </div>
                    <span className="text-[10px] text-[var(--muted)]">{(result.relevance_score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {onContentClick && !result.id.startsWith('http') && (
                <button
                  onClick={() => onContentClick(result.id)}
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0 px-2 py-1 border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all text-[10px] uppercase tracking-wider"
                  title="View full content"
                >
                  [view]
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
