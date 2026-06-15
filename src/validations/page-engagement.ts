import * as z from 'zod';

export const PageEngagementSchema = z.object({
  pathname: z.string().trim().min(1).max(500),
  activeSeconds: z.number().int().min(1).max(86_400),
  device: z.enum(['mobile', 'desktop']).optional(),
  sessionId: z.string().trim().min(1).max(64).optional(),
});

export type PageEngagementInput = z.infer<typeof PageEngagementSchema>;
