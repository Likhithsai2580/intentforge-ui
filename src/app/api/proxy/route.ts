import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://api.oxiverse.com';

async function proxyFetch(url: URL, init?: RequestInit): Promise<NextResponse> {
  try {
    const res = await fetch(url.toString(), init);
    const text = await res.text();

    let data: unknown;
    try {
      data = JSON.parse(text);
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
