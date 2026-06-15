'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import {
  accumulateActiveMs,
  activeMsToSeconds,
  PAGE_ENGAGEMENT_MIN_SECONDS,
} from '@/lib/page-engagement';

const SESSION_STORAGE_KEY = 'acesso_analytics_session';
const TICK_MS = 1_000;

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'] as const;

function detectDevice() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop';
}

function getOrCreateSessionId() {
  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const created =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `sess-${Date.now()}`;
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, created);
  return created;
}

function buildPathname(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/**
 * Tracks active time per page (visible tab + recent interaction) and persists on navigation.
 */
export function PageEngagementTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeMsRef = useRef(0);
  const lastTickRef = useRef(Date.now());
  const lastActivityRef = useRef(Date.now());
  const currentPathRef = useRef<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const recordActivity = () => {
      lastActivityRef.current = Date.now();
    };

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, recordActivity, { passive: true });
    }

    const handleVisibility = () => {
      lastTickRef.current = Date.now();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    intervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const next = accumulateActiveMs(
        activeMsRef.current,
        lastTickRef.current,
        lastActivityRef.current,
        now,
      );
      activeMsRef.current = next.activeMs;
      lastTickRef.current = next.lastTickAt;
    }, TICK_MS);

    return () => {
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, recordActivity);
      }
      document.removeEventListener('visibilitychange', handleVisibility);
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const nextPath = pathname ? buildPathname(pathname, searchParams) : null;

    const flush = (path: string) => {
      const now = Date.now();
      const next = accumulateActiveMs(
        activeMsRef.current,
        lastTickRef.current,
        lastActivityRef.current,
        now,
      );
      activeMsRef.current = next.activeMs;
      lastTickRef.current = now;

      const activeSeconds = activeMsToSeconds(activeMsRef.current);
      activeMsRef.current = 0;
      lastActivityRef.current = now;

      if (activeSeconds < PAGE_ENGAGEMENT_MIN_SECONDS) {
        return;
      }

      void fetch('/api/analytics/page-engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pathname: path,
          activeSeconds,
          device: detectDevice(),
          sessionId: getOrCreateSessionId(),
        }),
        keepalive: true,
      });
    };

    if (currentPathRef.current && currentPathRef.current !== nextPath) {
      flush(currentPathRef.current);
    }

    currentPathRef.current = nextPath;
    lastTickRef.current = Date.now();
    lastActivityRef.current = Date.now();

    const handlePageHide = () => {
      if (currentPathRef.current) {
        flush(currentPathRef.current);
      }
    };

    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [pathname, searchParams]);

  return null;
}
