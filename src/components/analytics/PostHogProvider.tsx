'use client';

import { Suspense } from 'react';
import { PostHogAttributionSync } from '@/components/analytics/PostHogAttributionSync';
import { PostHogPageView } from '@/components/analytics/PostHogPageView';
import { initPostHog } from '@/lib/posthog-client';

type PostHogProviderProps = {
  children: React.ReactNode;
};

/**
 * Initializes PostHog and tracks marketing page views.
 */
export function PostHogProvider(props: PostHogProviderProps) {
  if (typeof window !== 'undefined') {
    initPostHog();
  }

  return (
    <>
      <PostHogAttributionSync />
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {props.children}
    </>
  );
}
