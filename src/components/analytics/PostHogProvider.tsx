'use client';

import { Suspense } from 'react';
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
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {props.children}
    </>
  );
}
