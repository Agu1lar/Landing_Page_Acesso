import * as z from 'zod';
import { AttributionSchema } from '@/lib/attribution';

const AnalyticsEventBaseSchema = z.object({
  origin: z.string().min(1).max(80),
  equipmentSlug: z.string().max(120).optional(),
  equipmentName: z.string().max(300).optional(),
  pathname: z.string().max(500).optional(),
  device: z.enum(['mobile', 'desktop']).optional(),
  attribution: AttributionSchema.optional(),
});

export const AnalyticsEventSchema = z.discriminatedUnion('eventType', [
  AnalyticsEventBaseSchema.extend({
    eventType: z.literal('whatsapp_click'),
  }),
  AnalyticsEventBaseSchema.extend({
    eventType: z.literal('phone_click'),
  }),
]);

export type AnalyticsEventInput = z.infer<typeof AnalyticsEventSchema>;
