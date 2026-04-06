export interface SearchResult {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: string;
  source: string;
  media_type: string;
  thumbnail_url: string | null;
  intent_score: number;
  relevance_score: number;
  commercial_score: number;
  spam_score: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
  latency_ms: number;
  message: string | null;
  intent_scores?: Array<{
    group: string;
    score: number;
    primary_intent: string;
    description: string;
  }>;
  self_improving?: boolean;
}

export interface NewsResult {
  title: string;
  url: string;
  description: string;
  source: string;
  published_at: string | null;
  thumbnail_url: string | null;
}

export interface NewsResponse {
  query: string;
  results: NewsResult[];
  total: number;
  latency_ms: number;
  sources: string[];
}

export interface ImageResult {
  id: string;
  title: string;
  url: string;
  source: string;
  category: string;
  intent_score: number;
  relevance_score: number;
  thumbnail_url: string | null;
  alt_text: string | null;
  photographer: string | null;
  width: number | null;
  height: number | null;
  avg_color: string | null;
}

export interface ImageResponse {
  query: string;
  results: ImageResult[];
  total: number;
  latency_ms: number;
  sources: string[];
}

export interface VideoResult {
  id: string;
  title: string;
  url: string;
  source: string;
  description: string | null;
  intent_score: number;
  relevance_score: number;
  thumbnail_url: string | null;
  duration_secs: number | null;
  view_count: number | null;
  channel: string | null;
  published_at: string | null;
}

export interface VideoResponse {
  query: string;
  results: VideoResult[];
  total: number;
  latency_ms: number;
  sources: string[];
}

export interface ContentResponse {
  id: string;
  content: string;
}
