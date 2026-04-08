'use client';

interface SearchTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'web', label: 'ALL' },
  { id: 'news', label: 'NEWS' },
  { id: 'images', label: 'IMAGES' },
  { id: 'videos', label: 'VIDEOS' },
];

export default function SearchTabs({ activeTab, onTabChange }: SearchTabsProps) {
  return (
    <nav className="flex items-center gap-0 font-mono">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2.5 text-xs tracking-widest transition-all duration-150 border-b-2 ${
              isActive
                ? 'text-[var(--accent)] border-[var(--accent)] terminal-glow'
                : 'text-[var(--muted)] border-transparent hover:text-[var(--foreground)] hover:border-[var(--border)]'
            }`}
          >
            {isActive ? `[${tab.label}]` : tab.label}
          </button>
        );
      })}
    </nav>
  );
}
