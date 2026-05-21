import type { Metadata } from 'next';
import { brand } from '@/lib/brand';
import { getDefaultOgImages, withSiteOpenGraph } from '@/lib/site-metadata';
import { getBaseUrl } from '@/utils/Helpers';

export type MarketingMetadataInput = {
  title: string;
  description: string;
  path: string;
  ogPath?: string;
};

/**
 * Builds absolute canonical URL for a marketing path.
 */
export function buildCanonicalUrl(path: string) {
  const baseUrl = getBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalized}`;
}

/**
 * Builds complete metadata for public marketing pages (canonical, OG, Twitter, robots).
 */
export function buildMarketingMetadata(input: MarketingMetadataInput): Metadata {
  const canonical = buildCanonicalUrl(input.path);
  const ogPath = input.ogPath ?? '/opengraph-image';

  return withSiteOpenGraph(
    {
      title: input.title,
      description: input.description,
      alternates: { canonical },
      openGraph: {
        title: input.title,
        description: input.description,
        url: canonical,
        images: getDefaultOgImages(ogPath),
      },
      twitter: {
        title: input.title,
        description: input.description,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      },
      category: 'construction equipment rental',
      authors: [{ name: brand.name, url: getBaseUrl() }],
    },
    ogPath,
  );
}
