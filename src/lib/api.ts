import { SearchResponse, NewsResponse, ImageResponse, VideoResponse, ContentResponse } from '@/types';

async function fetchApi<T>(endpoint: string, params: Record<string, string | number | undefined>, method: 'GET' | 'POST' = 'GET', body?: unknown): Promise<T> {
  const url = new URL('/api/proxy', window.location.origin);
  url.searchParams.set('__endpoint', endpoint);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const res = await fetch(url.toString(), {
    method,
    headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
    body: method === 'POST' && body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export async function searchWeb(query: string, options?: { limit?: number; offset?: number; category?: string; semanticRatio?: number }): Promise<SearchResponse> {
  const startTime = Date.now();
  const res = await fetchApi<any>('/search', {
    q: query,
    limit: options?.limit ?? 15,
    offset: options?.offset ?? 0,
    category: options?.category,
    semantic_ratio: options?.semanticRatio,
  });
  const latency = Date.now() - startTime;

  const results = (res.results || []).map((r: any, idx: number) => ({
    id: r.id || (r.url ? `${r.url}-${idx}` : `web-${idx}`),
    title: r.title || '',
    url: r.url || '',
    description: r.content || r.description || '',
    category: r.category || res.category || 'general',
    source: r.sources ? r.sources.join(', ') : (r.source || 'web'),
    media_type: r.media_type || 'text',
    thumbnail_url: r.thumbnail_url || null,
    intent_score: r.score ?? r.intent_score ?? 0,
    relevance_score: r.score ?? r.relevance_score ?? 0,
    commercial_score: r.commercial_score ?? 0,
    spam_score: r.spam_score ?? 0,
    authority: r.authority ?? 0.5,
    is_local: r.is_local ?? false,
    sources: r.sources || [r.source || 'web'],
  }));

  return {
    query: query,
    results,
    total: res.total ?? res.count ?? results.length,
    latency_ms: latency,
    message: res.message || null,
    intent: res.intent || 'informational',
    category: res.category || 'informational',
    confidence: res.confidence ?? 1.0,
    constraints: res.constraints || [],
    structured_constraints: res.structured_constraints || { positive: [], negative: [] },
    expanded_queries: res.expanded_queries || [],
  };
}

export async function searchNews(query: string, options?: { limit?: number; category?: string; location?: string }): Promise<NewsResponse> {
  const startTime = Date.now();
  const res = await fetchApi<any>('/news', {
    q: query,
    limit: options?.limit ?? 10,
    category: options?.category,
    location: options?.location,
  });
  const latency = Date.now() - startTime;

  const results = (res.results || []).map((r: any) => ({
    title: r.title || '',
    url: r.url || '',
    description: r.description || '',
    source: r.source || 'news',
    published_at: r.published_at || null,
    thumbnail_url: r.thumbnail_url || null,
  }));

  return {
    query: query,
    results,
    total: res.total ?? res.count ?? results.length,
    latency_ms: latency,
    sources: res.sources || [],
  };
}

export async function searchImages(query: string, options?: { limit?: number; category?: string }): Promise<ImageResponse> {
  const startTime = Date.now();
  const res = await fetchApi<any>('/images', {
    q: query,
    limit: options?.limit ?? 10,
    category: options?.category,
  });
  const latency = Date.now() - startTime;

  const results = (res.results || []).map((r: any, idx: number) => ({
    id: r.id || (r.url ? `${r.url}-${idx}` : `img-${idx}`),
    title: r.title || '',
    url: r.url || '',
    source: r.source || 'images',
    category: r.category || '',
    intent_score: r.intent_score ?? 0.5,
    relevance_score: r.relevance_score ?? 0.5,
    thumbnail_url: r.thumbnail_url || r.image_url || null,
    alt_text: r.description || null,
    photographer: r.photographer || null,
    width: r.width || null,
    height: r.height || null,
    avg_color: r.avg_color || null,
  }));

  return {
    query: query,
    results,
    total: res.total ?? res.count ?? results.length,
    latency_ms: latency,
    sources: res.sources || [],
  };
}

export async function searchVideos(query: string, options?: { limit?: number; category?: string }): Promise<VideoResponse> {
  const startTime = Date.now();
  const res = await fetchApi<any>('/videos', {
    q: query,
    limit: options?.limit ?? 10,
    category: options?.category,
  });
  const latency = Date.now() - startTime;

  const results = (res.results || []).map((r: any, idx: number) => ({
    id: r.video_id || r.id || (r.url ? `${r.url}-${idx}` : `vid-${idx}`),
    title: r.title || '',
    url: r.url || '',
    source: r.source || 'videos',
    description: r.description || null,
    intent_score: r.intent_score ?? 0.5,
    relevance_score: r.relevance_score ?? 0.5,
    thumbnail_url: r.thumbnail || r.thumbnail_url || null,
    duration_secs: r.duration_secs || null,
    view_count: r.view_count || null,
    channel: r.channel || null,
    published_at: r.published_at || null,
  }));

  return {
    query: query,
    results,
    total: res.total ?? res.count ?? results.length,
    latency_ms: latency,
    sources: res.sources || [],
  };
}

export async function getContent(id: string): Promise<ContentResponse> {
  return fetchApi<ContentResponse>(`/content/${id}`, {});
}
