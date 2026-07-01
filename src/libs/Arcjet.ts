import arcjet, { detectBot, fixedWindow } from '@arcjet/next';

/**
 * Arcjet scoped to quote submissions (POST /api/leads) — rate limit + bot blocking.
 */
export const quoteLeadArcjet = arcjet({
  // Use `process.env` instead of Env to reduce bundle size in edge routes
  key: process.env.ARCJET_KEY ?? '',
  characteristics: ['ip.src'],
  rules: [
    fixedWindow({
      mode: 'LIVE',
      window: '15m',
      max: 8,
    }),
    detectBot({
      mode: 'LIVE',
      allow: [],
    }),
  ],
});
