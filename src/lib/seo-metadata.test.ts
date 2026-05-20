import { describe, expect, it } from 'vitest';
import { buildCanonicalUrl, buildMarketingMetadata } from '@/lib/seo-metadata';

describe('buildCanonicalUrl', () => {
  it('normalizes path with leading slash', () => {
    const url = buildCanonicalUrl('/equipamentos');
    expect(url).toContain('/equipamentos');
  });
});

describe('buildMarketingMetadata', () => {
  it('sets canonical, robots and openGraph url', () => {
    const meta = buildMarketingMetadata({
      title: 'Test title',
      description: 'Test description for SEO.',
      path: '/orcamento',
    });

    expect(meta.title).toBe('Test title');
    expect(meta.alternates?.canonical).toContain('/orcamento');
    expect(meta.robots).toMatchObject({ index: true, follow: true });
    expect(meta.openGraph?.url).toContain('/orcamento');
  });
});
