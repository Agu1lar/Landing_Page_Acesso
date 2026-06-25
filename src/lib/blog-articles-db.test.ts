import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BlogArticleRow } from '@/lib/blog-articles-db';

const dbState = {
  selectLimitResult: [] as unknown[],
  updateReturningResult: [] as unknown[],
};

function createSelectChain() {
  const chain = {
    from: () => chain,
    where: () => chain,
    limit: () => Promise.resolve(dbState.selectLimitResult),
    orderBy: () => Promise.resolve(dbState.selectLimitResult),
  };
  return chain;
}

vi.mock('@/libs/DB', () => ({
  db: {
    select: () => createSelectChain(),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve(dbState.updateReturningResult),
        }),
      }),
    }),
  },
}));

function sampleRow(overrides: Partial<BlogArticleRow> = {}): BlogArticleRow {
  return {
    id: 1,
    slug: 'test-article',
    title: 'Test article',
    excerpt: 'Excerpt long enough for validation.',
    metaTitle: 'Meta title for test article',
    metaDescription: 'Meta description for test article long enough.',
    coverImageUrl: null,
    content: { type: 'doc', content: [] },
    relatedLinks: [],
    status: 'draft',
    publishedAt: null,
    readingMinutes: 1,
    deletedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    updatedBy: 'user',
    ...overrides,
  };
}

describe('isBlogSlugAvailable', () => {
  beforeEach(() => {
    dbState.selectLimitResult = [];
  });

  it('returns true when slug is unused', async () => {
    const { isBlogSlugAvailable } = await import('@/lib/blog-articles-db');
    await expect(isBlogSlugAvailable('new-slug')).resolves.toBe(true);
  });

  it('returns true when slug belongs to same article', async () => {
    dbState.selectLimitResult = [{ id: 5 }];
    const { isBlogSlugAvailable } = await import('@/lib/blog-articles-db');
    await expect(isBlogSlugAvailable('existing-slug', 5)).resolves.toBe(true);
  });

  it('returns false when slug belongs to another article', async () => {
    dbState.selectLimitResult = [{ id: 5 }];
    const { isBlogSlugAvailable } = await import('@/lib/blog-articles-db');
    await expect(isBlogSlugAvailable('existing-slug', 6)).resolves.toBe(false);
    await expect(isBlogSlugAvailable('existing-slug')).resolves.toBe(false);
  });
});

describe('publishBlogArticleBySlug', () => {
  beforeEach(() => {
    dbState.updateReturningResult = [];
  });

  it('returns published article', async () => {
    dbState.updateReturningResult = [
      sampleRow({ status: 'published', publishedAt: new Date('2026-06-01') }),
    ];
    const { publishBlogArticleBySlug } = await import('@/lib/blog-articles-db');
    const article = await publishBlogArticleBySlug('test-article', 'user-1');
    expect(article?.status).toBe('published');
  });

  it('returns null when article missing', async () => {
    const { publishBlogArticleBySlug } = await import('@/lib/blog-articles-db');
    await expect(publishBlogArticleBySlug('missing', 'user-1')).resolves.toBeNull();
  });
});

describe('unpublishBlogArticleBySlug', () => {
  beforeEach(() => {
    dbState.updateReturningResult = [];
  });

  it('returns draft article', async () => {
    dbState.updateReturningResult = [sampleRow({ status: 'draft' })];
    const { unpublishBlogArticleBySlug } = await import('@/lib/blog-articles-db');
    const article = await unpublishBlogArticleBySlug('test-article', 'user-1');
    expect(article?.status).toBe('draft');
  });
});
