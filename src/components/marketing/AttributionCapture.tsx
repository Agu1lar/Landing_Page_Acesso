'use client';

import { captureAttributionFirstTouch } from '@/lib/attribution';

/**
 * Stores first-touch UTM and referrer in sessionStorage on the marketing site.
 */
export function AttributionCapture() {
  if (typeof window !== 'undefined') {
    captureAttributionFirstTouch();
  }

  return null;
}
