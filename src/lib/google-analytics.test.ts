import { describe, expect, it } from 'vitest';
import { GA_CONVERSION_EVENTS } from '@/lib/google-analytics';

describe('google analytics conversion helpers', () => {
  it('exposes GA4 event names used by the funnel', () => {
    expect(GA_CONVERSION_EVENTS.generateLead).toBe('generate_lead');
    expect(GA_CONVERSION_EVENTS.whatsappClick).toBe('whatsapp_click');
  });
});
