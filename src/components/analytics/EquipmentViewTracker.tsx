'use client';

import { useEffect } from 'react';
import { getPostHog } from '@/lib/posthog-client';

type EquipmentViewTrackerProps = {
  slug: string;
  name: string;
};

/**
 * Tracks equipment_view in PostHog when detail page mounts.
 */
export function EquipmentViewTracker(props: EquipmentViewTrackerProps) {
  useEffect(() => {
    const posthog = getPostHog();
    if (!posthog) {
      return;
    }

    posthog.capture('equipment_view', {
      slug: props.slug,
      name: props.name,
    });
  }, [props.slug, props.name]);

  return null;
}
