import { NextResponse } from 'next/server';
import { getAdsQualitySummary, parseAdsQualityFilters } from '@/lib/ads-quality-api';
import { authorizeInternalApi } from '@/lib/internal-api-auth';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const auth = authorizeInternalApi(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const parsed = parseAdsQualityFilters(searchParams);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const summary = await getAdsQualitySummary(parsed.filters);
  return NextResponse.json(summary);
}
