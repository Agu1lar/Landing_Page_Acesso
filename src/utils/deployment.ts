import { Env } from '@/libs/Env';

/**
 * Whether the deployment should be hidden from search engines (Vercel preview only).
 */
export function isPreviewDeployment() {
  return Env.VERCEL_ENV === 'preview';
}
