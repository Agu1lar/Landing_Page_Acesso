/**
 * ISR/cache revalidate interval for marketing catalog pages (seconds).
 * Raised before go-live to reduce Vercel ISR writes from bots and deploys.
 * Lower to 300–3600 after launch if fresher catalog data is needed.
 */
export const MARKETING_ISR_REVALIDATE_SECONDS = 86_400;
