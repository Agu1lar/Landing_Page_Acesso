import { describe, expect, it } from 'vitest';
import { attributionToPostHogProperties } from '@/lib/posthog-attribution';

describe('attribution to PostHog properties', () => {
  it('maps camelCase attribution to snake_case PostHog keys', () => {
    const props = attributionToPostHogProperties({
      utmSource: 'instagram',
      utmMedium: 'stories',
      utmCampaign: 'maio',
      landingPage: '/orcamento',
    });

    expect(props).toStrictEqual({
      utm_source: 'instagram',
      utm_medium: 'stories',
      utm_campaign: 'maio',
      initial_landing_page: '/orcamento',
    });
  });
});
