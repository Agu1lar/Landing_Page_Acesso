import { NextResponse } from 'next/server';
import { buildPublicCatalogJson } from '@/lib/ai-discovery';
import { getAllEquipment } from '@/lib/equipment';
import { isPreviewDeployment } from '@/utils/deployment';
import { getBaseUrl } from '@/utils/Helpers';

export const revalidate = 300;

export async function GET() {
  if (isPreviewDeployment()) {
    return NextResponse.json({ error: 'Not available on preview deployments.' }, { status: 404 });
  }

  const equipment = await getAllEquipment();
  const payload = buildPublicCatalogJson(equipment, getBaseUrl());

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
