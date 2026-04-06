'use client';

import { useState } from 'react';
import { ImageResult } from '@/types';

interface ImageResultsProps {
  results: ImageResult[];
  total: number;
  latency_ms: number;
}

export default function ImageResults({ results, total, latency_ms }: ImageResultsProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 px-4">
        <p className="text-sm text-[var(--muted)]">
          Images found <span className="font-semibold text-[var(--foreground)]">{total.toLocaleString()}</span> results
          <span className="mx-2 text-[var(--border)]">|</span>
          <span className="text-xs">{latency_ms}ms</span>
        </p>
      </div>

      <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3">
        {results.map((result, idx) => (
          <button
            key={result.id}
            onClick={() => setLightbox(result.thumbnail_url || result.url)}
            className="group break-inside-avoid block w-full text-left animate-slide-up"
            style={{ animationDelay: `${idx * 0.03}s`, animationFillMode: 'forwards', opacity: 0 }}
          >
            <div className="relative overflow-hidden rounded-xl bg-[var(--background)] border border-[var(--border)]">
              <img
                src={result.thumbnail_url || result.url}
                alt={result.alt_text || result.title}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs text-white font-medium line-clamp-2">{result.title}</p>
                  <p className="text-[10px] text-white/70 mt-0.5">{result.source}</p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-lg animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
