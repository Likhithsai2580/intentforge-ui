import { NextRequest, NextResponse } from "next/server";

/**
 * Markdown representations of key pages for agent consumption.
 * Pages are returned when a request includes `Accept: text/markdown`.
 */
const PAGE_MARKDOWN: Record<string, string> = {
  "/": `# IntentForge by Oxiverse

> IntentForge is an AI-powered, intent-first search engine built by Oxiverse. It goes beyond keyword matching by classifying user intent and expanding queries semantically before searching.

## Features

- **Web Search**: Multi-engine aggregated results from SearXNG, Brave, DuckDuckGo, Bing, and more
- **News Search**: Aggregated from Bing News and Google News
- **Image Search**: Bing Images via SearXNG
- **Video Search**: YouTube/Invidious video results
- **Intent Classification**: Classifies queries into 7 intent types with confidence scores
- **Query Expansion**: Automatically expands queries with semantic variants
- **AI-Powered**: Deep semantic understanding for accurate results

## Quick Start

To search, visit \`/?q=<your-query>\` or use the search bar on the homepage.

## API

The search API is available at \`https://api.oxiverse.com/search?q=<query>\`.

### Endpoints

| Endpoint | Description |
|----------|-------------|
| \`/search?q=\` | Full web search with intent classification |
| \`/images?q=\` | Image search |
| \`/videos?q=\` | Video search |
| \`/news?q=\` | News search |
| \`/health\` | Service health check |

## Links

- Website: https://search.oxiverse.com
- About: https://search.oxiverse.com/about
- Privacy: https://search.oxiverse.com/privacy
- API Docs: https://search.oxiverse.com/.well-known/openapi.json
- Terms: https://oxiverse.com/tos
`,

  "/about": `# About IntentForge by Oxiverse

**Oxiverse** is a next-generation intent-first search engine designed for effective discovery. Unlike traditional search engines that rely on simple keyword matching, the Oxiverse ecosystem is built to understand exactly what you are looking for.

**IntentForge AI** is the core engine powering our search results. By leveraging advanced semantic AI, IntentForge answers queries directly by analyzing the context and true intent behind your search, delivering unparalleled accuracy across web, news, images, and video search.

We believe the future of discovery relies on a smarter, decentralized, and intent-driven approach. As a modern AI search engine alternative, IntentForge ensures you find the information that matters, cutting through the noise with deep semantic understanding.

Built for the decentralized era. Open-source. Intent-driven.

## Disclosure

IntentForge aggregates results from multiple third-party search engines. Some outbound links may be affiliate links. This does not influence our search rankings or result ordering.

## Links

- Homepage: https://search.oxiverse.com
- Privacy: https://search.oxiverse.com/privacy
- Parent Company: https://oxiverse.com
`,

  "/privacy": `# Privacy Policy — IntentForge by Oxiverse

Your privacy is important to us. IntentForge focuses on your intent without compromising your data.

We do not sell your personal data. Search queries are only used to improve ranking models via anonymous feedback loops.

## Information We Collect

- Search queries — to provide results.
- Interaction data (clicks) — to improve our AI intent engine.
- Browser and device info — to optimize rendering.

## Links

- Homepage: https://search.oxiverse.com
- About: https://search.oxiverse.com/about
- Terms: https://oxiverse.com/tos
`,
};

/** Count approximate tokens in a string (4 chars ≈ 1 token). */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Middleware that handles Markdown for Agents content negotiation.
 * When a request includes Accept: text/markdown, returns a markdown
 * representation of the page instead of the HTML version.
 */
export function middleware(request: NextRequest) {
  const accept = request.headers.get("accept") || "";
  const wantsMarkdown = accept.includes("text/markdown");
  const { pathname } = request.nextUrl;

  // Only intercept pages that have markdown representations
  if (wantsMarkdown && PAGE_MARKDOWN[pathname]) {
    const markdown = PAGE_MARKDOWN[pathname];
    const tokens = estimateTokens(markdown);

    return new NextResponse(markdown, {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "x-markdown-tokens": String(tokens),
        "vary": "Accept",
        "cache-control": "public, max-age=3600, s-maxage=86400",
      },
    });
  }

  // Pass through for all other requests
  return NextResponse.next();
}

/** Match only top-level pages, excluding API routes and static files. */
export const config = {
  matcher: ["/", "/about", "/privacy"],
};
