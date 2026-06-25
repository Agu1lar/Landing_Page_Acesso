import 'server-only';

import {
  getPublishedBlogArticleBySlug,
  listPublishedBlogArticles,
  listPublishedBlogSlugs,
  listPublishedBlogSitemapEntries,
} from '@/lib/blog-articles-db';

export {
  getPublishedBlogArticleBySlug,
  listPublishedBlogArticles,
  listPublishedBlogSlugs,
  listPublishedBlogSitemapEntries,
};

/**
 * Maps slug to last modified date for sitemap.
 */
export async function getBlogLastModifiedBySlug() {
  const entries = await listPublishedBlogSitemapEntries();
  return new Map(
    entries.map((entry) => [
      entry.slug,
      entry.updatedAt ?? entry.publishedAt ?? new Date(),
    ] as const),
  );
}

/**
 * Returns all published slugs.
 */
export async function getAllBlogSlugs() {
  return listPublishedBlogSlugs();
}

/**
 * Returns one published article by slug.
 */
export async function getBlogArticleBySlug(slug: string) {
  return getPublishedBlogArticleBySlug(slug);
}
