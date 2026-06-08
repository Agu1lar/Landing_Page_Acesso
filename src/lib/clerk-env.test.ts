import { describe, expect, it } from 'vitest';
import { clerkKeyMode, isClerkProductionKeyMismatch } from '@/lib/clerk-env';

describe('clerk key mode', () => {
  it('detects live publishable key', () => {
    expect(clerkKeyMode('pk_live_abc')).toBe('live');
  });

  it('detects test publishable key', () => {
    expect(clerkKeyMode('pk_test_abc')).toBe('test');
  });

  it('flags test keys on Vercel Production', () => {
    expect(
      isClerkProductionKeyMismatch({
        vercelEnv: 'production',
        publishableKey: 'pk_test_abc',
      }),
    ).toBe(true);
  });

  it('allows live keys on Vercel Production', () => {
    expect(
      isClerkProductionKeyMismatch({
        vercelEnv: 'production',
        publishableKey: 'pk_live_abc',
      }),
    ).toBe(false);
  });
});
