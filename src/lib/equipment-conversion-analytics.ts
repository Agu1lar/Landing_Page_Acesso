/** Hours a lead can stay "new" before the stale alert appears. */
export const STALE_LEAD_HOURS = 24;

export type EquipmentConversionRow = {
  slug: string;
  name: string;
  pageViews: number;
  whatsappClicks: number;
  leads: number;
  /** Leads ÷ page views (0 when no views). */
  leadConversionRate: number;
  /** (WhatsApp + leads) ÷ page views (0 when no views). */
  engagementRate: number;
};

type SlugCount = { slug: string; name: string; count: number };

/**
 * Merges per-slug metrics into a conversion table sorted by page views.
 */
export function mergeEquipmentConversionRows(input: {
  pageViews: SlugCount[];
  whatsapp: SlugCount[];
  leads: SlugCount[];
  limit?: number;
}): EquipmentConversionRow[] {
  const merged = new Map<string, { name: string; pageViews: number; whatsapp: number; leads: number }>();

  const ensure = (slug: string, name?: string) => {
    const key = slug.trim();
    if (!key || key === '—') {
      return;
    }
    const existing = merged.get(key) ?? { name: name?.trim() || key, pageViews: 0, whatsapp: 0, leads: 0 };
    if (name?.trim() && existing.name === key) {
      existing.name = name.trim();
    }
    merged.set(key, existing);
  };

  for (const row of input.pageViews) {
    ensure(row.slug, row.name);
    const entry = merged.get(row.slug.trim());
    if (entry) {
      entry.pageViews += row.count;
    }
  }
  for (const row of input.whatsapp) {
    ensure(row.slug, row.name);
    const entry = merged.get(row.slug.trim());
    if (entry) {
      entry.whatsapp += row.count;
    }
  }
  for (const row of input.leads) {
    ensure(row.slug, row.name);
    const entry = merged.get(row.slug.trim());
    if (entry) {
      entry.leads += row.count;
    }
  }

  return [...merged.entries()]
    .map(([slug, stats]) => {
      const leadConversionRate =
        stats.pageViews > 0 ? Math.round((stats.leads / stats.pageViews) * 100) : 0;
      const engagementRate =
        stats.pageViews > 0
          ? Math.round(((stats.whatsapp + stats.leads) / stats.pageViews) * 100)
          : 0;

      return {
        slug,
        name: stats.name,
        pageViews: stats.pageViews,
        whatsappClicks: stats.whatsapp,
        leads: stats.leads,
        leadConversionRate,
        engagementRate,
      };
    })
    .sort(
      (a, b) =>
        b.pageViews - a.pageViews ||
        b.leads + b.whatsappClicks - (a.leads + a.whatsappClicks),
    )
    .slice(0, input.limit ?? 15);
}

/**
 * Returns how many whole hours have passed since the lead was created.
 */
export function hoursSinceLeadCreated(createdAt: Date, now = Date.now()) {
  return Math.floor((now - createdAt.getTime()) / (60 * 60 * 1000));
}
