import { describe, expect, it } from 'vitest';
import {
  stripLocalePath,
  usesMobileConversionDock,
  usesQuoteCartMobileBar,
} from '@/lib/mobile-conversion-dock';

describe('usesMobileConversionDock', () => {
  it('returns true for home', () => {
    expect(usesMobileConversionDock('/')).toBe(true);
    expect(usesMobileConversionDock('/pt-BR')).toBe(true);
  });

  it('returns true for equipment catalog', () => {
    expect(usesMobileConversionDock('/equipamentos')).toBe(true);
    expect(usesMobileConversionDock('/pt-BR/equipamentos')).toBe(true);
  });

  it('returns true for category pages', () => {
    expect(usesMobileConversionDock('/pt-BR/categorias/equipamentos-aereos')).toBe(true);
  });

  it('returns true for equipment detail pages', () => {
    expect(usesMobileConversionDock('/equipamentos/betoneira-400l')).toBe(true);
  });

  it('returns false for institutional pages', () => {
    expect(usesMobileConversionDock('/sobre')).toBe(false);
    expect(usesMobileConversionDock('/orcamento')).toBe(false);
  });
});

describe('usesQuoteCartMobileBar', () => {
  it('returns false on orcamento page', () => {
    expect(usesQuoteCartMobileBar('/orcamento')).toBe(false);
  });

  it('returns true on catalog pages', () => {
    expect(usesQuoteCartMobileBar('/equipamentos')).toBe(true);
  });
});

describe('stripLocalePath', () => {
  it('strips pt-BR prefix', () => {
    expect(stripLocalePath('/pt-BR/equipamentos')).toBe('/equipamentos');
    expect(stripLocalePath('/pt-BR')).toBe('/');
  });
});
