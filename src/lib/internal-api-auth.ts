import { timingSafeEqual } from 'node:crypto';

export type InternalApiAuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; error: 'internal_api_not_configured' | 'unauthorized' };

function readInternalApiSecret() {
  return process.env.INTERNAL_API_SECRET?.trim() || null;
}

function extractBearerToken(request: Request) {
  const auth = request.headers.get('authorization')?.trim();
  if (!auth?.toLowerCase().startsWith('bearer ')) {
    return null;
  }
  return auth.slice(7).trim() || null;
}

function secretsMatch(expected: string, provided: string) {
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

/**
 * Shared Bearer-token guard for server-to-server internal APIs.
 *
 * @param request - Incoming API request.
 * @returns Authorization result with HTTP status when rejected.
 */
export function authorizeInternalApi(request: Request): InternalApiAuthResult {
  const expected = readInternalApiSecret();
  if (!expected) {
    return { ok: false, status: 503, error: 'internal_api_not_configured' };
  }

  const provided = extractBearerToken(request);
  if (!provided || !secretsMatch(expected, provided)) {
    return { ok: false, status: 401, error: 'unauthorized' };
  }

  return { ok: true };
}
