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
  return fetchApi<SearchResponse>('/search', {
    q: query,
    limit: options?.limit ?? 15,
    offset: options?.offset ?? 0,
    category: options?.category,
    semantic_ratio: options?.semanticRatio,
  });
}

export async function searchNews(query: string, options?: { limit?: number; category?: string; location?: string }): Promise<NewsResponse> {
  return fetchApi<NewsResponse>('/news', {
    q: query,
    limit: options?.limit ?? 10,
    category: options?.category,
    location: options?.location,
  });
}

export async function searchImages(query: string, options?: { limit?: number; category?: string }): Promise<ImageResponse> {
  return fetchApi<ImageResponse>('/images', {
    q: query,
    limit: options?.limit ?? 10,
    category: options?.category,
  });
}

export async function searchVideos(query: string, options?: { limit?: number; category?: string }): Promise<VideoResponse> {
  return fetchApi<VideoResponse>('/videos', {
    q: query,
    limit: options?.limit ?? 10,
    category: options?.category,
  });
}

export async function getContent(id: string): Promise<ContentResponse> {
  return fetchApi<ContentResponse>(`/content/${id}`, {});
}
