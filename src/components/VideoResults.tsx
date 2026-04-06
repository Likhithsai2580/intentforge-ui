'use client';

import { VideoResult } from '@/types';

interface VideoResultsProps {
  results: VideoResult[];
  total: number;
  latency_ms: number;
}

const formatDuration = (secs: number) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatViews = (views: number) => {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
};

export default function VideoResults({ results, total, latency_ms }: VideoResultsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6 px-4">
        <p className="text-sm text-[var(--muted)]">
          Videos found <span className="font-semibold text-[var(--foreground)]">{total.toLocaleString()}</span> results
          <span className="mx-2 text-[var(--border)]">|</span>
          <span className="text-xs">{latency_ms}ms</span>
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {results.map((video, idx) => (
          <a
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--accent)] hover:shadow-lg hover:shadow-[var(--ring)] transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'forwards', opacity: 0 }}
          >
            <div className="relative aspect-video bg-[var(--background)] overflow-hidden">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-lg">
                  <svg className="h-5 w-5 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {video.duration_secs && (
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-[11px] font-medium rounded-md backdrop-blur-sm">
                  {formatDuration(video.duration_secs)}
                </span>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-[var(--foreground)] line-clamp-2 group-hover:text-accent transition-colors leading-snug">
                {video.title}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                {video.channel && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-[var(--accent-light)] flex items-center justify-center">
                      <span className="text-[8px] font-bold text-accent">{video.channel[0]}</span>
                    </div>
                    <span className="text-[11px] text-[var(--muted)] truncate max-w-[100px]">{video.channel}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[var(--muted)]">
                {video.view_count != null && video.view_count > 0 && (
                  <span>{formatViews(video.view_count)} views</span>
                )}
                <span className="text-[var(--border)]">·</span>
                <span>{video.source}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
