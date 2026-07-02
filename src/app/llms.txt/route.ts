import { NextResponse } from 'next/server';
import { buildLlmsTxtContent } from '@/lib/ai-discovery';
import { MARKETING_ISR_REVALIDATE_SECONDS } from '@/lib/isr-revalidate';
import { shouldBlockSearchIndexing } from '@/utils/deployment';
import { getBaseUrl } from '@/utils/Helpers';

/** @see MARKETING_ISR_REVALIDATE_SECONDS in @/lib/isr-revalidate */
export const revalidate = 86_400;

export async function GET() {
  if (shouldBlockSearchIndexing()) {
    return new NextResponse('Not available before go-live.', { status: 404 });
  }

  const body = buildLlmsTxtContent(getBaseUrl());

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': `public, max-age=${MARKETING_ISR_REVALIDATE_SECONDS}, s-maxage=${MARKETING_ISR_REVALIDATE_SECONDS}`,
    },
  });
}
