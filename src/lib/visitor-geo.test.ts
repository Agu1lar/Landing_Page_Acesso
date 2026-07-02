import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  readStoredVisitorGeo,
  VISITOR_GEO_STORAGE_KEY,
} from '@/lib/visitor-geo';

describe('readStoredVisitorGeo', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when nothing stored', () => {
    expect(readStoredVisitorGeo()).toBeNull();
  });

  it('returns city when consent geo is fresh', () => {
    storage.set(
      VISITOR_GEO_STORAGE_KEY,
      JSON.stringify({
        status: 'granted',
        capturedAt: new Date().toISOString(),
        geoCity: 'Belo Horizonte',
        geoRegion: 'Minas Gerais',
      }),
    );

    expect(readStoredVisitorGeo()).toEqual({
      geoCity: 'Belo Horizonte',
      geoRegion: 'Minas Gerais',
    });
  });

  it('returns null when user denied geo', () => {
    storage.set(
      VISITOR_GEO_STORAGE_KEY,
      JSON.stringify({
        status: 'denied',
        capturedAt: new Date().toISOString(),
      }),
    );

    expect(readStoredVisitorGeo()).toBeNull();
  });
});
