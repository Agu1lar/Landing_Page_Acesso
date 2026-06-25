import type { JSONContent } from '@tiptap/core';
import * as z from 'zod';

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
  excerpt: z.string().min(10).max(500),
  metaTitle: z.string().min(10).max(200),
  metaDescription: z.string().min(20).max(320),
  coverImageUrl: z.string().max(500).optional().nullable(),
  contentJson: z.string().min(2),
  relatedLinksJson: z.string().default('[]'),
  intent: z.enum(['save', 'publish', 'unpublish']),
});

export type BlogAdminFormValues = z.infer<typeof BlogAdminFormSchema>;

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
