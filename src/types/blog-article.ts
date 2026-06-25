import type { JSONContent } from '@tiptap/core';

export type BlogArticleStatus = 'draft' | 'published';

export type BlogRelatedLink = {
  label: string;
  href: string;
};

export type BlogArticle = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  excerpt: string;
  coverImageUrl: string | null;
  content: JSONContent;
  relatedLinks: BlogRelatedLink[];
  status: BlogArticleStatus;
};

export type BlogArticleAdminRow = BlogArticle & {
  id: number;
  deletedAt: Date | null;
};
