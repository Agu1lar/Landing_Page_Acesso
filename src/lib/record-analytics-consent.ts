import { readStoredAttribution } from '@/lib/attribution';

/** Persists analytics cookie banner accept/reject for operational debugging. */
export async function recordAnalyticsConsent(action: 'accept' | 'reject') {
  if (typeof window === 'undefined') {
    return;
  }

  const attribution = readStoredAttribution();
  try {
    await fetch('/api/analytics/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        pathname: window.location.pathname,
        attribution: attribution ?? undefined,
      }),
    });
  } catch {
    // Non-blocking — analytics tools still work without this audit row.
  }
}
