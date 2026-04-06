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

  const sourceColors: Record<string, string> = {
    google_news: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ddg_news: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    bing_news: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    gdelt: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    hackernews: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 px-4">
        <p className="text-sm text-[var(--muted)]">
          News found <span className="font-semibold text-[var(--foreground)]">{total.toLocaleString()}</span> results
          <span className="mx-2 text-[var(--border)]">|</span>
          <span className="text-xs">{latency_ms}ms</span>
        </p>
        <div className="flex items-center gap-1.5">
          {sources.map((s) => (
            <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sourceColors[s] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
              {s.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((result, idx) => (
          <a
            key={idx}
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--accent)] hover:shadow-lg hover:shadow-[var(--ring)] transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'forwards', opacity: 0 }}
          >
            {result.thumbnail_url && (
              <div className="relative h-36 overflow-hidden bg-[var(--background)]">
                <img
                  src={result.thumbnail_url}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )}
            <div className={`flex-1 p-4 ${!result.thumbnail_url && 'pt-3'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${sourceColors[result.source] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                  {result.source.replace(/_/g, ' ')}
                </span>
                {result.published_at && (
                  <span className="text-[11px] text-[var(--muted)]">{formatTime(result.published_at)}</span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-[var(--foreground)] group-hover:text-accent transition-colors leading-snug line-clamp-2 mb-1.5">
                {stripHtml(result.title)}
              </h3>
              <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
                {stripHtml(result.description)}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
