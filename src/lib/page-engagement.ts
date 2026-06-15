/** Idle threshold: no interaction for this long pauses active-time counting. */
export const PAGE_ENGAGEMENT_IDLE_MS = 30_000;

/** Minimum active seconds before persisting a page view. */
export const PAGE_ENGAGEMENT_MIN_SECONDS = 1;

export type PageEngagementFlushInput = {
  pathname: string;
  activeSeconds: number;
  device?: 'mobile' | 'desktop';
  sessionId?: string;
};

/**
 * Returns true when the tab is visible and the user interacted recently.
 */
export function isPageEngagementActive(lastActivityAt: number, now = Date.now()) {
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
    return false;
  }

  return now - lastActivityAt < PAGE_ENGAGEMENT_IDLE_MS;
}

/**
 * Accumulates active milliseconds between ticks when engagement rules pass.
 */
export function accumulateActiveMs(
  previousActiveMs: number,
  lastTickAt: number,
  lastActivityAt: number,
  now = Date.now(),
) {
  if (!isPageEngagementActive(lastActivityAt, now)) {
    return { activeMs: previousActiveMs, lastTickAt: now };
  }

  return {
    activeMs: previousActiveMs + Math.max(0, now - lastTickAt),
    lastTickAt: now,
  };
}

/**
 * Converts milliseconds to whole seconds for storage.
 */
export function activeMsToSeconds(activeMs: number) {
  return Math.max(0, Math.floor(activeMs / 1000));
}
