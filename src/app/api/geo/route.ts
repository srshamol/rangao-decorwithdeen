import { NextResponse } from 'next/server';

/**
 * Server-side geo-lookup proxy.
 * Fetches from ipapi.co on the server so the browser never hits CORS restrictions.
 * Usage: GET /api/geo?ip=1.2.3.4
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ip = searchParams.get('ip');

    if (!ip) {
      return NextResponse.json({ error: 'Missing ip param' }, { status: 400 });
    }

    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'rangao-store/1.0' },
      signal: AbortSignal.timeout(4000),
      // Cache for 24 h at the server level — second line of defence against upstream rate limits
      next: { revalidate: 86400 },
    } as any);

    if (!res.ok) {
      return NextResponse.json({ error: 'Geo lookup failed' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Geo lookup timeout or failed' }, { status: 200 });
  }
}
