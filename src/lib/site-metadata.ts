import type { Metadata } from 'next';
import { brand } from '@/lib/brand';
import { getBaseUrl } from '@/utils/Helpers';

/**
 * Default Open Graph images for marketing pages.
 */
export function getDefaultOgImages(path = '/opengraph-image') {
  const baseUrl = getBaseUrl();
  return [
    {
      url: `${baseUrl}${path}`,
      width: 1200,
      height: 630,
      alt: `${brand.name} — locação de equipamentos em BH`,
    },
  ];
}

/**
 * Merges page metadata with default Open Graph and Twitter cards.
 */
export function withSiteOpenGraph(metadata: Metadata, ogPath = '/opengraph-image'): Metadata {
  const images = metadata.openGraph?.images ?? getDefaultOgImages(ogPath);

  return {
    ...metadata,
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      siteName: brand.name,
      ...metadata.openGraph,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      ...metadata.twitter,
    },
  };
}
