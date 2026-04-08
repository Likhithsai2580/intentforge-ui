'use client';

import { NewsResult } from '@/types';

interface NewsResultsProps {
  results: NewsResult[];
  total: number;
  latency_ms: number;
  sources: string[];
}

export default function NewsResults({ results, total, latency_ms, sources }: NewsResultsProps) {
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\|/g, '').trim();
  };

  return (
    <div className="font-mono">
      <div className="flex items-center gap-3 mb-6 px-1 text-xs text-[var(--muted)]">
        <span className="text-[var(--accent)]">$</span>
        <span>found <span className="text-[var(--foreground)]">{total.toLocaleString()}</span> news results</span>
        <span className="text-[var(--border)]">//</span>
        <span className="text-[var(--terminal-cyan)]">{latency_ms}ms</span>
        <span className="text-[var(--border)]">//</span>
        <span className="text-[var(--muted)]">{sources.map(s => s.replace(/_/g, '.')).join(' ')}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {results.map((result, idx) => (
          <a
            key={idx}
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col bg-[var(--card)] border border-[var(--border)] overflow-hidden hover:border-[var(--accent)] transition-all duration-150 animate-slide-up"
            style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'forwards', opacity: 0 }}
          >
            {result.thumbnail_url && (
              <div className="relative h-32 overflow-hidden bg-[var(--background)]">
                <img
                  src={result.thumbnail_url}
                  alt=""
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] to-transparent" />
              </div>
            )}
            <div className="flex-1 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[9px] border border-[var(--border)] px-1.5 py-0.5 text-[var(--muted)] uppercase tracking-wider">
                  {result.source.replace(/_/g, '.')}
                </span>
                {result.published_at && (
                  <span className="text-[10px] text-[var(--muted)]">{formatTime(result.published_at)}</span>
                )}
              </div>
              <h3 className="text-xs text-[var(--accent)] group-hover:terminal-glow transition-colors leading-snug line-clamp-2 mb-1">
                &gt; {stripHtml(result.title)}
              </h3>
              <p className="text-[11px] text-[var(--muted)] line-clamp-2 leading-relaxed">
                {stripHtml(result.description)}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
