import { capturePhoneClick } from '@/lib/posthog-events';
import { GA_CONVERSION_EVENTS, captureGaEvent } from '@/lib/google-analytics';

type TrackPhoneClickInput = {
  origin: string;
  pathname?: string;
};

/**
 * Sends phone_click to PostHog and GA4 when a tel: link is used.
 */
export function trackPhoneClick(input: TrackPhoneClickInput) {
  capturePhoneClick(input);

  captureGaEvent(GA_CONVERSION_EVENTS.phoneClick, {
    origin: input.origin,
  });
}
