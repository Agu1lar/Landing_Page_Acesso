import { readStoredAttribution } from '@/lib/attribution';

type OneTapPromptOutcome = 'not_displayed' | 'skipped' | 'dismissed' | 'registered';

/** Persists One Tap prompt outcomes for operational debugging. */
export async function recordOneTapPrompt(outcome: OneTapPromptOutcome, reason: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const attribution = readStoredAttribution();
  try {
    await fetch('/api/analytics/one-tap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outcome,
        reason,
        pathname: window.location.pathname,
        attribution: attribution ?? undefined,
      }),
    });
  } catch {
    // Non-blocking telemetry.
  }
}
