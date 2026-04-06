import { TidyURL } from 'tidy-url';

/**
 * LinkCleaner: A robust utility to unwrap search redirects and clean tracking.
 */
export class LinkCleaner {
  static REDIRECT_MAP: Record<string, string | string[]> = {
    // Engine Domain: Redirect Parameter Key
    'duckduckgo.com': 'uddg',
    'google.com': ['q', 'url'],
    'bing.com': 'u',
    'yandex.com': 'url',
    'startpage.com': 'url',
    'search.yahoo.com': 'r',
    'l.facebook.com': 'u',
    't.co': 'url'
  };

  /**
   * Unwraps a search engine redirect and returns the original destination.
   */
  static unwrap(urlStr: string): string {
    if (!urlStr) return '';
    try {
      const url = new URL(urlStr);
      const hostname = url.hostname.replace('www.', '');
      
      // Get the key(s) for this engine
      const keys = this.REDIRECT_MAP[hostname];
      if (!keys) return urlStr;

      const searchParams = url.searchParams;
      const keyList = Array.isArray(keys) ? keys : [keys];
      
      for (const key of keyList) {
        const destination = searchParams.get(key);
        if (destination) {
          // If it starts with http, it is likely the real URL
          if (destination.startsWith('http')) {
            return decodeURIComponent(destination);
          }
        }
      }
      return urlStr;
    } catch {
      return urlStr;
    }
  }

  /**
   * Fully cleans a URL by unwrapping redirects and stripping tracking parameters.
   */
  static clean(urlStr: string): string {
    const unwrapped = this.unwrap(urlStr);
    try {
      // Use tidy-url for final sanitization (removes UTMs, etc.)
      const cleaned = TidyURL.clean(unwrapped);
      return cleaned.url || unwrapped;
    } catch {
      return unwrapped;
    }
  }
}
