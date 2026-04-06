'use client';

import Link from 'next/link';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  query: string;
  onSearch: (q: string) => void;
  isLoading: boolean;
}

export default function Header({ query, onSearch, isLoading }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-4 sm:gap-8">
        <button 
          onClick={() => window.location.href = '/'}
          className="flex-shrink-0 group flex items-center gap-2"
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
            Oxiverse
          </h1>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-accent/10 border border-accent/20 text-accent uppercase tracking-wider">
            Beta
          </span>
        </button>
        
        <div className="flex-1 max-w-2xl">
          <SearchBar
            initialQuery={query}
            onSearch={onSearch}
            isLoading={isLoading}
            hasResults={true}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden md:flex items-center gap-4 mr-2">
            <a href="https://oxiverse.com" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              About
            </a>
            <Link href="/settings" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              Settings
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
