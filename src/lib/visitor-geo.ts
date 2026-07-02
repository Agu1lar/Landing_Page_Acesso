import * as z from 'zod';
import { readStoredAttribution } from '@/lib/attribution';

export const VISITOR_GEO_STORAGE_KEY = 'acesso_visitor_geo';

export const VisitorGeoSchema = z.object({
  geoCity: z.string().max(120).optional(),
  geoRegion: z.string().max(120).optional(),
  geoCountry: z.string().max(80).optional(),
});

export type VisitorGeoInput = z.infer<typeof VisitorGeoSchema>;

type StoredVisitorGeo = VisitorGeoInput & {
  status: 'granted' | 'denied' | 'unavailable';
  capturedAt: string;
};

const GEO_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const GEO_TIMEOUT_MS = 12_000;

function parseStoredVisitorGeo(raw: string | null): StoredVisitorGeo | null {
  if (!raw?.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredVisitorGeo;
    if (!parsed.status || !parsed.capturedAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function isFresh(stored: StoredVisitorGeo) {
  const capturedAt = Date.parse(stored.capturedAt);
  if (Number.isNaN(capturedAt)) {
    return false;
  }
  return Date.now() - capturedAt < GEO_MAX_AGE_MS;
}

/**
 * Returns visitor geo saved after analytics consent (city/region approximate).
 */
export function readStoredVisitorGeo(): VisitorGeoInput | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = parseStoredVisitorGeo(window.localStorage.getItem(VISITOR_GEO_STORAGE_KEY));
  if (!stored || stored.status !== 'granted' || !isFresh(stored)) {
    return null;
  }

  if (!stored.geoCity?.trim() && !stored.geoRegion?.trim()) {
    return null;
  }

  return {
    geoCity: stored.geoCity?.trim() || undefined,
    geoRegion: stored.geoRegion?.trim() || undefined,
    geoCountry: stored.geoCountry?.trim() || undefined,
  };
}

function persistVisitorGeo(stored: StoredVisitorGeo) {
  window.localStorage.setItem(VISITOR_GEO_STORAGE_KEY, JSON.stringify(stored));
}

function persistVisitorGeoStatus(status: StoredVisitorGeo['status']) {
  persistVisitorGeo({
    status,
    capturedAt: new Date().toISOString(),
  });
}

function requestCurrentPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation unavailable'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: GEO_MAX_AGE_MS,
      timeout: GEO_TIMEOUT_MS,
    });
  });
}

async function reverseGeocodeCity(latitude: number, longitude: number): Promise<VisitorGeoInput> {
  const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('localityLanguage', 'pt');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Reverse geocode failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    city?: string;
    locality?: string;
    principalSubdivision?: string;
    countryName?: string;
  };

  return {
    geoCity: (data.city || data.locality || '').trim() || undefined,
    geoRegion: (data.principalSubdivision || '').trim() || undefined,
    geoCountry: (data.countryName || '').trim() || undefined,
  };
}

/**
 * Persists geo on the server for analytics (non-blocking).
 */
export async function syncVisitorGeoWithAnalytics(geo: VisitorGeoInput, pathname?: string) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!geo.geoCity?.trim() && !geo.geoRegion?.trim()) {
    return;
  }

  try {
    const attribution = readStoredAttribution();
    await fetch('/api/analytics/visitor-geo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...geo,
        pathname: pathname ?? window.location.pathname,
        attribution: attribution ?? undefined,
      }),
      keepalive: true,
    });
  } catch {
    // Non-blocking — local storage still feeds leads/events on this device.
  }
}

/**
 * Requests browser geolocation after analytics consent and stores city/region for the session.
 * The browser may show a separate permission prompt — triggered right after cookie accept.
 */
export async function captureVisitorGeoAfterConsent() {
  if (typeof window === 'undefined') {
    return null;
  }

  const existing = parseStoredVisitorGeo(window.localStorage.getItem(VISITOR_GEO_STORAGE_KEY));
  if (existing?.status === 'denied') {
    return null;
  }

  if (existing?.status === 'granted' && isFresh(existing)) {
    const geo = readStoredVisitorGeo();
    if (geo) {
      void syncVisitorGeoWithAnalytics(geo);
    }
    return geo;
  }

  try {
    const position = await requestCurrentPosition();
    const geo = await reverseGeocodeCity(position.coords.latitude, position.coords.longitude);

    persistVisitorGeo({
      ...geo,
      status: 'granted',
      capturedAt: new Date().toISOString(),
    });

    void syncVisitorGeoWithAnalytics(geo);
    return geo;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const denied =
      typeof GeolocationPositionError !== 'undefined' &&
      error instanceof GeolocationPositionError &&
      error.code === error.PERMISSION_DENIED;

    persistVisitorGeoStatus(denied ? 'denied' : 'unavailable');
    if (!denied) {
      console.debug('Visitor geo capture skipped:', message);
    }
    return null;
  }
}
