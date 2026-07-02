'use client';

import { useEffect } from 'react';
import { getPostHog } from '@/lib/posthog-client';
import { persistAnalyticsEvent } from '@/lib/track-analytics-event';

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

    persistAnalyticsEvent({
      eventType: 'equipment_view',
      origin: 'equipment_view',
      equipmentSlug: props.slug,
      equipmentName: props.name,
    });
  }, [props.slug, props.name]);

  return null;
}
