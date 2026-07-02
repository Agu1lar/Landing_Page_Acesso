import { sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { rateLimitBucketsSchema } from '@/models/Schema';

export const QUOTE_LEAD_RATE_LIMIT = {
  maxRequests: 8,
  windowMs: 15 * 60 * 1000,
} as const;

/**
 * Resolves the client IP from reverse-proxy headers.
 */
export function resolveClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Returns the fixed-window start for quote lead rate limiting.
 */
export function quoteLeadWindowStart(now = Date.now()) {
  const aligned = Math.floor(now / QUOTE_LEAD_RATE_LIMIT.windowMs) * QUOTE_LEAD_RATE_LIMIT.windowMs;
  return new Date(aligned);
}

/**
 * Returns true when the bucket count exceeds the allowed maximum.
 */
export function isQuoteLeadRateLimitExceeded(requestCount: number) {
  return requestCount > QUOTE_LEAD_RATE_LIMIT.maxRequests;
}

/**
 * Increments the quote-lead bucket and returns whether the request is allowed.
 */
export async function consumeQuoteLeadRateLimit(clientIp: string) {
  const bucketKey = `quote-lead:${clientIp}`;
  const windowStart = quoteLeadWindowStart();

  try {
    const [row] = await db
      .insert(rateLimitBucketsSchema)
      .values({
        bucketKey,
        windowStart,
        requestCount: 1,
      })
      .onConflictDoUpdate({
        target: rateLimitBucketsSchema.bucketKey,
        set: {
          windowStart,
          requestCount: sql`CASE
            WHEN ${rateLimitBucketsSchema.windowStart} = ${windowStart}
            THEN ${rateLimitBucketsSchema.requestCount} + 1
            ELSE 1
          END`,
        },
      })
      .returning({ requestCount: rateLimitBucketsSchema.requestCount });

    return !isQuoteLeadRateLimitExceeded(row?.requestCount ?? 1);
  } catch (error) {
    logger.warn('Quote lead rate limit skipped (database unavailable)', {
      message: error instanceof Error ? error.message : String(error),
    });
    return true;
  }
}

/**
 * Applies quote submission rate limit for one HTTP request.
 */
export async function allowQuoteLeadRequest(request: Request) {
  return consumeQuoteLeadRateLimit(resolveClientIp(request));
}
