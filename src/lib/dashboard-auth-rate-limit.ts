import { sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { rateLimitBucketsSchema } from '@/models/Schema';

export type AuthRateLimitConfig = {
  bucketPrefix: string;
  maxRequests: number;
  windowMs: number;
};

export const AUTH_LOGIN_RATE_LIMIT: AuthRateLimitConfig = {
  bucketPrefix: 'auth-login',
  maxRequests: 12,
  windowMs: 15 * 60 * 1000,
};

export const AUTH_FORGOT_PASSWORD_RATE_LIMIT: AuthRateLimitConfig = {
  bucketPrefix: 'auth-forgot',
  maxRequests: 4,
  windowMs: 15 * 60 * 1000,
};

export const AUTH_RESET_PASSWORD_RATE_LIMIT: AuthRateLimitConfig = {
  bucketPrefix: 'auth-reset',
  maxRequests: 8,
  windowMs: 15 * 60 * 1000,
};

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

function windowStartFor(config: AuthRateLimitConfig, now = Date.now()) {
  const aligned = Math.floor(now / config.windowMs) * config.windowMs;
  return new Date(aligned);
}

/**
 * Increments a fixed-window rate limit bucket. Returns false when limit exceeded.
 */
export async function consumeAuthRateLimit(
  config: AuthRateLimitConfig,
  keySuffix: string,
) {
  const bucketKey = `${config.bucketPrefix}:${keySuffix}`;
  const windowStart = windowStartFor(config);

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

    return (row?.requestCount ?? 1) <= config.maxRequests;
  } catch (error) {
    logger.warn('Auth rate limit skipped (database unavailable)', {
      message: error instanceof Error ? error.message : String(error),
    });
    return true;
  }
}

/**
 * Applies IP + optional e-mail rate limits for auth endpoints.
 */
export async function enforceAuthRateLimits(
  request: Request,
  config: AuthRateLimitConfig,
  email?: string,
) {
  const ip = resolveClientIp(request);
  const ipAllowed = await consumeAuthRateLimit(config, `ip:${ip}`);
  if (!ipAllowed) {
    return false;
  }

  if (email) {
    const emailAllowed = await consumeAuthRateLimit(config, `email:${email}`);
    if (!emailAllowed) {
      return false;
    }
  }

  return true;
}
