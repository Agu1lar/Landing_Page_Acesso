import { describe, expect, it } from 'vitest';
import {
  buildConversionFunnel,
  buildLeadReplyFunnel,
  summarizeQuoteAbandon,
} from '@/lib/analytics-funnel';

describe('buildConversionFunnel', () => {
  it('computes rates from top and previous step', () => {
    const steps = buildConversionFunnel({
      visits: 100,
      equipmentViews: 40,
      addToQuote: 10,
      quoteSubmits: 4,
      whatsappClicks: 20,
    });

    expect(steps[0]?.count).toBe(100);
    expect(steps[1]?.rateFromPrevious).toBe(40);
    expect(steps[4]?.rateFromTop).toBe(20);
  });
});

describe('buildLeadReplyFunnel', () => {
  it('computes lead → replied → won rates', () => {
    const steps = buildLeadReplyFunnel({
      leads: 20,
      whatsappReplied: 10,
      won: 2,
    });

    expect(steps.map((step) => step.id)).toEqual(['leads', 'whatsapp_replied', 'won']);
    expect(steps[1]?.rateFromPrevious).toBe(50);
    expect(steps[2]?.rateFromTop).toBe(10);
  });
});

describe('summarizeQuoteAbandon', () => {
  it('calculates abandon rate from add_to_quote', () => {
    const summary = summarizeQuoteAbandon({
      addToQuote: 10,
      quoteSubmits: 4,
      quoteAbandons: 3,
    });

    expect(summary.abandonRate).toBe(30);
  });
});
