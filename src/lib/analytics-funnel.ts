export type ConversionFunnelStep = {
  id: 'visits' | 'equipment_views' | 'add_to_quote' | 'quote_submits' | 'whatsapp_clicks';
  count: number;
  rateFromTop: number;
  rateFromPrevious: number | null;
};

export type ConversionFunnelCounts = {
  visits: number;
  equipmentViews: number;
  addToQuote: number;
  quoteSubmits: number;
  whatsappClicks: number;
};

function rate(part: number, whole: number) {
  if (whole <= 0) {
    return 0;
  }

  return Math.round((part / whole) * 100);
}

/**
 * Builds funnel steps with conversion rates for the operational dashboard.
 */
export function buildConversionFunnel(counts: ConversionFunnelCounts): ConversionFunnelStep[] {
  const ordered = [
    { id: 'visits' as const, count: counts.visits },
    { id: 'equipment_views' as const, count: counts.equipmentViews },
    { id: 'add_to_quote' as const, count: counts.addToQuote },
    { id: 'quote_submits' as const, count: counts.quoteSubmits },
    { id: 'whatsapp_clicks' as const, count: counts.whatsappClicks },
  ];

  const top = Math.max(ordered[0]?.count ?? 0, 1);

  return ordered.map((step, index) => {
    const previous = index > 0 ? ordered[index - 1]!.count : null;

    return {
      id: step.id,
      count: step.count,
      rateFromTop: rate(step.count, top),
      rateFromPrevious: previous === null ? null : rate(step.count, previous),
    };
  });
}

export type QuoteAbandonSummary = {
  addToQuote: number;
  quoteSubmits: number;
  quoteAbandons: number;
  abandonRate: number;
};

/**
 * Summarizes quote cart abandonment for the selected period.
 */
export function summarizeQuoteAbandon(input: {
  addToQuote: number;
  quoteSubmits: number;
  quoteAbandons: number;
}): QuoteAbandonSummary {
  const denominator = Math.max(input.addToQuote, 1);
  const abandonRate =
    input.addToQuote > 0 ? Math.round((input.quoteAbandons / denominator) * 100) : 0;

  return {
    addToQuote: input.addToQuote,
    quoteSubmits: input.quoteSubmits,
    quoteAbandons: input.quoteAbandons,
    abandonRate,
  };
}
