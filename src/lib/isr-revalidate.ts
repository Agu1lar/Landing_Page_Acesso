/**
 * ISR/cache revalidate interval for marketing catalog pages (seconds).
 * Raised before go-live to reduce Vercel ISR writes from bots and deploys.
 * Lower to 300–3600 after launch if fresher catalog data is needed.
 *
 * Used by unstable_cache. For `export const revalidate` in pages/routes, use the
 * literal `86400` — Next.js requires statically analyzable segment config values.
 */
export const MARKETING_ISR_REVALIDATE_SECONDS = 86_400;
