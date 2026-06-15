import { describe, expect, it, vi } from 'vitest';
import {
  accumulateActiveMs,
  activeMsToSeconds,
  isPageEngagementActive,
  PAGE_ENGAGEMENT_IDLE_MS,
} from '@/lib/page-engagement';

describe('isPageEngagementActive', () => {
  it('returns false when tab is hidden', () => {
    vi.stubGlobal('document', { visibilityState: 'hidden' });
    expect(isPageEngagementActive(Date.now(), Date.now())).toBe(false);
    vi.unstubAllGlobals();
  });

  it('returns false after idle threshold without interaction', () => {
    vi.stubGlobal('document', { visibilityState: 'visible' });
    const now = 100_000;
    expect(isPageEngagementActive(now - PAGE_ENGAGEMENT_IDLE_MS - 1, now)).toBe(false);
    vi.unstubAllGlobals();
  });

  it('returns true with visible tab and recent interaction', () => {
    vi.stubGlobal('document', { visibilityState: 'visible' });
    const now = 100_000;
    expect(isPageEngagementActive(now - 5_000, now)).toBe(true);
    vi.unstubAllGlobals();
  });
});

describe('accumulateActiveMs', () => {
  it('adds elapsed time only while engaged', () => {
    vi.stubGlobal('document', { visibilityState: 'visible' });
    const start = 1_000;
    const tick = 4_000;
    const result = accumulateActiveMs(0, start, start, tick);
    expect(result.activeMs).toBe(3_000);
    vi.unstubAllGlobals();
  });

  it('does not add time while idle', () => {
    vi.stubGlobal('document', { visibilityState: 'visible' });
    const now = 100_000;
    const result = accumulateActiveMs(500, now - 1_000, now - PAGE_ENGAGEMENT_IDLE_MS - 1, now);
    expect(result.activeMs).toBe(500);
    vi.unstubAllGlobals();
  });
});

describe('activeMsToSeconds', () => {
  it('floors to whole seconds', () => {
    expect(activeMsToSeconds(1999)).toBe(1);
    expect(activeMsToSeconds(2000)).toBe(2);
  });
});
