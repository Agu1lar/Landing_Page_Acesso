import { NextResponse } from 'next/server';
import { buildPublicCatalogJson } from '@/lib/ai-discovery';
import { getAllEquipment } from '@/lib/equipment';
import { MARKETING_ISR_REVALIDATE_SECONDS } from '@/lib/isr-revalidate';
import { shouldBlockSearchIndexing } from '@/utils/deployment';
import { getBaseUrl } from '@/utils/Helpers';

/** @see MARKETING_ISR_REVALIDATE_SECONDS in @/lib/isr-revalidate */
export const revalidate = 86_400;

export async function GET() {
  if (shouldBlockSearchIndexing()) {
    return NextResponse.json({ error: 'Not available before go-live.' }, { status: 404 });
  }

  const equipment = await getAllEquipment();
  const payload = buildPublicCatalogJson(equipment, getBaseUrl());

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': `public, max-age=${MARKETING_ISR_REVALIDATE_SECONDS}, s-maxage=${MARKETING_ISR_REVALIDATE_SECONDS}`,
    },
  });
}
