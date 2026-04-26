import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://api.oxiverse.com';
const SOVRN_API_KEY = process.env.SOVRN_API;

function monetizeUrl(url: string): string {
  if (!url || !SOVRN_API_KEY) return url;
  if (url.startsWith('https://redirect.viglink.com')) return url;
  // Basic check to avoid internal or invalid URLs
  if (url.startsWith('/') || url.includes('oxiverse.com') || url.includes('localhost')) return url;
  
  return `https://redirect.viglink.com?key=${SOVRN_API_KEY}&u=${encodeURIComponent(url)}`;
}

function processData(data: any): any {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(processData);
  }

  const newData = { ...data };
  for (const key in newData) {
    if (key === 'url' && typeof newData[key] === 'string') {
      newData[key] = monetizeUrl(newData[key]);
    } else if (typeof newData[key] === 'object') {
      newData[key] = processData(newData[key]);
    }
  }
  return newData;
}

async function proxyFetch(url: URL, init?: RequestInit): Promise<NextResponse> {
  try {
    const res = await fetch(url.toString(), init);
    const text = await res.text();

    let data: unknown;
    try {
      data = JSON.parse(text);
      // Monetize URLs in the response
      data = processData(data);
    } catch {
      data = { error: text || 'Empty response from upstream' };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upstream unreachable';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('__endpoint') || '/search';
  searchParams.delete('__endpoint');

  const url = new URL(endpoint, API_BASE);
  url.search = searchParams.toString();

  return proxyFetch(url);
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('__endpoint') || '/crawl/batch';
  searchParams.delete('__endpoint');

  const url = new URL(endpoint, API_BASE);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  return proxyFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
