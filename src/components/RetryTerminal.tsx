'use client';

import { useEffect, useState } from 'react';

interface RetryTerminalProps {
  attempt: number; // 1, 2, or 3
  query: string;
}

const MESSAGES = [
  [
    '> QUERY RETURNED 0 RESULTS',
    '> ANALYZING INTENT VECTORS...',
    '> RECALIBRATING SEARCH PARAMETERS...',
    '> RETRY ATTEMPT [1/3] INITIATED',
  ],
  [
    '> ATTEMPT 1 FAILED — EXPANDING CORPUS',
    '> INJECTING SEMANTIC FALLBACK LAYER...',
    '> CROSS-REFERENCING INTENT GRAPH...',
    '> RETRY ATTEMPT [2/3] INITIATED',
  ],
  [
    '> ATTEMPT 2 FAILED — LAST RESORT PROTOCOL',
    '> ENGAGING DEEP CRAWL MODE...',
    '> FORCING BROAD MATCH HEURISTICS...',
    '> RETRY ATTEMPT [3/3] INITIATED',
  ],
];

export default function RetryTerminal({ attempt, query }: RetryTerminalProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const lines = MESSAGES[Math.min(attempt - 1, 2)];

  useEffect(() => {
    setVisibleLines(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= lines.length) clearInterval(interval);
    }, 420);
    return () => clearInterval(interval);
  }, [attempt, lines.length]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 animate-fade-in font-mono">
      <div className="border border-[var(--terminal-red)] bg-[var(--card)]" style={{ boxShadow: '0 0 30px rgba(255,80,80,0.08)' }}>
        {/* title bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--terminal-red)]/40 bg-[var(--background)]">
          <span className="text-[10px] text-[var(--terminal-red)] tracking-widest uppercase">
            INTENTFORGE_TERMINAL — RETRY PROTOCOL
          </span>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 bg-[var(--terminal-red)] opacity-60" />
            <span className="w-2.5 h-2.5 bg-[var(--terminal-amber)] opacity-60" />
            <span className="w-2.5 h-2.5 bg-[var(--accent)] opacity-60" />
          </div>
        </div>

        {/* terminal body */}
        <div className="px-6 py-5 space-y-2 min-h-[140px]">
          <p className="text-[var(--muted)] text-xs mb-3">
            <span className="text-[var(--accent)]">C:\&gt;</span> query: &quot;
            <span className="text-[var(--terminal-cyan)]">{query}</span>&quot;
          </p>
          {lines.slice(0, visibleLines).map((line, i) => (
            <p
              key={i}
              className={`text-xs ${
                line.includes('RETRY')
                  ? 'text-[var(--terminal-amber)]'
                  : 'text-[var(--muted)]'
              }`}
            >
              {line}
            </p>
          ))}
          {visibleLines < lines.length && (
            <span className="inline-block w-2 h-3 bg-[var(--accent)] animate-pulse" />
          )}
          {visibleLines >= lines.length && (
            <p className="text-[var(--accent)] text-xs animate-pulse mt-2">
              &gt; FETCHING... <span className="cursor-blink">_</span>
            </p>
          )}
        </div>

        {/* progress bar */}
        <div className="px-6 pb-5">
          <div className="flex gap-1">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`h-1 flex-1 transition-all duration-500 ${
                  n < attempt
                    ? 'bg-[var(--terminal-red)]'
                    : n === attempt
                    ? 'bg-[var(--terminal-amber)] animate-pulse'
                    : 'bg-[var(--border)]'
                }`}
              />
            ))}
          </div>
          <p className="text-[10px] text-[var(--muted)] mt-2 tracking-widest">
            ATTEMPT {attempt} OF 3
          </p>
        </div>
      </div>
    </div>
  );
}
