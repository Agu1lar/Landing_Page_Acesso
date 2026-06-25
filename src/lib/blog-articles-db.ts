import 'server-only';

import { and, asc, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import type { JSONContent } from '@tiptap/core';
import { DICAS_ARTICLES } from '@/data/dicas-articles';
import { estimateReadingMinutes, sectionsToTiptapDoc } from '@/lib/blog-tiptap';
import { db } from '@/libs/DB';
import { blogArticlesSchema } from '@/models/Schema';
import type { BlogArticle, BlogArticleAdminRow, BlogArticleStatus } from '@/types/blog-article';

export type BlogArticleRow = InferSelectModel<typeof blogArticlesSchema>;

export type BlogArticleFormInput = {
  slug: string;
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  coverImageUrl: string | null;
  content: JSONContent;
  relatedLinks: { label: string; href: string }[];
  status: BlogArticleStatus;
};

export type BlogArticleAdminFilters = {
  q?: string;
  status?: 'all' | BlogArticleStatus;
};

function rowToBlogArticle(row: BlogArticleRow): BlogArticle {
  return {
    slug: row.slug,
    title: row.title,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    publishedAt: row.publishedAt?.toISOString().slice(0, 10) ?? '',
    updatedAt: row.updatedAt.toISOString(),
    readingMinutes: row.readingMinutes,
    excerpt: row.excerpt,
    coverImageUrl: row.coverImageUrl,
    content: row.content as JSONContent,
    relatedLinks: row.relatedLinks ?? [],
    status: row.status as BlogArticleStatus,
  };
}

function rowToAdminArticle(row: BlogArticleRow): BlogArticleAdminRow {
  return {
    ...rowToBlogArticle(row),
    id: row.id,
    deletedAt: row.deletedAt,
  };
}

/**
 * Seeds legacy file-based articles when the table is empty.
 */
export async function seedBlogArticlesFromLegacy(updatedBy?: string) {
  const countRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(blogArticlesSchema)
    .where(isNull(blogArticlesSchema.deletedAt));

  const count = countRows[0]?.count ?? 0;

  if (count > 0) {
    return { inserted: 0 };
  }

  for (const article of DICAS_ARTICLES) {
    const content = sectionsToTiptapDoc(article.sections);
    await db.insert(blogArticlesSchema).values({
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      content,
      relatedLinks: article.relatedLinks,
      status: 'published',
      publishedAt: new Date(article.publishedAt),
      readingMinutes: article.readingMinutes,
      updatedBy,
    });
  }

  return { inserted: DICAS_ARTICLES.length };
}

async function ensureLegacySeed() {
  await seedBlogArticlesFromLegacy('system-seed');
}

/**
 * Lists articles for admin dashboard.
 */
export async function listBlogArticlesAdmin(filters: BlogArticleAdminFilters = {}) {
  await ensureLegacySeed();

  const conditions = [isNull(blogArticlesSchema.deletedAt)];

  if (filters.status && filters.status !== 'all') {
    conditions.push(eq(blogArticlesSchema.status, filters.status));
  }

  if (filters.q?.trim()) {
    const term = `%${filters.q.trim()}%`;
    conditions.push(
      or(
        ilike(blogArticlesSchema.title, term),
        ilike(blogArticlesSchema.slug, term),
      )!,
    );
  }

  const rows = await db
    .select()
    .from(blogArticlesSchema)
    .where(and(...conditions))
    .orderBy(desc(blogArticlesSchema.updatedAt));

  return rows.map(rowToAdminArticle);
}

/**
 * Returns one article by slug for admin (any status).
 */
export async function getBlogArticleAdminBySlug(slug: string) {
  await ensureLegacySeed();

  const [row] = await db
    .select()
    .from(blogArticlesSchema)
    .where(and(eq(blogArticlesSchema.slug, slug), isNull(blogArticlesSchema.deletedAt)))
    .limit(1);

  return row ? rowToAdminArticle(row) : null;
}

/**
 * Returns published article for public site.
 */
export async function getPublishedBlogArticleBySlug(slug: string) {
  await ensureLegacySeed();

  const [row] = await db
    .select()
    .from(blogArticlesSchema)
    .where(
      and(
        eq(blogArticlesSchema.slug, slug),
        eq(blogArticlesSchema.status, 'published'),
        isNull(blogArticlesSchema.deletedAt),
      ),
    )
    .limit(1);

  return row ? rowToBlogArticle(row) : null;
}

/**
 * Lists published articles for index and sitemap.
 */
export async function listPublishedBlogArticles() {
  await ensureLegacySeed();

  const rows = await db
    .select()
    .from(blogArticlesSchema)
    .where(
      and(eq(blogArticlesSchema.status, 'published'), isNull(blogArticlesSchema.deletedAt)),
    )
    .orderBy(desc(blogArticlesSchema.publishedAt), asc(blogArticlesSchema.title));

  return rows.map(rowToBlogArticle);
}

export type BlogArticleSitemapEntry = {
  slug: string;
  updatedAt: Date;
  publishedAt: Date | null;
};

/**
 * Returns slug and dates for sitemap lastmod.
 */
export async function listPublishedBlogSitemapEntries() {
  await ensureLegacySeed();

  return db
    .select({
      slug: blogArticlesSchema.slug,
      updatedAt: blogArticlesSchema.updatedAt,
      publishedAt: blogArticlesSchema.publishedAt,
    })
    .from(blogArticlesSchema)
    .where(
      and(eq(blogArticlesSchema.status, 'published'), isNull(blogArticlesSchema.deletedAt)),
    );
}

/**
 * Returns published slugs for static generation.
 */
export async function listPublishedBlogSlugs() {
  const articles = await listPublishedBlogArticles();
  return articles.map((article) => article.slug);
}

/**
 * Returns one article by id for admin.
 */
export async function getBlogArticleAdminById(id: number) {
  const [row] = await db
    .select()
    .from(blogArticlesSchema)
    .where(and(eq(blogArticlesSchema.id, id), isNull(blogArticlesSchema.deletedAt)))
    .limit(1);

  return row ? rowToAdminArticle(row) : null;
}

/**
 * Returns whether a slug is free for create or update.
 */
export async function isBlogSlugAvailable(slug: string, excludeId?: number) {
  const [row] = await db
    .select({ id: blogArticlesSchema.id })
    .from(blogArticlesSchema)
    .where(and(eq(blogArticlesSchema.slug, slug), isNull(blogArticlesSchema.deletedAt)))
    .limit(1);

  if (!row) {
    return true;
  }

  return excludeId !== undefined && row.id === excludeId;
}

/**
 * Creates or updates a blog article.
 */
export async function saveBlogArticle(input: BlogArticleFormInput, updatedBy: string, articleId?: number) {
  const readingMinutes = estimateReadingMinutes(input.content);
  const publishedAt =
    input.status === 'published' ? new Date() : null;

  if (articleId) {
    const [existing] = await db
      .select()
      .from(blogArticlesSchema)
      .where(eq(blogArticlesSchema.id, articleId))
      .limit(1);

    const keepPublishedAt =
      input.status === 'published' && existing?.publishedAt
        ? existing.publishedAt
        : publishedAt;

    const [row] = await db
      .update(blogArticlesSchema)
      .set({
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt,
        metaTitle: input.metaTitle,
        metaDescription: input.metaDescription,
        coverImageUrl: input.coverImageUrl,
        content: input.content,
        relatedLinks: input.relatedLinks,
        status: input.status,
        publishedAt: input.status === 'published' ? keepPublishedAt : null,
        readingMinutes,
        updatedBy,
      })
      .where(eq(blogArticlesSchema.id, articleId))
      .returning();

    return rowToAdminArticle(row!);
  }

  const [row] = await db
    .insert(blogArticlesSchema)
    .values({
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
      coverImageUrl: input.coverImageUrl,
      content: input.content,
      relatedLinks: input.relatedLinks,
      status: input.status,
      publishedAt: input.status === 'published' ? new Date() : null,
      readingMinutes,
      updatedBy,
    })
    .returning();

  return rowToAdminArticle(row!);
}

/**
 * Publishes a draft article.
 */
export async function publishBlogArticleBySlug(slug: string, updatedBy: string) {
  const [row] = await db
    .update(blogArticlesSchema)
    .set({
      status: 'published',
      publishedAt: sql`COALESCE(${blogArticlesSchema.publishedAt}, NOW())`,
      updatedBy,
    })
    .where(and(eq(blogArticlesSchema.slug, slug), isNull(blogArticlesSchema.deletedAt)))
    .returning();

  return row ? rowToAdminArticle(row) : null;
}

/**
 * Unpublishes an article (keeps content as draft).
 */
export async function unpublishBlogArticleBySlug(slug: string, updatedBy: string) {
  const [row] = await db
    .update(blogArticlesSchema)
    .set({
      status: 'draft',
      updatedBy,
    })
    .where(and(eq(blogArticlesSchema.slug, slug), isNull(blogArticlesSchema.deletedAt)))
    .returning();

  return row ? rowToAdminArticle(row) : null;
}

/**
 * Soft-deletes an article.
 */
export async function archiveBlogArticleBySlug(slug: string, updatedBy: string) {
  const [row] = await db
    .update(blogArticlesSchema)
    .set({
      deletedAt: new Date(),
      status: 'draft',
      updatedBy,
    })
    .where(eq(blogArticlesSchema.slug, slug))
    .returning();

  return row ? rowToAdminArticle(row) : null;
}
