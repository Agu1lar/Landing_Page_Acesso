import type { JSONContent } from '@tiptap/core';
import * as z from 'zod';

export const BLOG_SEO_LIMITS = {
  metaTitleMin: 10,
  metaTitleMax: 200,
  metaDescriptionMin: 20,
  metaDescriptionMax: 320,
  excerptMin: 10,
  excerptMax: 500,
} as const;

export type BlogSeoField = 'metaTitle' | 'metaDescription';
export type BlogSeoFieldIssue = 'too_short' | 'too_long';

const relatedLinkSchema = z.object({
  label: z.string().min(1).max(120),
  href: z.string().min(1).max(500).regex(/^\//u, 'Use caminho relativo começando com /'),
});

export const BlogAdminFormSchema = z.object({
  articleId: z.coerce.number().int().positive().optional(),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, 'Slug inválido'),
  title: z.string().min(3).max(300),
  excerpt: z.string().min(BLOG_SEO_LIMITS.excerptMin).max(BLOG_SEO_LIMITS.excerptMax),
  metaTitle: z.string().min(BLOG_SEO_LIMITS.metaTitleMin).max(BLOG_SEO_LIMITS.metaTitleMax),
  metaDescription: z
    .string()
    .min(BLOG_SEO_LIMITS.metaDescriptionMin)
    .max(BLOG_SEO_LIMITS.metaDescriptionMax),
  coverImageUrl: z.string().max(500).optional().nullable(),
  contentJson: z.string().min(2),
  relatedLinksJson: z.string().default('[]'),
  intent: z.enum(['save', 'publish', 'unpublish']),
});

export const BlogArticleSeoSchema = BlogAdminFormSchema.pick({
  metaTitle: true,
  metaDescription: true,
});

export type BlogAdminFormValues = z.infer<typeof BlogAdminFormSchema>;

/**
 * Suggests a default SEO title from the article title.
 */
export function suggestBlogMetaTitle(title: string) {
  const trimmed = title.trim();
  return trimmed ? `${trimmed} | Dicas Acesso` : '';
}

/**
 * Suggests a default SEO description from the listing excerpt.
 */
export function suggestBlogMetaDescription(excerpt: string) {
  return excerpt.trim().slice(0, BLOG_SEO_LIMITS.metaDescriptionMax);
}

/**
 * Validates one SEO field for client-side feedback.
 */
export function validateBlogSeoField(field: BlogSeoField, value: string): BlogSeoFieldIssue | null {
  const trimmed = value.trim();
  const limits =
    field === 'metaTitle'
      ? { min: BLOG_SEO_LIMITS.metaTitleMin, max: BLOG_SEO_LIMITS.metaTitleMax }
      : { min: BLOG_SEO_LIMITS.metaDescriptionMin, max: BLOG_SEO_LIMITS.metaDescriptionMax };

  if (trimmed.length < limits.min) {
    return 'too_short';
  }
  if (trimmed.length > limits.max) {
    return 'too_long';
  }
  return null;
}

/**
 * Returns whether stored SEO fields meet publish requirements.
 */
export function isBlogArticleSeoReady(input: { metaTitle: string; metaDescription: string }) {
  return BlogArticleSeoSchema.safeParse(input).success;
}

/**
 * Parses TipTap JSON from admin form.
 */
export function parseBlogContentJson(raw: string) {
  const parsed = JSON.parse(raw) as unknown;
  return z
    .object({
      type: z.literal('doc'),
      content: z.array(z.record(z.string(), z.unknown())).optional(),
    })
    .passthrough()
    .parse(parsed) as JSONContent;
}

/**
 * Parses related links JSON from admin form.
 */
export function parseRelatedLinksJson(raw: string) {
  if (!raw.trim()) {
    return [] as z.infer<typeof relatedLinkSchema>[];
  }
  const parsed = JSON.parse(raw) as unknown;
  return z.array(relatedLinkSchema).parse(parsed);
}
