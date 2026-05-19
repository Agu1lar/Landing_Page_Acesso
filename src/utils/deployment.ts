import { Env } from '@/libs/Env';

/**
 * Whether the deployment should be hidden from search engines (Vercel preview).
 */
export function isPreviewDeployment() {
  if (Env.VERCEL_ENV === 'preview') {
    return true;
  }

  const appUrl = Env.NEXT_PUBLIC_APP_URL ?? '';
  return appUrl.includes('.vercel.app');
}
