import { afterEach, describe, expect, it, vi } from 'vitest';
import { authorizeInternalApi } from '@/lib/internal-api-auth';

function requestWithAuth(token?: string) {
  return new Request('https://example.com/api/internal/v1/ads-quality/summary', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

describe('authorizeInternalApi', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns 503 when the internal secret is not configured', () => {
    vi.stubEnv('INTERNAL_API_SECRET', '');

    expect(authorizeInternalApi(requestWithAuth('token'))).toEqual({
      ok: false,
      status: 503,
      error: 'internal_api_not_configured',
    });
  });

  it('rejects missing or invalid bearer tokens', () => {
    vi.stubEnv('INTERNAL_API_SECRET', 'super-secret-token-with-length');

    expect(authorizeInternalApi(requestWithAuth())).toEqual({
      ok: false,
      status: 401,
      error: 'unauthorized',
    });
    expect(authorizeInternalApi(requestWithAuth('wrong-token'))).toEqual({
      ok: false,
      status: 401,
      error: 'unauthorized',
    });
  });

  it('accepts the configured bearer token', () => {
    vi.stubEnv('INTERNAL_API_SECRET', 'super-secret-token-with-length');

    expect(authorizeInternalApi(requestWithAuth('super-secret-token-with-length'))).toEqual({ ok: true });
  });
});
