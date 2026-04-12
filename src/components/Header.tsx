'use client';

import Image from 'next/image';
import Link from 'next/link';
import SearchBar from './SearchBar';

interface HeaderProps {
  query: string;
  onSearch: (q: string) => void;
  isLoading: boolean;
}

export default function Header({ query, onSearch, isLoading }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--border)] px-4 py-2" style={{ boxShadow: '0 1px 0 0 rgba(0,255,157,0.1)' }}>
      {/* Terminal title bar */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Logo + Branding */}
          <button
            onClick={() => window.location.href = '/classic'}
            className="flex-shrink-0 flex items-center gap-2 group"
          >
            <Image
              src="/assets/intentforge.JPG"
              alt="IntentForge"
              width={28}
              height={28}
              className="rounded-sm opacity-90 group-hover:opacity-100 transition-opacity"
              style={{ imageRendering: 'crisp-edges' }}
            />
            <div className="flex flex-col leading-none">
              <span className="text-[10px] text-[var(--muted)] font-mono tracking-widest uppercase">oxiverse://</span>
              <span className="text-sm font-mono font-bold text-[var(--accent)] terminal-glow tracking-wider">INTENTFORGE</span>
            </div>
          </button>

          <span className="text-[var(--border)] font-mono text-lg hidden sm:block">|</span>

          <div className="flex-1 max-w-2xl">
            <SearchBar
              initialQuery={query}
              onSearch={onSearch}
              isLoading={isLoading}
              hasResults={true}
            />
          </div>

          <nav className="hidden md:flex items-center gap-4 ml-2">
            <a
              href="https://oxiverse.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-[var(--muted)] hover:text-[var(--accent)] transition-colors tracking-wider uppercase"
            >
              [about]
            </a>
            <Link
              href="/settings?mode=classic"
              className="text-xs font-mono text-[var(--muted)] hover:text-[var(--accent)] transition-colors tracking-wider uppercase"
            >
              [settings]
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
