# IntentForge v2 — API Reference

**Version:** 0.1.0
**Base URL:** `http://localhost:9100`
**Content-Type:** `application/json`
**Protocol:** HTTP/1.1

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Search](#get-search)
  - [News](#get-news)
  - [Images](#get-images)
  - [Videos](#get-videos)
  - [Get Full Content](#get-contentid)
  - [Crawl Single URL](#get-crawl)
  - [Batch Crawl](#post-crawlbatch)
  - [Health Check](#get-health)
  - [Metrics](#get-metrics)
  - [Discovery Status](#get-discoverystatus)
  - [Discovery Enqueue](#post-discoveryenqueue)
  - [Admin Reindex Scores](#post-adminreindex-scores)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Prometheus Metrics](#prometheus-metrics)
- [Configuration Reference](#configuration-reference)

---

## Overview

IntentForge is an intent-first discovery engine that provides hybrid semantic + keyword search over autonomously discovered web content. The HTTP API is built with [Axum](https://github.com/tokio-rs/axum) and exposes endpoints for crawling, searching, content discovery, and operational monitoring.

All responses use `application/json` content-type unless otherwise noted (the `/metrics` endpoint returns Prometheus text format).

---

## Authentication

The API does not enforce authentication on its endpoints. Meilisearch and Redis connections are authenticated internally using configuration from `config.yaml`. Expose this API only behind a trusted network boundary or reverse proxy with authentication.

---

## Endpoints

### `GET /search`

Hybrid semantic + keyword search across the indexed corpus. Combines local Meilisearch results with real-time meta-search discovery from SearXNG (70+ engines via Tor) and 8 direct providers with intent-weighted scoring. Applies query expansion, auto-filtering, cross-encoder re-ranking, and deduplication.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | **Yes** | — | Search query. Supports natural language for semantic matching. |
| `limit` | integer | No | `15` | Maximum number of results to return. |
| `offset` | integer | No | `0` | Number of results to skip (pagination). |
| `filter` | string | No | — | Meilisearch filter expression (e.g. `intent_score > 0.8 AND category = "tech"`). |
| `category` | string | No | — | Filter by category (e.g. `tech`, `science`). |
| `media_type` | string | No | — | Filter by media type: `text`, `image`, `video`. |
| `semantic_ratio` | float | No | `0.7` | Weight of semantic scoring vs keyword scoring (0.0–1.0). `0.0` = pure keyword, `1.0` = pure semantic. |

**Behavior:**

1. The query is expanded using synonym/abbreviation expansion (e.g. "nlp" → "natural language processing").
2. Auto-filters are applied: `spam_score < 0.5` always; `commercial_score < 0.7` unless commercial intent is detected (query contains "buy", "price", or "discount").
3. The local Meilisearch index is searched first (sub-50ms target).
4. If local results are insufficient (fewer than 15 high-quality results) AND (local search completed under 3s or returned empty), a synchronous meta-search phase runs with a 4000ms timeout. Meta-search queries all providers with provider-specific timeouts (SearXNG: 8s, DDG/Bing/GDELT: 4s, GitHub/ArXiv/Reddit: 6s) and a 6s global aggregator timeout. Early exit triggers at 15 results from a high-quality engine. All meta-search traffic is routed through Tor (Snowflake bridges with socks5h:// DNS resolution).
5. The top 15 results are re-scored using ONNX cross-encoder re-ranking, blended with the configured `semantic_ratio`.
6. Results are deduplicated by URL.
7. If zero results or low-quality results are returned, the query is automatically queued for background indexing via the self-improvement pipeline. The self-improvement process runs up to 10 rounds with 500ms inter-round delay (3× faster than before), a 360s distributed lock TTL, relative candidate ranking (RRF × 0.4 + intent alignment × 0.3 + source weight × 0.3), quality-gated indexing (intent ≥ 0.30, relevance ≥ 0.30), and partial improvements. After indexing, a re-search is performed and cached if it meets the relaxed threshold (≥3 quality results and ≥5 total).

**Response: `200 OK`**

```json
{
  "query": "rust async runtime",
  "results": [
    {
      "id": "a1b2c3d4",
      "title": "Understanding Tokio: The Rust Async Runtime",
      "url": "https://tokio.rs/blog/understanding-tokio",
      "description": "A deep dive into Tokio's task scheduler, I/O driver, and timer implementation.",
      "category": "tech",
      "source": "trending",
      "media_type": "text",
      "thumbnail_url": null,
      "intent_score": 0.92,
      "relevance_score": 0.88,
      "commercial_score": 0.0,
      "spam_score": 0.05
    }
  ],
  "total": 1,
  "latency_ms": 42,
  "message": null
}
```

**Field Reference:**

| Field | Type | Description |
|-------|------|-------------|
| `query` | string | The original query as received. |
| `results` | array[[SearchResult](#searchresult)] | Ordered list of matching documents. |
| `total` | integer | Number of results in this response (after limit/offset). |
| `latency_ms` | integer | Total request latency in milliseconds. |
| `message` | string\|null | Advisory message. Present when discovery timed out and results are partial. |

---

### `GET /news`

Dedicated news search endpoint. Aggregates results from 5+ sources concurrently: Google News RSS, DuckDuckGo News, Bing News, GDELT (global event database), and Hacker News. Supports optional location-based enrichment.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | **Yes** | — | News search query. |
| `limit` | integer | No | `10` | Maximum number of results. |
| `category` | string | No | — | Category filter (passed to providers that support it). |
| `location` | string | No | — | Location string for geo-enriched news (e.g. `"San Francisco, CA, USA"`). Parsed as `city, state, country`. Triggers Google News geo, GDELT local news, and location-enriched Bing searches. |

**Behavior:**

- Each provider is queried with a 2-second timeout.
- Results are deduplicated by URL across all providers.
- Google News results with `"Published: "` prefix in the description have their publish date extracted into the `published_at` field.
- Early termination: stops collecting once `limit` results are gathered.

**Response: `200 OK`**

```json
{
  "query": "artificial intelligence regulation",
  "results": [
    {
      "title": "EU AI Act: What Developers Need to Know",
      "url": "https://news.example.com/eu-ai-act",
      "description": "The European Union's comprehensive AI regulation framework...",
      "source": "google_news",
      "published_at": "2026-03-28",
      "thumbnail_url": null
    }
  ],
  "total": 1,
  "latency_ms": 1850,
  "sources": ["google_news", "duckduckgo_news", "bing_news", "gdelt", "hackernews"]
}
```

**Field Reference:**

| Field | Type | Description |
|-------|------|-------------|
| `query` | string | Original query. |
| `results` | array[[NewsResult](#newsresult)] | Aggregated news articles. |
| `total` | integer | Number of results returned. |
| `latency_ms` | integer | Request latency in milliseconds. |
| `sources` | array[string] | List of provider names that contributed results. |

---

### `GET /images`

Dedicated image search endpoint. Searches the local Meilisearch index (for crawled image metadata) and external providers (Pixabay, Pexels) concurrently.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | **Yes** | — | Image search query. |
| `limit` | integer | No | `10` | Maximum number of results. |
| `category` | string | No | — | Category filter for local index results. |

**Behavior:**

- Local index search and external provider search run concurrently via `tokio::join!`.
- External provider search has a 6-second timeout.
- The `media_type = "image"` filter is automatically applied to local index queries.
- Local results (higher intent relevance) are merged before external results.
- External providers are rate-limited per-provider (Pixabay: 100 req/60s, Pexels: 200 req/hour).
- External results are cached per query for the configured TTL (default: 24 hours).

**API Keys:** Set `PIXABAY_API_KEY` and/or `PEXELS_API_KEY` environment variables to enable external providers.

**Response: `200 OK`**

```json
{
  "query": "mountain landscape",
  "results": [
    {
      "id": "pixabay_12345",
      "title": "Mountain Landscape",
      "url": "https://pixabay.com/photos/mountain-landscape-12345/",
      "source": "pixabay",
      "category": "",
      "intent_score": 0.5,
      "relevance_score": 0.5,
      "thumbnail_url": "https://cdn.pixabay.com/photo/preview.jpg",
      "alt_text": null,
      "photographer": "john_doe",
      "width": 1920,
      "height": 1080,
      "avg_color": null
    }
  ],
  "total": 1,
  "latency_ms": 320,
  "sources": ["pixabay", "pexels"]
}
```

**Field Reference:**

| Field | Type | Description |
|-------|------|-------------|
| `query` | string | Original query. |
| `results` | array[[ImageResult](#imageresult)] | Merged image results. |
| `total` | integer | Number of results returned. |
| `latency_ms` | integer | Request latency in milliseconds. |
| `sources` | array[string] | Provider names that contributed results. |

---

### `GET /videos`

Dedicated video search endpoint. Searches indexed video documents from Meilisearch and performs live discovery across 8 video sources: YouTube (via YouTube Unified, direct API, RapidAPI fallback), Piped, Invidious, Internet Archive, Vimeo, Dailymotion, and Odysee.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | **Yes** | — | Video search query. |
| `limit` | integer | No | `10` | Maximum number of results. |
| `category` | string | No | — | Category filter for indexed results. |

**Behavior:**

1. Indexed video documents are retrieved from Meilisearch with `media_type = "video"` filter.
2. Live search is dispatched to all enabled video sources concurrently. YouTube Unified gets a 12-second timeout; all other sources get 5 seconds.
3. Each video is scored using an intent-first video scorer that evaluates title relevance, description quality, channel authority, duration appropriateness, and view count signals.
4. Results are sorted by intent score (descending), then relevance score.
5. Videos failing the quality gate are filtered out (unless fewer than 5 quality results exist).
6. Results are cached per query for the configured TTL (default: 1800s).

**Response: `200 OK`**

```json
{
  "query": "rust programming tutorial",
  "results": [
    {
      "id": "yt-unified-dQw4w9WgXcQ",
      "title": "Rust in 100 Seconds",
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "source": "YouTube (Unified)",
      "description": null,
      "intent_score": 0.91,
      "relevance_score": 0.85,
      "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      "duration_secs": 120,
      "view_count": 1500000,
      "channel": "Fireship",
      "published_at": "2024-01-15T00:00:00+00:00"
    }
  ],
  "total": 1,
  "latency_ms": 4200,
  "sources": ["youtube_unified", "piped", "invidious"]
}
```

**Field Reference:**

| Field | Type | Description |
|-------|------|-------------|
| `query` | string | Original query. |
| `results` | array[[VideoResult](#videoresult)] | Merged video results. |
| `total` | integer | Number of results returned. |
| `latency_ms` | integer | Request latency in milliseconds. |
| `sources` | array[string] | Provider names that contributed results. |

---

### `GET /content/:id`

Retrieve full content for a document from Redis compressed storage. Documents are stored with their full text content during indexing and can be retrieved later via this endpoint.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | **Yes** | Document ID (e.g. `a1b2c3d4` or `ext-8f3a2b1c`). |

**Response: `200 OK` (found)**

```json
{
  "id": "a1b2c3d4",
  "content": "Full text content of the document. This is the complete extracted text from the web page, stored in Redis with Zstd compression. The content can be several kilobytes long..."
}
```

**Response: `404 Not Found`**

```json
{
  "error": "Content not found in Redis"
}
```

**Response: `500 Internal Server Error`**

```json
{
  "error": "Redis connection error: Connection refused"
}
```

**Notes:**

- Content is stored during indexing for both local and externally enriched documents.
- Storage uses Zstd compression to minimize memory footprint.
- This endpoint is useful for displaying full article content without re-crawling.

---

### `GET /crawl`

Crawl a single URL, extracting content via static HTML fetch (with Trafilatura integration for content extraction). Respects robots.txt if configured.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | **Yes** | — | The URL to crawl. Must be a valid HTTP/HTTPS URL. |

**Response: `200 OK` (success)**

```json
{
  "url": "https://example.com/article",
  "title": "Example Article Title",
  "content_length": 15234,
  "success": true,
  "latency_ms": 1250,
  "error": null
}
```

**Response: `200 OK` (failure)**

```json
{
  "url": "https://invalid.example.com/404",
  "title": "",
  "content_length": 0,
  "success": false,
  "latency_ms": 500,
  "error": "HTTP 404: Not Found"
}
```

**Field Reference:**

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | The crawled URL (may differ from input due to redirects). |
| `title` | string | Extracted page title. Empty on failure. |
| `content_length` | integer | Length of extracted text content in characters. |
| `success` | boolean | Whether the crawl succeeded. |
| `latency_ms` | integer | Crawl latency in milliseconds. |
| `error` | string\|null | Error message on failure. `null` on success. |

**Notes:**

- This endpoint fetches the URL but does **not** index it into Meilisearch. Use the search endpoint's background enrichment or discovery enqueue for automatic indexing.
- The crawler respects robots.txt, applies adaptive rate limiting (default 10 req/s), and uses a static-first strategy.

---

### `POST /crawl/batch`

Crawl multiple URLs in a single request. Uses the crawler's batch fetch mechanism with concurrency control and rate limiting.

**Request Body:**

```json
{
  "urls": [
    "https://example.com/page1",
    "https://example.com/page2",
    "https://example.com/page3"
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `urls` | array[string] | **Yes** | List of URLs to crawl. |

**Response: `200 OK`**

```json
[
  {
    "url": "https://example.com/page1",
    "title": "Page One",
    "content_length": 8500,
    "success": true,
    "latency_ms": 0,
    "error": null
  },
  {
    "url": "https://example.com/page2",
    "title": "Page Two",
    "content_length": 12300,
    "success": true,
    "latency_ms": 0,
    "error": null
  }
]
```

**Response: `500 Internal Server Error` (batch failure)**

```json
[
  {
    "url": "batch",
    "title": "",
    "content_length": 0,
    "success": false,
    "latency_ms": 45,
    "error": "Crawler error: connection refused"
  }
]
```

**Notes:**

- Batch requests are subject to the same rate limiting and concurrency controls as individual requests (`max_concurrent` from config, default 8).
- Individual URL latency is reported as `0` in batch responses; total batch latency is tracked via Prometheus metrics.

---

### `GET /health`

Simple health check endpoint. Returns `200 OK` with status JSON when the service is running.

**Response: `200 OK`**

```json
{
  "status": "ok"
}
```

**Content-Type:** `application/json`

**Notes:**

- This is a liveness check only. It does not verify downstream dependencies (Meilisearch, Redis, ONNX model).
- For monitoring downstream health, use `GET /metrics` and observe `intentforge_search_requests_total` and `intentforge_crawl_requests_total` counters.

---

### `GET /metrics`

Prometheus-compatible metrics endpoint. Returns all registered metrics in Prometheus exposition format.

**Response: `200 OK`**

**Content-Type:** `text/plain; version=0.0.4; charset=utf-8` (Prometheus text format)

Example output:

```
# HELP intentforge_crawl_requests_total Total crawl requests
# TYPE intentforge_crawl_requests_total counter
intentforge_crawl_requests_total 1542

# HELP intentforge_search_requests_total Total search requests
# TYPE intentforge_search_requests_total counter
intentforge_search_requests_total 8932

# HELP intentforge_search_latency_seconds Search latency
# TYPE intentforge_search_latency_seconds histogram
intentforge_search_latency_seconds_bucket{le="0.005"} 4521
intentforge_search_latency_seconds_bucket{le="0.01"} 7832
intentforge_search_latency_seconds_bucket{le="0.05"} 8901
intentforge_search_latency_seconds_bucket{le="+Inf"} 8932
intentforge_search_latency_seconds_sum 198.4
intentforge_search_latency_seconds_count 8932

# HELP intentforge_zero_result_searches_total Total searches with zero results (triggers background indexing)
# TYPE intentforge_zero_result_searches_total counter
intentforge_zero_result_searches_total 47
```

See [Prometheus Metrics](#prometheus-metrics) for the full list of exported metrics.

---

### `GET /discovery/status`

Returns the current state of the autonomous discovery service, including crawl queue size and configured discovery domains.

**Response: `200 OK`**

```json
{
  "queue_size": 1247,
  "last_cycle_secs": 45,
  "domains": ["github.com", "arxiv.org", "news.ycombinator.com", "stackoverflow.com", "medium.com", "dev.to"],
  "max_queue_size": 50000
}
```

**Field Reference:**

| Field | Type | Description |
|-------|------|-------------|
| `queue_size` | integer | Current number of URLs in the Redis crawl queue. |
| `last_cycle_secs` | integer\|null | Seconds elapsed since the last completed discovery cycle. `null` if no cycle has completed yet. |
| `domains` | array[string] | List of domains configured for Common Crawl delta discovery. |
| `max_queue_size` | integer | Maximum queue size before discovery pauses (backpressure). |

---

### `POST /discovery/enqueue`

Manually enqueue a URL for crawling and indexing. The URL is added to the Redis priority queue and processed by the background discovery queue processor.

**Request Body:**

```json
{
  "url": "https://arxiv.org/abs/2401.12345",
  "category": "science",
  "priority": 8
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `url` | string | **Yes** | — | URL to enqueue. Must be a valid HTTP/HTTPS URL. |
| `category` | string | No | `"manual"` | Category label for the URL. Used for filtering and scoring. |
| `priority` | integer | No | `5` | Priority level (1–10). Higher values are processed first. Score = `priority * 100000 + timestamp`. |

**Response: `200 OK` (enqueued)**

```json
{
  "url": "https://arxiv.org/abs/2401.12345",
  "enqueued": true,
  "error": null
}
```

**Response: `200 OK` (already seen)**

```json
{
  "url": "https://arxiv.org/abs/2401.12345",
  "enqueued": false,
  "error": null
}
```

**Response: `500 Internal Server Error`**

```json
{
  "url": "https://arxiv.org/abs/2401.12345",
  "enqueued": false,
  "error": "Redis connection error: Connection refused"
}
```

**Notes:**

- URLs are deduplicated via Redis Bloom filter (`crawl:seen`). If a URL has been seen before, `enqueued` will be `false`.
- The queue processor runs continuously, popping URLs in priority order and batch-crawling them (up to 20 at a time).
- Crawled documents are automatically embedded via ONNX and indexed into Meilisearch.

---

### `POST /admin/reindex-scores`

Administrative endpoint that re-indexes all documents in Meilisearch, recalculating `intent_score` and `relevance_score` using the current ONNX embedding model. Use this to fix legacy scores after model upgrades or scoring algorithm changes.

**Request Body:** None (empty body).

**Response: `200 OK` (completed)**

```json
{
  "status": "completed",
  "documents_processed": 15420,
  "error": null
}
```

**Response: `500 Internal Server Error`**

```json
{
  "status": "error",
  "documents_processed": 3200,
  "error": "Meilisearch task timeout"
}
```

**Field Reference:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `"completed"` or `"error"`. |
| `documents_processed` | integer | Total number of documents updated. |
| `error` | string\|null | Error message on failure. |

**Notes:**

- Processes documents in batches of 50.
- Only documents with out-of-range scores (`intent_score < 0` or `> 1`, `relevance_score < 0.1` or `> 1.0`) are updated. Documents with valid scores are skipped.
- Recalculated scores: `intent_score` = cosine similarity between title+category embedding and content embedding; `relevance_score` = `intent_score * 0.4 + quality_score * 0.4`, clamped to `[0.1, 1.0]`.
- This is a potentially long-running operation. Monitor progress via the `documents_processed` field in the response.

---

## Data Models

### SearchResult

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique document identifier. |
| `title` | string | Document title. |
| `url` | string | Canonical URL of the document. |
| `description` | string\|null | Short description or snippet. |
| `category` | string | Content category (e.g. `tech`, `science`, `video`, `discovery`). |
| `source` | string | Origin source (e.g. `trending`, `discovery`, `hackernews`, `google_news`). |
| `media_type` | string | Content type: `"text"`, `"image"`, or `"video"`. |
| `thumbnail_url` | string\|null | Thumbnail image URL, if available. |
| `intent_score` | float | Semantic alignment score between query intent and document content. Range: `[0.0, 1.0]`. |
| `relevance_score` | float | Composite relevance score (blended after re-ranking). Range: `[0.0, 1.0]`. |
| `commercial_score` | float | Commercial intent detection score. Higher values indicate commercial/promotional content. Range: `[0.0, 1.0]`. |
| `spam_score` | float | Spam/low-quality detection score. Higher values indicate likely spam. Range: `[0.0, 1.0]`. |

### NewsResult

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Article headline. |
| `url` | string | Article URL. |
| `description` | string | Article summary or snippet. |
| `source` | string | Provider name: `"google_news"`, `"duckduckgo_news"`, `"bing_news"`, `"gdelt"`, `"hackernews"`. |
| `published_at` | string\|null | Publication date in `YYYY-MM-DD` format, if available. Extracted from Google News description format. |
| `thumbnail_url` | string\|null | Thumbnail image URL, if available. |

### ImageResult

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique image identifier. Prefix indicates provider (e.g. `pixabay_`, `pexels_`, `img-`). |
| `title` | string | Image title or primary tag. |
| `url` | string | Link to the image page (provider page, not direct image URL). |
| `source` | string | Provider name: `"pixabay"`, `"pexels"`, or indexed source name. |
| `category` | string | Category label. Empty for external provider results. |
| `intent_score` | float | Intent alignment score. `0.5` for external results; computed for indexed results. |
| `relevance_score` | float | Relevance score. `0.5` for external results; computed for indexed results. |
| `thumbnail_url` | string\|null | Preview/thumbnail image URL. |
| `alt_text` | string\|null | Alternative text description (from indexed results). |
| `photographer` | string\|null | Photographer or creator name (from Pixabay/Pexels). |
| `width` | integer\|null | Image width in pixels. |
| `height` | integer\|null | Image height in pixels. |
| `avg_color` | string\|null | Average color as hex string (from Pexels). |

### VideoResult

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique video identifier. Prefix indicates source (e.g. `yt-unified-`, `piped-`, `invidious-`, `archive-`, `vimeo-`, `dailymotion-`, `odysee-`). |
| `title` | string | Video title. |
| `url` | string | Video watch page URL. |
| `source` | string | Source name: `"YouTube (Unified)"`, `"YouTube"`, `"YouTube (Fallback)"`, `"Piped"`, `"Invidious"`, `"Internet Archive"`, `"Vimeo"`, `"Dailymotion"`, `"Odysee"`, or `"index"` for indexed results. |
| `description` | string\|null | Video description. |
| `intent_score` | float | Intent-first relevance score. Range: `[0.0, 1.0]`. |
| `relevance_score` | float | Composite relevance score. Range: `[0.0, 1.0]`. |
| `thumbnail_url` | string\|null | Video thumbnail URL. |
| `duration_secs` | integer\|null | Video duration in seconds. |
| `view_count` | integer\|null | Number of views. |
| `channel` | string\|null | Channel or uploader name. |
| `published_at` | string\|null | Publication date in RFC 3339 format (e.g. `"2024-01-15T00:00:00+00:00"`). |

### CrawlResponse

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | The crawled URL. |
| `title` | string | Extracted page title. Empty on failure. |
| `content_length` | integer | Length of extracted text content in characters. |
| `success` | boolean | Whether the crawl succeeded. |
| `latency_ms` | integer | Crawl latency in milliseconds. |
| `error` | string\|null | Error message on failure. `null` on success. |

### DiscoveryStatusResponse

| Field | Type | Description |
|-------|------|-------------|
| `queue_size` | integer | Current number of URLs in the crawl queue (Redis sorted set). |
| `last_cycle_secs` | integer\|null | Seconds since last discovery cycle completed. `null` if no cycle has run. |
| `domains` | array[string] | Configured Common Crawl delta domains. |
| `max_queue_size` | integer | Queue size threshold that triggers backpressure (discovery pauses). |

### DiscoveryEnqueueRequest

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `url` | string | **Yes** | — | URL to enqueue for crawling. |
| `category` | string | No | `"manual"` | Content category label. |
| `priority` | integer | No | `5` | Processing priority (1–10). |

### DiscoveryEnqueueResponse

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | The enqueued URL. |
| `enqueued` | boolean | `true` if newly enqueued, `false` if already seen. |
| `error` | string\|null | Error message on failure. `null` on success. |

### ReindexScoresResponse

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `"completed"` or `"error"`. |
| `documents_processed` | integer | Total number of documents updated. |
| `error` | string\|null | Error message on failure. |

### BatchCrawlRequest

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `urls` | array[string] | **Yes** | List of URLs to crawl. |

### ContentResponse

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document ID. |
| `content` | string | Full text content stored in Redis. |

---

## Error Handling

All endpoints return structured JSON responses. Error conditions are handled as follows:

- **Crawl failures** return `200 OK` with `success: false` and an `error` message in the response body. This allows callers to process partial results.
- **Batch crawl total failures** return `500 Internal Server Error` with a single-element array containing the error.
- **Discovery enqueue failures** return `500 Internal Server Error` with `enqueued: false` and an `error` field.
- **Reindex failures** return `500 Internal Server Error` with `status: "error"`.
- **Content not found** returns `404 Not Found` with `error: "Content not found in Redis"`.
- **Invalid filter syntax** returns `400 Bad Request` with descriptive error message.

The API does not use HTTP error codes for business logic failures. `5xx` codes indicate server-side infrastructure errors (Redis, Meilisearch, ONNX runtime).

---

## Rate Limiting

Rate limiting is applied at the crawler level, not at the API endpoint level. The crawler enforces:

- **Request rate:** Default 10 requests/second (`config.crawler.rate_limit`).
- **Concurrency:** Default 8 concurrent fetches (`config.crawler.max_concurrent`).
- **Retry:** Default 3 retries with adaptive backoff (`config.crawler.max_retries`).
- **robots.txt:** Respected by default (`config.crawler.respect_robots`).

External providers (Pixabay, Pexels, YouTube, etc.) have their own per-provider rate limits enforced internally:

| Provider | Rate Limit | Notes |
|----------|------------|-------|
| Pixabay | 100 req/60s | Free tier |
| Pexels | 200 req/hour | 20k/month free tier |
| YouTube Unified | Configurable | Via API key quota |
| RapidAPI | Varies | Based on subscription |

---

## Prometheus Metrics

All metrics are exposed at `GET /metrics` in Prometheus exposition format.

| Metric Name | Type | Description |
|-------------|------|-------------|
| `intentforge_crawl_requests_total` | Counter | Total number of crawl requests (single + batch). |
| `intentforge_crawl_latency_seconds` | Histogram | Crawl request latency. Buckets: `[0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0]`. |
| `intentforge_index_documents_total` | Counter | Total documents indexed into Meilisearch. |
| `intentforge_index_latency_seconds` | Histogram | Index operation latency. Buckets: `[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0]`. |
| `intentforge_search_requests_total` | Counter | Total search requests (includes `/search`, `/images`, `/videos`). |
| `intentforge_search_latency_seconds` | Histogram | Search request latency. Buckets: `[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0]`. |
| `intentforge_zero_result_searches_total` | Counter | Searches that returned zero results (triggers background indexing). |
| `intentforge_low_quality_searches_total` | Counter | Searches with few results or low relevance (triggers enrichment). |
| `intentforge_inference_duration_seconds` | Histogram | ONNX inference duration. Buckets: `[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0]`. |
| `intentforge_trending_fetch_total` | Counter | Total trending feed fetch operations. |
| `intentforge_trending_items_total` | Counter | Total trending items discovered. |

---

## Configuration Reference

The API server port is configurable via the `API_PORT` environment variable (default: `9100`).

Key configuration parameters from `config.yaml` that affect API behavior:

| Config Path | Key | Default | API Impact |
|-------------|-----|---------|------------|
| `meilisearch` | `semantic_ratio` | `0.7` | Default hybrid search weight for `/search`. |
| `meilisearch` | `binary_quantization` | `true` | Enables 8x vector compression (48 bytes/doc). |
| `crawler` | `rate_limit` | `10` | Max requests/second for `/crawl` and `/crawl/batch`. |
| `crawler` | `max_concurrent` | `8` | Max parallel fetches. |
| `crawler` | `respect_robots` | `true` | Whether `/crawl` respects robots.txt. |
| `crawler` | `static_first` | `true` | Try static HTML before JS rendering. |
| `inference` | `embedding_dim` | `384` | Embedding vector dimension. |
| `inference` | `model_path` | `models/all-MiniLM-L6-v2.onnx` | ONNX model path for embeddings and re-ranking. |
| `self_improvement` | `enabled` | `true` | Enable background gap-filling enrichment. |
| `discovery` | `max_queue_size` | `50000` | Backpressure threshold for `/discovery/status`. |
| `video_discovery` | `search_limit` | `15` | Max results per video source. |
| `image_search` | `search_limit` | `20` | Max results per image provider. |
| `image_search` | `cache_ttl_secs` | `86400` | Image result cache TTL (24h). Pixabay requires minimum 24h. |
| `extraction` | `trafilatura_url` | `http://localhost:8080` | Trafilatura microservice for content extraction. |
| `extraction` | `batch_size` | `16` | Batch extraction size. |

---

**Built with ❤️ by Likhith Sai Seemala**
