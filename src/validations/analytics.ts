import * as z from 'zod';
import { AttributionSchema } from '@/lib/attribution';

export const AnalyticsEventSchema = z.object({
  eventType: z.literal('whatsapp_click'),
  origin: z.string().min(1).max(80),
  equipmentSlug: z.string().max(120).optional(),
  equipmentName: z.string().max(300).optional(),
  pathname: z.string().max(500).optional(),
  device: z.enum(['mobile', 'desktop']).optional(),
  attribution: AttributionSchema.optional(),
});

export type AnalyticsEventInput = z.infer<typeof AnalyticsEventSchema>;
