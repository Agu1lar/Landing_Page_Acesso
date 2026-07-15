import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbState = {
  selectResult: [] as Array<{ toSlug: string }>,
  updateCalls: 0,
  insertCalls: 0,
};

vi.mock('@/libs/DB', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(dbState.selectResult),
        }),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => {
          dbState.updateCalls += 1;
          return Promise.resolve();
        },
      }),
    }),
    insert: () => ({
      values: () => ({
        onConflictDoUpdate: () => {
          dbState.insertCalls += 1;
          return Promise.resolve();
        },
      }),
    }),
  },
}));

describe('getBlogSlugRedirectTarget', () => {
  beforeEach(() => {
    dbState.selectResult = [];
    dbState.updateCalls = 0;
    dbState.insertCalls = 0;
  });

  it('returns null when no redirect exists', async () => {
    const { getBlogSlugRedirectTarget } = await import('@/lib/blog-slug-redirects');
    await expect(getBlogSlugRedirectTarget('slug-atual')).resolves.toBeNull();
  });

  it('follows redirect chain to final slug', async () => {
    const { getBlogSlugRedirectTarget } = await import('@/lib/blog-slug-redirects');
    dbState.selectResult = [{ toSlug: 'slug-novo' }];
    await expect(getBlogSlugRedirectTarget('slug-antigo')).resolves.toBe('slug-novo');
  });
});

describe('registerBlogSlugRedirect', () => {
  beforeEach(() => {
    dbState.selectResult = [];
    dbState.updateCalls = 0;
    dbState.insertCalls = 0;
  });

  it('skips identical slugs', async () => {
    const { registerBlogSlugRedirect } = await import('@/lib/blog-slug-redirects');
    await registerBlogSlugRedirect({ fromSlug: 'mesmo-slug', toSlug: 'mesmo-slug', articleId: 1 });
    expect(dbState.insertCalls).toBe(0);
    expect(dbState.updateCalls).toBe(0);
  });

  it('stores redirect for changed slug', async () => {
    const { registerBlogSlugRedirect } = await import('@/lib/blog-slug-redirects');
    await registerBlogSlugRedirect({ fromSlug: 'slug-antigo', toSlug: 'slug-novo', articleId: 1 });
    expect(dbState.updateCalls).toBe(1);
    expect(dbState.insertCalls).toBe(1);
  });
});
