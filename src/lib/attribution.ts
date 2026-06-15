import * as z from 'zod';

const ATTRIBUTION_STORAGE_KEY = 'acesso_attribution';

const UTM_PARAM_MAP = {
  utm_source: 'utmSource',
  utm_medium: 'utmMedium',
  utm_campaign: 'utmCampaign',
  utm_content: 'utmContent',
  utm_term: 'utmTerm',
} as const;

const CLICK_ID_PARAM_MAP = {
  gclid: 'gclid',
  gbraid: 'gbraid',
  wbraid: 'wbraid',
} as const;

export const AttributionSchema = z.object({
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(200).optional(),
  utmContent: z.string().max(200).optional(),
  utmTerm: z.string().max(200).optional(),
  gclid: z.string().max(255).optional(),
  gbraid: z.string().max(255).optional(),
  wbraid: z.string().max(255).optional(),
  referrer: z.string().max(500).optional(),
  landingPage: z.string().max(500).optional(),
});

export type AttributionInput = z.infer<typeof AttributionSchema>;

/**
 * Parses UTM query params from a search string (e.g. `?utm_source=google`).
 */
export function parseUtmsFromSearch(search: string) {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const partial: Partial<AttributionInput> = {};

  for (const [queryKey, fieldKey] of Object.entries(UTM_PARAM_MAP)) {
    const value = params.get(queryKey)?.trim();
    if (value) {
      partial[fieldKey] = value;
    }
  }

  return partial;
}

/**
 * Parses Google Ads click ids from URL (auto-tagging).
 */
export function parseClickIdsFromSearch(search: string) {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const partial: Partial<AttributionInput> = {};

  for (const [queryKey, fieldKey] of Object.entries(CLICK_ID_PARAM_MAP)) {
    const value = params.get(queryKey)?.trim();
    if (value) {
      partial[fieldKey] = value;
    }
  }

  return partial;
}

/**
 * Builds attribution payload from URL search, referrer and landing path (first-touch).
 */
export function buildAttributionFromVisit(options: {
  search: string;
  referrer: string;
  landingPath: string;
}) {
  const fromQuery = {
    ...parseUtmsFromSearch(options.search),
    ...parseClickIdsFromSearch(options.search),
  };
  const referrer = options.referrer.trim().slice(0, 500) || undefined;
  const landingPage = options.landingPath.trim().slice(0, 500) || undefined;

  const payload = {
    ...fromQuery,
    referrer,
    landingPage,
  };

  const parsed = AttributionSchema.safeParse(payload);
  return parsed.success ? parsed.data : {};
}

/**
 * Returns true when attribution has at least one meaningful field.
 */
export function hasAttributionData(attribution: AttributionInput) {
  return Boolean(
    attribution.utmSource ??
      attribution.utmMedium ??
      attribution.utmCampaign ??
      attribution.utmContent ??
      attribution.utmTerm ??
      attribution.gclid ??
      attribution.gbraid ??
      attribution.wbraid ??
      attribution.referrer ??
      attribution.landingPage,
  );
}

/**
 * Reads JSON attribution from sessionStorage (browser only).
 */
export function readStoredAttribution(): AttributionInput | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = AttributionSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Persists first-touch attribution for the tab session (does not overwrite).
 */
export function captureAttributionFirstTouch() {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)) {
    return;
  }

  const built = buildAttributionFromVisit({
    search: window.location.search,
    referrer: document.referrer,
    landingPath: `${window.location.pathname}${window.location.search}`,
  });

  if (!hasAttributionData(built)) {
    return;
  }

  window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(built));
}
