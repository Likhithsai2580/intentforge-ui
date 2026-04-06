import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://api.oxiverse.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('__endpoint') || '/search';
  searchParams.delete('__endpoint');

  const url = new URL(endpoint, API_BASE);
  url.search = searchParams.toString();

  const res = await fetch(url.toString());
  const data = await res.json();

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('__endpoint') || '/crawl/batch';
  searchParams.delete('__endpoint');

  const url = new URL(endpoint, API_BASE);
  const body = await request.json();

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  return NextResponse.json(data);
}
