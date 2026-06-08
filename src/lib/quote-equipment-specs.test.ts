import { describe, expect, it } from 'vitest';
import { formatQuoteSpecsLine } from '@/lib/quote-equipment-specs';

describe('format quote specs line', () => {
  it('includes working height and load capacity for aerial platforms', () => {
    const line = formatQuoteSpecsLine([
      { label: 'Tipo', value: 'Tesoura (laje)' },
      { label: 'Altura de trabalho', value: '~6,1 m (20 ft)' },
      { label: 'Capacidade / peso na plataforma', value: '~300 kg' },
    ]);

    expect(line).toContain('Altura de trabalho: ~6,1 m (20 ft)');
    expect(line).toContain('Capacidade de carga: ~300 kg');
  });

  it('returns undefined when no matching specs exist', () => {
    expect(formatQuoteSpecsLine([{ label: 'Potência', value: '5 kVA' }])).toBeUndefined();
  });
});
