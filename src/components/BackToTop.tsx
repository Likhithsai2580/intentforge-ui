'use client';

import { useState, useEffect } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 px-3 py-2 font-mono text-xs border border-[var(--accent)] text-[var(--accent)] bg-[var(--background)] hover:bg-[var(--accent-light)] transition-all duration-200 animate-fade-in tracking-widest uppercase"
      style={{ boxShadow: '0 0 12px rgba(0,255,157,0.2)' }}
      aria-label="Back to top"
    >
      [^top]
    </button>
  );
}
