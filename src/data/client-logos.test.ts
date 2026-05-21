import { describe, expect, it } from 'vitest';
import { CLIENT_LOGOS } from '@/data/client-logos';

describe('client logos list', () => {
  it('lists at least six trust badges for the home section', () => {
    expect(CLIENT_LOGOS.length).toBeGreaterThanOrEqual(6);
  });

  it('uses unique slugs for each entry', () => {
    const slugs = CLIENT_LOGOS.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
