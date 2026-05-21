import { describe, expect, it } from 'vitest';
import { dedupeClientLogos, dedupeKeyFromFileName } from '@/lib/client-logos-dedupe';
import type { SegmentLogoFile } from '@/lib/client-logos-fs';

function logo(fileName: string, segment = 'industria'): SegmentLogoFile {
  return {
    fileName,
    src: `/clientes/${segment}/${fileName}`,
    alt: fileName,
  };
}

describe('dedupe key from file name', () => {
  it('strips copy suffix and logo word', () => {
    expect(dedupeKeyFromFileName('bunge-logo (1).jpg')).toBe('bunge');
    expect(dedupeKeyFromFileName('vale logo.webp')).toBe('vale');
  });
});

describe('dedupe client logos', () => {
  it('removes duplicate company files across folders', () => {
    const logos = dedupeClientLogos([
      logo('bunge-logo.jpg', 'logistica'),
      logo('bunge-logo (1).jpg', 'industria'),
      logo('vale logo.webp', 'mineracao'),
    ]);

    expect(logos).toHaveLength(2);
    expect(logos.map((entry) => entry.fileName)).toEqual(['bunge-logo.jpg', 'vale logo.webp']);
  });

  it('prefers webp over jpg for the same company key', () => {
    const logos = dedupeClientLogos([
      logo('jam-primeiro.jpg', 'industria'),
      logo('jam-primeiro (1).jpg', 'construcao'),
      logo('jam-primeiro.webp', 'construcao'),
    ]);

    expect(logos).toHaveLength(1);
    expect(logos[0]?.fileName).toBe('jam-primeiro.webp');
  });
});
