'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { captureGaPageView } from '@/lib/google-analytics';

/**
 * Sends page_view to GA4 on route changes (after analytics consent).
 */
export function GaPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    captureGaPageView(path);
  }, [pathname, searchParams]);

  return null;
}
