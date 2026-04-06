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
    try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 px-4">
        <p className="text-sm text-[var(--muted)]">
          Search found <span className="font-semibold text-[var(--foreground)]">{total.toLocaleString()}</span> results
          <span className="mx-2 text-[var(--border)]">|</span>
          <span className="text-xs">{latency_ms}ms</span>
        </p>
      </div>

      <div className="space-y-1">
        {results.map((result, idx) => (
          <article
            key={result.id}
            className="group p-4 rounded-xl hover:bg-[var(--card-hover)] border border-transparent hover:border-[var(--border)] transition-all duration-200 animate-slide-up stagger-1"
            style={{ animationDelay: `${idx * 0.04}s` }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-[var(--accent-light)] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-accent uppercase">{getDomain(result.url)[0]}</span>
                    </div>
                    <span className="text-xs text-[var(--muted)] truncate max-w-[200px]">{getDomain(result.url)}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-light)] text-accent font-medium">
                    {result.source}
                  </span>
                </div>

                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-[var(--foreground)] group-hover:text-accent transition-colors leading-snug block mb-1.5"
                >
                  {result.title}
                </a>

                {result.description && (
                  <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-2">
                    {result.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--background)] text-[var(--muted)] border border-[var(--border)]">
                    {result.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-12 h-1 rounded-full bg-[var(--border)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400 transition-all"
                        style={{ width: `${result.relevance_score * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[var(--muted)]">{(result.relevance_score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {onContentClick && (
                <button
                  onClick={() => onContentClick(result.id)}
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-2 rounded-lg hover:bg-[var(--background)] text-[var(--muted)] hover:text-accent transition-all"
                  title="View full content"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
