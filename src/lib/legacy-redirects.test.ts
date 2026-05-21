import { describe, expect, it } from 'vitest';
import {
  legacyRedirectStats,
  normalizeLegacyPathname,
  resolveLegacyRedirect,
} from './legacy-redirects';

describe('normalize legacy pathname', () => {
  it('removes trailing slash from path', () => {
    expect(normalizeLegacyPathname('/blog/')).toBe('/blog');
  });

  it('keeps root path', () => {
    expect(normalizeLegacyPathname('/')).toBe('/');
  });
});

describe('resolve legacy redirect', () => {
  it('redirects blog index to faq', () => {
    expect(resolveLegacyRedirect('/blog/')).toBe('/faq');
  });

  it('redirects plataformas post to aerial category', () => {
    expect(
      resolveLegacyRedirect(
        '/plataforma-elevatoria-tesoura-a-solucao-ideal-para-trabalhos-em-altura/',
      ),
    ).toBe('/categorias/equipamentos-aereos');
  });

  it('redirects nr12 post to training page', () => {
    expect(
      resolveLegacyRedirect(
        '/equipamentos-em-conformidade-com-a-nr12-seguranca-e-qualidade-para-sua-obra',
      ),
    ).toBe('/treinamento-plataformas-aereas');
  });

  it('redirects wp category prefix to equipamentos', () => {
    expect(resolveLegacyRedirect('/category/plataformas/')).toBe('/equipamentos');
  });

  it('returns null for unknown marketing path', () => {
    expect(resolveLegacyRedirect('/orcamento')).toBeNull();
  });
});

describe('legacy redirect stats', () => {
  it('lists configured redirect counts', () => {
    const stats = legacyRedirectStats();
    expect(stats.exact).toBeGreaterThanOrEqual(20);
    expect(stats.prefix).toBeGreaterThanOrEqual(3);
  });
});
