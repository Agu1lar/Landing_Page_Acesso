import { describe, expect, it } from 'vitest';
import {
  hoursSinceLeadCreated,
  mergeEquipmentConversionRows,
} from '@/lib/equipment-conversion-analytics';

describe('hoursSinceLeadCreated', () => {
  it('returns whole hours elapsed', () => {
    const created = new Date('2026-06-14T10:00:00.000Z');
    const now = new Date('2026-06-15T11:30:00.000Z').getTime();
    expect(hoursSinceLeadCreated(created, now)).toBe(25);
  });
});

describe('mergeEquipmentConversionRows', () => {
  it('merges metrics and computes conversion rates', () => {
    const rows = mergeEquipmentConversionRows({
      pageViews: [{ slug: 'betoneira', name: 'Betoneira', count: 100 }],
      whatsapp: [{ slug: 'betoneira', name: 'Betoneira', count: 10 }],
      leads: [{ slug: 'betoneira', name: 'Betoneira', count: 5 }],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      slug: 'betoneira',
      pageViews: 100,
      whatsappClicks: 10,
      leads: 5,
      leadConversionRate: 5,
      engagementRate: 15,
    });
  });

  it('includes equipment with conversions but no tracked page views', () => {
    const rows = mergeEquipmentConversionRows({
      pageViews: [],
      whatsapp: [{ slug: 'guindaste', name: 'Guindaste', count: 2 }],
      leads: [],
    });

    expect(rows[0]?.slug).toBe('guindaste');
    expect(rows[0]?.pageViews).toBe(0);
    expect(rows[0]?.engagementRate).toBe(0);
  });
});
