import * as z from 'zod';
import { ALL_EQUIPMENT_CATEGORIES } from '@/lib/categories-seo';
import { isAllowedEquipmentLaudoUrl } from '@/lib/equipment-laudo-upload';
import type { EquipmentCategory } from '@/types/equipment';

const categoryEnum = ALL_EQUIPMENT_CATEGORIES as [EquipmentCategory, ...EquipmentCategory[]];

export const specSchema = z.object({
  label: z.string().min(1).max(120),
  value: z.string().min(1).max(300),
});

const imageSchema = z.object({
  url: z.string().min(1).max(500),
  alt: z.string().max(300).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isPrimary: z.coerce.boolean().default(false),
});

export const EquipmentAdminFormSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, 'Slug inválido'),
  name: z.string().min(2).max(300),
  category: z.enum(categoryEnum),
  shortDescription: z.string().min(5).max(500),
  longDescription: z.string().max(8000).default(''),
  specsJson: z.string().default('[]'),
  tags: z.string().default(''),
  featured: z.coerce.boolean().default(false),
  available: z.coerce.boolean().default(true),
  published: z.coerce.boolean().default(true),
  imagesJson: z.string().default('[]'),
  laudoUrl: z.string().max(500).default(''),
  laudoLabel: z.string().max(200).default(''),
}).refine((data) => isAllowedEquipmentLaudoUrl(data.laudoUrl), {
  message: 'URL do laudo inválida. Envie o PDF pelo painel.',
  path: ['laudoUrl'],
});

export type EquipmentAdminFormValues = z.infer<typeof EquipmentAdminFormSchema>;

/**
 * Parses specs JSON from admin form textarea.
 */
export function parseSpecsJson(raw: string) {
  if (!raw.trim()) {
    return [] as z.infer<typeof specSchema>[];
  }
  const parsed = JSON.parse(raw) as unknown;
  return z.array(specSchema).parse(parsed);
}

/**
 * Parses gallery images JSON from admin form.
 */
export function parseImagesJson(raw: string) {
  if (!raw.trim()) {
    return [] as z.infer<typeof imageSchema>[];
  }
  const parsed = JSON.parse(raw) as unknown;
  return z.array(imageSchema).parse(parsed);
}
