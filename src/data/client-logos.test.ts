import { describe, expect, it } from 'vitest';
import { CLIENT_LOGO_SEGMENTS } from '@/data/client-logos';

describe('client logo segments', () => {
  it('defines six sector folders for the home section', () => {
    expect(CLIENT_LOGO_SEGMENTS).toHaveLength(6);
  });

  it('uses unique sector ids matching public/clientes subfolders', () => {
    expect(new Set(CLIENT_LOGO_SEGMENTS).size).toBe(CLIENT_LOGO_SEGMENTS.length);
    expect(CLIENT_LOGO_SEGMENTS).toContain('construcao');
    expect(CLIENT_LOGO_SEGMENTS).toContain('mineracao');
  });
});
