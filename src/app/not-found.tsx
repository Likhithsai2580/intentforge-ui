import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="text-center animate-scale-in">
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] bg-clip-text text-transparent">
            404
          </h1>
        </div>
        <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-3">Page not found</h2>
        <p className="text-[var(--muted)] mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-[var(--accent-hover)] transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-accent/25"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Back to Search
        </Link>
      </div>
    </main>
  );
}
