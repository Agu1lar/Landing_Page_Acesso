'use client';

import { useEffect } from 'react';
import { hasAttributionData, parseClickIdsFromSearch, parseUtmsFromSearch, readStoredAttribution } from '@/lib/attribution';
import { registerPostHogAttribution } from '@/lib/posthog-attribution';
import { getPostHog, initPostHog } from '@/lib/posthog-client';

/**
 * Registers first-touch UTMs and referrer as PostHog super properties.
 */
export function PostHogAttributionSync() {
  useEffect(() => {
    initPostHog();
    const posthog = getPostHog();
    if (!posthog) {
      return;
    }

    const fromUrl = {
      ...parseUtmsFromSearch(window.location.search),
      ...parseClickIdsFromSearch(window.location.search),
    };
    const stored = readStoredAttribution() ?? {};
    const merged = { ...fromUrl, ...stored };

    if (hasAttributionData(merged)) {
      registerPostHogAttribution(posthog, merged);
    }
  }, []);

  return null;
}
