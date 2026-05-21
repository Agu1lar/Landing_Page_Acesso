import { describe, expect, it } from 'vitest';
import { CLIENT_LOGO_SEGMENTS } from '@/data/client-logos';

describe('client logo segments', () => {
  it('defines six sector folders for the home section', () => {
    expect(CLIENT_LOGO_SEGMENTS).toHaveLength(6);
  });

  it('uses unique sector ids matching public/clientes subfolders', () => {
    const ids = CLIENT_LOGO_SEGMENTS.map((segment) => segment.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('construcao');
    expect(ids).toContain('mineracao');
  });
});
