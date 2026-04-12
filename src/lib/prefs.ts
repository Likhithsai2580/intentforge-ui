/**
 * Cookie-based user preferences store.
 * Works on both client and server (Next.js server components can read cookies too).
 * All cookies are SameSite=Lax, 1-year expiry, no sensitive data.
 */

export interface UserPrefs {
  // Appearance
  theme: 'light' | 'dark' | 'system';
  // Search behaviour
  safe_search: boolean;
  deep_search: boolean;
  results_per_page: 10 | 15 | 20 | 30;
  open_in_new_tab: boolean;
}

export const DEFAULT_PREFS: UserPrefs = {
  theme: 'system',
  safe_search: true,
  deep_search: true,
  results_per_page: 15,
  open_in_new_tab: true,
};

const COOKIE_NAME = 'if_prefs';
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// ── Helpers ────────────────────────────────────────────────────────────────────

function serialize(prefs: UserPrefs): string {
  return encodeURIComponent(JSON.stringify(prefs));
}

function deserialize(raw: string): UserPrefs {
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

// ── Client-side API ────────────────────────────────────────────────────────────

/** Read all prefs from the cookie (client-side). */
export function readPrefs(): UserPrefs {
  if (typeof document === 'undefined') return { ...DEFAULT_PREFS };
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? deserialize(match[1]) : { ...DEFAULT_PREFS };
}

/** Write all prefs to the cookie (client-side). */
export function writePrefs(prefs: UserPrefs): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=${serialize(prefs)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

/** Update a single pref key (client-side). */
export function setPref<K extends keyof UserPrefs>(key: K, value: UserPrefs[K]): UserPrefs {
  const current = readPrefs();
  const next = { ...current, [key]: value };
  writePrefs(next);
  return next;
}

/** Resolve the effective theme ('light' | 'dark') from the stored pref. */
export function resolveTheme(prefs: UserPrefs): 'light' | 'dark' {
  if (prefs.theme === 'system') {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return prefs.theme;
}

/** Parse the cookie string from a server-side `Cookie` header value. */
export function readPrefsFromCookieHeader(cookieHeader: string): UserPrefs {
  const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? deserialize(match[1]) : { ...DEFAULT_PREFS };
}
