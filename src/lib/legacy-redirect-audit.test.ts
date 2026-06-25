import { describe, expect, it } from 'vitest';
import {
  auditLegacyRedirectPaths,
  extractAuditPath,
  suggestLegacyRedirectDestination,
} from '@/lib/legacy-redirect-audit';

describe('extract audit path', () => {
  it('normalizes full GSC URL to pathname', () => {
    expect(
      extractAuditPath('https://acessoequipamentos.com.br/blog/?utm_source=google'),
    ).toBe('/blog');
  });
});

describe('audit legacy redirect paths', () => {
  it('marks mapped blog path as covered', () => {
    const report = auditLegacyRedirectPaths(['/blog/', '/orcamento']);

    expect(report.missing).not.toContain('/blog');
    expect(report.missing).toContain('/orcamento');
    expect(report.coveragePct).toBe(50);
  });
});

describe('suggest legacy redirect destination', () => {
  it('suggests guindaste category for munck URLs', () => {
    expect(suggestLegacyRedirectDestination('/aluguel-munck-bh')).toBe(
      '/categorias/guindaste-industrial',
    );
  });

  it('suggests franna detail for franna URLs', () => {
    expect(suggestLegacyRedirectDestination('/aluguel-de-guindaste-fr17-franna-bh')).toBe(
      '/equipamentos/franna-fr17',
    );
  });
});
