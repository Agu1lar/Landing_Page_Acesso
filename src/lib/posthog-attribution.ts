import type { PostHog } from 'posthog-js';
import type { AttributionInput } from '@/lib/attribution';

/**
 * Maps first-touch attribution to PostHog super properties (snake_case).
 */
export function attributionToPostHogProperties(attribution: AttributionInput) {
  const props: Record<string, string> = {};

  if (attribution.utmSource) {
    props.utm_source = attribution.utmSource;
  }
  if (attribution.utmMedium) {
    props.utm_medium = attribution.utmMedium;
  }
  if (attribution.utmCampaign) {
    props.utm_campaign = attribution.utmCampaign;
  }
  if (attribution.utmContent) {
    props.utm_content = attribution.utmContent;
  }
  if (attribution.utmTerm) {
    props.utm_term = attribution.utmTerm;
  }
  if (attribution.gclid) {
    props.gclid = attribution.gclid;
  }
  if (attribution.gbraid) {
    props.gbraid = attribution.gbraid;
  }
  if (attribution.wbraid) {
    props.wbraid = attribution.wbraid;
  }
  if (attribution.referrer) {
    props.initial_referrer = attribution.referrer;
  }
  if (attribution.landingPage) {
    props.initial_landing_page = attribution.landingPage;
  }

  return props;
}

/**
 * Registers campaign attribution on the PostHog session (all following events).
 */
export function registerPostHogAttribution(posthog: PostHog, attribution: AttributionInput) {
  const props = attributionToPostHogProperties(attribution);
  if (Object.keys(props).length > 0) {
    posthog.register(props);
  }
}
