import { NextResponse } from 'next/server';
import { buildLlmsTxtContent } from '@/lib/ai-discovery';
import { isPreviewDeployment } from '@/utils/deployment';
import { getBaseUrl } from '@/utils/Helpers';

export const revalidate = 3600;

export async function GET() {
  if (isPreviewDeployment()) {
    return new NextResponse('Not available on preview deployments.', { status: 404 });
  }

  const body = buildLlmsTxtContent(getBaseUrl());

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
